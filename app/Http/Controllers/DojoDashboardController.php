<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\KenshiRank;
use App\Http\Resources\DojoResource;
use App\Http\Resources\KenshiResource;
use App\Models\Dojo;
use App\Models\Kenshi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DojoDashboardController extends Controller
{
    /**
     * Display the analytics and monitoring dashboard for the authenticated Sensei's dojo.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Resolve the dojo managed by this sensei, or fallback to the first active dojo for testing/superadmins
        $dojo = Dojo::where('head_sensei_id', $user->id)->first()
            ?? Dojo::active()->firstOrFail();

        $kenshisQuery = Kenshi::where('dojo_id', $dojo->id);

        $totalKenshis = (clone $kenshisQuery)->count();
        $activeKenshis = (clone $kenshisQuery)->where('is_active', true)->count();
        $inactiveKenshis = $totalKenshis - $activeKenshis;

        // Rank distribution analysis
        $allKenshis = (clone $kenshisQuery)->get();
        $yudanshaCount = $allKenshis->filter(fn (Kenshi $k) => $k->rank->isDan())->count();
        $mudanshaCount = $totalKenshis - $yudanshaCount;

        // Group by rank category for interactive chart
        $rankDistribution = [
            'Dan (Yudansha)' => $yudanshaCount,
            'Coklat (Kyu 1 - 3)' => $allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu1, KenshiRank::Kyu2, KenshiRank::Kyu3]))->count(),
            'Hijau/Biru (Kyu 4 - 6)' => $allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu4, KenshiRank::Kyu5, KenshiRank::Kyu6]))->count(),
            'Kuning/Putih (Kyu 7 - Minarai)' => $allKenshis->filter(fn (Kenshi $k) => in_array($k->rank, [KenshiRank::Kyu7, KenshiRank::Kyu8, KenshiRank::Minarai]))->count(),
        ];

        // Eligible for UKT exam (attendance > 85% or ready_for_ukt metadata)
        $readyForUktCount = $allKenshis->filter(function (Kenshi $k) {
            return ($k->metadata['attendance_rate'] ?? 0) >= 85 || ($k->metadata['ready_for_ukt'] ?? false) === true;
        })->count();

        // Paginated roster with search
        $searchTerm = $request->query('search');
        $rankFilter = $request->query('rank');

        $roster = Kenshi::where('dojo_id', $dojo->id)
            ->search($searchTerm)
            ->when($rankFilter, fn ($q, $r) => $q->where('rank', $r))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dojos/Analytics', [
            'dojo' => new DojoResource($dojo->load('headSensei')),
            'stats' => [
                'total_kenshis' => $totalKenshis,
                'active_kenshis' => $activeKenshis,
                'inactive_kenshis' => $inactiveKenshis,
                'active_percentage' => $totalKenshis > 0 ? round(($activeKenshis / $totalKenshis) * 100) : 0,
                'yudansha_count' => $yudanshaCount,
                'mudansha_count' => $mudanshaCount,
                'ready_for_ukt_count' => $readyForUktCount,
                'rank_distribution' => $rankDistribution,
            ],
            'roster' => KenshiResource::collection($roster),
            'filters' => [
                'search' => $searchTerm,
                'rank' => $rankFilter,
            ],
            'ranks' => collect(KenshiRank::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
        ]);
    }
}
