import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageProps, Kenshi } from '@/types';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Award,
    Building2,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Compass,
    Crosshair,
    Dumbbell,
    ExternalLink,
    Flame,
    GraduationCap,
    HeartPulse,
    Layers,
    MapPin,
    Plus,
    Shield,
    Sparkles,
    Star,
    TrendingUp,
    User,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Button } from '@/Components/UI/Elements/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { formatDate } from '@/lib/utils';

interface Props {
    is_kenshi_only?: boolean;
    kenshi_profile?: { data: Kenshi } | Kenshi | null;
    kenshi_stats?: {
        total_attendances: number;
        attended_total: number;
        present_count: number;
        late_count: number;
        excused_count: number;
        sick_count: number;
        absent_count: number;
        attendance_rate: number;
        independent_sessions: number;
        independent_minutes: number;
    } | null;
    latest_evaluation?: {
        id: string;
        evaluation_date: string;
        technique_score: number;
        embu_score: number;
        randori_score: number;
        physical_score: number;
        discipline_score: number;
        overall_score: number;
        grade: string;
        recommendation?: string;
        notes?: string;
        coach?: { name: string };
    } | null;
    upcoming_schedule?: any;
    recent_trainings?: Array<{
        id: string;
        training_date: string;
        drill_type: string;
        title: string;
        duration_minutes: number;
        intensity: string;
        estimated_calories?: number;
    }> | null;
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
    regions: Array<{
        pengprov: string;
        dojo_count: number;
        kenshis_count: number;
    }>;
    recent_kenshis:
        | {
              data?: Kenshi[];
          }
        | Kenshi[];
    recent_activities: Array<{
        id: number;
        description: string;
        log_name: string;
        causer: string;
        time_ago: string;
    }>;
    upcoming_agenda: Array<{
        title: string;
        date: string;
        location: string;
        badge: string;
        badge_color: 'rose' | 'amber' | 'emerald' | string;
    }>;
}

