<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AgendaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->profiles()->create([
            'name' => $request->name,
            'slug' => Str::random(10),
            'is_public' => false,
        ]);

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $agenda = Profile::findOrFail($id);

        if ($agenda->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_public' => 'boolean',
        ]);

        $agenda->update($validated);

        return redirect()->back();
    }

    public function destroy($id)
    {
        $agenda = Profile::findOrFail($id);

        if ($agenda->user_id !== Auth::id()) {
            abort(403);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->profiles()->count() <= 1) {
            return redirect()->back()->withErrors(['agenda' => 'Vous devez garder au moins un agenda.']);
        }

        $agenda->delete();

        return redirect()->back();
    }
}
