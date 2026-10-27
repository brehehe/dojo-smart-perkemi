import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import { Modal } from '@/Components/UI/Overlays/Modal';
import { SelectSearch } from '@/Components/UI/Forms/SelectSearch';
import { formatDate } from '@/lib/utils';
import {
    Activity,
    AlertCircle,
    Award,
    Calendar,
    CheckCircle,
    Crosshair,
    Dumbbell,
    HeartPulse,
    Plus,
    Shield,
    Star,
    TrendingUp,
    User,
    UserCheck,
    X,
} from 'lucide-react';

interface EvaluationItem {
    id: string;
    kenshi_id: string;
    coach_id: string;
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
    kenshi?: {
        id: string;
        full_name: string;
        id_card_number: string;
        rank?: { label: string; belt_color?: string; is_dan?: boolean };
        dojo?: { name: string };
    };
    coach?: {
        name: string;
        email?: string;
    };
}

interface AvailableKenshi {
    id: string;
    full_name: string;
    id_card_number: string;
    rank?: { label: string; belt_color?: string; is_dan?: boolean };
    dojo?: { name: string };
}

interface Props {
    isKenshiOnly?: boolean;
    currentKenshi?: { id: string; full_name: string; rank?: { label: string } } | null;
    evaluations?: EvaluationItem[];
    availableKenshis?: AvailableKenshi[];
}

