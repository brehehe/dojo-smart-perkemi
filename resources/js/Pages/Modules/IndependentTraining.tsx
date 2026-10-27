import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Modal } from '@/Components/UI/Overlays/Modal';
import { SelectSearch } from '@/Components/UI/Forms/SelectSearch';
import { formatDate } from '@/lib/utils';
import {
    Activity,
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Dumbbell,
    Flame,
    HeartPulse,
    Plus,
    Trash2,
    X,
    Zap,
} from 'lucide-react';

interface TrainingEntry {
    id: string;
    kenshi_id: string;
    training_date: string;
    drill_type: string;
    title: string;
    duration_minutes: number;
    intensity: 'light' | 'medium' | 'hard';
    reps_or_cycles?: string;
    estimated_calories?: number;
    notes?: string;
    status: string;
    coach_notes?: string;
    kenshi?: {
        full_name: string;
        id_card_number: string;
        rank?: { label: string };
    };
}

interface Props {
    activeKenshis: number;
    isKenshiOnly?: boolean;
    currentKenshi?: { id: string; full_name: string } | null;
    trainings?: TrainingEntry[];
    stats?: {
        total_sessions: number;
        total_minutes: number;
        this_week_sessions: number;
        avg_duration: number;
    };
}

export default function IndependentTraining({
    activeKenshis,
    isKenshiOnly = false,
    currentKenshi,
    trainings = [],
    stats = {
        total_sessions: 0,
        total_minutes: 0,
        this_week_sessions: 0,
        avg_duration: 35,
    },
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const todayStr = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        training_date: todayStr,
        drill_type: 'Tandoku Embu',
        title: '',
        duration_minutes: 45,
        intensity: 'medium' as 'light' | 'medium' | 'hard',
        reps_or_cycles: '',
        estimated_calories: 250,
        notes: '',
    });

    const recommendedDrills = [
        {
            type: 'Tandoku Embu',
            title: 'Tandoku Embu Mandiri (Bentuk 1-6)',
            duration: 45,
            intensity: 'medium' as const,
            reps: '5 Set Siklus Penuh',
            calories: 320,
            category: 'Koreografi & Kihon',
        },
        {
            type: 'Kihon & Goho',
            title: 'Shadow Punch & Tenshin Step Drill',
            duration: 30,
            intensity: 'hard' as const,
            reps: '300 Tsuki / 150 Keri',
            calories: 280,
            category: 'Goho Drills',
        },
        {
            type: 'Kebugaran Otot',
            title: 'Core Strengthening & Flexibility Kempo',
            duration: 40,
            intensity: 'medium' as const,
            reps: 'Plank & Hip Opener 4 Set',
            calories: 210,
            category: 'Conditioning Fisik',
        },
        {
            type: 'Chinkon Gyo',
            title: 'Chinkon Gyo (Meditasi Zen & Pernapasan Tanden)',
            duration: 20,
            intensity: 'light' as const,
            reps: 'Zazen & Meditasi Dokuritsu',
            calories: 60,
            category: 'Mental & Spiritual',
        },
    ];

    const prefillAndOpen = (drill: typeof recommendedDrills[0]) => {
        setFormData({
            training_date: todayStr,
            drill_type: drill.type,
            title: drill.title,
            duration_minutes: drill.duration,
            intensity: drill.intensity,
            reps_or_cycles: drill.reps,
            estimated_calories: drill.calories,
            notes: `Latihan mandiri mengikuti panduan drill rekomendasi: ${drill.title}`,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/performance/independent', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                setFormData({
                    training_date: todayStr,
                    drill_type: 'Tandoku Embu',
                    title: '',
                    duration_minutes: 45,
                    intensity: 'medium',
                    reps_or_cycles: '',
                    estimated_calories: 250,
                    notes: '',
                });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: string, title: string) => {
        if (confirm(`Hapus catatan sesi latihan "${title}" dari logbook Anda?`)) {
            router.delete(`/performance/independent/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Latihan Mandiri & Digital Logbook - Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Latihan Mandiri & Digital Logbook"
                    description="Pencatatan sesi latihan mandiri di luar tatami dojo (Tandoku Embu, Kihon Tsuki/Keri, Chinkon Gyo, dan Conditioning Fisik) untuk pemantauan konsistensi atlet."
                    actions={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setFormData({
                                    training_date: todayStr,
                                    drill_type: 'Tandoku Embu',
                                    title: '',
                                    duration_minutes: 45,
                                    intensity: 'medium',
                                    reps_or_cycles: '',
                                    estimated_calories: 250,
                                    notes: '',
                                });
                                setModalOpen(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Catat Latihan Mandiri
                        </Button>
                    }
                />

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            {isKenshiOnly ? 'Total Sesi Latihan' : 'Total Log Tercatat'}
                        </span>
                        <p className="text-2xl font-black text-slate-900 mt-2">{stats.total_sessions}</p>
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{stats.this_week_sessions} sesi minggu ini</span>
                        </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Total Waktu Latihan
                        </span>
                        <p className="text-2xl font-black text-slate-900 mt-2">
                            {Math.floor(stats.total_minutes / 60)}j {stats.total_minutes % 60}m
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium block mt-1">
                            {stats.total_minutes} menit akumulasi
                        </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Rata-rata Durasi
                        </span>
                        <p className="text-2xl font-black text-slate-900 mt-2">{stats.avg_duration} Mnt</p>
                        <span className="text-[11px] text-amber-600 font-medium block mt-1">Per sesi latihan</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Status Logbook
                        </span>
                        <p className="text-2xl font-black text-emerald-600 mt-2">Aktif</p>
                        <span className="text-[11px] text-slate-500 font-medium block mt-1">
                            Terhubung ke Sensei
                        </span>
                    </div>
                </div>

                {/* Logged Sessions History */}
                <Card className="border-slate-200 shadow-xs overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">
                                {isKenshiOnly ? 'Riwayat Latihan Mandiri Saya' : 'Daftar Logbook Latihan Mandiri Atlet'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Catatan sesi latihan pribadi yang terekam di sistem e-Dojo.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setModalOpen(true)}
                            leftIcon={<Plus className="w-3.5 h-3.5 text-red-600" />}
                        >
                            Tambah Catatan
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {trainings.length === 0 ? (
                            <div className="text-center py-12 px-4 space-y-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <Dumbbell className="w-6 h-6" />
                                </div>
                                <div className="max-w-sm mx-auto space-y-1">
                                    <h5 className="text-sm font-bold text-slate-900">Belum Ada Sesi Mandiri</h5>
                                    <p className="text-xs text-slate-500">
                                        Mulai catat latihan mandiri Anda hari ini untuk meningkatkan stamina, teknik Tandoku Embu, dan kedisiplinan Shorinji Kempo.
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setModalOpen(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                                >
                                    Catat Sesi Pertama Sekarang
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4 whitespace-nowrap">Tanggal & Jenis</th>
                                            {!isKenshiOnly && <th className="py-3 px-4 whitespace-nowrap">Kenshi</th>}
                                            <th className="py-3 px-4 whitespace-nowrap min-w-[180px]">Fokus / Judul Latihan</th>
                                            <th className="py-3 px-4 whitespace-nowrap">Durasi & Beban</th>
                                            <th className="py-3 px-4 whitespace-nowrap">Intensitas</th>
                                            <th className="py-3 px-4 whitespace-nowrap min-w-[200px]">Catatan Pribadi</th>
                                            <th className="py-3 px-4 text-right whitespace-nowrap w-16">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {trainings.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="space-y-0.5 whitespace-nowrap">
                                                        <span className="font-bold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                                                            <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                            <span>{formatDate(t.training_date)}</span>
                                                        </span>
                                                        <span className="inline-block text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                                            {t.drill_type}
                                                        </span>
                                                    </div>
                                                </td>

                                                {!isKenshiOnly && (
                                                    <td className="py-3 px-4 whitespace-nowrap">
                                                        <span className="font-semibold text-slate-900 block whitespace-nowrap">
                                                            {t.kenshi?.full_name || '-'}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                                                            {t.kenshi?.id_card_number}
                                                        </span>
                                                    </td>
                                                )}

                                                <td className="py-3 px-4 min-w-[180px] max-w-sm whitespace-normal break-words">
                                                    <span className="font-bold text-slate-900 block">{t.title}</span>
                                                    {t.reps_or_cycles && (
                                                        <span className="text-[11px] text-slate-500">
                                                            {t.reps_or_cycles}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold whitespace-nowrap">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{t.duration_minutes} Menit</span>
                                                    </div>
                                                    {t.estimated_calories && (
                                                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium whitespace-nowrap">
                                                            <Flame className="w-3 h-3 shrink-0" />
                                                            <span>~{t.estimated_calories} Kkal</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span
                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                                                            t.intensity === 'hard'
                                                                ? 'bg-rose-100 text-rose-800'
                                                                : t.intensity === 'medium'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-emerald-100 text-emerald-800'
                                                        }`}
                                                    >
                                                        {t.intensity === 'hard'
                                                            ? 'Tinggi'
                                                            : t.intensity === 'medium'
                                                            ? 'Sedang'
                                                            : 'Ringan'}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-4 min-w-[200px] max-w-sm text-slate-600 whitespace-normal break-words leading-relaxed">
                                                    {t.notes || '-'}
                                                </td>

                                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(t.id, t.title)}
                                                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Hapus Catatan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recommendations Program Drills */}
                <Card className="border-slate-200 shadow-xs">
                    <CardHeader>
                        <h4 className="text-sm font-bold text-slate-900">Program Drill Mandiri Terstruktur</h4>
                        <p className="text-xs text-slate-500">
                            Menu latihan rekomendasi Sensei Kepala untuk pemantapan teknik di rumah. Klik tombol untuk memulai dan mencatat.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendedDrills.map((drill, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-red-200 hover:bg-slate-50/80 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700">
                                                {drill.category}
                                            </span>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{drill.duration} Menit</span>
                                            </div>
                                        </div>
                                        <h5 className="text-sm font-bold text-slate-900 mb-1">{drill.title}</h5>
                                        <p className="text-xs text-slate-600 mb-4">
                                            {drill.reps} • Estimasi {drill.calories} Kkal
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => prefillAndOpen(drill)}
                                        className="w-full text-xs hover:border-red-500 hover:text-red-600"
                                        leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
                                    >
                                        Mulai & Catat Sesi Ini
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MODAL CATAT LATIHAN MANDIRI */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Catat Sesi Latihan Mandiri"
                description="Input rekaman latihan mandiri ke logbook digital"
                icon={<Dumbbell className="w-5 h-5 text-red-600" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="independent-training-form"
                            variant="primary"
                            size="sm"
                            disabled={submitting || !formData.title.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan ke Logbook'}
                        </Button>
                    </>
                }
            >
                <form id="independent-training-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Tanggal Latihan <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.training_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, training_date: e.target.value })
                                }
                                required
                                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900 bg-white"
                            />
                        </div>

                        <div>
                            <SelectSearch
                                label="Kategori Drill"
                                required
                                value={formData.drill_type}
                                onChange={(val) => setFormData({ ...formData, drill_type: val })}
                                options={[
                                    { value: 'Tandoku Embu', label: 'Tandoku Embu (Koreografi Solo)' },
                                    { value: 'Kihon & Goho', label: 'Kihon & Goho (Tsuki, Keri, Uke)' },
                                    { value: 'Juho Drill', label: 'Juho Solo & Hand Flexibility' },
                                    { value: 'Kebugaran Otot', label: 'Kebugaran Otot & Stamina (Cardio)' },
                                    { value: 'Chinkon Gyo', label: 'Chinkon Gyo (Zazen & Pernapasan)' },
                                    { value: 'Kelenturan & Stretches', label: 'Kelenturan & Mobilitas Sendi' },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Fokus / Judul Sesi Latihan <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Contoh: Pemantapan Embu Bentuk 1-4 & 200 Gyaku Tsuki"
                            className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Durasi (Menit) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                min={5}
                                max={360}
                                value={formData.duration_minutes}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        duration_minutes: parseInt(e.target.value) || 0,
                                    })
                                }
                                required
                                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                            />
                        </div>

                        <div>
                            <SelectSearch
                                label="Intensitas Latihan"
                                value={formData.intensity}
                                onChange={(val) =>
                                    setFormData({
                                        ...formData,
                                        intensity: val as 'light' | 'medium' | 'hard',
                                    })
                                }
                                options={[
                                    { value: 'light', label: 'Ringan (Recovery/Teknik Lembut)' },
                                    { value: 'medium', label: 'Sedang (Standar Latihan)' },
                                    { value: 'hard', label: 'Tinggi (High Intensity / Fisik Keras)' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Estimasi Kalori (Kkal)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={formData.estimated_calories}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        estimated_calories: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Target Repetisi / Siklus Set
                        </label>
                        <input
                            type="text"
                            value={formData.reps_or_cycles}
                            onChange={(e) =>
                                setFormData({ ...formData, reps_or_cycles: e.target.value })
                            }
                            placeholder="Contoh: 5 Set Siklus Penuh / 300 Pukulan"
                            className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Catatan / Evaluasi Pribadi
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Tuliskan kendala teknik, sensasi fisik, atau pencapaian pada sesi latihan ini..."
                            className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                        />
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
