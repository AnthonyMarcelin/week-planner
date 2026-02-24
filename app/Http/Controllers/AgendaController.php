<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AgendaController extends Controller
{
    use AuthorizesRequests;
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->profiles()->create([
            'name' => $request->name,
            'slug' => Str::random(24),
            'is_public' => false,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Profile $agenda)
    {
        $this->authorize('update', $agenda);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_public' => 'boolean',
        ]);

        $agenda->update($validated);

        return redirect()->back();
    }

    public function destroy(Profile $agenda)
    {
        $this->authorize('delete', $agenda);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->profiles()->count() <= 1) {
            return redirect()->back()->withErrors(['agenda' => 'Vous devez garder au moins un agenda.']);
        }

        $agenda->delete();

        return redirect()->back();
    }
}
