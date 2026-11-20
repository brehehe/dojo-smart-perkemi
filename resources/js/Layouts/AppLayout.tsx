import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { cn } from '@/lib/utils';
import {
    Award,
    BarChart3,
    Bell,
    Building2,
    Calendar,
    CalendarCheck,
    ChevronDown,
    Coins,
    CreditCard,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    Home,
    Landmark,
    Layers,
    LayoutDashboard,
    LayoutGrid,
    LogOut,
    Menu,
    Receipt,
    Settings,
    Shield,
    ShieldCheck,
    TrendingUp,
    User,
    UserCheck,
    Users,
    Video,
    Wallet,
    X,
} from 'lucide-react';

export interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumb?: string;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    show?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, breadcrumb }) => {
    const page = usePage<PageProps>();
    const { auth, flash, app } = page.props;
    const url = page.url || '';
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Tahun 2026');

    const user = auth.user;
    const userRoles = user?.roles || [];
    const isSuperAdmin = userRoles.includes('SuperAdmin');
    const isPengprovAdmin = userRoles.includes('PengprovAdmin');
    const isPengkabAdmin = userRoles.includes('PengkabAdmin');
    const isSensei = userRoles.includes('Sensei');
    const isKenshi = userRoles.includes('Kenshi');
    const isKenshiOnly = isKenshi && !isSuperAdmin && !isPengprovAdmin && !isPengkabAdmin && !isSensei;

    // Build user initial
    const userInitial = user?.name ? user.name.slice(0, 2).toUpperCase() : 'PB';
    const roleLabel = isSuperAdmin
        ? 'SuperAdmin'
        : isPengprovAdmin
            ? 'Pengprov Jawa Timur'
            : isPengkabAdmin
                ? 'Pengkot Surabaya'
                : isSensei
                    ? 'Sensei Pelatih'
                    : 'Kenshi Atlet';

    // Grouped Nav Sections matching Desktop & Mobile design exactly
    const navSections: NavSection[] = [
        {
            title: 'IKHTISAR',
            items: [
                {
                    name: isKenshiOnly ? 'Dashboard Atlet' : 'Ikhtisar Nasional',
                    href: '/dashboard',
                    icon: LayoutGrid,
                    show: true,
                },
                {
                    name: 'Analitik & Tren',
                    href: '/reports',
                    icon: TrendingUp,
                    show: !isKenshiOnly,
                },
            ],
        },
        {
            title: 'MASTER DATA',
            items: [
                {
                    name: isKenshiOnly ? 'Profil Kenshi' : 'Master Kenshi',
                    href: '/kenshis',
                    icon: User,
                    show: true,
                },
                {
                    name: 'Pelatih & Sensei',
                    href: '/coaches',
                    icon: GraduationCap,
                    show: !isKenshiOnly,
                },
                {
                    name: 'Master Cabang Dojo',
                    href: '/dojos',
                    icon: Building2,
                    show: !isKenshiOnly,
                },
            ],
        },
        {
            title: 'PENGURUS WILAYAH',
            items: [
                {
                    name: 'Pengurus Pengprov',
                    href: '/pengprov',
                    icon: Landmark,
                    show: !isKenshiOnly,
                },
                {
                    name: 'Pengurus Pengkot',
                    href: '/pengkot',
                    icon: ShieldCheck,
                    show: !isKenshiOnly,
                },
            ],
        },
        {
            title: 'KEUANGAN & IURAN',
            items: [
                {
                    name: 'Kas & Iuran Dojo',
                    href: '/dojo/iuran',
                    icon: Wallet,
                    show: !isKenshiOnly,
                },
                {
                    name: 'Pengaturan Tarif & SK',
                    href: '/dojo/settings/iuran',
                    icon: Coins,
                    show: isSuperAdmin || isSensei,
                },
                {
                    name: 'Iuran Saya',
                    href: '/portal/kenshi/iuran',
                    icon: Wallet,
                    show: isKenshiOnly,
                },
            ],
        },
        {
            title: 'KURIKULUM & MATERI',
            items: [
                {
                    name: 'Kurikulum Nasional & WSKO',
                    href: '/materials',
                    icon: Video,
                    show: true,
                },
                {
                    name: 'Materi Latihan Dojo',
                    href: '/dojo/materi',
                    icon: Layers,
                    show: !isKenshiOnly,
                },
            ],
        },
        {
            title: 'KTA & UKT',
            items: [
                {
                    name: 'KTA Digital Kenshi',
                    href: '/portal/kenshi',
                    icon: CreditCard,
                    show: true,
                },
                {
                    name: 'Ujian Kenaikan Tingkat (UKT)',
                    href: '/examinations',
                    icon: FileText,
                    show: true,
                },
            ],
        },
        {
            title: 'KEHADIRAN & JADWAL',
            items: [
                {
                    name: 'Presensi & Kehadiran',
                    href: '/attendance/check-in',
                    icon: CalendarCheck,
                    show: true,
                },
                {
                    name: 'Jadwal & Kalender Latihan',
                    href: '/schedules',
                    icon: Calendar,
                    show: true,
                },
            ],
        },
        {
            title: 'LAPORAN & EKSPOR',
            items: [
                {
                    name: 'Laporan Rekapitulasi',
                    href: '/reports',
                    icon: BarChart3,
                    show: true,
                },
            ],
        },
    ];

    const currentPath = (url || (typeof window !== 'undefined' ? window.location.pathname : '')).split('?')[0];

    const getBreadcrumbTitle = () => {
        if (breadcrumb) return breadcrumb;
        if (title) return title;
        if (currentPath === '/dashboard' || currentPath === '/') return 'Ikhtisar Nasional';
        if (currentPath.startsWith('/dojos')) return 'Master Cabang Dojo';
        if (currentPath.startsWith('/kenshis')) return 'Pangkalan Data Kenshi';
        if (currentPath.startsWith('/coaches')) return 'Direktori Pelatih & Sensei';
        if (currentPath.startsWith('/pengprov')) return 'Pengurus Daerah (Pengprov)';
        if (currentPath.startsWith('/pengkot')) return 'Pengurus Cabang (Pengkot)';
        if (currentPath.startsWith('/dojo/settings/iuran')) return 'Pengaturan Tarif & Iuran SK';
        if (currentPath.startsWith('/dojo/iuran')) return 'Kas & Rekapitulasi Iuran Dojo';
        if (currentPath.startsWith('/dojo/materi')) return 'Materi Latihan Dojo';
        if (currentPath.startsWith('/materials')) return 'Kurikulum & Video Pembelajaran';
        if (currentPath.startsWith('/examinations')) return 'Penyelenggaraan UKT Perkemi';
        if (currentPath.startsWith('/attendance')) return 'Presensi & Kehadiran';
        if (currentPath.startsWith('/schedules')) return 'Jadwal & Kalender Latihan';
        if (currentPath.startsWith('/portal/kenshi/iuran')) return 'Tagihan Iuran Kenshi';
        if (currentPath.startsWith('/portal/kenshi/ukt')) return 'Gerbang Evaluasi UKT Kenshi';
        if (currentPath.startsWith('/portal/kenshi')) return 'KTA Digital Kenshi';
        if (currentPath.startsWith('/reports')) return 'Laporan & Rekapitulasi Data';
        return 'Pusat Komando';
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex w-full max-w-full overflow-x-hidden text-[#17202D] font-sans antialiased">
            {/* Mobile Drawer Backdrop */}
            {mobileDrawerOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity duration-200"
                    onClick={() => setMobileDrawerOpen(false)}
                />
            )}

            {/* Desktop Sidebar (Solid Dark Navy #102B40) */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-[#102B40] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-[#102B40]',
                    mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo & Org Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-[#1A3B52] shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#C51C2A] flex items-center justify-center text-white shadow-xs shrink-0">
                            <Shield className="w-5 h-5 fill-white/10 stroke-white" />
                        </div>
                        <div className="leading-tight">
                            <span className="text-base font-bold tracking-tight text-white block">
                                e-DOJO
                            </span>
                            <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-300 block">
                                PERKEMI INDONESIA
                            </span>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white p-1"
                        aria-label="Tutup menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-dark">
                    {navSections.map((section, sIdx) => {
                        const visibleItems = section.items.filter((item) => item.show !== false);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={sIdx} className="space-y-1">
                                <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                    {section.title}
                                </p>
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    const isCurrent =
                                        item.href === '/dashboard'
                                            ? currentPath === '/dashboard' || currentPath === '/'
                                            : currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href + '/'));

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setMobileDrawerOpen(false)}
                                            className={cn(
                                                'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors relative cursor-pointer',
                                                isCurrent
                                                    ? 'bg-[#24475E] text-white font-semibold'
                                                    : 'text-slate-300 hover:bg-[#1A3B52] hover:text-white'
                                            )}
                                        >
                                            {/* Active Red Left Indicator */}
                                            {isCurrent && (
                                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#C51C2A] rounded-r" />
                                            )}
                                            <Icon
                                                className={cn(
                                                    'w-4 h-4 shrink-0 transition-colors',
                                                    isCurrent ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                                )}
                                            />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                {/* Sidebar Footer: Desktop copyright vs Mobile Drawer user card */}
                <div className="border-t border-[#1A3B52] bg-[#102B40] shrink-0">
                    {/* Desktop footer matching desktop mockup */}
                    <div className="hidden lg:flex items-center justify-between px-4 py-3 text-xs text-slate-400 border-t border-[#1A3B52]">
                        <div>
                            <span className="text-[11px] font-medium tracking-tight text-slate-400 block">
                                PB Perkemi &copy; 2026
                            </span>
                            <span className="text-[10px] font-mono text-slate-300 bg-[#1A3B52] border border-[#24475E] px-2 py-0.5 rounded-full inline-block mt-0.5">
                                v1.0.0
                            </span>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            title="Keluar dari e-DOJO"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC3545] hover:bg-[#1A3B52] transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Mobile drawer footer matching mobile mockup */}
                    <div className="lg:hidden p-3 border-t border-[#1A3B52]">
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#1A3B52] border border-[#24475E] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {userInitial}
                                </div>
                                <div className="leading-tight truncate max-w-[130px]">
                                    <span className="text-xs font-bold text-white block truncate">
                                        {user?.name || 'PB Perkemi'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block truncate">
                                        {roleLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-300 bg-[#1A3B52] border border-[#24475E] px-2 py-0.5 rounded-full">
                                    v1.0.0
                                </span>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    title="Keluar dari e-DOJO"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC3545] hover:bg-[#1A3B52] transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Area: Topbar + Page Content */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-hidden">
                {/* Desktop Top Header (Hidden on mobile) */}
                <header className="hidden lg:flex h-16 bg-white border-b border-[#E8EBEF] px-8 items-center justify-between sticky top-0 z-30 shadow-2xs">
                    {/* Left: Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-[#718092]">
                        <Home className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Pusat Komando</span>
                        <span>/</span>
                        <span className="font-semibold text-[#17202D] truncate">
                            {getBreadcrumbTitle()}
                        </span>
                    </div>

                    {/* Right: Period picker, Notifications, Profile */}
                    <div className="flex items-center gap-5">
                        {/* Period Selector */}
                        <div className="relative">
                            <div className="flex items-center gap-2 text-xs text-[#718092]">
                                <span>Periode</span>
                                <button
                                    type="button"
                                    onClick={() => setPeriodOpen(!periodOpen)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EBEF] bg-white hover:bg-slate-50 text-xs font-medium text-[#17202D] transition-colors cursor-pointer"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{selectedPeriod}</span>
                                    <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
                                </button>
                            </div>

                            {periodOpen && (
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg border border-[#E8EBEF] shadow-lg py-1 z-40 text-xs">
                                    {['Tahun 2026', 'Tahun 2025', 'Semester II 2026', 'Semester I 2026'].map(
                                        (p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPeriod(p);
                                                    setPeriodOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium text-[#17202D] cursor-pointer"
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Notification Bell with unread dot */}
                        <div className="relative">
                            <button
                                type="button"
                                className="w-9 h-9 rounded-lg border border-[#E8EBEF] flex items-center justify-center text-slate-600 hover:bg-slate-50 relative cursor-pointer"
                                aria-label="Notifikasi"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C51C2A] ring-2 ring-white" />
                            </button>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative pl-3 border-l border-[#E8EBEF]">
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#102B40]"
                                aria-expanded={profileDropdownOpen}
                                aria-haspopup="true"
                            >
                                <div className="w-9 h-9 rounded-full bg-[#102B40] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                    {userInitial}
                                </div>
                                <div className="leading-tight text-left">
                                    <span className="text-xs font-bold text-[#17202D] block truncate max-w-[160px]">
                                        {user?.name || 'Pengurus Besar Perkemi'}
                                    </span>
                                    <span className="text-[10px] text-[#718092] block">
                                        {roleLabel}
                                    </span>
                                </div>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-[#718092] transition-transform duration-150 ml-0.5", profileDropdownOpen && "rotate-180")} />
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-[#E8EBEF] shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="px-4 py-3 border-b border-[#E8EBEF] bg-[#F8F9FA]/70">
                                            <p className="text-xs font-bold text-[#17202D] truncate">{user?.name || 'Pengurus Perkemi'}</p>
                                            <p className="text-[11px] text-[#718092] truncate">{user?.email || 'admin@perkemi.id'}</p>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#102B40]/10 text-[#102B40]">
                                                {roleLabel}
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href={isKenshiOnly ? '/portal/kenshi' : '/kenshis'}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#17202D] hover:bg-slate-50 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <User className="w-4 h-4 text-[#718092]" />
                                                <span>Profil Saya</span>
                                            </Link>
                                            {(isSuperAdmin || isSensei) && (
                                                <Link
                                                    href="/dojo/settings/iuran"
                                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#17202D] hover:bg-slate-50 transition-colors"
                                                    onClick={() => setProfileDropdownOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4 text-[#718092]" />
                                                    <span>Pengaturan Sistem</span>
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-[#E8EBEF] pt-1">
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#DC3545] hover:bg-red-50/70 transition-colors cursor-pointer text-left"
                                            >
                                                <LogOut className="w-4 h-4 text-[#DC3545]" />
                                                <span>Keluar dari e-DOJO</span>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile Top Header (< lg screen, matching Image 1 exactly) */}
                <header className="lg:hidden h-14 bg-white border-b border-[#E8EBEF] px-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileDrawerOpen(true)}
                            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
                            aria-label="Buka menu navigasi"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-md bg-[#C51C2A] flex items-center justify-center text-white shrink-0">
                                <Shield className="w-4 h-4 fill-white/10 stroke-white" />
                            </div>
                            <div className="leading-tight">
                                <span className="text-xs font-bold text-[#17202D] block">e-DOJO</span>
                                <span className="text-[8px] text-[#718092] font-semibold tracking-wider block">
                                    PERKEMI INDONESIA
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="w-8 h-8 rounded-lg border border-[#E8EBEF] flex items-center justify-center text-slate-600 relative"
                            aria-label="Notifikasi"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C51C2A] ring-1 ring-white" />
                        </button>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="w-8 h-8 rounded-full bg-[#102B40] text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                                aria-label="Menu Profil & Keluar"
                            >
                                {userInitial}
                            </button>
                            {profileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E8EBEF] shadow-lg py-1.5 z-50">
                                        <div className="px-4 py-2.5 border-b border-[#E8EBEF] bg-[#F8F9FA]/70">
                                            <p className="text-xs font-bold text-[#17202D] truncate">{user?.name || 'Pengurus Perkemi'}</p>
                                            <p className="text-[11px] text-[#718092] truncate">{user?.email || 'admin@perkemi.id'}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#102B40]/10 text-[#102B40]">
                                                {roleLabel}
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href={isKenshiOnly ? '/portal/kenshi' : '/kenshis'}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#17202D] hover:bg-slate-50 transition-colors"
                                                onClick={() => setProfileDropdownOpen(false)}
                                            >
                                                <User className="w-4 h-4 text-[#718092]" />
                                                <span>Profil Saya</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-[#E8EBEF] pt-1">
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#DC3545] hover:bg-red-50/70 transition-colors cursor-pointer text-left"
                                            >
                                                <LogOut className="w-4 h-4 text-[#DC3545]" />
                                                <span>Keluar dari e-DOJO</span>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 lg:p-6 xl:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto min-w-0">
                    {children}
                </main>

                {/* Mobile Fixed Bottom Navigation (5 main items matching Image 1) */}
                <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E8EBEF] z-30 h-16 flex items-center justify-around px-2 shadow-lg">
                    {[
                        {
                            name: 'Beranda',
                            href: '/dashboard',
                            icon: Home,
                            active: currentPath === '/dashboard' || currentPath === '/',
                        },
                        {
                            name: 'Kehadiran',
                            href: '/attendance/check-in',
                            icon: CalendarCheck,
                            active: currentPath.startsWith('/attendance'),
                        },
                        {
                            name: 'Kenshi',
                            href: '/kenshis',
                            icon: Users,
                            active: currentPath.startsWith('/kenshis'),
                        },
                        {
                            name: 'KTA & UKT',
                            href: '/portal/kenshi',
                            icon: Award,
                            active: currentPath.startsWith('/portal/kenshi') || currentPath.startsWith('/examinations'),
                        },
                        {
                            name: 'Laporan',
                            href: '/reports',
                            icon: BarChart3,
                            active: currentPath.startsWith('/reports'),
                        },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    'flex flex-col items-center justify-center py-1 px-3 text-center transition-colors',
                                    tab.active ? 'text-[#C51C2A]' : 'text-[#718092] hover:text-[#17202D]'
                                )}
                            >
                                <Icon className="w-5 h-5 mb-0.5" />
                                <span className={cn('text-[10px] tracking-tight', tab.active ? 'font-bold' : 'font-medium')}>
                                    {tab.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
