<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Dojo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Dojo
 */
class DojoResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
            'pengprov' => $this->pengprov,
            'pengkab' => $this->pengkab,
            'address' => $this->address,
            'city' => $this->city,
            'latitude' => $this->latitude ?? $this->metadata['latitude'] ?? null,
            'longitude' => $this->longitude ?? $this->metadata['longitude'] ?? null,
            'maps_url' => $this->metadata['google_maps_url'] ?? ($this->latitude ? "https://www.google.com/maps?q={$this->latitude},{$this->longitude}" : null),
            'head_sensei' => $this->whenLoaded('headSensei', fn () => $this->headSensei ? [
                'id' => $this->headSensei->id,
                'name' => $this->headSensei->name,
                'email' => $this->headSensei->email,
            ] : null),
            'contact_phone' => $this->contact_phone,
            'contact_email' => $this->contact_email,
            'status' => $this->status ? [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'color' => $this->status->badgeColor(),
            ] : null,
            'kenshis_count' => $this->whenCounted('kenshis'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
