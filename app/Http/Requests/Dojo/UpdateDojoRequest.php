<?php

declare(strict_types=1);

namespace App\Http\Requests\Dojo;

use App\Enums\DojoStatus;
use App\Models\Dojo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDojoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('dojo.update') ?? true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $dojoId = $this->route('dojo') instanceof Dojo
            ? $this->route('dojo')->id
            : $this->route('dojo');

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('dojos', 'code')->ignore($dojoId)],
            'name' => ['required', 'string', 'max:150'],
            'pengprov' => ['required', 'string', 'max:100'],
            'pengkab' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'head_sensei_id' => ['nullable', 'exists:users,id'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'contact_email' => ['nullable', 'email', 'max:100'],
            'status' => ['required', Rule::enum(DojoStatus::class)],
        ];
    }
}
