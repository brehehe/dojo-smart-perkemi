<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\DojoResource;
use App\Http\Resources\KenshiResource;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\Pengurus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengurusController extends Controller
{
    /**
     * Display Pengkot / Pengkab profile, affiliated dojos, and registered athletes.
     */
    public function pengkot(Request $request): Response
    {
        $user = $request->user();

        // Resolve active Pengkot
        $pengkotId = $request->query('id');
        $pengkot = null;

        if ($pengkotId) {
            $pengkot = Pengurus::pengkot()->find($pengkotId);
        }

        if (! $pengkot && $user->hasRole('PengkabAdmin')) {
            $pengkot = Pengurus::pengkot()->where('user_id', $user->id)->first();
        }

        if (! $pengkot) {
            $pengkot = Pengurus::pengkot()->where('region', 'Kota Surabaya')->first()
                ?? Pengurus::pengkot()->firstOrFail();
        }

        $allPengkots = Pengurus::pengkot()->active()->orderBy('name')->get();

        // Affiliated dojos in this city
        $dojos = Dojo::where(function ($q) use ($pengkot) {
            $q->where('pengkab', $pengkot->region)
                ->orWhere('city', $pengkot->region)
                ->orWhere('pengkab', 'like', "%{$pengkot->region}%");
        })->with('headSensei')->get();

        // Registered Atlet Pengkot
        $athletes = Kenshi::where(function ($q) use ($pengkot) {
            $q->where('pengkot_id', $pengkot->id)
                ->orWhere(function ($sub) use ($pengkot) {
                    $sub->where('is_atlet_pengkot', true)
                        ->where('pengkot', $pengkot->region);
                });
        })->with(['dojo', 'user'])->latest()->get();

        $totalAthletes = $athletes->count();
        $yudanshaCount = $athletes->filter(fn (Kenshi $k) => $k->rank?->isDan())->count();
        $mudanshaCount = $totalAthletes - $yudanshaCount;

        $canEdit = $user->hasRole('SuperAdmin') || ($user->hasRole('PengkabAdmin') && $pengkot->user_id === $user->id);

        return Inertia::render('Pengurus/Pengkot', [
            'pengkot' => $pengkot,
            'allPengkots' => $allPengkots,
            'dojos' => DojoResource::collection($dojos),
            'athletes' => KenshiResource::collection($athletes),
            'stats' => [
                'total_dojos' => $dojos->count(),
                'total_athletes' => $totalAthletes,
                'yudansha_count' => $yudanshaCount,
                'mudansha_count' => $mudanshaCount,
            ],
            'canEdit' => $canEdit,
        ]);
    }

    /**
     * Display Pengprov profile, affiliated dojos across the province, and provincial athletes.
     */
    public function pengprov(Request $request): Response
    {
        $user = $request->user();

        // Resolve active Pengprov
        $pengprovId = $request->query('id');
        $pengprov = null;

        if ($pengprovId) {
            $pengprov = Pengurus::pengprov()->find($pengprovId);
        }

        if (! $pengprov && $user->hasRole('PengprovAdmin')) {
            $pengprov = Pengurus::pengprov()->where('user_id', $user->id)->first();
        }

        if (! $pengprov) {
            $pengprov = Pengurus::pengprov()->where('region', 'Jawa Timur')->first()
                ?? Pengurus::pengprov()->firstOrFail();
        }

        $allPengprovs = Pengurus::pengprov()->active()->orderBy('name')->get();

        // Affiliated dojos in this province
        $dojos = Dojo::where(function ($q) use ($pengprov) {
            $q->where('pengprov', $pengprov->region)
                ->orWhere('pengprov', 'like', "%{$pengprov->region}%");
        })->with('headSensei')->get();

        // Registered Atlet Pengprov
        $athletes = Kenshi::where(function ($q) use ($pengprov) {
            $q->where('pengprov_id', $pengprov->id)
                ->orWhere(function ($sub) use ($pengprov) {
                    $sub->where('is_atlet_pengprov', true)
                        ->where('pengprov', $pengprov->region);
                });
        })->with(['dojo', 'user'])->latest()->get();

        $totalAthletes = $athletes->count();
        $yudanshaCount = $athletes->filter(fn (Kenshi $k) => $k->rank?->isDan())->count();
        $mudanshaCount = $totalAthletes - $yudanshaCount;

        $canEdit = $user->hasRole('SuperAdmin') || ($user->hasRole('PengprovAdmin') && $pengprov->user_id === $user->id);

        return Inertia::render('Pengurus/Pengprov', [
            'pengprov' => $pengprov,
            'allPengprovs' => $allPengprovs,
            'dojos' => DojoResource::collection($dojos),
            'athletes' => KenshiResource::collection($athletes),
            'stats' => [
                'total_dojos' => $dojos->count(),
                'total_athletes' => $totalAthletes,
                'yudansha_count' => $yudanshaCount,
                'mudansha_count' => $mudanshaCount,
            ],
            'canEdit' => $canEdit,
        ]);
    }

    /**
     * Update committee details (SK, Ketua, Sekretaris, Kontak, Alamat, Motto).
     */
    public function update(Request $request, Pengurus $pengurus): RedirectResponse
    {
        $user = $request->user();

        // Authorization check
        $isAuthorized = $user->hasRole('SuperAdmin')
            || ($pengurus->type === 'pengkot' && $user->hasRole('PengkabAdmin') && $pengurus->user_id === $user->id)
            || ($pengurus->type === 'pengprov' && $user->hasRole('PengprovAdmin') && $pengurus->user_id === $user->id);

        if (! $isAuthorized) {
            abort(403, 'Anda tidak memiliki hak akses untuk memperbarui kepengurusan ini.');
        }

        $validated = $request->validate([
            'leader_name' => ['required', 'string', 'max:150'],
            'secretary_name' => ['nullable', 'string', 'max:150'],
            'sk_number' => ['nullable', 'string', 'max:100'],
            'sk_period' => ['nullable', 'string', 'max:50'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'metadata' => ['nullable', 'array'],
        ]);

        $pengurus->update($validated);

        activity('pengurus')
            ->performedOn($pengurus)
            ->causedBy($user)
            ->log("Profil kepengurusan {$pengurus->name} diperbarui.");

        return back()->with('success', "Profil kepengurusan {$pengurus->name} berhasil diperbarui.");
    }
}
