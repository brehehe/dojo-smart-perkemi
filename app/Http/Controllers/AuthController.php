<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\DojoStatus;
use App\Enums\KenshiRank;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
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
     * Show registration form for new kenshi members.
     */
    public function showRegister(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return $this->redirectByRole(Auth::user());
        }

        $dojos = Dojo::where('status', DojoStatus::Active)
            ->select('id', 'name', 'code', 'pengprov', 'city')
            ->orderBy('name')
            ->get();

        $ranks = collect(KenshiRank::cases())->map(fn (KenshiRank $rank) => [
            'value' => $rank->value,
            'label' => $rank->label(),
        ]);

        return Inertia::render('Auth/Register', [
            'dojos' => $dojos,
            'ranks' => $ranks,
        ]);
    }

    /**
     * Process registration for new kenshi members.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'dojo_id' => ['required', 'uuid', 'exists:dojos,id'],
            'id_card_number' => ['nullable', 'string', 'max:30', 'unique:kenshis,id_card_number'],
            'gender' => ['required', Rule::in(['M', 'F'])],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'rank' => ['nullable', Rule::enum(KenshiRank::class)],
        ]);

        $user = DB::transaction(function () use ($validated): User {
            $user = User::create([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $user->assignRole('Kenshi');

            $idCard = ! empty($validated['id_card_number'])
                ? $validated['id_card_number']
                : 'KNS-'.date('Y').'-'.str_pad((string) (Kenshi::count() + 1), 4, '0', STR_PAD_LEFT);

            $rank = ! empty($validated['rank'])
                ? KenshiRank::from($validated['rank'])
                : KenshiRank::Minarai;

            Kenshi::create([
                'user_id' => $user->id,
                'dojo_id' => $validated['dojo_id'],
                'id_card_number' => $idCard,
                'full_name' => $validated['full_name'],
                'gender' => $validated['gender'],
                'rank' => $rank,
                'member_type' => 'athlete',
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'joined_at' => now()->toDateString(),
                'is_active' => true,
            ]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('kenshis.portal')
            ->with('success', 'Registrasi Kenshi berhasil! Selamat datang di Perkemi e-Dojo.');
    }

    /**
     * Process authentication with credentials.
     */
    public function login(Request $request): RedirectResponse
    {
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

        return redirect()->route('login')
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
