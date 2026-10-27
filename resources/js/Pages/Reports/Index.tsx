import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent, CardTitle } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { SelectSearch } from '@/Components/UI/Forms/SelectSearch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/DataDisplay/Table';
import { formatDate } from '@/lib/utils';
import {
    Building2,
    Users,
    UserCheck,
    CalendarCheck,
    FileSpreadsheet,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Cpu,
    ExternalLink,
    RefreshCw,
    Shield,
    Dumbbell,
    Award,
    Activity,
    HeartPulse,
    Search,
    Filter,
    Layers,
    BarChart3,
    TrendingUp,
    Sparkles,
    ChevronRight,
    Eye,
} from 'lucide-react';

interface ReportMetrics {
    is_kenshi_only?: boolean;
    total_dojos: number;
    active_dojos: number;
    total_kenshis: number;
    total_athletes: number;
    total_coaches: number;
    total_attendances: number;
    today_attendances: number;
    total_evaluations: number;
    avg_evaluation_score: number;
    ready_ukt_count: number;
    total_independent_trainings: number;
    total_training_minutes: number;
}

interface AspectAverages {
    technique: number;
    embu: number;
    randori: number;
    physical: number;
    discipline: number;
    overall: number;
}

interface RecentData {
    dojos: any[];
    kenshis: any[];
    attendances: any[];
    evaluations: any[];
    independentTrainings: any[];
    promotions: any[];
}

interface ReportsProps {
    metrics: ReportMetrics;
    aspectAverages: AspectAverages;
    recentData: RecentData;
    dojosList: Array<{ id: string; name: string }>;
    isKenshiOnly?: boolean;
}

interface QueuedTask {
    exportId: string;
    type: string;
    format: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    filename?: string;
    startedAt: string;
}

type ExportType = 'dojo' | 'kenshi' | 'attendance' | 'evaluation' | 'independent' | 'promotion';

