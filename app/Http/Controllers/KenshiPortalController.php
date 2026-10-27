<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\KenshiRank;
use App\Http\Resources\KenshiResource;
use App\Models\Kenshi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KenshiPortalController extends Controller
{
    /**
     * Display the member portal, interactive Digital Member Card (KTA), and UKT roadmap.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Find kenshi linked to this user, or fallback to first kenshi for preview
        $kenshi = $user->kenshi()->with('dojo')->first()
            ?? Kenshi::with('dojo')->firstOrFail();

        // Calculate UKT Roadmap steps
        $allRanks = [
            KenshiRank::Minarai,
            KenshiRank::Kyu8,
            KenshiRank::Kyu7,
            KenshiRank::Kyu6,
            KenshiRank::Kyu5,
            KenshiRank::Kyu4,
            KenshiRank::Kyu3,
            KenshiRank::Kyu2,
            KenshiRank::Kyu1,
            KenshiRank::Dan1,
            KenshiRank::Dan2,
            KenshiRank::Dan3,
        ];

        $currentRankIndex = array_search($kenshi->rank, $allRanks);
        if ($currentRankIndex === false) {
            $currentRankIndex = 0;
        }

        $roadmap = array_map(function (KenshiRank $r, int $idx) use ($currentRankIndex) {
            return [
                'rank' => $r->value,
                'label' => $r->label(),
                'belt_color' => $r->beltColor(),
                'is_completed' => $idx < $currentRankIndex,
                'is_current' => $idx === $currentRankIndex,
                'is_upcoming' => $idx > $currentRankIndex,
            ];
        }, $allRanks, array_keys($allRanks));

        return Inertia::render('Kenshis/Portal', [
            'kenshi' => new KenshiResource($kenshi),
            'roadmap' => $roadmap,
            'cardSecurityHash' => hash('sha256', "PERKEMI:{$kenshi->id_card_number}:{$kenshi->dojo_id}"),
        ]);
    }
}
