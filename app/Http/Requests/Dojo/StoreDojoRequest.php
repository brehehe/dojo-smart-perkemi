<?php

declare(strict_types=1);

namespace App\Http\Requests\Dojo;

use App\Enums\DojoStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDojoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('dojo.create') ?? true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:dojos,code'],
            'name' => ['required', 'string', 'max:150'],
            'pengprov' => ['required', 'string', 'max:100'],
            'pengkab' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_meters' => ['nullable', 'integer', 'min:10', 'max:5000'],
            'head_sensei_id' => ['nullable', 'exists:users,id'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:100'],
            'status' => ['required', Rule::enum(DojoStatus::class)],
        ];
    }

    /**
     * Custom attribute names for validation.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'code' => 'Kode Dojo',
            'name' => 'Nama Dojo',
            'pengprov' => 'Pengprov Perkemi',
            'pengkab' => 'Pengkab / Pengkot',
            'status' => 'Status Dojo',
        ];
    }
}
