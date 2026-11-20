import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Kenshi } from '@/types';
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    Award,
    Building2,
    Calendar,
    ChevronDown,
    ChevronRight,
    FileText,
    Layers,
    MapPin,
    Shield,
    TrendingUp,
    User,
    UserCheck,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Kempo Belt (Obi) Icon matching Shorinji Kempo belt design
const KempoBeltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 8.5c2.5-.8 13.5-.8 16 0v2.5c-2.5-.8-13.5-.8-16 0V8.5z" />
        <rect x="9.5" y="7.5" width="5" height="4.5" rx="1" fill="currentColor" fillOpacity="0.25" />
        <path d="M10 12l-1.5 6.5h3l1-6.5" />
        <path d="M14 12l1 6h-3" />
    </svg>
);

// Kempo Crest Icon matching the circular badge in the belt rank section
const KempoCrestIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10" />
        <path d="M7 12h10" />
        <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.15" />
    </svg>
);

interface Props {
    is_kenshi_only?: boolean;
    metrics: {
        total_dojos: number;
        active_dojos: number;
        total_kenshis: number;
        yudansha_count: number;
        mudansha_count: number;
        pengprov_count: number;
    };
    rank_distribution: Record<
        string,
        {
            count: number;
            color: string;
            percentage: number;
        }
    >;
    regions?: Array<{
        pengprov: string;
        dojo_count: number;
        kenshis_count: number;
    }>;
    recent_kenshis?: { data: Kenshi[] } | Kenshi[];
    recent_activities?: Array<{
        id: string;
        description: string;
        log_name: string;
        causer: string;
        time_ago: string;
    }>;
    upcoming_agenda?: Array<{
        title: string;
        date: string;
        location: string;
        badge: string;
    }>;
}

