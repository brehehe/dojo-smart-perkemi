import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Minimalist Japanese Dojo Architecture Line Art (Pagoda eaves, lattice entrance, wooden pillars)
const JapaneseDojoLineArt = () => (
    <svg
        viewBox="0 0 360 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[260px] xl:max-w-[300px] max-h-[90px] xl:max-h-[115px] text-white/20 select-none pointer-events-none transition-opacity duration-300 shrink-0"
        aria-hidden="true"
    >
        {/* Upper roof ridge finial */}
        <path d="M140 35 L180 32 L220 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M177 26 L180 23 L183 26 V32 H177 V26Z" stroke="currentColor" strokeWidth="1.5" />

        {/* Main Pagoda Curved Upper Roof */}
        <path
            d="M70 70 C110 50 150 42 180 42 C210 42 250 50 290 70 L285 75 C248 58 212 50 180 50 C148 50 112 58 75 75 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
        />
        {/* Upturned Eaves */}
        <path d="M68 68 C64 64 60 58 56 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M292 68 C296 64 300 58 304 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

        {/* Secondary Lower Roof */}
        <path
            d="M40 100 C90 85 140 80 180 80 C220 80 270 85 320 100 L316 106 C270 93 222 88 180 88 C138 88 90 93 44 106 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
        />
        <path d="M38 98 C33 93 28 85 24 74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M322 98 C327 93 332 85 336 74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

        {/* Supporting Structural Pillars */}
        <line x1="80" y1="106" x2="80" y2="152" stroke="currentColor" strokeWidth="1.5" />
        <line x1="120" y1="106" x2="120" y2="152" stroke="currentColor" strokeWidth="1.5" />
        <line x1="240" y1="106" x2="240" y2="152" stroke="currentColor" strokeWidth="1.5" />
        <line x1="280" y1="106" x2="280" y2="152" stroke="currentColor" strokeWidth="1.5" />

        {/* Center Entrance Gate & Lattice Doors */}
        <rect x="135" y="106" width="90" height="46" stroke="currentColor" strokeWidth="1.5" rx="1" />
        <line x1="180" y1="106" x2="180" y2="152" stroke="currentColor" strokeWidth="1.5" />
        <line x1="135" y1="118" x2="225" y2="118" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="135" y1="130" x2="225" y2="130" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="135" y1="142" x2="225" y2="142" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="150" y1="106" x2="150" y2="152" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="165" y1="106" x2="165" y2="152" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="195" y1="106" x2="195" y2="152" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="210" y1="106" x2="210" y2="152" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />

        {/* Base Steps Foundation */}
        <line x1="15" y1="152" x2="345" y2="152" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="156" x2="330" y2="156" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
);

