<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::where('user_id', auth()->id())->get();
        return Inertia::render('Dashboard', [
            'activities' => $activities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label'      => 'required|string|max:255',
            'start_time' => 'required',
            'end_time'   => 'required',
            'type'       => 'required|in:pro,perso',
            'days'       => 'required|array|min:1',
        ]);

        $groupId = Str::uuid();

        foreach ($validated['days'] as $day) {
            for ($i = 0; $i < 4; $i++) {
                Activity::create([
                    'label'       => $validated['label'],
                    'start_time'  => $validated['start_time'],
                    'end_time'    => $validated['end_time'],
                    'type'        => $validated['type'],
                    'day_of_week' => $day,
                    'user_id'     => auth()->id(),
                    'week_index'  => $i,
                    'group_id'    => $groupId,
                ]);
            }
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
            'end_time'   => 'required',
            'type'       => 'required|in:pro,perso',
            'scope'      => 'required|in:single,series',
        ]);

        if ($request->scope === 'series' && $activity->group_id) {
            Activity::where('group_id', $activity->group_id)
                ->where('user_id', auth()->id())
                ->update([
                    'label'      => $validated['label'],
                    'start_time' => $validated['start_time'],
                    'end_time'   => $validated['end_time'],
                    'type'       => $validated['type'],
                ]);
        } else {
            $activity->update([
                'label'      => $validated['label'],
                'start_time' => $validated['start_time'],
                'end_time'   => $validated['end_time'],
                'type'       => $validated['type'],
                'group_id'   => null, 
            ]);
        }

        return redirect()->back();
    }

    public function destroy(Request $request, Activity $activity)
    {
        if ($activity->user_id !== auth()->id()) {
            abort(403);
        }

        $scope = $request->input('scope', 'single');

        if ($scope === 'series' && $activity->group_id) {
            Activity::where('group_id', $activity->group_id)
                ->where('user_id', auth()->id())
                ->delete();
        } else {
            $activity->delete();
        }

        return redirect()->back();
    }
}