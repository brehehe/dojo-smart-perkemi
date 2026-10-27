<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Kenshi;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Kenshi
 */
class KenshiResource extends JsonResource
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
            'id_card_number' => $this->id_card_number,
            'full_name' => $this->full_name,
            'nickname' => $this->nickname,
            'gender' => $this->gender,
            'place_of_birth' => $this->place_of_birth,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'blood_type' => $this->blood_type,
            'rank' => $this->rank ? [
                'value' => $this->rank->value,
                'label' => $this->rank->label(),
                'belt_color' => $this->rank->beltColor(),
                'is_dan' => $this->rank->isDan(),
            ] : null,
            'member_type' => $this->member_type ?? 'athlete',
            'phone' => $this->phone,
            'address' => $this->address,
            'is_active' => $this->is_active,
            'joined_at' => $this->joined_at?->format('Y-m-d'),
            'dojo' => $this->whenLoaded('dojo', fn () => $this->dojo ? [
                'id' => $this->dojo->id,
                'name' => $this->dojo->name,
                'code' => $this->dojo->code,
                'pengprov' => $this->dojo->pengprov,
            ] : null),
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'email' => $this->user->email,
            ] : null),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
