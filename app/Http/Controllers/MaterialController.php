<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Material\StoreMaterialAction;
use App\Actions\Material\ToggleMaterialProgressAction;
use App\Enums\KenshiRank;
use App\Enums\MaterialPillar;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\Material;
use App\Models\Pengurus;
use App\Services\DokuhonPageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    /**
     * Display curriculum materials directory with belt-level gating and scope hierarchy.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isPBOrAdmin = $user && $user->hasAnyRole(['SuperAdmin', 'PengprovAdmin']);
        $isSensei = $user && $user->hasRole('Sensei');

        $kenshi = $user ? Kenshi::where('user_id', $user->id)->first() : null;

        $pillarFilter = $request->query('pillar');
        $rankFilter = $request->query('rank');
        $mediaFilter = $request->query('media_type');
        $scopeFilter = $request->query('scope_type');

        $query = Material::with(['dojo', 'pengprov', 'pengkot', 'uploader'])
            ->active();

        // Organizational gating:
        // If logged-in user is a Kenshi and not an admin/sensei, filter only to accessible materials
        if ($kenshi && ! ($isPBOrAdmin || $isSensei)) {
            $query->accessibleForKenshi($kenshi);
        }

        // Apply UI filters
        $query->when($pillarFilter, fn ($q, $p) => $q->where('pillar', $p))
            ->when($rankFilter, fn ($q, $r) => $q->where('target_rank', $r))
            ->when($mediaFilter && $mediaFilter !== 'all', function ($q) use ($mediaFilter): void {
                if ($mediaFilter === 'video') {
                    $q->where(fn ($sub) => $sub->where('media_type', 'video')->orWhere('media_type', 'both')->orWhereNotNull('video_url'));
                } elseif ($mediaFilter === 'pdf') {
                    $q->where(fn ($sub) => $sub->where('media_type', 'pdf')->orWhere('media_type', 'both')->orWhereNotNull('pdf_path'));
                }
            })
            ->when($scopeFilter && $scopeFilter !== 'all', fn ($q) => $q->where('scope_type', $scopeFilter))
            ->orderBy('order_priority')
            ->orderBy('created_at', 'desc');

        $materials = $query->get()->map(function (Material $m) use ($kenshi, $isPBOrAdmin, $isSensei) {
            $isCompleted = false;
            if ($kenshi) {
                $isCompleted = $kenshi->materialProgresses()
                    ->where('material_id', $m->id)
                    ->where('is_completed', true)
                    ->exists();
            }

            // Gating rule: Kenshi can only access materials of their rank or lower
            // Sensei, PB, and SuperAdmin can access all
            $isLocked = false;
            if ($kenshi && ! ($isPBOrAdmin || $isSensei) && ! $m->is_public) {
                $ranksOrder = array_column(KenshiRank::cases(), 'value');
                $kenshiRankIdx = array_search($kenshi->rank?->value, $ranksOrder, true);
                $materialRankIdx = array_search($m->target_rank?->value, $ranksOrder, true);

                if ($materialRankIdx !== false && $kenshiRankIdx !== false && $materialRankIdx > $kenshiRankIdx) {
                    $isLocked = true;
                }
            }

            // Determine friendly scope label
            $scopeLabel = 'Nasional (PB PERKEMI)';
            if ($m->scope_type === 'pengprov') {
                $scopeLabel = $m->pengprov ? "Pengprov {$m->pengprov->region}" : 'Pengprov Tingkat I';
            } elseif ($m->scope_type === 'pengkot') {
                $scopeLabel = $m->pengkot ? "Pengkot/Pengkab {$m->pengkot->region}" : 'Pengkot/Pengkab';
            } elseif ($m->scope_type === 'dojo') {
                $scopeLabel = $m->dojo ? "Dojo {$m->dojo->name}" : 'Cabang Dojo';
            }

            return [
                'id' => $m->id,
                'title' => $m->title,
                'slug' => $m->slug,
                'pillar' => $m->pillar?->value,
                'pillar_label' => $m->pillar?->label(),
                'pillar_color' => $m->pillar?->badgeColor(),
                'target_rank' => $m->target_rank?->value,
                'target_rank_label' => $m->target_rank?->label(),
                'summary' => $m->summary,
                'has_video' => ! empty($m->video_url),
                'video_duration' => $m->video_duration,
                'has_pdf' => ! empty($m->pdf_path) || ! empty($m->pages_data),
                'pdf_path' => $m->pdf_path,
                'media_type' => $m->media_type ?? (! empty($m->pdf_path) ? 'pdf' : 'video'),
                'scope_type' => $m->scope_type ?? ($m->is_official_pb ? 'national' : 'dojo'),
                'scope_label' => $scopeLabel,
                'is_official_pb' => $m->is_official_pb,
                'is_locked' => $isLocked,
                'is_completed' => $isCompleted,
            ];
        });

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'currentKenshi' => $kenshi,
            'pillars' => collect(MaterialPillar::cases())->map(fn ($p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ]),
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
            'filters' => [
                'pillar' => $pillarFilter,
                'rank' => $rankFilter,
                'media_type' => $mediaFilter ?? 'all',
                'scope_type' => $scopeFilter ?? 'all',
            ],
        ]);
    }

    /**
     * Show detailed material player & in-browser interactive Framer Motion Flipbook reader.
     */
    public function show(Material $material, Request $request): Response
    {
        $user = $request->user();
        $kenshi = $user ? Kenshi::where('user_id', $user->id)->first() : null;

        $isCompleted = false;
        if ($kenshi) {
            $isCompleted = $kenshi->materialProgresses()
                ->where('material_id', $material->id)
                ->where('is_completed', true)
                ->exists();
        }

        // Auto fallback to default Dokuhon pages ONLY if no uploaded PDF file exists and pillar is dokuhon
        $pagesData = $material->pages_data;
        if (empty($pagesData) && empty($material->pdf_path) && $material->pillar?->value === 'dokuhon') {
            $pagesData = DokuhonPageService::getDefaultPages($material->title, $material->summary);
        }

        // Determine friendly scope label
        $scopeLabel = 'PB PERKEMI (Pusat Komando Nasional)';
        if ($material->scope_type === 'pengprov') {
            $scopeLabel = $material->pengprov ? "Pengprov PERKEMI {$material->pengprov->region}" : 'Pengprov Tingkat I';
        } elseif ($material->scope_type === 'pengkot') {
            $scopeLabel = $material->pengkot ? "Pengkot/Pengkab PERKEMI {$material->pengkot->region}" : 'Pengkot/Pengkab';
        } elseif ($material->scope_type === 'dojo') {
            $scopeLabel = $material->dojo ? "Dojo {$material->dojo->name}" : 'Cabang Dojo';
        }

        return Inertia::render('Materials/Show', [
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'slug' => $material->slug,
                'pillar' => $material->pillar?->value,
                'pillar_label' => $material->pillar?->label(),
                'target_rank' => $material->target_rank?->value,
                'target_rank_label' => $material->target_rank?->label(),
                'summary' => $material->summary,
                'video_url' => $material->video_url,
                'video_duration' => $material->video_duration,
                'video_chapters' => $material->video_chapters ?? [],
                'pdf_path' => $material->pdf_path,
                'media_type' => $material->media_type ?? (! empty($material->pdf_path) ? 'pdf' : 'video'),
                'scope_type' => $material->scope_type ?? ($material->is_official_pb ? 'national' : 'dojo'),
                'scope_label' => $scopeLabel,
                'pdf_pages_count' => $material->pdf_pages_count ?? (is_array($pagesData) ? count($pagesData) : 10),
                'pages_data' => $pagesData ?? [],
                'is_official_pb' => $material->is_official_pb,
                'is_completed' => $isCompleted,
            ],
            'currentKenshi' => $kenshi,
        ]);
    }

    /**
     * Toggle completion state of a material.
     */
    public function toggleComplete(Material $material, Request $request, ToggleMaterialProgressAction $action): RedirectResponse
    {
        $user = $request->user();
        $kenshi = $user ? Kenshi::where('user_id', $user->id)->first() : null;

        if (! $kenshi) {
            return back()->with('error', 'Profil kenshi tidak ditemukan.');
        }

        $progress = $action->execute($kenshi, $material);

        $msg = $progress->is_completed
            ? "Materi '{$material->title}' ditandai selesai dipelajari."
            : "Materi '{$material->title}' ditandai belum selesai.";

        return back()->with('success', $msg);
    }

    /**
     * Multi-level management portal for PB, Pengprov, Pengkot, and Dojo managers.
     */
    public function dojoIndex(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user && $user->hasRole('SuperAdmin');
        $isPengprovAdmin = $user && $user->hasRole('PengprovAdmin');
        $isPengkabAdmin = $user && $user->hasRole('PengkabAdmin');
        $isSensei = $user && $user->hasRole('Sensei');

        // Current scope context
        $currentScope = 'dojo';
        if ($isSuperAdmin) {
            $currentScope = 'national';
        } elseif ($isPengprovAdmin) {
            $currentScope = 'pengprov';
        } elseif ($isPengkabAdmin) {
            $currentScope = 'pengkot';
        }

        // Fetch organizations for form selection
        $pengprovList = Pengurus::pengprov()->active()->get(['id', 'name', 'region']);
        $pengkotList = Pengurus::pengkot()->active()->get(['id', 'name', 'region']);
        $dojoList = Dojo::active()->get(['id', 'name', 'code', 'pengprov', 'pengkab']);

        $currentPengprov = null;
        $currentPengkot = null;
        $currentDojo = null;

        if ($isPengprovAdmin) {
            $currentPengprov = Pengurus::where('type', 'pengprov')->where('user_id', $user->id)->first() ?? $pengprovList->first();
        } elseif ($isPengkabAdmin) {
            $currentPengkot = Pengurus::where('type', 'pengkot')->where('user_id', $user->id)->first() ?? $pengkotList->first();
        } elseif ($isSensei) {
            $currentDojo = Dojo::where('head_sensei_id', $user->id)->first() ?? $dojoList->first();
        } else {
            $currentDojo = $dojoList->first();
        }

        // Query materials filtered according to role
        $query = Material::with(['dojo', 'pengprov', 'pengkot', 'uploader'])->latest();

        if ($isPengprovAdmin && $currentPengprov) {
            $query->where(function ($q) use ($currentPengprov): void {
                $q->where('scope_type', 'pengprov')->where('pengprov_id', $currentPengprov->id);
            });
        } elseif ($isPengkabAdmin && $currentPengkot) {
            $query->where(function ($q) use ($currentPengkot): void {
                $q->where('scope_type', 'pengkot')->where('pengkot_id', $currentPengkot->id);
            });
        } elseif ($isSensei && $currentDojo) {
            $query->where(function ($q) use ($currentDojo): void {
                $q->where('scope_type', 'dojo')->where('dojo_id', $currentDojo->id);
            });
        }

        $materials = $query->get()->map(function (Material $m) {
            $scopeLabel = 'Nasional (PB PERKEMI)';
            if ($m->scope_type === 'pengprov') {
                $scopeLabel = $m->pengprov ? "Pengprov {$m->pengprov->region}" : 'Pengprov';
            } elseif ($m->scope_type === 'pengkot') {
                $scopeLabel = $m->pengkot ? "Pengkot {$m->pengkot->region}" : 'Pengkot';
            } elseif ($m->scope_type === 'dojo') {
                $scopeLabel = $m->dojo ? "Dojo {$m->dojo->name}" : 'Cabang Dojo';
            }

            return [
                'id' => $m->id,
                'title' => $m->title,
                'slug' => $m->slug,
                'pillar' => $m->pillar?->value,
                'pillar_label' => $m->pillar?->label(),
                'target_rank' => $m->target_rank?->value,
                'target_rank_label' => $m->target_rank?->label(),
                'summary' => $m->summary,
                'video_url' => $m->video_url,
                'video_duration' => $m->video_duration,
                'pdf_path' => $m->pdf_path,
                'media_type' => $m->media_type ?? (! empty($m->pdf_path) ? 'pdf' : 'video'),
                'scope_type' => $m->scope_type ?? ($m->is_official_pb ? 'national' : 'dojo'),
                'scope_label' => $scopeLabel,
                'is_official_pb' => $m->is_official_pb,
                'created_at' => $m->created_at?->diffForHumans() ?? '',
            ];
        });

        return Inertia::render('Dojo/Materi', [
            'currentScope' => $currentScope,
            'currentPengprov' => $currentPengprov,
            'currentPengkot' => $currentPengkot,
            'currentDojo' => $currentDojo,
            'pengprovList' => $pengprovList,
            'pengkotList' => $pengkotList,
            'dojoList' => $dojoList,
            'materials' => $materials,
            'pillars' => collect(MaterialPillar::cases())->map(fn ($p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ]),
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
        ]);
    }

    /**
     * Store material uploaded with multi-tier organization and video/PDF support.
     */
    public function storeDojoMaterial(Request $request, StoreMaterialAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'pillar' => ['required', 'string'],
            'target_rank' => ['required', 'string'],
            'scope_type' => ['nullable', 'string', 'in:national,pengprov,pengkot,dojo'],
            'dojo_id' => ['nullable', 'uuid', 'exists:dojos,id'],
            'pengprov_id' => ['nullable', 'uuid', 'exists:pengurus,id'],
            'pengkot_id' => ['nullable', 'uuid', 'exists:pengurus,id'],
            'video_url' => ['nullable', 'string', 'max:500'],
            'video_file' => ['nullable', 'file', 'mimes:mp4,webm,mov,mkv', 'max:204800'],
            'video_duration' => ['nullable', 'string', 'max:20'],
            'pdf_file' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
            'pdf_path' => ['nullable', 'string', 'max:500'],
            'summary' => ['nullable', 'string', 'max:1000'],
        ]);

        $material = $action->execute($validated, $request->user());

        $typeMsg = $material->media_type === 'both'
            ? 'Modul video dan buku PDF'
            : ($material->media_type === 'pdf' ? 'Buku & modul PDF' : 'Video materi');

        return back()->with('success', "{$typeMsg} '{$material->title}' berhasil ditambahkan ke sistem.");
    }
}
