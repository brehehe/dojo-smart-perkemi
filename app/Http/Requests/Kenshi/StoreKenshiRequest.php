<?php

declare(strict_types=1);

namespace App\Http\Requests\Kenshi;

use App\Enums\KenshiRank;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKenshiRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('kenshi.manage') ?? true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_card_number' => ['required', 'string', 'max:30', 'unique:kenshis,id_card_number'],
            'dojo_id' => ['required', 'exists:dojos,id'],
            'full_name' => ['required', 'string', 'max:150'],
            'nickname' => ['nullable', 'string', 'max:50'],
            'gender' => ['required', Rule::in(['M', 'F'])],
            'place_of_birth' => ['nullable', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'rank' => ['required', Rule::enum(KenshiRank::class)],
            'member_type' => ['nullable', Rule::in(['athlete', 'coach'])],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'joined_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
            'create_user_account' => ['boolean'],
            'email' => ['required_if:create_user_account,true', 'nullable', 'email', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:4'],
        ];
    }
}
