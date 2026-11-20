import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
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
    Calendar, 
    CheckCircle2, 
    ChevronLeft, 
    Clock, 
    Edit3, 
    GraduationCap, 
    MapPin, 
    ShieldCheck, 
    UserCheck, 
    Users, 
    X,
    XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreItem {
    id: string;
    dokuhon_score: number;
    goho_score: number;
    juho_score: number;
    embu_score: number;
    randori_score: number;
    total_weighted_score: number;
    examiner?: { name: string };
}

interface RegistrationItem {
    id: string;
    kenshi: { id: string; full_name: string; id_card_number: string; dojo?: { name: string } };
    current_rank: string;
    target_rank: string;
    chest_number: string | null;
    is_eligible: boolean;
    status: string;
    final_score: number | null;
    result_grade: string | null;
    scores?: ScoreItem[];
}

interface ExaminationDetail {
    id: string;
    title: string;
    level_scope: string;
    location_name: string;
    date: string;
    start_time: string;
    quota: number;
    status: string;
    registrations: RegistrationItem[];
}

interface PageProps {
    examination: ExaminationDetail;
    isExaminer: boolean;
}

export default function ExaminationShow({ examination, isExaminer }: PageProps) {
    const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        registration_id: '',
        dokuhon_score: 80,
        goho_score: 80,
        juho_score: 80,
        embu_score: 80,
        randori_score: 80,
        notes: '',
    });

    const handleOpenScore = (reg: RegistrationItem) => {
        setSelectedReg(reg);
        setData({
            registration_id: reg.id,
            dokuhon_score: 80,
            goho_score: 80,
            juho_score: 80,
            embu_score: 80,
            randori_score: 80,
            notes: '',
        });
    };

    const handleScoreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/examinations/scores', {
            onSuccess: () => {
                setSelectedReg(null);
                reset();
            },
        });
    };

    const handlePromote = (regId: string) => {
        if (!confirm('Apakah Anda yakin mengesahkan kelulusan dan menaikkan sabuk kenshi ini?')) {
            return;
        }
        router.post(`/examinations/registrations/${regId}/finalize`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`${examination.title} - Lembar Ujian UKT`} />

            <div className="space-y-6">
                <div>
                    <Link
                        href="/examinations"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#718092] hover:text-[#17202D] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar UKT
                    </Link>
                </div>

                {/* Banner */}
                <div className="bg-[#102B40] text-white p-6 lg:p-7 rounded-xl border border-[#1A3B52] shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#C51C2A] text-white">
                            {examination.level_scope.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                            Status: <span className="text-[#16865C] font-bold uppercase">{examination.status}</span>
                        </span>
                    </div>

                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                        {examination.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-3 border-t border-[#1A3B52]">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>{examination.date} ({examination.start_time} WIB)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>{examination.location_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>{examination.registrations.length} / {examination.quota} Peserta Terdaftar</span>
                        </div>
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] overflow-hidden shadow-2xs">
                    <div className="px-5 py-4 border-b border-[#E8EBEF] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#718092]" />
                            Daftar Peserta & Lembar Penilaian Dewan Penguji
                        </h3>
                        <span className="text-xs text-[#718092]">
                            {examination.registrations.length} peserta
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No. Dada</TableHead>
                                    <TableHead>Nama Kenshi</TableHead>
                                    <TableHead>Dojo Cabang</TableHead>
                                    <TableHead>Tingkat Sekarang</TableHead>
                                    <TableHead>Tingkat Dituju</TableHead>
                                    <TableHead>Nilai Akhir</TableHead>
                                    <TableHead>Status Hasil</TableHead>
                                    <TableHead className="text-right">Aksi Penguji</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examination.registrations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-[#718092]">
                                            Belum ada kenshi yang terdaftar pada sesi UKT ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    examination.registrations.map((reg) => (
                                        <TableRow key={reg.id}>
                                            <TableCell className="font-mono font-bold text-[#17202D]">
                                                {reg.chest_number || '-'}
                                            </TableCell>
                                            <TableCell className="font-bold text-[#17202D]">
                                                {reg.kenshi?.full_name}
                                                <div className="text-[10px] font-normal text-[#718092]">
                                                    NIK: {reg.kenshi?.id_card_number}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-[#718092]">{reg.kenshi?.dojo?.name || '-'}</TableCell>
                                            <TableCell className="capitalize text-xs text-[#718092]">{reg.current_rank.replace(/_/g, ' ')}</TableCell>
                                            <TableCell className="capitalize font-semibold text-xs text-[#17202D]">{reg.target_rank.replace(/_/g, ' ')}</TableCell>
                                            <TableCell className="font-mono font-bold text-[#17202D]">
                                                {reg.final_score !== null ? reg.final_score : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {reg.status === 'passed' ? (
                                                    <Badge variant="emerald" withDot>
                                                        Lulus
                                                    </Badge>
                                                ) : reg.status === 'remedial' ? (
                                                    <Badge variant="amber" withDot>
                                                        Remedial
                                                    </Badge>
                                                ) : reg.status === 'failed' ? (
                                                    <Badge variant="rose" withDot>
                                                        Tidak Lulus
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="slate">
                                                        Terdaftar
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {isExaminer && (
                                                    <Button
                                                        variant="navy"
                                                        size="sm"
                                                        onClick={() => handleOpenScore(reg)}
                                                    >
                                                        Input Nilai
                                                    </Button>
                                                )}
                                                {reg.status === 'passed' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handlePromote(reg.id)}
                                                    >
                                                        Sahkan Sabuk
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal Digital Scoring Dewan Penguji */}
            {selectedReg && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8EBEF] text-xs">
                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#17202D]">
                                    Lembar Penilaian Penguji (Tatami Scoring)
                                </h3>
                                <p className="text-[11px] text-[#718092]">
                                    Peserta: <span className="font-bold text-[#17202D]">{selectedReg.kenshi.full_name}</span> (No. Dada: {selectedReg.chest_number})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReg(null)}
                                className="text-[#718092] hover:text-[#17202D] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleScoreSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[#17202D] mb-1">
                                        Dokuhon & Falsafah (15%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.dokuhon_score}
                                        onChange={(e) => setData('dokuhon_score', parseInt(e.target.value) || 0)}
                                        className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[#17202D] mb-1">
                                        Goho / Teknik Keras (25%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.goho_score}
                                        onChange={(e) => setData('goho_score', parseInt(e.target.value) || 0)}
                                        className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[#17202D] mb-1">
                                        Juho / Teknik Lunak (25%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.juho_score}
                                        onChange={(e) => setData('juho_score', parseInt(e.target.value) || 0)}
                                        className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-[#17202D] mb-1">
                                        Embu / Kerapian Gerak (20%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.embu_score}
                                        onChange={(e) => setData('embu_score', parseInt(e.target.value) || 0)}
                                        className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">
                                    Randori & Ketahanan Fisik (15%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.randori_score}
                                    onChange={(e) => setData('randori_score', parseInt(e.target.value) || 0)}
                                    className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">Catatan Evaluasi Dewan Penguji</label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan teknik atau koreksi kuncian..."
                                    className="w-full p-2.5 rounded-lg border border-[#E8EBEF] text-xs focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-[#E8EBEF] flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReg(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    type="submit"
                                    disabled={processing}
                                    isLoading={processing}
                                >
                                    Simpan Nilai
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
