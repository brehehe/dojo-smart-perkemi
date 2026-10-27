<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\TrainingSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TrainingSchedule
 */
class TrainingScheduleResource extends JsonResource
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
            'dojo_id' => $this->dojo_id,
            'dojo' => $this->whenLoaded('dojo', fn () => $this->dojo ? [
                'id' => $this->dojo->id,
                'name' => $this->dojo->name,
                'code' => $this->dojo->code,
                'pengprov' => $this->dojo->pengprov,
                'pengkab' => $this->dojo->pengkab,
                'address' => $this->dojo->address,
                'city' => $this->dojo->city,
                'latitude' => $this->dojo->latitude,
                'longitude' => $this->dojo->longitude,
                'google_maps_url' => $this->dojo->metadata['google_maps_url'] ?? null,
            ] : null),
            'title' => $this->title,
            'program_type' => $this->program_type ? [
                'value' => $this->program_type->value,
                'label' => $this->program_type->label(),
                'color' => $this->program_type->badgeColor(),
            ] : null,
            'date' => $this->date ? (is_string($this->date) ? $this->date : $this->date->format('Y-m-d')) : null,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'location_name' => $this->location_name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'radius_meters' => $this->radius_meters,
            'instructor_name' => $this->instructor_name,
            'notes' => $this->notes,
            'status' => $this->status,
            'attendances_count' => $this->whenCounted('attendances'),
            'attendances' => AttendanceResource::collection($this->whenLoaded('attendances')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