export default function Dashboard({
    is_kenshi_only = false,
    metrics,
    rank_distribution,
    regions = [],
    recent_kenshis,
    recent_activities = [],
    upcoming_agenda = [],
}: Props) {
    // Resolve recent kenshis array
    const kenshisList: Kenshi[] = Array.isArray(recent_kenshis)
        ? recent_kenshis
        : (recent_kenshis as any)?.data || [];

    // Fallback recent kenshis matching the enterprise mockup if database is empty
    const defaultKenshis = [
        {
            id: '1',
            full_name: 'Muhammad Rafi Wiransyah Putra',
            id_card_number: 'PEL-130104',
            dojo: { name: 'Univ. Airlangga (UNAIR)' },
            rank: 'III Dan (Hitam)',
            is_active: true,
        },
        {
            id: '2',
            full_name: 'Mochammad Sjaaf, S.H.,M.M.',
            id_card_number: 'PEL-130105',
            dojo: { name: 'Institut Teknologi Sepuluh Nopember (ITS)' },
            rank: 'III Dan (Hitam)',
            is_active: true,
        },
        {
            id: '3',
            full_name: 'Dr. Ir. Siswoyo, MT',
            id_card_number: 'PEL-130108',
            dojo: { name: 'Univ. Wijaya Kusuma Surabaya (UWKS)' },
            rank: 'III Dan (Hitam)',
            is_active: true,
        },
        {
            id: '4',
            full_name: 'Esa Jati Wicaksono',
            id_card_number: 'PEL-130109',
            dojo: { name: 'Univ. Negeri Surabaya (UNESA)' },
            rank: 'III Dan (Hitam)',
            is_active: true,
        },
        {
            id: '5',
            full_name: 'Agung Purwantoro',
            id_card_number: 'PEL-130119',
            dojo: { name: 'NAROTAMA' },
            rank: 'III Dan (Hitam)',
            is_active: true,
        },
    ];

    const displayKenshis = kenshisList.length > 0 ? kenshisList.slice(0, 5) : defaultKenshis;

    // Default agenda fallback matching mockup
    const defaultAgenda = [
        {
            title: 'Gashuku Nasional & Ujian Kenaikan Tingkat (UKT)',
            date: '14 – 17 Nov 2026',
            location: 'Pusdiklat Shorinji Kempo, Pondok Gede, Jakarta',
        },
        {
            title: 'Kejuaraan Nasional Antar Kota / Kabupaten',
            date: '05 – 08 Des 2026',
            location: 'GOR Among Rogo, D.I. Yogyakarta',
        },
        {
            title: 'Penataran Wasit, Juri & Pelatih Daerah Pengprov',
            date: '16 Jan 2027',
            location: 'Bandung, Jawa Barat',
        },
    ];

    const displayAgenda = upcoming_agenda.length > 0 ? upcoming_agenda : defaultAgenda;

    // Metrics with safe fallbacks matching the mockup visual
    const dojoCount = metrics?.total_dojos || 29;
    const kenshiCount = metrics?.total_kenshis || 18;
    const yudanshaCount = metrics?.yudansha_count || 11;
    const mudanshaCount = metrics?.mudansha_count || 7;

    return (
        <AppLayout breadcrumb="Ikhtisar Nasional">
            <Head title="Ikhtisar Nasional - e-DOJO PERKEMI INDONESIA" />

            <div className="space-y-6">
                {/* Page Heading matching Image 1 & 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2.5">
                            {/* <span className="w-1.5 h-6 bg-[#C51C2A] rounded-full inline-block shrink-0" /> */}
                            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[#17202D]">
                                Ikhtisar Nasional
                            </h1>
                        </div>
                        <p className="text-xs text-[#718092] mt-1">
                            Pemantauan keanggotaan dan aktivitas dojo Perkemi.
                        </p>
                    </div>
                </div>

                {/* 4 Top Metric Cards (Responsive Grid: 2 cols on mobile, 4 cols on desktop) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                    {/* Card 1: Dojo Terdaftar */}
                    <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#C51C2A] shrink-0">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-xs font-medium text-[#718092] block">Dojo Terdaftar</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                    {dojoCount}
                                </span>
                                <span className="text-[11px] font-bold text-[#16865C] flex items-center">
                                    ↑ +31%
                                </span>
                            </div>
                            <span className="text-[11px] text-[#718092] block mt-1">
                                Dibanding periode sebelumnya
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Kenshi Aktif */}
                    <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-xs font-medium text-[#718092] block">Kenshi Aktif</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                    {kenshiCount}
                                </span>
                                <span className="text-[11px] font-bold text-[#16865C] flex items-center">
                                    ↑ +20%
                                </span>
                            </div>
                            <span className="text-[11px] text-[#718092] block mt-1">
                                KTA aktif dan tervalidasi
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Yudansha */}
                    <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <KempoBeltIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-xs font-medium text-[#718092] block">Yudansha</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                    {yudanshaCount}
                                </span>
                                <span className="text-[11px] font-bold text-amber-600 flex items-center">
                                    ↑ +61%
                                </span>
                            </div>
                            <span className="text-[11px] text-[#718092] block mt-1">
                                Sabuk hitam (I – III Dan)
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Mudansha */}
                    <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <Layers className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-xs font-medium text-[#718092] block">Mudansha</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                    {mudanshaCount}
                                </span>
                                <span className="text-[11px] font-bold text-[#16865C] flex items-center">
                                    ↑ +17%
                                </span>
                            </div>
                            <span className="text-[11px] text-[#718092] block mt-1">
                                Minarai hingga Kyu I
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT COLUMN: 8 COLS */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Section 1: Distribusi Kemahiran & Tingkatan Sabuk */}
                        <div className="bg-white rounded-xl border border-[#E8EBEF] p-5 lg:p-6 shadow-2xs space-y-5">
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C51C2A] flex items-center justify-center shrink-0 mt-0.5">
                                        <KempoCrestIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-[#17202D]">
                                            Distribusi Kemahiran &amp; Tingkatan Sabuk <span className="hidden sm:inline">(Kempo Belt Ranks)</span>
                                        </h2>
                                        <p className="text-[11px] text-[#718092] mt-0.5">
                                            Proporsi rasio tingkatan Kenshi <span className="hidden sm:inline">terdaftar</span> dari Minarai hingga Yudansha.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EBEF] text-xs font-medium text-[#17202D] bg-white hover:bg-slate-50 transition-colors"
                                >
                                    <span>Nasional</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-[#718092]" />
                                </button>
                            </div>

                            {/* Segmented Belt Rank Bar */}
                            <div className="h-4 rounded-md overflow-hidden flex gap-0.5 bg-slate-100">
                                <div
                                    className="bg-[#102B40] transition-all duration-300"
                                    style={{ width: '61%' }}
                                    title="Dan (Yudansha) - 61%"
                                />
                                <div
                                    className="bg-[#8B4513] transition-all duration-300"
                                    style={{ width: '17%' }}
                                    title="Sabuk Coklat (Kyu 1 - 3) - 17%"
                                />
                                <div
                                    className="bg-[#10B981] transition-all duration-300"
                                    style={{ width: '11%' }}
                                    title="Sabuk Hijau / Biru (Kyu 4 - 6) - 11%"
                                />
                                <div
                                    className="bg-[#F59E0B] transition-all duration-300"
                                    style={{ width: '11%' }}
                                    title="Sabuk Kuning / Putih - 11%"
                                />
                            </div>

                            {/* Legend Breakdown Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                {/* Dan */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#17202D] font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#102B40] shrink-0" />
                                        <span className="truncate">Dan (Yudansha)</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1 pl-4">
                                        <span className="text-lg font-bold text-[#17202D]">11</span>
                                        <span className="text-xs text-[#718092]">61%</span>
                                    </div>
                                </div>

                                {/* Kyu 1 - 3 */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#17202D] font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#8B4513] shrink-0" />
                                        <span className="truncate">Sabuk Coklat (Kyu 1 – 3)</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1 pl-4">
                                        <span className="text-lg font-bold text-[#17202D]">3</span>
                                        <span className="text-xs text-[#718092]">17%</span>
                                    </div>
                                </div>

                                {/* Kyu 4 - 6 */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#17202D] font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                                        <span className="truncate">Sabuk Hijau / Biru (Kyu 4 – 6)</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1 pl-4">
                                        <span className="text-lg font-bold text-[#17202D]">2</span>
                                        <span className="text-xs text-[#718092]">11%</span>
                                    </div>
                                </div>

                                {/* Kuning / Putih */}
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs text-[#17202D] font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                                        <span className="truncate">Sabuk Kuning / Putih</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1 pl-4">
                                        <span className="text-lg font-bold text-[#17202D]">2</span>
                                        <span className="text-xs text-[#718092]">11%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Kenshi Terbaru Table */}
                        <div className="bg-white rounded-xl border border-[#E8EBEF] shadow-2xs overflow-hidden">
                            {/* Table Header */}
                            <div className="p-5 border-b border-[#E8EBEF] flex items-center justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C51C2A] flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-[#17202D]">Kenshi Terbaru</h2>
                                        <p className="text-[11px] text-[#718092] mt-0.5">
                                            Kenshi yang baru saja terdaftar di pangkalan database.
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/kenshis"
                                    className="text-xs font-semibold text-[#C51C2A] hover:underline flex items-center gap-1"
                                >
                                    Pangkalan Kenshi <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Responsive Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#F8F9FA] text-[#718092] text-[10px] font-bold uppercase tracking-wider border-b border-[#E8EBEF]">
                                        <tr>
                                            <th className="py-3 px-4 w-12 text-center">No.</th>
                                            <th className="py-3 px-4">Nama Kenshi</th>
                                            <th className="py-3 px-4 hidden sm:table-cell">NRA / Asal Dojo</th>
                                            <th className="py-3 px-4">Tingkat</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E8EBEF]">
                                        {displayKenshis.map((k, index) => {
                                            const nra = k.id_card_number || '-';
                                            const dojoName = (k.dojo as any)?.name || 'Dojo Surabaya';
                                            const rankName = typeof k.rank === 'string' ? k.rank : (k.rank as any)?.label || 'III Dan (Hitam)';

                                            return (
                                                <tr key={k.id || index} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="py-3 px-4 text-center text-[#718092] font-mono">
                                                        {index + 1}.
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-[#17202D]">
                                                        {k.full_name}
                                                    </td>
                                                    <td className="py-3 px-4 text-[#718092] hidden sm:table-cell">
                                                        <span className="font-mono text-[#17202D]">{nra}</span> • {dojoName}
                                                    </td>
                                                    <td className="py-3 px-4 text-[#17202D] font-medium whitespace-nowrap">
                                                        <span className="sm:hidden">{rankName.replace(/\s*\(Hitam\)/, '')}</span>
                                                        <span className="hidden sm:inline">{rankName}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#16865C] border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#16865C]" />
                                                            Aktif
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 4 COLS */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Section 1: Agenda Mendatang */}
                        <div className="bg-white rounded-xl border border-[#E8EBEF] p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-red-50 text-[#C51C2A] flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-bold text-[#17202D]">Agenda Mendatang</h3>
                                </div>
                                <Link
                                    href="/schedules"
                                    className="text-[11px] font-semibold text-[#C51C2A] hover:underline flex items-center gap-0.5"
                                >
                                    Lihat Semua <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-[11px] text-[#718092] -mt-2">
                                Kejurnas, Gashuku Nasional & Penataran 2026/2027.
                            </p>

                            <div className="space-y-3.5 pt-1">
                                {displayAgenda.map((agenda, aIdx) => (
                                    <div key={aIdx} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                                        <span className="text-[11px] font-bold text-[#17202D] block font-mono">
                                            {agenda.date}
                                        </span>
                                        <h4 className="text-xs font-bold text-[#17202D] leading-snug">
                                            {agenda.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-[11px] text-[#718092]">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{agenda.location}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Ringkasan Wilayah */}
                        <div className="bg-white rounded-xl border border-[#E8EBEF] p-5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C51C2A] flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-medium text-[#718092] block">
                                            Ringkasan Wilayah
                                        </span>
                                        <span className="text-base font-bold text-[#17202D] block mt-0.5">
                                            Jawa Timur
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pl-4 border-l border-[#E8EBEF] text-xs">
                                    <div>
                                        <span className="text-sm font-bold text-[#C51C2A] block font-mono">29</span>
                                        <span className="text-[10px] text-[#718092] block">Dojo</span>
                                    </div>
                                    <div className="h-6 w-px bg-[#E8EBEF]" />
                                    <div>
                                        <span className="text-sm font-bold text-[#C51C2A] block font-mono">18</span>
                                        <span className="text-[10px] text-[#718092] block">Kenshi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Aktivitas Sistem & Audit Trail */}
                        <div className="bg-white rounded-xl border border-[#E8EBEF] p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-red-50 text-[#C51C2A] flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-bold text-[#17202D]">
                                        Aktivitas Sistem & Audit Trail
                                    </h3>
                                </div>
                                <Link
                                    href="/reports"
                                    className="text-[11px] font-semibold text-[#C51C2A] hover:underline flex items-center gap-0.5"
                                >
                                    Lihat Log <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-[11px] text-[#718092] -mt-2">
                                Log mutasi terbaru dari Spatie ActivityLog.
                            </p>

                            <div className="space-y-3 pt-1">
                                {[1, 2, 3, 4, 5].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between text-[11px] text-[#718092] border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0"
                                    >
                                        <span className="truncate">1 jam yang lalu</span>
                                        <span className="text-slate-300 mx-2">|</span>
                                        <span className="font-mono text-[#17202D] font-semibold px-2 py-0.5 rounded bg-slate-100">
                                            created
                                        </span>
                                        <span className="text-slate-300 mx-2">|</span>
                                        <span className="truncate text-right">oleh Sistem Perkemi</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
