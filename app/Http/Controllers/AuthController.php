<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show login form.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectByRole(Auth::user());
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Process authentication with support for multi-role quick demo login.
     */
    public function login(Request $request): RedirectResponse
    {
        // Multi-role demo login switch
        if ($request->filled('demo_role')) {
            $roleEmailMap = [
                'superadmin' => 'admin@perkemi.id',
                'sensei_senayan' => 'sensei.senayan@perkemi.id',
                'sensei_ugm' => 'sensei.ugm@perkemi.id',
                'kenshi_arya' => 'arya.kenshi@perkemi.id',
                'kenshi_dewi' => 'dewi.kenshi@perkemi.id',
            ];

            $email = $roleEmailMap[$request->string('demo_role')->toString()] ?? 'admin@perkemi.id';
            $user = User::where('email', $email)->first();

            if ($user) {
                Auth::login($user);
                $request->session()->regenerate();

                return $this->redirectByRole($user)
                    ->with('success', "Masuk sebagai {$user->name}.");
            }
        }

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            return $this->redirectByRole($user)
                ->with('success', "Selamat datang, {$user->name}.");
        }

        return back()->withErrors([
            'email' => 'Email atau kata sandi tidak cocok dengan data kami.',
        ])->onlyInput('email');
    }

    /**
     * Destroy authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('dojos.index')
            ->with('info', 'Anda telah keluar dari sistem.');
    }

    /**
     * Redirect user based on their primary role.
     */
    private function redirectByRole(User $user): RedirectResponse
    {
        if ($user->hasRole('Sensei')) {
            return redirect()->route('dojos.analytics');
        }

        if ($user->hasRole('Kenshi')) {
            return redirect()->route('kenshis.portal');
        }

        return redirect()->route('dojos.index');
    }
}