export default function ReportsIndex({
    metrics,
    aspectAverages,
    recentData,
    dojosList,
    isKenshiOnly = false,
}: ReportsProps) {
    const [useQueue, setUseQueue] = useState<boolean>(true);
    const [queuedTasks, setQueuedTasks] = useState<QueuedTask[]>([]);
    const [isTriggering, setIsTriggering] = useState<string | null>(null);

    // Filter & Tab states
    const [activeTab, setActiveTab] = useState<'all' | 'dojo' | 'kenshi' | 'attendance' | 'evaluation' | 'independent' | 'promotion'>('all');
    const [viewMode, setViewMode] = useState<'cards' | 'preview'>('cards');
    const [selectedDojoId, setSelectedDojoId] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Poll active tasks in queue
    useEffect(() => {
        const activeTasks = queuedTasks.filter((t) => t.status === 'pending' || t.status === 'processing');
        if (activeTasks.length === 0) return;

        const interval = setInterval(async () => {
            for (const task of activeTasks) {
                try {
                    const res = await fetch(`/reports/status/${task.exportId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.status === 'completed' || data.status === 'failed') {
                            setQueuedTasks((prev) =>
                                prev.map((t) =>
                                    t.exportId === task.exportId
                                        ? { ...t, status: data.status, filename: data.filename }
                                        : t
                                )
                            );
                        }
                    }
                } catch (e) {
                    console.error('Failed to poll status', e);
                }
            }
        }, 2500);

        return () => clearInterval(interval);
    }, [queuedTasks]);

    const handleExport = async (type: ExportType, format: 'excel' | 'pdf') => {
        const taskKey = `${type}-${format}`;
        setIsTriggering(taskKey);

        if (!useQueue) {
            // Direct download link
            window.location.href = `/reports/export?type=${type}&format=${format}&mode=direct`;
            setIsTriggering(null);
            return;
        }

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/reports/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type,
                    format,
                    mode: 'queue',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const newTask: QueuedTask = {
                    exportId: data.export_id,
                    type,
                    format,
                    status: 'pending',
                    startedAt: new Date().toLocaleTimeString('id-ID'),
                };
                setQueuedTasks((prev) => [newTask, ...prev]);
            }
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setIsTriggering(null);
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'dojo':
                return 'Cabang Dojo Perkemi';
            case 'kenshi':
                return 'Pangkalan Kenshi & Pelatih';
            case 'attendance':
                return 'Presensi Tatami & Geofence';
            case 'evaluation':
                return 'Rapor Penilaian 5 Aspek Pelatih';
            case 'independent':
                return 'Logbook Latihan Mandiri Atlet';
            case 'promotion':
                return 'Kualifikasi & Rekapitulasi UKT';
            default:
                return type;
        }
    };

    const dojoOptions = [
        { value: 'all', label: 'Semua Dojo Cabang' },
        ...(dojosList || []).map((d) => ({ value: d.id, label: d.name })),
    ];

    return (
        <AppLayout>
            <Head title="Pusat Laporan & Rekapitulasi - e-Dojo Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title={isKenshiOnly ? 'Laporan Presensi & Rapor Saya' : 'Pusat Laporan & Rekapitulasi Data'}
                    description={
                        isKenshiOnly
                            ? 'Rekapitulasi resmi presensi tatami, evaluasi 5 aspek waza oleh Sensei, dan logbook latihan mandiri Anda.'
                            : 'Ekspor dan cetak laporan resmi cabang dojo, atlet/pelatih, presensi tatami GPS, sport science 5 aspek, logbook mandiri, dan kelayakan UKT.'
                    }
                >
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                        <Cpu className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-slate-700">Worker Queue:</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useQueue}
                                onChange={(e) => setUseQueue(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                            {useQueue ? 'Queue Aktif (Asinkron)' : 'Langsung'}
                        </span>
                    </div>
                </PageHeading>

                {/* Queue Information Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[#0B132B] via-slate-900 to-[#1C2541] p-5 text-white shadow-md relative overflow-hidden border border-slate-800">
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                    Pusat Rekapitulasi Nasional
                                </span>
                                <span className="text-xs text-slate-400">Database Driver Worker Queue</span>
                            </div>
                            <h3 className="text-base font-bold text-white">
                                6 Kategori Laporan Lengkap Terintegrasi Sport Science & Federasi
                            </h3>
                            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                                Setiap dataset memproses riwayat koordinat GPS tatami, rapor waza pelatih, dan log latihan mandiri secara asinkron.
                                Hasil ekspor tersimpan dalam file spreadsheet Excel (.csv) dan dokumen PDF resmi terstandarisasi PB Perkemi.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
                            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-slate-200">Format Dokumen Resmi PB Perkemi</span>
                        </div>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Cabang Dojo</span>
                        <p className="text-xl font-black text-slate-900 mt-1">{metrics.total_dojos}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">{metrics.active_dojos} Aktif</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Atlet</span>
                        <p className="text-xl font-black text-slate-900 mt-1">{metrics.total_athletes}</p>
                        <span className="text-[10px] text-slate-500 font-medium">{metrics.total_coaches} Sensei</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Presensi Tatami</span>
                        <p className="text-xl font-black text-slate-900 mt-1">{metrics.total_attendances}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">{metrics.today_attendances} Hari Ini</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Rapor Evaluasi</span>
                        <p className="text-xl font-black text-slate-900 mt-1">{metrics.total_evaluations}</p>
                        <span className="text-[10px] text-blue-600 font-medium">Avg: {metrics.avg_evaluation_score}/100</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Latihan Mandiri</span>
                        <p className="text-xl font-black text-slate-900 mt-1">{metrics.total_independent_trainings}</p>
                        <span className="text-[10px] text-amber-600 font-medium">{metrics.total_training_minutes} Menit</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Kandidat Siap UKT</span>
                        <p className="text-xl font-black text-emerald-600 mt-1">{metrics.ready_ukt_count}</p>
                        <span className="text-[10px] text-emerald-600 font-medium">Kualifikasi Lengkap</span>
                    </div>
                </div>

                {/* Visual Analytics / Radar Chart 5 Aspek & Training Volume */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Progress Bar Chart: Rata-Rata 5 Aspek Waza Pelatih */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-red-600" />
                                    Statistik Rata-Rata Evaluasi 5 Aspek Waza (Sport Science)
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Agregasi penilaian kurikulum Shorinji Kempo dari Sensei Dojo.
                                </p>
                            </div>
                            <Badge variant="primary" size="sm" className="font-bold">
                                Skor Nasional: {aspectAverages?.overall || 82}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-700">1. Teknik (Goho & Juho)</span>
                                        <span className="font-black text-slate-900">{aspectAverages?.technique || 84}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${aspectAverages?.technique || 84}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-700">2. Embu (Koreografi Gerak & Harmonisasi)</span>
                                        <span className="font-black text-slate-900">{aspectAverages?.embu || 82}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${aspectAverages?.embu || 82}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-700">3. Randori & Respon Tarung (Bogu)</span>
                                        <span className="font-black text-slate-900">{aspectAverages?.randori || 78}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-amber-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${aspectAverages?.randori || 78}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-700">4. Fisik & Daya Tahan (Biomotorik)</span>
                                        <span className="font-black text-slate-900">{aspectAverages?.physical || 85}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-rose-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${aspectAverages?.physical || 85}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-700">5. Disiplin & Etika Reigi</span>
                                        <span className="font-black text-slate-900">{aspectAverages?.discipline || 91}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${aspectAverages?.discipline || 91}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ringkasan Kualifikasi UKT & Volume Pelatihan */}
                    <Card className="flex flex-col justify-between">
                        <CardHeader className="pb-2 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                Kesiapan UKT & Pelatihan
                            </CardTitle>
                            <p className="text-xs text-slate-500">
                                Tingkat pemenuhan syarat kenaikan tingkat.
                            </p>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                                <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                                    Status Kualifikasi UKT
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-emerald-900 font-medium">Kenshi Memenuhi Syarat:</span>
                                    <span className="text-base font-black text-emerald-700">{metrics.ready_ukt_count} Atlet</span>
                                </div>
                                <p className="text-[11px] text-emerald-700">
                                    Memenuhi ambang batas minimal 16 sesi tatami dan nilai rata-rata ≥ 70.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <span className="text-[11px] font-bold uppercase text-slate-600 block">
                                    Aktivitas Latihan Mandiri (Logbook)
                                </span>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">Total Sesi Mandiri:</span>
                                    <strong className="text-slate-900">{metrics.total_independent_trainings} Sesi</strong>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">Akumulasi Waktu:</span>
                                    <strong className="text-red-600">
                                        {Math.floor(metrics.total_training_minutes / 60)} Jam {metrics.total_training_minutes % 60} Menit
                                    </strong>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Bar & Category Tabs */}
                <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                        {/* Category Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
                            {[
                                { id: 'all', label: 'Semua Kategori (6 Laporan)' },
                                { id: 'evaluation', label: 'Rapor Pelatih (5 Aspek)' },
                                { id: 'independent', label: 'Latihan Mandiri' },
                                { id: 'attendance', label: 'Presensi Tatami' },
                                { id: 'promotion', label: 'Promosi UKT' },
                                { id: 'kenshi', label: 'Atlet & Sensei' },
                                { id: 'dojo', label: 'Cabang Dojo' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                                        activeTab === tab.id
                                            ? 'bg-red-600 text-white shadow-xs'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* View Switcher: Cards vs Live Table */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-slate-400 font-medium">Mode:</span>
                            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('cards')}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                        viewMode === 'cards'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Kartu Ekspor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('preview')}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                        viewMode === 'preview'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Pratinjau Tabel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VIEW 1: 6 Export Cards Grid */}
                {viewMode === 'cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Laporan Rapor & Penilaian 5 Aspek Pelatih */}
                        {(activeTab === 'all' || activeTab === 'evaluation') && (
                            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">Rapor 5 Aspek Pelatih</h4>
                                            <p className="text-xs text-slate-500">Evaluasi Sport Science & Waza</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Mencakup penilaian terperinci 5 Aspek Shorinji Kempo (Teknik Goho-Juho, Embu, Randori, Fisik, Disiplin),
                                        predikat kelulusan (A/B+/B/C/D), rekomendasi UKT Sensei, dan catatan umpan balik atlet.
                                    </p>
                                    <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Evaluasi:</span>
                                            <strong className="text-slate-800">{metrics.total_evaluations} Penilaian</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Rata-Rata Skor:</span>
                                            <span className="text-emerald-600 font-semibold">{metrics.avg_evaluation_score} / 100</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('evaluation', 'excel')}
                                            disabled={isTriggering === 'evaluation-excel'}
                                            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                            className="w-full text-xs"
                                        >
                                            Excel (.csv)
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('evaluation', 'pdf')}
                                            disabled={isTriggering === 'evaluation-pdf'}
                                            leftIcon={<FileText className="w-4 h-4 text-red-400" />}
                                            className="w-full text-xs"
                                        >
                                            PDF Resmi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 2. Laporan Logbook Latihan Mandiri */}
                        {(activeTab === 'all' || activeTab === 'independent') && (
                            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-600">
                                            <Dumbbell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">Latihan Mandiri (Logbook)</h4>
                                            <p className="text-xs text-slate-500">Drill Waza & Kondisi Fisik</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Rekapitulasi latihan mandiri di rumah meliputi drill Tandoku Embu, Kihon Waza,
                                        durasi menit, repetisi siklus gerak, intensitas latihan, dan estimasi pembakaran kalori.
                                    </p>
                                    <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Sesi Dicatat:</span>
                                            <strong className="text-slate-800">{metrics.total_independent_trainings} Sesi</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Akumulasi Menit:</span>
                                            <span className="text-amber-600 font-semibold">{metrics.total_training_minutes} Menit</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('independent', 'excel')}
                                            disabled={isTriggering === 'independent-excel'}
                                            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                            className="w-full text-xs"
                                        >
                                            Excel (.csv)
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('independent', 'pdf')}
                                            disabled={isTriggering === 'independent-pdf'}
                                            leftIcon={<FileText className="w-4 h-4 text-red-400" />}
                                            className="w-full text-xs"
                                        >
                                            PDF Resmi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 3. Laporan Kualifikasi & Rekapitulasi UKT */}
                        {(activeTab === 'all' || activeTab === 'promotion') && (
                            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">Rekapitulasi Kenaikan Tingkat (UKT)</h4>
                                            <p className="text-xs text-slate-500">Kelayakan Kyu & Dan Nasional</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Daftar kelayakan kenshi mengikuti Ujian Kenaikan Tingkat (UKT) berdasarkan
                                        pemenuhan batas minimal presensi tatami dan hasil evaluasi materi waza.
                                    </p>
                                    <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Kenshi Siap UKT:</span>
                                            <strong className="text-emerald-700">{metrics.ready_ukt_count} Atlet</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Syarat Kehadiran:</span>
                                            <span className="text-slate-600 font-semibold">≥ 16 Sesi Tatami</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('promotion', 'excel')}
                                            disabled={isTriggering === 'promotion-excel'}
                                            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                            className="w-full text-xs"
                                        >
                                            Excel (.csv)
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('promotion', 'pdf')}
                                            disabled={isTriggering === 'promotion-pdf'}
                                            leftIcon={<FileText className="w-4 h-4 text-red-400" />}
                                            className="w-full text-xs"
                                        >
                                            PDF Resmi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 4. Laporan Presensi Tatami */}
                        {(activeTab === 'all' || activeTab === 'attendance') && (
                            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600">
                                            <CalendarCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">Laporan Presensi Tatami</h4>
                                            <p className="text-xs text-slate-500">Log Kehadiran & Validasi Geofence</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Audit rekapitulasi presensi latihan, akurasi radius GPS terhadap dojo,
                                        verifikasi potret tatami, dan riwayat absensi berkala untuk syarat UKT kenaikan tingkat.
                                    </p>
                                    <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Log:</span>
                                            <strong className="text-slate-800">{metrics.total_attendances} Kehadiran</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Hari Ini:</span>
                                            <span className="text-emerald-600 font-semibold">{metrics.today_attendances} Check-in</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('attendance', 'excel')}
                                            disabled={isTriggering === 'attendance-excel'}
                                            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                            className="w-full text-xs"
                                        >
                                            Excel (.csv)
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('attendance', 'pdf')}
                                            disabled={isTriggering === 'attendance-pdf'}
                                            leftIcon={<FileText className="w-4 h-4 text-red-400" />}
                                            className="w-full text-xs"
                                        >
                                            PDF Resmi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 5. Laporan Kenshi & Pelatih */}
                        {(activeTab === 'all' || activeTab === 'kenshi') && (
                            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-red-600/10 text-red-600">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">Laporan Atlet & Pelatih</h4>
                                            <p className="text-xs text-slate-500">Database Pangkalan Nasional</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Memuat NIK anggota, klasifikasi atlet/pelatih, tingkatan Kyu & Dan, dojo asal,
                                        status akun login mandiri, serta tanggal registrasi dengan keamanan enkripsi data.
                                    </p>
                                    <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Atlet Terdaftar:</span>
                                            <strong className="text-slate-800">{metrics.total_athletes} Kenshi</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Pelatih / Sensei:</span>
                                            <strong className="text-slate-800">{metrics.total_coaches} Pelatih</strong>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('kenshi', 'excel')}
                                            disabled={isTriggering === 'kenshi-excel'}
                                            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                            className="w-full text-xs"
                                        >
                                            Excel (.csv)
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('kenshi', 'pdf')}
                                            disabled={isTriggering === 'kenshi-pdf'}
                                            leftIcon={<FileText className="w-4 h-4 text-red-400" />}
                                            className="w-full text-xs"
                                        >
                                            PDF Resmi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 6. Laporan Cabang Dojo */}
                        {(activeTab === 'all' || activeTab === 'dojo') && (
                            <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900">Laporan Cabang Dojo</h4>
                                            <p className="text-xs text-slate-500">Rekapitulasi Nasional & Pemetaan</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Mencakup kode registrasi resmi, Pengprov/Pengkab, Sensei penanggung jawab,
                                        koordinat GPS Latitude-Longitude, kontak verifikasi, dan kuota anggota kenshi.
                                    </p>
                                    <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Data:</span>
                                            <strong className="text-slate-800">{metrics.total_dojos} Dojo</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Geotagging:</span>
                                            <span className="text-emerald-600 font-semibold">Tersinkronisasi</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('dojo', 'excel')}
                                            disabled={isTriggering === 'dojo-excel'}
                                            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                            className="w-full text-xs"
                                        >
                                            Excel (.csv)
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('dojo', 'pdf')}
                                            disabled={isTriggering === 'dojo-pdf'}
                                            leftIcon={<FileText className="w-4 h-4 text-red-400" />}
                                            className="w-full text-xs"
                                        >
                                            PDF Resmi
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* VIEW 2: Interactive Live Preview Tables */}
                {viewMode === 'preview' && (
                    <div className="space-y-6">
                        {/* Table 1: Rapor 5 Aspek Pelatih */}
                        {(activeTab === 'all' || activeTab === 'evaluation') && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-purple-600" />
                                            Pratinjau Data: Rapor & Penilaian 5 Aspek Pelatih
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">Data evaluasi waza Shorinji Kempo terbaru.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('evaluation', 'excel')}
                                            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                                        >
                                            Excel
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('evaluation', 'pdf')}
                                            leftIcon={<FileText className="w-3.5 h-3.5 text-red-400" />}
                                        >
                                            PDF
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <Table className="whitespace-nowrap">
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80">
                                                    <TableHead>Tanggal</TableHead>
                                                    <TableHead>Nama Atlet Kenshi</TableHead>
                                                    <TableHead>Dojo Asal</TableHead>
                                                    <TableHead>Sensei Penilai</TableHead>
                                                    <TableHead className="text-center">Skor Rata-Rata</TableHead>
                                                    <TableHead>Predikat</TableHead>
                                                    <TableHead>Rekomendasi UKT</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentData.evaluations && recentData.evaluations.length > 0 ? (
                                                    recentData.evaluations.map((ev) => (
                                                        <TableRow key={ev.id} className="hover:bg-slate-50/70">
                                                            <TableCell className="text-xs text-slate-600">
                                                                {formatDate(ev.evaluation_date)}
                                                            </TableCell>
                                                            <TableCell className="font-bold text-slate-900 text-xs">
                                                                {ev.kenshi?.full_name || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600">
                                                                {ev.kenshi?.dojo?.name || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600">
                                                                {ev.coach?.name || 'Sensei'}
                                                            </TableCell>
                                                            <TableCell className="text-center font-black text-slate-900 text-xs">
                                                                {ev.overall_score}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        ev.overall_score >= 80
                                                                            ? 'success'
                                                                            : ev.overall_score >= 70
                                                                            ? 'primary'
                                                                            : 'warning'
                                                                    }
                                                                    size="sm"
                                                                >
                                                                    {ev.grade}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-700">
                                                                {ev.recommendation || '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                                                            Belum ada data penilaian pelatih yang terekam.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Table 2: Logbook Latihan Mandiri */}
                        {(activeTab === 'all' || activeTab === 'independent') && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Dumbbell className="w-4 h-4 text-amber-600" />
                                            Pratinjau Data: Logbook Latihan Mandiri Atlet
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">Aktivitas drill mandiri Tandoku Embu dan penguatan fisik di rumah.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('independent', 'excel')}
                                            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                                        >
                                            Excel
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('independent', 'pdf')}
                                            leftIcon={<FileText className="w-3.5 h-3.5 text-red-400" />}
                                        >
                                            PDF
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <Table className="whitespace-nowrap">
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80">
                                                    <TableHead>Tanggal</TableHead>
                                                    <TableHead>Nama Atlet</TableHead>
                                                    <TableHead>Tipe Drill</TableHead>
                                                    <TableHead>Judul Latihan</TableHead>
                                                    <TableHead className="text-center">Durasi</TableHead>
                                                    <TableHead className="text-center">Intensitas</TableHead>
                                                    <TableHead className="text-center">Estimasi Kalori</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentData.independentTrainings && recentData.independentTrainings.length > 0 ? (
                                                    recentData.independentTrainings.map((tr) => (
                                                        <TableRow key={tr.id} className="hover:bg-slate-50/70">
                                                            <TableCell className="text-xs text-slate-600">
                                                                {formatDate(tr.training_date)}
                                                            </TableCell>
                                                            <TableCell className="font-bold text-slate-900 text-xs">
                                                                {tr.kenshi?.full_name || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                                                                    {tr.drill_type}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-800">{tr.title}</TableCell>
                                                            <TableCell className="text-center text-xs font-semibold">
                                                                {tr.duration_minutes} Menit
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={
                                                                        tr.intensity === 'hard'
                                                                            ? 'danger'
                                                                            : tr.intensity === 'medium'
                                                                            ? 'warning'
                                                                            : 'success'
                                                                    }
                                                                    size="sm"
                                                                >
                                                                    {tr.intensity === 'hard' ? 'Intensif' : tr.intensity === 'medium' ? 'Sedang' : 'Ringan'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center text-xs text-amber-600 font-medium">
                                                                {tr.estimated_calories ? `~${tr.estimated_calories} Kkal` : '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                                                            Belum ada log latihan mandiri.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Table 3: Rekapitulasi Kenaikan Tingkat (UKT) */}
                        {(activeTab === 'all' || activeTab === 'promotion') && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-emerald-600" />
                                            Pratinjau Data: Kualifikasi Kenaikan Tingkat (UKT)
                                        </CardTitle>
                                        <p className="text-xs text-slate-500">Kelayakan atlet berdasarkan jam tatami dan waza.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('promotion', 'excel')}
                                            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                                        >
                                            Excel
                                        </Button>
                                        <Button
                                            variant="navy"
                                            size="sm"
                                            onClick={() => handleExport('promotion', 'pdf')}
                                            leftIcon={<FileText className="w-3.5 h-3.5 text-red-400" />}
                                        >
                                            PDF
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <Table className="whitespace-nowrap">
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80">
                                                    <TableHead>NIK & Nama Kenshi</TableHead>
                                                    <TableHead>Dojo Asal</TableHead>
                                                    <TableHead>Tingkatan Saat Ini</TableHead>
                                                    <TableHead>Target Berikutnya</TableHead>
                                                    <TableHead className="text-center">Presensi Tatami</TableHead>
                                                    <TableHead className="text-center">Nilai Waza</TableHead>
                                                    <TableHead>Status Kualifikasi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentData.promotions && recentData.promotions.length > 0 ? (
                                                    recentData.promotions.map((p) => (
                                                        <TableRow key={p.id} className="hover:bg-slate-50/70">
                                                            <TableCell>
                                                                <div>
                                                                    <span className="font-bold text-slate-900 text-xs block">{p.full_name}</span>
                                                                    <span className="text-[10px] text-slate-400 font-mono">{p.id_card_number}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600">{p.dojo_name}</TableCell>
                                                            <TableCell className="text-xs">{p.rank_label}</TableCell>
                                                            <TableCell className="text-xs font-bold text-red-600">{p.next_rank_label}</TableCell>
                                                            <TableCell className="text-center font-bold text-xs">
                                                                {p.attendances_count} Sesi
                                                            </TableCell>
                                                            <TableCell className="text-center text-xs font-black">
                                                                {p.latest_score}
                                                            </TableCell>
                                                            <TableCell>
                                                                {p.is_ready ? (
                                                                    <Badge variant="success" size="sm" className="font-bold">
                                                                        Siap UKT
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="neutral" size="sm">
                                                                        Masa Pemantauan
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                                                            Belum ada data kualifikasi UKT.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Queue Task Monitoring Drawer / Progress List */}
                {queuedTasks.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                    Antrean Ekspor Berkas Aktif (Worker Queue)
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Daftar dokumen yang sedang diproses di background server.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {queuedTasks.map((task) => (
                                    <div
                                        key={task.exportId}
                                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                                                {task.format === 'excel' ? (
                                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <FileText className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {getTypeLabel(task.type)} ({task.format.toUpperCase()})
                                                </p>
                                                <span className="text-[11px] text-slate-400">
                                                    Mulai diproses: {task.startedAt}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {task.status === 'pending' || task.status === 'processing' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                                                    Memproses di Latar Belakang...
                                                </span>
                                            ) : task.status === 'completed' ? (
                                                <a
                                                    href={`/reports/download/${task.exportId}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Unduh Berkas
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                                    Gagal
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
