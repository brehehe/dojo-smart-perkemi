<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Attendance
 */
class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'training_schedule_id' => $this->training_schedule_id,
            'kenshi_id' => $this->kenshi_id,
            'kenshi' => $this->whenLoaded('kenshi', fn () => $this->kenshi ? [
                'id' => $this->kenshi->id,
                'id_card_number' => $this->kenshi->id_card_number,
                'full_name' => $this->kenshi->full_name,
                'nickname' => $this->kenshi->nickname,
                'gender' => $this->kenshi->gender,
                'rank' => $this->kenshi->rank ? [
                    'value' => $this->kenshi->rank->value,
                    'label' => $this->kenshi->rank->label(),
                    'belt_color' => $this->kenshi->rank->beltColor(),
                ] : null,
            ] : null),
            'schedule' => $this->whenLoaded('schedule', fn () => $this->schedule ? [
                'id' => $this->schedule->id,
                'title' => $this->schedule->title,
                'date' => is_string($this->schedule->date) ? $this->schedule->date : $this->schedule->date?->format('Y-m-d'),
                'start_time' => $this->schedule->start_time,
                'end_time' => $this->schedule->end_time,
                'location_name' => $this->schedule->location_name,
            ] : null),
            'status' => $this->status ? [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'color' => $this->status->badgeColor(),
            ] : null,
            'check_in_at' => $this->check_in_at?->format('H:i:s d/m/Y'),
            'check_in_time' => $this->check_in_at?->format('H:i'),
            'photo_url' => $this->photo_url,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'location_accuracy' => $this->location_accuracy,
            'distance_meters' => $this->distance_meters,
            'is_within_radius' => (bool) $this->is_within_radius,
            'verifier' => $this->whenLoaded('verifier', fn () => $this->verifier ? [
                'id' => $this->verifier->id,
                'name' => $this->verifier->name,
            ] : null),
            'verified_by' => $this->verified_by,
            'is_approved' => ! empty($this->verified_by),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