export default function Dashboard({
    is_kenshi_only = false,
    kenshi_profile,
    kenshi_stats,
    latest_evaluation,
    upcoming_schedule,
    recent_trainings = [],
    metrics,
    rank_distribution,
    regions,
    recent_kenshis,
    recent_activities,
    upcoming_agenda,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const userRoles = auth.user?.roles || [];
    const isSensei = userRoles.includes('Sensei');
    const isKenshi = userRoles.includes('Kenshi');

    const kenshi = kenshi_profile && 'data' in kenshi_profile ? kenshi_profile.data : kenshi_profile;
    const upcoming = upcoming_schedule && 'data' in upcoming_schedule ? upcoming_schedule.data : upcoming_schedule;

    // DEDICATED ATHLETE VIEW IF ROLE IS KENSHI
    if (is_kenshi_only && kenshi) {
        return (
            <AppLayout>
                <Head title={`Dashboard Atlet Kenshi - ${kenshi.full_name}`} />

                <div className="space-y-6">
                    {/* Athlete Hero Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#0B132B] to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-start sm:items-center gap-4">
                                <Avatar
                                    name={kenshi.full_name}
                                    size="lg"
                                    className="ring-2 ring-red-500 shrink-0"
                                />
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-600 text-white shadow-xs">
                                            <Shield className="w-3 h-3" />
                                            PERKEMI ATLET
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Tatami Aktif
                                        </span>
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                        Selamat Datang, {kenshi.full_name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300 font-mono">
                                        <span>NIK: {kenshi.id_card_number}</span>
                                        <span>•</span>
                                        <span>Dojo: {kenshi.dojo?.name || 'Cabang Dojo'}</span>
                                        {kenshi.rank && (
                                            <>
                                                <span>•</span>
                                                <RankBadge
                                                    label={kenshi.rank.label}
                                                    beltColor={kenshi.rank.belt_color}
                                                    isDan={kenshi.rank.is_dan}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <Link href="/attendance/check-in">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
                                        leftIcon={<Camera className="w-4 h-4" />}
                                    >
                                        Presensi Kamera & GPS
                                    </Button>
                                </Link>
                                <Link href="/performance/independent">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700"
                                        leftIcon={<Dumbbell className="w-4 h-4" />}
                                    >
                                        Catat Latihan Mandiri
                                    </Button>
                                </Link>
                                <Link href="/portal/kenshi">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                        leftIcon={<Award className="w-4 h-4 text-amber-400" />}
                                    >
                                        KTA Digital Saya
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 4 Athlete Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Attendance Rate */}
                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                                    Kehadiran Tatami
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        {kenshi_stats?.attendance_rate ?? 100}%
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        ({kenshi_stats?.attended_total ?? 0} Sesi Hadir)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${kenshi_stats?.attendance_rate ?? 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-emerald-700 font-medium block mt-1.5">
                                    {kenshi_stats?.present_count ?? 0} Tepat Waktu • {kenshi_stats?.late_count ?? 0} Dispensasi
                                </span>
                            </CardContent>
                        </Card>

                        {/* Excuses & Alpha */}
                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                                    Izin, Sakit & Alpha
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black text-violet-600 tracking-tight">
                                        {(kenshi_stats?.excused_count ?? 0) +
                                            (kenshi_stats?.sick_count ?? 0) +
                                            (kenshi_stats?.absent_count ?? 0)}
                                    </span>
                                    <span className="text-xs text-slate-500">Sesi Berhalangan</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium mt-2">
                                    <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
                                        {kenshi_stats?.excused_count ?? 0} Izin
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                        {kenshi_stats?.sick_count ?? 0} Sakit
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                                        {kenshi_stats?.absent_count ?? 0} Alpha
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Coach Evaluation Score */}
                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                                    Rapor Pelatih Terakhir
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        {latest_evaluation ? latest_evaluation.overall_score : '-'}
                                    </span>
                                    <span className="text-xs text-slate-500">/ 100 Skor Komposit</span>
                                </div>
                                <div className="mt-1.5">
                                    {latest_evaluation ? (
                                        <Badge variant="success" size="sm">
                                            {latest_evaluation.grade}
                                        </Badge>
                                    ) : (
                                        <span className="text-[11px] text-slate-400">Belum ada evaluasi resmi</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Independent Training */}
                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                                    Latihan Mandiri
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black text-amber-600 tracking-tight">
                                        {kenshi_stats?.independent_sessions ?? 0}
                                    </span>
                                    <span className="text-xs text-slate-500">Sesi Logbook</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                                    {Math.floor((kenshi_stats?.independent_minutes ?? 0) / 60)}j{' '}
                                    {(kenshi_stats?.independent_minutes ?? 0) % 60}m waktu latihan
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column (2 Cols): 5-Aspect Coach Radar & Independent Logbook */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Coach Evaluation Card */}
                            <Card className="border-slate-200 shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 bg-white">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Rapor Performa 5 Aspek dari Pelatih
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Evaluasi penguasaan materi Shorinji Kempo oleh Sensei Dojo.
                                        </p>
                                    </div>
                                    <Link href="/performance/evaluations">
                                        <Button variant="ghost" size="sm" className="text-xs text-red-600">
                                            Buka Rapor Penuh
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-5">
                                    {latest_evaluation ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                                        Teknik
                                                    </span>
                                                    <span className="text-base font-black text-slate-900">
                                                        {latest_evaluation.technique_score}
                                                    </span>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                                        Embu
                                                    </span>
                                                    <span className="text-base font-black text-slate-900">
                                                        {latest_evaluation.embu_score}
                                                    </span>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                                        Randori
                                                    </span>
                                                    <span className="text-base font-black text-slate-900">
                                                        {latest_evaluation.randori_score}
                                                    </span>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                                        Fisik
                                                    </span>
                                                    <span className="text-base font-black text-slate-900">
                                                        {latest_evaluation.physical_score}
                                                    </span>
                                                </div>
                                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                                        Disiplin
                                                    </span>
                                                    <span className="text-base font-black text-slate-900">
                                                        {latest_evaluation.discipline_score}
                                                    </span>
                                                </div>
                                            </div>

                                            {latest_evaluation.recommendation && (
                                                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900 text-xs border border-emerald-100 flex items-center justify-between">
                                                    <div>
                                                        <span className="font-bold block">Rekomendasi Sensei:</span>
                                                        <span>{latest_evaluation.recommendation}</span>
                                                    </div>
                                                    <Badge variant="success" size="sm">
                                                        {latest_evaluation.grade}
                                                    </Badge>
                                                </div>
                                            )}

                                            {latest_evaluation.notes && (
                                                <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    "{latest_evaluation.notes}" — {latest_evaluation.coach?.name || 'Sensei'}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-500 space-y-2">
                                            <Award className="w-8 h-8 text-slate-300 mx-auto" />
                                            <p className="text-xs">
                                                Belum ada penilaian pelatih yang terekam. Ikuti sesi latihan tatami secara konsisten untuk evaluasi UKT.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Independent Training Logbook */}
                            <Card className="border-slate-200 shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 bg-white">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Sesi Latihan Mandiri Terbaru
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Catatan drill mandiri Tandoku Embu dan latihan fisik di rumah.
                                        </p>
                                    </div>
                                    <Link href="/performance/independent">
                                        <Button variant="outline" size="sm" className="text-xs" leftIcon={<Plus className="w-3.5 h-3.5 text-red-600" />}>
                                            Catat Latihan
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {recent_trainings && recent_trainings.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {recent_trainings.map((t) => (
                                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                                                            {t.drill_type}
                                                        </span>
                                                        <h5 className="text-xs font-bold text-slate-900">{t.title}</h5>
                                                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                            <span>{formatDate(t.training_date)}</span>
                                                            <span>•</span>
                                                            <span>{t.duration_minutes} Menit</span>
                                                            {t.estimated_calories && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-amber-600 font-medium">~{t.estimated_calories} Kkal</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            t.intensity === 'hard'
                                                                ? 'danger'
                                                                : t.intensity === 'medium'
                                                                ? 'warning'
                                                                : 'success'
                                                        }
                                                        size="sm"
                                                    >
                                                        {t.intensity === 'hard'
                                                            ? 'Intensif'
                                                            : t.intensity === 'medium'
                                                            ? 'Sedang'
                                                            : 'Ringan'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 space-y-2">
                                            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto" />
                                            <p className="text-xs">Belum ada latihan mandiri yang dicatat minggu ini.</p>
                                            <Link href="/performance/independent">
                                                <Button variant="secondary" size="sm" className="mt-1">
                                                    Buka Digital Logbook
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Upcoming Dojo Training & KTA Quick Card */}
                        <div className="space-y-6">
                            {/* Upcoming Training Schedule Card */}
                            <Card className="border-slate-200 shadow-xs">
                                <CardHeader className="border-b border-slate-100 px-5 py-4 bg-white">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
                                        Jadwal Tatami Dojo
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Sesi Latihan Mendatang
                                    </h4>
                                </CardHeader>
                                <CardContent className="p-5">
                                    {upcoming ? (
                                        <div className="space-y-3.5">
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-900">{upcoming.title}</h5>
                                                <p className="text-xs text-slate-500 mt-0.5">{upcoming.dojo?.name}</p>
                                            </div>

                                            <div className="space-y-2 text-xs text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="font-semibold">{formatDate(upcoming.date, { withDay: true })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>{upcoming.start_time} - {upcoming.end_time} WIB</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                                                    <span className="truncate">{upcoming.location_name || 'Tatami Dojo'}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Link href={`/schedules/${upcoming.id}`} className="w-full block">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                                                        leftIcon={<Camera className="w-4 h-4" />}
                                                    >
                                                        Cek Kehadiran & Status Sesi
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-500 space-y-2">
                                            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                                            <p className="text-xs">Tidak ada jadwal sesi latihan aktif untuk dojo Anda hari ini.</p>
                                            <Link href="/schedules">
                                                <Button variant="secondary" size="sm" className="mt-1">
                                                    Lihat Kalender Sesi
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Digital License (KTA) Card */}
                            <Card className="border-slate-200 shadow-xs bg-slate-900 text-white overflow-hidden relative">
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                            KTA Digital Perkemi
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-400">
                                            Verified Tatami
                                        </span>
                                    </div>

                                    <div>
                                        <h5 className="text-base font-bold text-white">{kenshi.full_name}</h5>
                                        <p className="text-xs font-mono text-slate-300 mt-0.5">{kenshi.id_card_number}</p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Tingkat Sabuk:</span>
                                        <span className="font-bold text-white">{kenshi.rank?.label || 'Kenshi'}</span>
                                    </div>

                                    <div className="pt-1">
                                        <Link href="/portal/kenshi" className="w-full block">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
                                                leftIcon={<Award className="w-3.5 h-3.5 text-amber-400" />}
                                            >
                                                Buka KTA Digital Penuh
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const kenshisList: Kenshi[] = Array.isArray(recent_kenshis)
        ? recent_kenshis
        : (recent_kenshis?.data ?? []);

    const activeDojoPercentage =
        metrics.total_dojos > 0
            ? Math.round((metrics.active_dojos / metrics.total_dojos) * 100)
            : 100;

    const yudanshaPercentage =
        metrics.total_kenshis > 0
            ? Math.round((metrics.yudansha_count / metrics.total_kenshis) * 100)
            : 0;

    return (
        <AppLayout>
            <Head title="Pusat Komando & Dashboard Nasional - PB Perkemi" />

            <div className="space-y-5 sm:space-y-6">
                {/* Executive Command Center Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0B132B] text-white p-5 sm:p-7 lg:p-8 shadow-md border border-slate-800">
                    {/* Subtle Radial Glows */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
                        <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
                                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-red-600 text-white shadow-xs">
                                    <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    PB PERKEMI
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    Command Center
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live Sync
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                Pusat Komando & Analitik Nasional
                            </h1>
                            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Portal terpadu pemantauan seluruh cabang dojo, sertifikasi keaktifan kenshi,
                                evaluasi tingkat kemahiran (Dan/Kyu), serta kalender kejuaraan Shorinji Kempo Indonesia.
                            </p>
                        </div>

                        {/* Quick Action Navigation Buttons */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
                            {isSensei && (
                                <Link href="/my-dojo" className="w-full sm:w-auto">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={<Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        className="w-full sm:w-auto justify-center text-xs"
                                    >
                                        Dojo Saya
                                    </Button>
                                </Link>
                            )}

                            {isKenshi && (
                                <Link href="/portal/kenshi" className="w-full sm:w-auto">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        leftIcon={<Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                        className="w-full sm:w-auto justify-center text-xs"
                                    >
                                        KTA Digital
                                    </Button>
                                </Link>
                            )}

                            <Link href="/dojos" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    className="w-full sm:w-auto justify-center border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 hover:text-white text-xs"
                                >
                                    Daftar Dojo
                                </Button>
                            </Link>

                            <Link href="/kenshis" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                    className="w-full sm:w-auto justify-center border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 hover:text-white text-xs"
                                >
                                    Pangkalan Kenshi
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Key Executive Metrics Grid (5 KPI Cards Responsive) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
                    {/* Total Dojos */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Dojo
                            </span>
                            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {metrics.total_dojos}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-1 sm:px-1.5 py-0.5 rounded">
                                {activeDojoPercentage}%
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
                            {metrics.pengprov_count} Pengprov
                        </p>
                    </motion.div>

                    {/* Total Kenshis */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Kenshi
                            </span>
                            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {metrics.total_kenshis}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 px-1 sm:px-1.5 py-0.5 rounded">
                                Terdata
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
                            KTA aktif tervalidasi
                        </p>
                    </motion.div>

                    {/* Yudansha (Black Belt / Dan) */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Yudansha (Dan)
                            </span>
                            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {metrics.yudansha_count}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-amber-700 bg-amber-50 px-1 sm:px-1.5 py-0.5 rounded">
                                {yudanshaPercentage}%
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
                            Sabuk Hitam (I - III Dan)
                        </p>
                    </motion.div>

                    {/* Mudansha (Kyu Kenshi) */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Mudansha (Kyu)
                            </span>
                            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {metrics.mudansha_count}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-600 bg-slate-100 px-1 sm:px-1.5 py-0.5 rounded">
                                Siswa
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
                            Minarai hingga Kyu I
                        </p>
                    </motion.div>

                    {/* Pengprov Coverage */}
                    <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="col-span-2 sm:col-span-1 lg:col-span-1 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Cakupan Wilayah
                            </span>
                            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                                {metrics.pengprov_count}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-1 sm:px-1.5 py-0.5 rounded">
                                Pengprov
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">
                            Seluruh Indonesia
                        </p>
                    </motion.div>
                </div>

                {/* Multi-Role Quick Interactive Pathway Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
                    {/* Portal Sensei */}
                    <Link href="/my-dojo" className="group block">
                        <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="h-full rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-shadow group-hover:shadow-md group-hover:border-red-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                                    Akses Portal <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                                Panel Dojo & Analitik Sensei
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                Pantau data kenshi, hitung persentase kehadiran, kelayakan Ujian Kenaikan Tingkat (UKT),
                                serta mutasi siswa di dojo binaan Anda.
                            </p>
                        </motion.div>
                    </Link>

                    {/* Portal Kenshi */}
                    <Link href="/portal/kenshi" className="group block">
                        <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="h-full rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-shadow group-hover:shadow-md group-hover:border-amber-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
                                    Buka KTA <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                                KTA Digital & Roadmap UKT
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                Kartu identitas 3D Kenshi berstandar PB Perkemi, hash enkripsi anti-pemalsuan,
                                riwayat tingkatan sabuk, dan jalur kenaikan tingkat.
                            </p>
                        </motion.div>
                    </Link>

                    {/* Audit Trail & Log Viewer */}
                    <a href="/log-viewer" target="_blank" rel="noreferrer" className="sm:col-span-2 md:col-span-1 group block">
                        <motion.div
                            whileHover={{ y: -3 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="h-full rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-shadow group-hover:shadow-md group-hover:border-slate-400"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[#0B132B] group-hover:text-white transition-colors">
                                    <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:translate-x-1 transition-transform">
                                    Audit Logs <ExternalLink className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                                Keamanan & Jejak Audit Sistem
                            </h3>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                Opcodes Log Viewer & Spatie ActivityLog terintegrasi untuk memonitor mutasi data,
                                otentikasi peran, dan integritas database nasional.
                            </p>
                        </motion.div>
                    </a>
                </div>

                {/* Tingkat Kemahiran (Rank Distribution Proportions) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                                Distribusi Kemahiran & Tingkatan Sabuk (Kempo Belt Ranks)
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Proporsi rasio tingkatan Kenshi terdaftar dari Minarai hingga Yudansha
                            </p>
                        </div>
                        <Badge variant="navy">Nasional</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Segmented Proportional Progress Bar */}
                        <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
                            {Object.entries(rank_distribution).map(([tier, data]) => {
                                if (data.percentage <= 0) return null;
                                return (
                                    <div
                                        key={tier}
                                        style={{
                                            width: `${data.percentage}%`,
                                            backgroundColor: data.color,
                                        }}
                                        className="h-full rounded-full transition-all duration-500"
                                        title={`${tier}: ${data.count} kenshi (${data.percentage}%)`}
                                    />
                                );
                            })}
                        </div>

                        {/* Rank Tier Grid Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                            {Object.entries(rank_distribution).map(([tier, data]) => (
                                <div
                                    key={tier}
                                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span
                                            className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                                            style={{ backgroundColor: data.color }}
                                        />
                                        <span className="text-xs font-bold text-slate-700 truncate">
                                            {tier}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline justify-between mt-2">
                                        <span className="text-xl font-extrabold text-slate-900">
                                            {data.count}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">
                                            {data.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Two-Column Analytics Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (7 cols): Regional Spread & Recent Kenshis */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Regional Pengprov Distribution */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Sebaran Dojo & Kenshi Terbanyak (Pengprov)
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Peringkat pengprov dengan konsentrasi pembinaan tertinggi
                                    </p>
                                </div>
                                <Link
                                    href="/dojos"
                                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                >
                                    Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3.5">
                                    {regions.map((region, idx) => {
                                        const maxKenshis = Math.max(
                                            ...regions.map((r) => r.kenshis_count),
                                            1
                                        );
                                        const progress = Math.round(
                                            (region.kenshis_count / maxKenshis) * 100
                                        );

                                        return (
                                            <div
                                                key={region.pengprov}
                                                className="p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50/80 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                                                            #{idx + 1}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {region.pengprov}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="text-slate-500">
                                                            <strong className="text-slate-800 font-semibold">
                                                                {region.dojo_count}
                                                            </strong>{' '}
                                                            Dojo
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-red-600 font-bold">
                                                            {region.kenshis_count} Kenshi
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mini progress bar */}
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-red-600 rounded-full transition-all duration-300"
                                                        style={{ width: `${Math.max(progress, 8)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Kenshi Registrations */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Pendaftaran Kenshi Terbaru
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Kenshi yang baru saja terdaftar di pangkalan database
                                    </p>
                                </div>
                                <Link
                                    href="/kenshis"
                                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                >
                                    Pangkalan Kenshi <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y divide-slate-100">
                                    {kenshisList.length > 0 ? (
                                        kenshisList.map((kenshi) => (
                                            <div
                                                key={kenshi.id}
                                                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-lg px-2 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Avatar name={kenshi.full_name} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {kenshi.full_name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] font-mono text-slate-400">
                                                                {kenshi.id_card_number}
                                                            </span>
                                                            {kenshi.dojo && (
                                                                <span className="text-[11px] text-slate-500 truncate">
                                                                    • {kenshi.dojo.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 flex items-center gap-2">
                                                    <RankBadge
                                                        label={kenshi.rank.label}
                                                        beltColor={kenshi.rank.belt_color}
                                                        isDan={kenshi.rank.is_dan}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 py-4 text-center">
                                            Belum ada pendaftaran kenshi baru
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (5 cols): Agenda & Live Activity Feed */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Upcoming Perkemi Agenda & Tournaments */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Kalender Agenda PB Perkemi
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Kejurnas, Gashuku Nasional & Penataran 2026/2027
                                    </p>
                                </div>
                                <Calendar className="w-4 h-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcoming_agenda.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                                    {item.title}
                                                </h4>
                                                <span
                                                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                        item.badge_color === 'rose'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : item.badge_color === 'amber'
                                                              ? 'bg-amber-100 text-amber-800'
                                                              : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {item.badge}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-[11px] text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{item.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">{item.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Audit Feed (Spatie ActivityLog) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Aktivitas Sistem & Audit Trail
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Log mutasi terbaru dari Spatie ActivityLog
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Recorded
                                </span>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3.5">
                                    {recent_activities.length > 0 ? (
                                        recent_activities.map((act) => (
                                            <div
                                                key={act.id}
                                                className="flex items-start gap-3 text-xs"
                                            >
                                                <div className="mt-0.5 h-6 w-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                                    <Activity className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-slate-800 leading-snug">
                                                        {act.description}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        oleh{' '}
                                                        <strong className="text-slate-600 font-medium">
                                                            {act.causer}
                                                        </strong>{' '}
                                                        • {act.time_ago}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-xs text-slate-400">
                                            Belum ada log aktivitas tercatat
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