export default function CoachEvaluation({
    isKenshiOnly = false,
    currentKenshi,
    evaluations = [],
    availableKenshis = [],
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<EvaluationItem | null>(null);

    const todayStr = new Date().toISOString().split('T')[0];

    // Form state for grading kenshi
    const [formData, setFormData] = useState({
        kenshi_id: availableKenshis[0]?.id || '',
        evaluation_date: todayStr,
        technique_score: 80,
        embu_score: 80,
        randori_score: 75,
        physical_score: 85,
        discipline_score: 90,
        recommendation: 'Siap Mengikuti Ujian Kenaikan Tingkat (UKT)',
        notes: '',
    });

    const liveOverall = Math.round(
        (Number(formData.technique_score) +
            Number(formData.embu_score) +
            Number(formData.randori_score) +
            Number(formData.physical_score) +
            Number(formData.discipline_score)) /
            5
    );

    const liveGrade =
        liveOverall >= 90
            ? 'A (Istimewa)'
            : liveOverall >= 80
            ? 'B+ (Sangat Baik / Siap UKT)'
            : liveOverall >= 70
            ? 'B (Cukup Baik)'
            : liveOverall >= 60
            ? 'C (Perlu Pembinaan Intensif)'
            : 'D (Belum Memenuhi Syarat)';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/performance/evaluations', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setModalOpen(false);
                setFormData({
                    kenshi_id: availableKenshis[0]?.id || '',
                    evaluation_date: todayStr,
                    technique_score: 80,
                    embu_score: 80,
                    randori_score: 75,
                    physical_score: 85,
                    discipline_score: 90,
                    recommendation: 'Siap Mengikuti Ujian Kenaikan Tingkat (UKT)',
                    notes: '',
                });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const latestEvaluation = evaluations[0] || null;

    return (
        <AppLayout>
            <Head title="Penilaian & Rapor Pelatih - Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title={isKenshiOnly ? 'Penilaian & Rapor Pelatih Saya' : 'Penilaian & Rapor Atlet Kenshi'}
                    description={
                        isKenshiOnly
                            ? 'Pantau rapor performa resmi dari Pelatih & Sensei Dojo berdasarkan 5 pilar Shorinji Kempo (Teknik, Embu, Randori, Fisik, dan Disiplin).'
                            : 'Evaluasi performa berkala atlet kenshi, standarisasi UKT, dan rapor 5 pilar Shorinji Kempo oleh Sensei & Pelatih.'
                    }
                    actions={
                        !isKenshiOnly && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setModalOpen(true)}
                                className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Beri Penilaian Atlet
                            </Button>
                        )
                    }
                />

                {/* KENSHI VIEW: LATEST EVALUATION HERO & 5-PILLAR BREAKDOWN */}
                {isKenshiOnly && latestEvaluation && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Overall Grade Card */}
                        <Card className="border-slate-200 shadow-xs bg-gradient-to-br from-slate-900 via-slate-800 to-[#0B132B] text-white overflow-hidden relative">
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                                        Rapor Evaluasi Terakhir
                                    </span>
                                    <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{formatDate(latestEvaluation.evaluation_date)}</span>
                                    </span>
                                </div>

                                <div className="pt-2 text-center">
                                    <span className="text-5xl font-black text-white tracking-tight">
                                        {latestEvaluation.overall_score}
                                    </span>
                                    <span className="text-xs text-slate-400 block mt-1">/ 100 Skor Komposit</span>
                                </div>

                                <div className="text-center">
                                    <span className="inline-block px-3 py-1 bg-red-600/90 text-white text-xs font-bold rounded-lg shadow-xs">
                                        {latestEvaluation.grade}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-slate-700/60 text-xs space-y-1.5">
                                    <div className="flex justify-between text-slate-300">
                                        <span>Pelatih Penguji:</span>
                                        <span className="font-semibold text-white">
                                            {latestEvaluation.coach?.name || 'Sensei Dojo'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Rekomendasi:</span>
                                        <span className="font-semibold text-amber-300 text-right">
                                            {latestEvaluation.recommendation || 'Latihan Rutin'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 5-Pillar Score Bars */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
                            <CardHeader className="border-b border-slate-100 py-4 px-5">
                                <h4 className="text-sm font-bold text-slate-900">
                                    Rincian 5 Aspek Penilaian Shorinji Kempo
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Skor evaluasi objektif dari sesi latihan tatami dan ujian berkala.
                                </p>
                            </CardHeader>
                            <CardContent className="p-5 space-y-3.5">
                                {[
                                    {
                                        label: 'Penguasaan Teknik (Goho & Juho)',
                                        score: latestEvaluation.technique_score,
                                        icon: Crosshair,
                                        desc: 'Presisi tsuki, keri, uke, kote-nuki, dan gassho rei',
                                        color: 'bg-red-600',
                                    },
                                    {
                                        label: 'Tandoku / Kumi Embu',
                                        score: latestEvaluation.embu_score,
                                        icon: Award,
                                        desc: 'Irama gerak, choushi, kime, dan sinkronisasi pasangan',
                                        color: 'bg-amber-500',
                                    },
                                    {
                                        label: 'Randori & Strategi Tarung',
                                        score: latestEvaluation.randori_score,
                                        icon: Shield,
                                        desc: 'Timing ma-ai, refleks hindaran, dan efektivitas counter',
                                        color: 'bg-blue-600',
                                    },
                                    {
                                        label: 'Kebugaran Fisik & Stamina',
                                        score: latestEvaluation.physical_score,
                                        icon: HeartPulse,
                                        desc: 'Daya tahan otot, kelenturan tatami, dan pemulihan nafas',
                                        color: 'bg-emerald-600',
                                    },
                                    {
                                        label: 'Disiplin, Etika & Chinkon Gyo',
                                        score: latestEvaluation.discipline_score,
                                        icon: Star,
                                        desc: 'Reigi, sopan santun tatami, dan meditasi zazen',
                                        color: 'bg-indigo-600',
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                                <item.icon className="w-3.5 h-3.5 text-slate-500" />
                                                <span>{item.label}</span>
                                            </div>
                                            <span className="font-mono font-bold text-slate-900">
                                                {item.score} / 100
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full transition-all ${item.color}`}
                                                style={{ width: `${item.score}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                                    </div>
                                ))}

                                {latestEvaluation.notes && (
                                    <div className="mt-4 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                                        <span className="font-bold block mb-0.5">Catatan Khusus Sensei:</span>
                                        <p className="italic leading-relaxed">{latestEvaluation.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* EVALUATION HISTORY TABLE (FOR BOTH KENSHI & SENSEI) */}
                <Card className="border-slate-200 shadow-xs overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 bg-white">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">
                                {isKenshiOnly ? 'Riwayat Rapor Evaluasi Pelatih' : 'Daftar Evaluasi Seluruh Atlet'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isKenshiOnly
                                    ? 'Histori penilaian berkala Anda dari waktu ke waktu.'
                                    : 'Rekapitulasi nilai 5 aspek performa kenshi di dojo.'}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {evaluations.length === 0 ? (
                            <div className="text-center py-12 px-4 space-y-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div className="max-w-sm mx-auto space-y-1">
                                    <h5 className="text-sm font-bold text-slate-900">Belum Ada Penilaian Tercatat</h5>
                                    <p className="text-xs text-slate-500">
                                        {isKenshiOnly
                                            ? 'Sensei atau Pelatih Dojo belum memasukkan catatan evaluasi resmi untuk akun Anda.'
                                            : 'Gunakan tombol "Beri Penilaian Atlet" untuk mulai mencatat skor 5 pilar kenshi.'}
                                    </p>
                                </div>
                                {!isKenshiOnly && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setModalOpen(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                                    >
                                        Beri Penilaian Pertama
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4 whitespace-nowrap">Tanggal Evaluasi</th>
                                            {!isKenshiOnly && <th className="py-3 px-4 whitespace-nowrap min-w-[200px]">Kenshi</th>}
                                            <th className="py-3 px-4 whitespace-nowrap">Pelatih Penguji</th>
                                            <th className="py-3 px-4 whitespace-nowrap">Skor 5 Aspek</th>
                                            <th className="py-3 px-4 whitespace-nowrap">Nilai Total</th>
                                            <th className="py-3 px-4 whitespace-nowrap min-w-[200px]">Grade & Rekomendasi</th>
                                            <th className="py-3 px-4 text-right whitespace-nowrap w-24">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {evaluations.map((ev) => (
                                            <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 font-bold text-slate-900 whitespace-nowrap">
                                                        <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                        <span>{formatDate(ev.evaluation_date)}</span>
                                                    </div>
                                                </td>

                                                {!isKenshiOnly && (
                                                    <td className="py-3 px-4 whitespace-nowrap min-w-[200px]">
                                                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                                                            <Avatar name={ev.kenshi?.full_name || 'Kenshi'} size="sm" />
                                                            <div className="whitespace-nowrap">
                                                                <span className="font-bold text-slate-900 block whitespace-nowrap">
                                                                    {ev.kenshi?.full_name}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                                                                    {ev.kenshi?.id_card_number}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}

                                                <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                                                    {ev.coach?.name || 'Sensei Dojo'}
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="text-[11px] text-slate-600 space-y-0.5 whitespace-nowrap">
                                                        <span>Teknik: <strong>{ev.technique_score}</strong></span> •{' '}
                                                        <span>Embu: <strong>{ev.embu_score}</strong></span> •{' '}
                                                        <span>Randori: <strong>{ev.randori_score}</strong></span> •{' '}
                                                        <span>Fisik: <strong>{ev.physical_score}</strong></span> •{' '}
                                                        <span>Disiplin: <strong>{ev.discipline_score}</strong></span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className="text-sm font-black text-slate-900">
                                                        {ev.overall_score}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">/100</span>
                                                </td>

                                                <td className="py-3 px-4 min-w-[200px]">
                                                    <div className="whitespace-nowrap">
                                                        <Badge
                                                            variant={
                                                                ev.overall_score >= 80
                                                                    ? 'success'
                                                                    : ev.overall_score >= 70
                                                                    ? 'warning'
                                                                    : 'secondary'
                                                            }
                                                            size="sm"
                                                        >
                                                            {ev.grade}
                                                        </Badge>
                                                    </div>
                                                    {ev.recommendation && (
                                                        <span className="block text-[11px] text-slate-500 mt-1 whitespace-normal break-words max-w-xs leading-relaxed">
                                                            {ev.recommendation}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4 text-right whitespace-nowrap w-24">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedDetail(ev)}
                                                        className="text-xs text-slate-600 hover:text-red-600 whitespace-nowrap"
                                                    >
                                                        Lihat Rapor
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* MODAL BERI PENILAIAN ATLET (FOR SENSEI / COACH) */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Form Penilaian Performa Kenshi (5 Pilar)"
                description="Evaluasi teknik, embu, randori, fisik, dan etika reigi kenshi"
                icon={<Award className="w-5 h-5 text-red-600" />}
                maxWidth="xl"
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
                            form="coach-evaluation-form"
                            variant="primary"
                            size="sm"
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan Penilaian'}
                        </Button>
                    </>
                }
            >
                <form id="coach-evaluation-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <SelectSearch
                                label="Pilih Kenshi yang Dinilai"
                                required
                                value={formData.kenshi_id}
                                onChange={(val) => setFormData({ ...formData, kenshi_id: val })}
                                options={availableKenshis.map((k) => ({
                                    value: k.id,
                                    label: k.full_name,
                                    sublabel: k.id_card_number,
                                    badge: k.member_type === 'coach' ? 'Pelatih' : 'Kenshi',
                                }))}
                                placeholder="Pilih atau cari kenshi..."
                                searchPlaceholder="Ketik nama atau NIK kenshi..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Tanggal Penilaian <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.evaluation_date}
                                onChange={(e) =>
                                    setFormData({ ...formData, evaluation_date: e.target.value })
                                }
                                required
                                className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* 5-Aspect Score Sliders/Inputs */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                            Skor 5 Aspek (Skala 0 - 100)
                        </h5>

                        {[
                            {
                                key: 'technique_score',
                                label: '1. Teknik (Goho & Juho)',
                                value: formData.technique_score,
                            },
                            {
                                key: 'embu_score',
                                label: '2. Embu (Koreografi Gerak)',
                                value: formData.embu_score,
                            },
                            {
                                key: 'randori_score',
                                label: '3. Randori & Respon Tarung',
                                value: formData.randori_score,
                            },
                            {
                                key: 'physical_score',
                                label: '4. Fisik & Daya Tahan',
                                value: formData.physical_score,
                            },
                            {
                                key: 'discipline_score',
                                label: '5. Disiplin & Etika Reigi',
                                value: formData.discipline_score,
                            },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-4">
                                <span className="text-xs font-medium text-slate-700 w-1/2">
                                    {item.label}
                                </span>
                                <div className="flex items-center gap-3 w-1/2 justify-end">
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={item.value}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [item.key]: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-28 accent-red-600"
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={item.value}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [item.key]: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-14 text-center font-bold font-mono text-xs rounded-lg border border-slate-200 p-1 bg-white text-slate-900"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Live Overall Calculation Card */}
                        <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                                Prediksi Nilai Rata-rata:
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-red-600">{liveOverall}</span>
                                <Badge variant="secondary" size="sm">
                                    {liveGrade}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <SelectSearch
                            label="Rekomendasi Pelatih"
                            value={formData.recommendation}
                            onChange={(val) => setFormData({ ...formData, recommendation: val })}
                            options={[
                                { value: 'Siap Mengikuti Ujian Kenaikan Tingkat (UKT)', label: 'Siap Mengikuti Ujian Kenaikan Tingkat (UKT)' },
                                { value: 'Rekomendasi Seleksi Tim Atlet Kejuaraan / Porprov', label: 'Rekomendasi Seleksi Tim Atlet Kejuaraan / Porprov' },
                                { value: 'Perlu Penguatan Kihon & Latihan Mandiri Embu', label: 'Perlu Penguatan Kihon & Latihan Mandiri Embu' },
                                { value: 'Tingkatkan Kedisiplinan & Presensi Tatami', label: 'Tingkatkan Kedisiplinan & Presensi Tatami' },
                                { value: 'Latihan Rutin Sesuai Kurikulum', label: 'Latihan Rutin Sesuai Kurikulum' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Catatan / Umpan Balik Khusus untuk Atlet
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            placeholder="Contoh: Kuda-kuda (kamae) sudah kokoh, namun saat counter keri perlu lebih rileks dan jaga pernapasan tanden..."
                            className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                        />
                    </div>
                </form>
            </Modal>

            {/* DETAIL MODAL */}
            {selectedDetail && (
                <Modal
                    isOpen={Boolean(selectedDetail)}
                    onClose={() => setSelectedDetail(null)}
                    title="Rapor Lengkap Evaluasi Kempo"
                    description={`${selectedDetail.kenshi?.full_name} • ${formatDate(selectedDetail.evaluation_date)}`}
                    icon={<Award className="w-5 h-5 text-red-600" />}
                    maxWidth="md"
                    footer={
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedDetail(null)}
                        >
                            Tutup
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                    Skor Keseluruhan
                                </span>
                                <span className="text-3xl font-black text-slate-900">
                                    {selectedDetail.overall_score}
                                </span>
                                <span className="text-xs text-slate-400">/100</span>
                            </div>
                            <div className="text-right">
                                <Badge variant="success" className="text-xs">
                                    {selectedDetail.grade}
                                </Badge>
                                <span className="text-[11px] text-slate-500 block mt-1">
                                    Oleh {selectedDetail.coach?.name || 'Sensei'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Teknik (Goho & Juho):</span>
                                <span className="font-bold font-mono">{selectedDetail.technique_score} / 100</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Embu & Koreografi:</span>
                                <span className="font-bold font-mono">{selectedDetail.embu_score} / 100</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Randori & Taktik:</span>
                                <span className="font-bold font-mono">{selectedDetail.randori_score} / 100</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Kondisi Fisik:</span>
                                <span className="font-bold font-mono">{selectedDetail.physical_score} / 100</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-600">Disiplin & Etika:</span>
                                <span className="font-bold font-mono">{selectedDetail.discipline_score} / 100</span>
                            </div>
                        </div>

                        {selectedDetail.recommendation && (
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-900 text-xs">
                                <span className="font-bold block mb-0.5">Rekomendasi:</span>
                                <span>{selectedDetail.recommendation}</span>
                            </div>
                        )}

                        {selectedDetail.notes && (
                            <div className="p-3 rounded-lg bg-slate-50 text-slate-700 text-xs">
                                <span className="font-bold block mb-0.5">Catatan Evaluator:</span>
                                <p className="italic">{selectedDetail.notes}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}
