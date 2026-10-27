<?php

declare(strict_types=1);

namespace App\Http\Requests\Attendance;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'training_schedule_id' => ['required', 'uuid', 'exists:training_schedules,id'],
            'kenshi_id' => ['required', 'uuid', 'exists:kenshis,id'],
            'status' => ['required', Rule::enum(AttendanceStatus::class)],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric', 'min:0'],
            'photo' => ['nullable'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
