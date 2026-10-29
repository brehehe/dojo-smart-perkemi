<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Kenshi\ImportKenshisAction;
use App\Actions\Kenshi\RegisterKenshiAction;
use App\Enums\KenshiRank;
use App\Http\Requests\Kenshi\StoreKenshiRequest;
use App\Http\Requests\Kenshi\UpdateKenshiRequest;
use App\Http\Resources\DojoResource;
use App\Http\Resources\KenshiResource;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\Pengurus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KenshiController extends Controller
{
    /**
     * Display a listing of kenshis with eager loading, rank filtering, and pagination.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Kenshi::class);

        $filters = $request->only(['search', 'rank', 'dojo_id', 'is_active', 'member_type']);

        $rankEnum = ! empty($filters['rank']) ? KenshiRank::tryFrom($filters['rank']) : null;

        $kenshis = Kenshi::query()
            ->with(['dojo:id,name,code,pengprov', 'user:id,email'])
            ->search($filters['search'] ?? null)
            ->rank($rankEnum)
            ->byDojo($filters['dojo_id'] ?? null)
            ->when(! empty($filters['member_type']), fn ($q) => $q->where('member_type', $filters['member_type']))
            ->when(isset($filters['is_active']) && $filters['is_active'] !== '', function ($q) use ($filters) {
                return $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $activeDojos = Dojo::active()->select('id', 'name', 'code', 'pengprov')->get();

        return Inertia::render('Kenshis/Index', [
            'kenshis' => KenshiResource::collection($kenshis),
            'filters' => $filters,
            'dojos' => DojoResource::collection($activeDojos),
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
        ]);
    }

    /**
     * Display a listing specifically for Coaches and Sensei.
     */
    public function coaches(Request $request): Response
    {
        $this->authorize('viewAny', Kenshi::class);

        $filters = $request->only(['search', 'rank', 'dojo_id', 'is_active']);
        $filters['member_type'] = 'coach';

        $rankEnum = ! empty($filters['rank']) ? KenshiRank::tryFrom($filters['rank']) : null;

        $coaches = Kenshi::query()
            ->with(['dojo:id,name,code,pengprov', 'user:id,email'])
            ->where('member_type', 'coach')
            ->search($filters['search'] ?? null)
            ->rank($rankEnum)
            ->byDojo($filters['dojo_id'] ?? null)
            ->when(isset($filters['is_active']) && $filters['is_active'] !== '', function ($q) use ($filters) {
                return $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $activeDojos = Dojo::active()->select('id', 'name', 'code', 'pengprov')->get();

        return Inertia::render('Kenshis/Index', [
            'kenshis' => KenshiResource::collection($coaches),
            'filters' => $filters,
            'dojos' => DojoResource::collection($activeDojos),
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
            'pageTitle' => 'Pangkalan Data Pelatih & Sensei',
            'isCoachOnly' => true,
        ]);
    }

    /**
     * Export Kenshis to formatted CSV/Excel spreadsheet.
     */
    public function export(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Kenshi::class);

        $filters = $request->only(['search', 'rank', 'dojo_id', 'is_active', 'member_type']);
        $rankEnum = ! empty($filters['rank']) ? KenshiRank::tryFrom($filters['rank']) : null;

        $kenshis = Kenshi::query()
            ->with(['dojo:id,name,code,pengprov', 'user:id,email'])
            ->search($filters['search'] ?? null)
            ->rank($rankEnum)
            ->byDojo($filters['dojo_id'] ?? null)
            ->when(! empty($filters['member_type']), fn ($q) => $q->where('member_type', $filters['member_type']))
            ->when(isset($filters['is_active']) && $filters['is_active'] !== '', function ($q) use ($filters) {
                return $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
            })
            ->latest()
            ->get();

        $filename = 'kenshi_perkemi_export_'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($kenshis): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'No',
                'Nomor Induk (NIK)',
                'Nama Lengkap',
                'Nama Panggilan',
                'Tipe Anggota',
                'Jenis Kelamin',
                'Tingkatan (Rank)',
                'Dojo Cabang',
                'Kode Dojo',
                'Email Akun',
                'Nomor Telepon',
                'Alamat',
                'Tanggal Bergabung',
                'Status Aktif',
            ]);

            foreach ($kenshis as $index => $k) {
                fputcsv($handle, [
                    $index + 1,
                    $k->id_card_number,
                    $k->full_name,
                    $k->nickname ?? '-',
                    $k->member_type === 'coach' ? 'Pelatih' : 'Atlet / Kenshi',
                    $k->gender === 'M' ? 'Putra' : 'Putri',
                    $k->rank->label(),
                    $k->dojo?->name ?? '-',
                    $k->dojo?->code ?? '-',
                    $k->user?->email ?? '-',
                    $k->phone ?? '-',
                    $k->address ?? '-',
                    $k->joined_at?->format('Y-m-d') ?? '-',
                    $k->is_active ? 'Aktif' : 'Non-Aktif',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Download template for importing kenshi spreadsheet.
     */
    public function downloadTemplate(): StreamedResponse
    {
        $filename = 'template_import_kenshi_perkemi.csv';

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'id_card_number',
                'full_name',
                'nickname',
                'member_type',
                'gender',
                'rank',
                'dojo_code',
                'email',
                'phone',
                'date_of_birth',
                'address',
            ]);

            fputcsv($handle, [
                'KNS-SBY-010',
                'Budi Santoso',
                'Budi',
                'athlete',
                'M',
                'Kyu 1',
                'DOJO-SBY-001',
                'budi.santoso@gmail.com',
                '081234567890',
                '2002-05-15',
                'Jl. Raya Sawahan No. 12, Surabaya',
            ]);

            fputcsv($handle, [
                'PEL-SBY-011',
                'Sensei Bambang Wijaya',
                'Bambang',
                'coach',
                'M',
                'III Dan',
                'DOJO-SBY-001',
                'bambang.sensei@perkemi.id',
                '081398765432',
                '1988-10-20',
                'Komplek Olahraga Sawahan, Surabaya',
            ]);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Import kenshis and coaches from uploaded spreadsheet.
     */
    public function import(Request $request, ImportKenshisAction $action): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $result = $action->execute($request->file('file'));

        if ($result['imported'] === 0 && ! empty($result['errors'])) {
            return back()->with('error', 'Gagal mengimpor: '.implode(' ', array_slice($result['errors'], 0, 3)));
        }

        $msg = "Berhasil mengimpor {$result['imported']} data Kenshi/Pelatih. Akun login dibuat otomatis dengan password default NIK.";
        if ($result['skipped'] > 0) {
            $msg .= " ({$result['skipped']} baris dilewati).";
        }

        return redirect()->route('kenshis.index')->with('success', $msg);
    }

    /**
     * Show the form for registering a new kenshi.
     */
    public function create(): Response
    {
        $this->authorize('create', Kenshi::class);

        $dojos = Dojo::active()->select('id', 'name', 'code', 'pengprov', 'status')->get();
        $pengkots = Pengurus::pengkot()->active()->orderBy('name')->get(['id', 'name', 'code', 'region']);
        $pengprovs = Pengurus::pengprov()->active()->orderBy('name')->get(['id', 'name', 'code', 'region']);

        return Inertia::render('Kenshis/Create', [
            'dojos' => DojoResource::collection($dojos),
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
            'pengkots' => $pengkots,
            'pengprovs' => $pengprovs,
        ]);
    }

    /**
     * Store a newly created kenshi using the RegisterKenshiAction.
     */
    public function store(StoreKenshiRequest $request, RegisterKenshiAction $action): RedirectResponse
    {
        $kenshi = $action->execute($request->validated());

        return $this->redirectWithSuccess('kenshis.index', "Kenshi [{$kenshi->full_name}] ({$kenshi->id_card_number}) berhasil terdaftar.");
    }

    /**
     * Display the specified kenshi profile.
     */
    public function show(Kenshi $kenshi): Response
    {
        $this->authorize('view', $kenshi);

        $kenshi->load(['dojo', 'user', 'pengkotOrg', 'pengprovOrg']);

        return Inertia::render('Kenshis/Show', [
            'kenshi' => new KenshiResource($kenshi),
        ]);
    }

    /**
     * Show the form for editing the specified kenshi.
     */
    public function edit(Kenshi $kenshi): Response
    {
        $this->authorize('update', $kenshi);

        $dojos = Dojo::active()->select('id', 'name', 'code', 'pengprov', 'status')->get();
        $pengkots = Pengurus::pengkot()->active()->orderBy('name')->get(['id', 'name', 'code', 'region']);
        $pengprovs = Pengurus::pengprov()->active()->orderBy('name')->get(['id', 'name', 'code', 'region']);

        return Inertia::render('Kenshis/Edit', [
            'kenshi' => new KenshiResource($kenshi),
            'dojos' => DojoResource::collection($dojos),
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
            'pengkots' => $pengkots,
            'pengprovs' => $pengprovs,
        ]);
    }

    /**
     * Update the specified kenshi record.
     */
    public function update(UpdateKenshiRequest $request, Kenshi $kenshi): RedirectResponse
    {
        $validated = $request->validated();

        $isPengkot = ! empty($validated['is_atlet_pengkot']) || ! empty($validated['pengkot_id']);
        $validated['is_atlet_pengkot'] = $isPengkot;
        if (! $isPengkot) {
            $validated['pengkot_id'] = null;
            $validated['pengkot'] = null;
        } elseif (empty($validated['pengkot']) && ! empty($validated['pengkot_id'])) {
            $pengkot = Pengurus::find($validated['pengkot_id']);
            $validated['pengkot'] = $pengkot?->region ?? $pengkot?->name;
        }

        $isPengprov = ! empty($validated['is_atlet_pengprov']) || ! empty($validated['pengprov_id']);
        $validated['is_atlet_pengprov'] = $isPengprov;
        if (! $isPengprov) {
            $validated['pengprov_id'] = null;
            $validated['pengprov'] = null;
        } elseif (empty($validated['pengprov']) && ! empty($validated['pengprov_id'])) {
            $pengprov = Pengurus::find($validated['pengprov_id']);
            $validated['pengprov'] = $pengprov?->region ?? $pengprov?->name;
        }

        $kenshi->update($validated);

        activity('kenshi')
            ->performedOn($kenshi)
            ->causedBy(auth()->user())
            ->log("Data kenshi [{$kenshi->full_name}] ({$kenshi->id_card_number}) diperbarui.");

        return $this->redirectWithSuccess('kenshis.index', "Data kenshi [{$kenshi->full_name}] berhasil diperbarui.");
    }

    /**
     * Soft delete the specified kenshi.
     */
    public function destroy(Kenshi $kenshi): RedirectResponse
    {
        $this->authorize('delete', $kenshi);

        $kenshi->delete();

        activity('kenshi')
            ->performedOn($kenshi)
            ->causedBy(auth()->user())
            ->log("Kenshi [{$kenshi->full_name}] ({$kenshi->id_card_number}) dinonaktifkan.");

        return $this->redirectWithSuccess('kenshis.index', "Kenshi [{$kenshi->full_name}] berhasil dinonaktifkan.");
    }
}
