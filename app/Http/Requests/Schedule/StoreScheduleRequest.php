<?php

declare(strict_types=1);

namespace App\Http\Requests\Schedule;

use App\Enums\ScheduleProgramType;
use App\Models\TrainingSchedule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        return $user->can('create', TrainingSchedule::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'dojo_id' => ['required', 'uuid', 'exists:dojos,id'],
            'title' => ['required', 'string', 'max:150'],
            'program_type' => ['required', Rule::enum(ScheduleProgramType::class)],
            'start_time' => ['required', 'string', 'max:10'],
            'end_time' => ['required', 'string', 'max:10'],
            'location_name' => ['nullable', 'string', 'max:150'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_meters' => ['nullable', 'integer', 'min:10', 'max:5000'],
            'instructor_name' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'mode' => ['nullable', 'string', 'in:single,multi,recurring'],
            'date' => ['required_if:mode,single', 'nullable', 'date'],
            'dates' => ['required_if:mode,multi', 'nullable', 'array', 'min:1'],
            'dates.*' => ['date'],
            'days_of_week' => ['required_if:mode,recurring', 'nullable', 'array', 'min:1'],
            'days_of_week.*' => ['integer', 'between:0,6'],
            'start_date' => ['required_if:mode,recurring', 'nullable', 'date'],
            'end_date' => ['required_if:mode,recurring', 'nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
