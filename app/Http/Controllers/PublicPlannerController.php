<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Inertia\Inertia;

class PublicPlannerController extends Controller
{
    public function show($slug)
    {
        $profile = Profile::where('slug', $slug)
                          ->where('is_public', true)
                          ->firstOrFail();

        $activities = $profile->activities;

        return Inertia::render('PublicPlanner', [
            'profileName' => $profile->name,
            'activities' => $activities,
        ]);
    }
}