// Loading Screen Component following Section 4 specifications
interface LoadingScreenProps {
    statusText: string;
    progressPercentage: number;
    isExiting?: boolean;
    onDismiss?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ statusText, progressPercentage, isExiting, onDismiss }) => {
    return (
        <div
            className={cn(
                'fixed inset-0 z-50 bg-[#102B40] text-white flex flex-col justify-between items-center py-12 px-6 transition-all duration-300 ease-in-out',
                isExiting ? 'opacity-0 pointer-events-none scale-[1.02]' : 'opacity-100 scale-100 animate-in fade-in duration-200'
            )}
            role="status"
            aria-live="polite"
        >
            {/* Top Bar with optional Lewati / Tutup button */}
            <div className="w-full flex justify-end">
                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#1A3B52] bg-[#102B40]/80 hover:bg-[#1A3B52] transition cursor-pointer"
                    >
                        Lewati
                    </button>
                )}
            </div>

            {/* Center Brand & Loading Indicator */}
            <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
                {/* Logo Perisai e-DOJO */}
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C51C2A] shadow-inner">
                    <Shield className="w-9 h-9 fill-[#C51C2A]/20 stroke-[#C51C2A]" />
                </div>

                {/* Teks e-DOJO */}
                <h1 className="text-3xl font-extrabold tracking-tight text-white">e-DOJO</h1>

                {/* Minimal Progress Indicator */}
                <div className="w-64 h-1 bg-[#1A3B52] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#C51C2A] rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(Math.max(progressPercentage, 10), 100)}%` }}
                    />
                </div>

                {/* Status Text (States 1 to 4) */}
                <p className="text-xs font-medium text-slate-300 tracking-wide min-h-[1.5rem] transition-opacity duration-200">
                    {statusText}
                </p>
            </div>

            {/* Footer */}
            <div className="text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 block">
                    PERKEMI INDONESIA
                </span>
            </div>
        </div>
    );
};

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    // Directly show loading screen when accessing /login
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [loadingStage, setLoadingStage] = useState(1);
    const [loadingText, setLoadingText] = useState('Memuat sistem e-DOJO…');
    const [loadingProgress, setLoadingProgress] = useState(25);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Automatically trigger loading screen upon entering /login
    useEffect(() => {
        // State 1: Memuat sistem
        setLoadingStage(1);
        setLoadingText('Memverifikasi sistem e-DOJO…');
        setLoadingProgress(25);

        // State 2: Memuat profil & enkripsi
        const t1 = setTimeout(() => {
            setLoadingStage(2);
            setLoadingText('Memuat profil pengguna…');
            setLoadingProgress(55);
        }, 500);

        // State 3: Menyiapkan ruang kerja
        const t2 = setTimeout(() => {
            setLoadingStage(3);
            setLoadingText('Menyiapkan ruang kerja Anda…');
            setLoadingProgress(85);
        }, 1100);

        // State 4: Siap
        const t3 = setTimeout(() => {
            setLoadingStage(4);
            setLoadingText('Selamat datang di e-DOJO.');
            setLoadingProgress(100);
        }, 1700);

        // Smooth dissolve fade-out transition
        const t4 = setTimeout(() => {
            setIsExiting(true);
        }, 2100);

        const t5 = setTimeout(() => {
            setShowLoadingScreen(false);
            setIsExiting(false);
        }, 2400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
        };
    }, []);

    const dismissLoading = () => {
        setIsExiting(true);
        setTimeout(() => {
            setShowLoadingScreen(false);
            setIsExiting(false);
        }, 200);
    };

    const triggerLoadingPreview = () => {
        setIsExiting(false);
        setShowLoadingScreen(true);
        setLoadingStage(1);
        setLoadingText('Memverifikasi akun Anda…');
        setLoadingProgress(25);

        setTimeout(() => {
            setLoadingStage(2);
            setLoadingText('Memuat profil pengguna…');
            setLoadingProgress(55);
        }, 600);

        setTimeout(() => {
            setLoadingStage(3);
            setLoadingText('Menyiapkan ruang kerja Anda…');
            setLoadingProgress(80);
        }, 1200);

        setTimeout(() => {
            setLoadingStage(4);
            setLoadingText('Selamat datang di e-DOJO.');
            setLoadingProgress(100);
        }, 1800);

        setTimeout(() => {
            setIsExiting(true);
        }, 2200);

        setTimeout(() => {
            setShowLoadingScreen(false);
            setIsExiting(false);
        }, 2500);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/login', {
            onStart: () => {
                // Initiating authentication
            },
            onSuccess: () => {
                // Successful auth - start smooth loading screen transition before landing
                setShowLoadingScreen(true);
                setLoadingStage(1);
                setLoadingText('Memverifikasi akun Anda…');
                setLoadingProgress(35);

                setTimeout(() => {
                    setLoadingStage(2);
                    setLoadingText('Memuat profil pengguna…');
                    setLoadingProgress(70);
                }, 300);

                setTimeout(() => {
                    setLoadingStage(3);
                    setLoadingText('Menyiapkan ruang kerja Anda…');
                    setLoadingProgress(95);
                }, 600);
            },
            onError: () => {
                setShowLoadingScreen(false);
                reset('password');
            },
        });
    };

    return (
        <div className="h-screen w-screen bg-white text-[#17202D] font-sans antialiased overflow-hidden flex flex-col lg:flex-row selection:bg-[#C51C2A] selection:text-white">
            <Head title="Masuk - e-DOJO PERKEMI INDONESIA" />

            {/* Loading Screen Overlay */}
            {showLoadingScreen && (
                <LoadingScreen
                    statusText={loadingText}
                    progressPercentage={loadingProgress}
                    isExiting={isExiting}
                    onDismiss={dismissLoading}
                />
            )}

            {/* ======================================================== */}
            {/* LEFT SECTION: BRAND IDENTITY (40% width on Desktop)     */}
            {/* ======================================================== */}
            <div className="hidden lg:flex lg:w-5/12 xl:w-5/12 bg-[#102B40] text-white flex-col justify-between p-8 xl:p-12 h-full overflow-hidden select-none relative shrink-0">
                {/* Top Organization Header */}
                <div className="flex items-center gap-2.5 z-10 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-[#C51C2A] flex items-center justify-center text-white shadow-xs">
                        <Shield className="w-4 h-4 fill-white/10 stroke-white" />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                        PERKEMI INDONESIA
                    </span>
                </div>

                {/* Center Brand Grouping */}
                <div className="my-auto py-6 flex flex-col items-center text-center z-10 space-y-3.5">
                    {/* Red Shield Emblem */}
                    <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C51C2A] shadow-inner mb-1">
                        <Shield className="w-9 h-9 xl:w-11 xl:h-11 fill-[#C51C2A]/20 stroke-[#C51C2A] stroke-[1.75]" />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-1">
                        <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white">e-DOJO</h2>
                        <p className="text-[10px] xl:text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                            PERKEMI INDONESIA
                        </p>
                    </div>

                    {/* Red Accent Horizontal Divider Line */}
                    <div className="w-10 h-1 bg-[#C51C2A] rounded-full my-0.5" />

                    {/* Tagline */}
                    <p className="text-xs xl:text-sm italic font-normal text-slate-300 tracking-wide max-w-xs">
                        Satu sistem. Satu organisasi.
                    </p>
                </div>

                {/* Bottom: Japanese Dojo Architecture Line Art SVG */}
                <div className="flex flex-col items-center justify-end z-10 shrink-0">
                    <JapaneseDojoLineArt />
                </div>

                {/* Decorative subtle dark gradient overlay for depth */}
                <div className="absolute inset-0 bg-radial from-transparent via-[#102B40]/40 to-[#102B40] pointer-events-none" />
            </div>

            {/* ======================================================== */}
            {/* RIGHT SECTION: AUTHENTICATION FORM (60% Desktop / Full Mobile) */}
            {/* ======================================================== */}
            <div className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 h-full overflow-y-auto lg:overflow-hidden">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden flex flex-col items-center text-center mb-6 pt-2 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#C51C2A] mb-2">
                        <Shield className="w-7 h-7 fill-[#C51C2A]/15 stroke-[#C51C2A] stroke-2" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#17202D]">e-DOJO</h2>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#718092] mt-0.5">
                        PERKEMI INDONESIA
                    </span>
                </div>

                {/* Authentication Form Container (Centered, Max Width 420px) */}
                <div className="w-full max-w-[420px] mx-auto my-auto py-2">
                    {/* Heading & Subtitle */}
                    <div className="mb-6">
                        <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-[#17202D]">
                            Selamat datang kembali
                        </h1>
                        <p className="text-xs sm:text-sm text-[#718092] mt-1 leading-relaxed">
                            Masuk untuk mengelola aktivitas Perkemi.
                        </p>
                    </div>

                    {/* General / Auth Errors Alert */}
                    {errors.email && (
                        <div
                            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[#DC3545] text-xs flex items-start gap-2.5 animate-in fade-in"
                            role="alert"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="font-medium leading-snug">
                                {errors.email}
                            </span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        {/* Field 1: Alamat Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-[#17202D]"
                            >
                                Alamat email
                            </label>
                            <div className="relative rounded-lg">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    disabled={processing}
                                    placeholder="nama@perkemi.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={cn(
                                        'w-full h-11 rounded-lg border bg-white px-3.5 text-xs sm:text-sm text-[#17202D] placeholder:text-slate-400',
                                        'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40]',
                                        errors.email
                                            ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                            : 'border-[#E8EBEF]'
                                    )}
                                    aria-invalid={Boolean(errors.email)}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                />
                            </div>
                        </div>

                        {/* Field 2: Kata Sandi */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-[#17202D]"
                            >
                                Kata sandi
                            </label>
                            <div className="relative rounded-lg">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="current-password"
                                    required
                                    disabled={processing}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={cn(
                                        'w-full h-11 rounded-lg border bg-white px-3.5 pr-11 text-xs sm:text-sm text-[#17202D] placeholder:text-slate-400',
                                        'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40]',
                                        errors.password
                                            ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                            : 'border-[#E8EBEF]'
                                    )}
                                    aria-invalid={Boolean(errors.password)}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-[#17202D] transition-colors focus:outline-none"
                                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p id="password-error" className="text-[11px] font-medium text-[#DC3545] mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Field 3 & 4: Remember me & Forgot Password */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    disabled={processing}
                                    className="w-4 h-4 rounded border-[#E8EBEF] text-[#102B40] focus:ring-[#102B40]/20 transition cursor-pointer"
                                />
                                <span className="text-[#17202D] font-normal text-xs">
                                    Ingat saya di perangkat ini
                                </span>
                            </label>

                            <Link
                                href="/forgot-password"
                                className="font-medium text-[#C51C2A] hover:underline hover:text-red-700 transition-colors"
                            >
                                Lupa kata sandi?
                            </Link>
                        </div>

                        {/* Field 5: Primary Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={cn(
                                'w-full h-11 rounded-lg bg-[#102B40] hover:bg-[#1A3B52] active:bg-[#24475E]',
                                'text-white font-semibold text-xs sm:text-sm tracking-wide',
                                'flex items-center justify-center gap-2.5 shadow-xs transition-colors duration-150',
                                'focus:outline-none focus:ring-2 focus:ring-[#102B40]/20 focus:ring-offset-2',
                                'disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer'
                            )}
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memverifikasi akun…</span>
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4" />
                                    <span>Masuk ke e-DOJO</span>
                                </>
                            )}
                        </button>

                        {/* Field 6: Secondary Action Link (Registrasi Kenshi Baru) */}
                        <div className="pt-1.5 text-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C51C2A] hover:text-red-700 hover:underline transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Registrasi Kenshi baru</span>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Sub-footer with Security Info & Preview Link */}
                <div className="pt-3 border-t border-[#E8EBEF] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#718092] gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16865C]" />
                        <span>Sistem Keamanan Terenkripsi SSL/TLS 256-Bit</span>
                    </div>
                    <button
                        type="button"
                        onClick={triggerLoadingPreview}
                        className="text-[11px] text-[#718092] hover:text-[#17202D] underline decoration-dotted cursor-pointer"
                    >
                        Pratinjau Loading Screen
                    </button>
                </div>
            </div>
        </div>
    );
}
