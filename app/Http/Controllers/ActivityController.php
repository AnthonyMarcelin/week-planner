<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ActivityController extends Controller
{
    private $daysMap = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    public function index()
    {
        return Inertia::render('Dashboard', [
            'activities' => auth()->user()->activities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label'      => 'required|string|max:255',
            'start_time' => 'required',
            'end_time'   => 'required|after:start_time',
            'type'       => 'required|in:pro,perso',
            'days'       => 'required|array|min:1',
        ]);

        foreach ($validated['days'] as $dayIndex) {
            if ($this->hasOverlap($dayIndex, $validated['start_time'], $validated['end_time'])) {
                throw ValidationException::withMessages([
                    'days' => "Chevauchement détecté le " . $this->daysMap[$dayIndex] . " sur ce créneau.",
                ]);
            }
        }

        foreach ($validated['days'] as $day) {
            Activity::create([
                'label'       => $validated['label'],
                'start_time'  => $validated['start_time'],
                'end_time'    => $validated['end_time'],
                'type'        => $validated['type'],
                'day_of_week' => $day,
                'user_id'     => auth()->id(),
            ]);
        }

        return redirect()->back();
    }

    public function update(Request $request, Activity $activity)
    {
        if ($activity->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'label'      => 'required|string|max:255',
            'start_time' => 'required',
            'end_time'   => 'required|after:start_time',
            'type'       => 'required|in:pro,perso',
        ]);

        if ($this->hasOverlap($activity->day_of_week, $validated['start_time'], $validated['end_time'], $activity->id)) {
            throw ValidationException::withMessages([
                'start_time' => "Ce créneau chevauche une autre activité existante.",
            ]);
        }

        $activity->update($validated);

        return redirect()->back();
    }

    public function destroy(Activity $activity)
    {
        if ($activity->user_id !== auth()->id()) {
            abort(403);
        }

        $activity->delete();

        return redirect()->back();
    }

    private function hasOverlap($dayOfWeek, $startTime, $endTime, $ignoreId = null)
    {
        return Activity::where('user_id', auth()->id())
            ->where('day_of_week', $dayOfWeek)
            ->where('id', '!=', $ignoreId)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })
            ->exists();
    }
}