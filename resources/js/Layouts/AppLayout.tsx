import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';
import {
    Activity,
    Award,
    Brain,
    Building2,
    CalendarCheck,
    Camera,
    ChevronDown,
    Crosshair,
    Dumbbell,
    FileSpreadsheet,
    HeartPulse,
    Landmark,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    PlusCircle,
    Shield,
    Sparkles,
    Trophy,
    UserCheck,
    UserPlus,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import { Button } from '@/Components/UI/Elements/Button';
import { Alert } from '@/Components/UI/Feedback/Alert';

export interface AppLayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    external?: boolean;
    show?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { auth, flash, app } = usePage<PageProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const user = auth.user;
    const userRoles = user?.roles || [];
    const isSuperAdmin = userRoles.includes('SuperAdmin');
    const isPengprovAdmin = userRoles.includes('PengprovAdmin');
    const isPengkabAdmin = userRoles.includes('PengkabAdmin');
    const isSensei = userRoles.includes('Sensei');
    const isKenshi = userRoles.includes('Kenshi');
    const isKenshiOnly = isKenshi && !isSuperAdmin && !isPengprovAdmin && !isPengkabAdmin && !isSensei;
    const can = user?.can || {};

    const isLoggedIn = Boolean(user);
    const canViewDirectory = Boolean(can.view_directory ?? (isLoggedIn && !isKenshiOnly));
    const canDojoCreate = Boolean(can.dojo_create ?? (isSuperAdmin || isPengprovAdmin));
    const canKenshiCreate = Boolean(can.kenshi_create ?? (isSuperAdmin || isPengprovAdmin || isSensei));
    const canViewReports = Boolean(can.view_reports ?? (isSuperAdmin || isPengprovAdmin || isPengkabAdmin || isSensei || isKenshi));
    const canViewFinance = Boolean(can.view_finance ?? (isSuperAdmin || isPengprovAdmin || isPengkabAdmin || isSensei));
    const canViewSystemLogs = Boolean(can.view_system_logs ?? isSuperAdmin);
    const canViewMyDojo = Boolean(can.view_my_dojo ?? (isSensei || isSuperAdmin || isPengprovAdmin));
    const canViewKtaPortal = Boolean(can.view_kta_portal ?? (isKenshi || isSuperAdmin));

    const navSections: NavSection[] = [
        {
            title: isKenshiOnly ? 'Pusat Komando Atlet' : 'Pusat Komando',
            items: [
                {
                    name: isKenshiOnly ? 'Dashboard Atlet Kenshi' : 'Dashboard & Command Center',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                    show: true,
                },
                {
                    name: 'Panel Dojo Saya',
                    href: '/my-dojo',
                    icon: Building2,
                    badge: isSensei ? 'Sensei' : undefined,
                    show: canViewMyDojo,
                },
            ],
        },
        {
            title: isKenshiOnly ? 'Identitas Atlet Kenshi' : 'Database & Profil Perkemi',
            items: [
                { name: 'Daftar Cabang Dojo', href: '/dojos', icon: Shield, show: canViewDirectory },
                { name: 'Pengurus Pengprov', href: '/pengprov', icon: Building2, badge: 'Jatim', show: canViewDirectory || isPengprovAdmin },
                { name: 'Pengurus Pengkot', href: '/pengkot', icon: Landmark, badge: 'Surabaya', show: canViewDirectory || isPengkabAdmin },
                { name: 'Atlet Kenshi', href: '/kenshis', icon: Users, show: canViewDirectory },
                { name: 'Pelatih & Sensei', href: '/coaches', icon: UserCheck, badge: 'Yudansha', show: canViewDirectory },
                { name: isKenshiOnly ? 'KTA Digital & Profil Saya' : 'KTA Digital Kenshi', href: '/portal/kenshi', icon: Award, show: canViewKtaPortal },
            ],
        },
        {
            title: 'Seleksi & Registrasi',
            items: [
                { name: 'Registrasi Anggota Baru', href: '/kenshis/create', icon: UserPlus, show: canKenshiCreate },
                { name: 'Daftar Cabang Baru', href: '/dojos/create', icon: PlusCircle, show: canDojoCreate },
            ],
        },
        {
            title: 'Smart Attendance & Geo',
            items: [
                { name: 'Presensi Kamera & GPS', href: '/attendance/check-in', icon: Camera, badge: 'Live', show: isLoggedIn },
                { name: 'Jadwal & Kalender', href: '/schedules', icon: CalendarCheck, show: true },
            ],
        },
        {
            title: 'Sport Science & Performance',
            items: [
                { name: 'Physical Performance', href: '/performance/physical', icon: Activity, show: isLoggedIn },
                { name: 'Technical Performance', href: '/performance/technical', icon: Crosshair, show: isLoggedIn },
                { name: 'Latihan Mandiri (Logbook)', href: '/performance/independent', icon: Dumbbell, show: isLoggedIn },
                { name: isKenshiOnly ? 'Penilaian Pelatih Saya' : 'Penilaian Pelatih', href: '/performance/evaluations', icon: UserCheck, badge: 'Review', show: isLoggedIn },
                { name: 'Wellness & Recovery', href: '/performance/wellness', icon: HeartPulse, show: isLoggedIn },
            ],
        },
        {
            title: 'Intelijen & Evaluasi',
            items: [
                { name: 'Competition Intelligence', href: '/competitions', icon: Trophy, show: isLoggedIn },
                { name: 'AI Athlete Intelligence', href: '/ai-intelligence', icon: Brain, badge: 'AI', show: isLoggedIn },
                { name: 'Promosi & UKT Roadmap', href: '/promotions', icon: Award, show: isLoggedIn },
            ],
        },
        {
            title: isKenshiOnly ? 'Laporan Saya' : 'Laporan & Rekapitulasi',
            items: [
                { name: isKenshiOnly ? 'Laporan Presensi & Prestasi' : 'Pusat Laporan & Ekspor', href: '/reports', icon: FileSpreadsheet, badge: 'Queue', show: canViewReports },
            ],
        },
        {
            title: 'Keuangan',
            items: [
                { name: 'Finance & Accounting', href: '/finance', icon: Wallet, show: canViewFinance },
            ],
        },
    ];

    const visibleSections = navSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => item.show !== false),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <div className="min-h-screen bg-slate-50 flex w-full max-w-full overflow-x-hidden">
            {/* Mobile Sidebar Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar (Kurogane Navy #0B132B) */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-[#0B132B] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Branding / Dojo Perkemi Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-base font-bold tracking-tight text-white block leading-none">
                                e-DOJO
                            </span>
                            <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-500 block mt-0.5">
                                PERKEMI INDONESIA
                            </span>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-dark">
                    {visibleSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                {section.title}
                            </p>
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isCurrent =
                                    typeof window !== 'undefined' &&
                                    (item.href === '/dashboard'
                                        ? window.location.pathname === '/dashboard' || window.location.pathname === '/'
                                        : window.location.pathname.startsWith(item.href) && item.href !== '#');

                                const content = (
                                    <>
                                        <Icon
                                            className={cn(
                                                'w-4 h-4 shrink-0 transition-colors',
                                                isCurrent ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-200'
                                            )}
                                        />
                                        <span className="flex-1 text-xs font-medium truncate">{item.name}</span>
                                        {item.badge && (
                                            <span
                                                className={cn(
                                                    'text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded',
                                                    item.badge === 'Live'
                                                        ? 'bg-red-900/60 text-red-300'
                                                        : item.badge === 'Queue'
                                                          ? 'bg-emerald-900/60 text-emerald-300'
                                                          : item.badge === 'AI'
                                                            ? 'bg-indigo-900/60 text-indigo-300'
                                                            : 'bg-slate-800 text-slate-400'
                                                )}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                );

                                if (item.external) {
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                                        >
                                            {content}
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            'group flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors',
                                            isCurrent
                                                ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
                                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                        )}
                                    >
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium">PB Perkemi © 2026</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        v{app?.version || '1.0'}
                    </span>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0 w-full max-w-full overflow-x-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 touch-manipulation"
                            aria-label="Buka Menu Navigasi"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2 sm:hidden">
                            <div className="h-7 w-7 rounded-md bg-red-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                                <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black tracking-tight text-slate-900">
                                e-DOJO <span className="text-red-600">PERKEMI</span>
                            </span>
                        </Link>
                        <span className="text-sm font-semibold text-slate-700 hidden sm:inline-block">
                            Sistem Manajemen Dojo & Kenshi Perkemi
                        </span>
                    </div>

                    {/* User Profile or Guest Login */}
                    {auth.user ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer select-none"
                            >
                                <Avatar name={auth.user.name} size="sm" />
                                <div className="text-left hidden md:block">
                                    <span className="block text-xs font-bold text-slate-800 leading-tight">
                                        {auth.user.name}
                                    </span>
                                    <span className="block text-[11px] text-slate-500">
                                        {auth.user.roles?.[0] || 'SuperAdmin'}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs font-semibold text-slate-800">{auth.user.name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>
                                    </div>

                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Keluar</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="navy" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                                Masuk / Login
                            </Button>
                        </Link>
                    )}
                </header>

                {/* Flash Messages */}
                <div className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-6 pt-3 sm:pt-4">
                    {flash?.success && (
                        <Alert variant="success" message={flash.success} className="mb-4" />
                    )}
                    {flash?.error && (
                        <Alert variant="error" message={flash.error} className="mb-4" />
                    )}
                </div>

                {/* Page Content */}
                <main className="flex-1 max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-6 pb-24 lg:pb-12 pt-2">
                    {children}
                </main>

                {/* Mobile Bottom Navigation Bar (Fixed bottom for mobile/tablet) */}
                <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
                    <Link
                        href="/dashboard"
                        className={cn(
                            'flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors',
                            typeof window !== 'undefined' &&
                                (window.location.pathname === '/dashboard' || window.location.pathname === '/')
                                ? 'text-red-600'
                                : 'text-slate-500 hover:text-slate-900'
                        )}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="mt-0.5">Beranda</span>
                    </Link>

                    <Link
                        href="/schedules"
                        className={cn(
                            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors',
                            typeof window !== 'undefined' && window.location.pathname.startsWith('/schedules')
                                ? 'text-red-600'
                                : 'text-slate-500 hover:text-slate-900'
                        )}
                    >
                        <CalendarCheck className="w-4 h-4" />
                        <span className="mt-0.5">Jadwal</span>
                    </Link>

                    <Link
                        href="/attendance/check-in"
                        className={cn(
                            'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors',
                            typeof window !== 'undefined' && window.location.pathname.startsWith('/attendance')
                                ? 'text-red-600'
                                : 'text-slate-500 hover:text-slate-900'
                        )}
                    >
                        <Camera className="w-4 h-4 text-red-600" />
                        <span className="mt-0.5 text-red-600 font-bold">Presensi</span>
                    </Link>

                    {canViewMyDojo ? (
                        <Link
                            href="/my-dojo"
                            className={cn(
                                'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors',
                                typeof window !== 'undefined' && window.location.pathname.startsWith('/my-dojo')
                                    ? 'text-red-600'
                                    : 'text-slate-500 hover:text-slate-900'
                            )}
                        >
                            <Building2 className="w-4 h-4" />
                            <span className="mt-0.5">Dojo</span>
                        </Link>
                    ) : canViewKtaPortal ? (
                        <Link
                            href="/portal/kenshi"
                            className={cn(
                                'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors',
                                typeof window !== 'undefined' && window.location.pathname.startsWith('/portal/kenshi')
                                    ? 'text-red-600'
                                    : 'text-slate-500 hover:text-slate-900'
                            )}
                        >
                            <Award className="w-4 h-4" />
                            <span className="mt-0.5">KTA</span>
                        </Link>
                    ) : !isLoggedIn ? (
                        <Link
                            href="/login"
                            className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-900"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="mt-0.5">Masuk</span>
                        </Link>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-900"
                    >
                        <Menu className="w-4 h-4" />
                        <span className="mt-0.5">Menu</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};
