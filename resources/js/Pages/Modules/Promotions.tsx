import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/DataDisplay/Table';
import {
    Award,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpCircle,
    BookOpen,
    Shield,
    Users,
    UserCheck,
    ChevronRight,
} from 'lucide-react';

interface PromotionCandidate {
    id: string;
    id_card_number: string;
    full_name: string;
    dojo: string;
    rank: string;
    rank_label: string;
    next_rank: string | null;
    next_rank_label: string;
    attendances_count: number;
    latest_score: number | null;
    latest_grade: string | null;
    recommendation: string | null;
    is_ready: boolean;
}

interface Props {
    candidates: PromotionCandidate[];
    canPromote: boolean;
    isKenshiOnly?: boolean;
    readyCount: number;
    totalCandidates: number;
}

export default function Promotions({
    candidates,
    canPromote,
    isKenshiOnly = false,
    readyCount,
    totalCandidates,
}: Props) {
    const [isPromotingId, setIsPromotingId] = useState<string | null>(null);

    const promotionTiers = [
        { from: 'Minarai (Putih)', to: 'Kyu VIII - VII (Kuning)', reqMonths: '4 Bulan', minAttendance: '16 Sesi', status: 'Terbuka' },
        { from: 'Kyu VI - V (Hijau)', to: 'Kyu IV (Biru)', reqMonths: '6 Bulan', minAttendance: '32 Sesi', status: 'Terbuka' },
        { from: 'Kyu III - I (Cokelat)', to: 'Shodan (I Dan Hitam)', reqMonths: '12 Bulan', minAttendance: '48 Sesi', status: 'Verifikasi Pengprov' },
        { from: 'I Dan (Hitam)', to: 'II Dan (Hitam)', reqMonths: '24 Bulan', minAttendance: '96 Sesi', status: 'Verifikasi Nasional PB Perkemi' },
    ];

    const handlePromote = (candidate: PromotionCandidate) => {
        if (!candidate.next_rank) return;
        if (
            confirm(
                `Apakah Anda yakin ingin mempromosikan Kenshi [${candidate.full_name}] dari ${candidate.rank_label} ke tingkatan ${candidate.next_rank_label}?`
            )
        ) {
            setIsPromotingId(candidate.id);
            router.post(
                `/promotions/${candidate.id}/promote`,
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setIsPromotingId(null),
                }
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Promosi & Degradasi - UKT & Kenaikan Tingkat Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Promosi & Degradasi (Roadmap UKT)"
                    description="Sistem kelayakan Ujian Kenaikan Tingkat (UKT) otomatis berdasarkan riwayat presensi tatami, evaluasi 5 aspek waza, dan masa waktu aktif."
                    actions={
                        <Link href="/reports">
                            <Button variant="outline" size="sm" leftIcon={<Award className="w-4 h-4 text-red-600" />}>
                                Ekspor Rekapitulasi UKT
                            </Button>
                        </Link>
                    }
                />

                {/* Role & Authority Notice Card */}
                <div className="rounded-2xl bg-gradient-to-r from-[#0B132B] via-slate-900 to-[#1C2541] p-5 text-white shadow-md relative overflow-hidden border border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                    Otoritas Kenaikan Tingkat (UKT)
                                </span>
                                <span className="text-xs text-slate-300">
                                    {canPromote ? 'Akses Pengurus / Sensei Aktif' : 'Mode Pratinjau Kenshi (Read-Only)'}
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-white">
                                {canPromote
                                    ? 'Anda memiliki hak otorisasi untuk mengesahkan promosi tingkatan kenshi.'
                                    : 'Kenshi hanya dapat memantau progres kehadiran tatami dan rekomendasi evaluasi pelatih.'}
                            </h3>
                            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                Sesuai AD/ART PB Perkemi, promosi kenshi disahkan oleh <strong>Pengurus (SuperAdmin / Pengprov / Pengkab)</strong> atau <strong>Sensei / Pelatih Dojo</strong> berdasarkan akumulasi minimal presensi tatami dan kelulusan evaluasi materi waza.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
                            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-slate-200">Standar Nasional PB Perkemi</span>
                        </div>
                    </div>
                </div>

                {/* Metric Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Kandidat Siap UKT</span>
                        <p className="text-2xl font-black text-emerald-600 mt-2">{readyCount} Kenshi</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Memenuhi Syarat Presensi & Waza</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Total Atlet Terpantau</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalCandidates} Atlet</p>
                        <span className="text-[11px] text-slate-500 font-medium">Dalam Pangkalan Dojo</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Standar Presensi Tatami</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">≥ 16 Sesi</p>
                        <span className="text-[11px] text-slate-500 font-medium">Kehadiran Minimal per Semester</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Ambang Skor Pelatih</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">≥ 70.0</p>
                        <span className="text-[11px] text-slate-500 font-medium">Predikat Baik (Goho & Juho)</span>
                    </div>
                </div>

                {/* Candidate Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">
                                {isKenshiOnly ? 'Status Kualifikasi Kenaikan Tingkat Saya' : 'Daftar Kenshi & Kandidat Kenaikan Tingkat'}
                            </h4>
                            <p className="text-xs text-slate-500">
                                Akumulasi kehadiran sesi tatami dan rapor evaluasi pelatih Shorinji Kempo.
                            </p>
                        </div>
                        <Link href="/reports">
                            <Button variant="ghost" size="sm" className="text-xs text-red-600">
                                Buka di Pusat Laporan →
                            </Button>
                        </Link>
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
                                        <TableHead className="text-center">Nilai Waza Pelatih</TableHead>
                                        <TableHead>Status Kualifikasi</TableHead>
                                        {canPromote && <TableHead className="text-right">Aksi Promosi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.length > 0 ? (
                                        candidates.map((candidate) => (
                                            <TableRow key={candidate.id} className="hover:bg-slate-50/70 transition-colors">
                                                <TableCell>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">{candidate.full_name}</span>
                                                        <span className="text-[11px] text-slate-400 font-mono">{candidate.id_card_number}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600">{candidate.dojo}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                                                        {candidate.rank_label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                                                        <ArrowUpCircle className="w-3.5 h-3.5" />
                                                        {candidate.next_rank_label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-bold text-slate-800 text-xs">
                                                        {candidate.attendances_count} Sesi
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {candidate.latest_score !== null ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="text-xs font-black text-slate-900">{candidate.latest_score}</span>
                                                            <span className="text-[10px] text-slate-500">{candidate.latest_grade}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Belum dinilai</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {candidate.is_ready ? (
                                                        <Badge variant="success" size="sm" className="font-bold">
                                                            Siap UKT
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="neutral" size="sm">
                                                            Masa Pemantauan
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                {canPromote && (
                                                    <TableCell className="text-right">
                                                        {candidate.next_rank ? (
                                                            <Button
                                                                type="button"
                                                                variant="primary"
                                                                size="sm"
                                                                className="text-xs bg-red-600 hover:bg-red-700 text-white"
                                                                disabled={isPromotingId === candidate.id}
                                                                isLoading={isPromotingId === candidate.id}
                                                                onClick={() => handlePromote(candidate)}
                                                            >
                                                                Naikkan Tingkat
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">Maksimal</span>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={canPromote ? 8 : 7} className="text-center py-8 text-slate-400">
                                                Tidak ada data kandidat kenaikan tingkat saat ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Roadmap Pedoman Standar Waktu */}
                <Card>
                    <CardHeader>
                        <h4 className="text-sm font-bold text-slate-900">Roadmap Standar Waktu & Syarat UKT</h4>
                        <p className="text-xs text-slate-500">Buku pedoman tingkatan resmi Persaudaraan Beladiri Shorinji Kempo Indonesia.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {promotionTiers.map((tier, idx) => (
                                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">
                                                {tier.from} <span className="text-red-600">→</span> {tier.to}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Masa Latihan: {tier.reqMonths} • Kehadiran Minimal: {tier.minAttendance}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
                                        {tier.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
