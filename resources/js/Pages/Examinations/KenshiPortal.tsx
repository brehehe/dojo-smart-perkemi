import React from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { 
    AlertCircle, 
    Award, 
    Calendar, 
    CheckCircle2, 
    FileText, 
    GraduationCap, 
    MapPin, 
    Receipt, 
    ShieldAlert, 
    ShieldCheck, 
    UserCheck, 
    Users, 
    XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EligibilityCriterion {
    passed: boolean;
    label: string;
    detail: string;
}

interface EligibilityData {
    is_eligible: boolean;
    criteria: {
        dues_paid: EligibilityCriterion;
        attendance: EligibilityCriterion;
        material_progress: EligibilityCriterion;
        coach_evaluation: EligibilityCriterion;
        membership_active: EligibilityCriterion;
    };
}

interface ExamItem {
    id: string;
    title: string;
    date: string;
    location_name: string;
    level_scope: string;
}

interface PageProps {
    currentKenshi: any;
    eligibility: EligibilityData | null;
    upcomingExaminations: ExamItem[];
    activeRegistration: any;
}

export default function KenshiUktPortal({
    currentKenshi,
    eligibility,
    upcomingExaminations,
    activeRegistration,
}: PageProps) {
    const handleRegister = (examId: string) => {
        if (!confirm('Apakah Anda yakin mendaftar pada sesi Ujian Kenaikan Tingkat ini?')) {
            return;
        }
        router.post(`/examinations/${examId}/register`, {
            kenshi_id: currentKenshi?.id,
        });
    };

    return (
        <AppLayout>
            <Head title="Gerbang Ujian Kenaikan Tingkat (UKT) - Kenshi" />

            <PageHeading
                title="Pusat Kesiapan Ujian Kenaikan Tingkat (UKT)"
                description="Sesuai ketetapan PB PERKEMI, kenshi wajib memenuhi 5 prasyarat mutlak (bebas tunggakan iuran, presensi latihan, kelulusan materi video/PDF, evaluasi pelatih, dan keaktifan anggota) sebelum diizinkan mengikuti UKT."
                badge={
                    <Badge variant="rose">
                        Prasyarat UKT
                    </Badge>
                }
            />

            <div className="space-y-6">
                {/* Active Registration Ticket if already registered */}
                {activeRegistration && (
                    <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-5 text-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#16865C] text-white">
                                Tiket Peserta UKT Resmi
                            </span>
                            <h3 className="text-base font-bold text-emerald-950 mt-1">
                                {activeRegistration.examination?.title}
                            </h3>
                            <div className="text-xs text-emerald-800 flex flex-wrap items-center gap-4 pt-1">
                                <span>No. Dada: <strong className="font-mono text-sm">{activeRegistration.chest_number}</strong></span>
                                <span>Target Sabuk: <strong>{activeRegistration.target_rank}</strong></span>
                                <span>Status: <strong className="uppercase">{activeRegistration.status}</strong></span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-xs font-bold text-[#16865C] bg-white px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-[#16865C]" /> Terverifikasi Ikut Ujian
                            </span>
                        </div>
                    </div>
                )}

                {/* 5 Eligibility Criteria Cards */}
                {eligibility && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#718092]" />
                                Verifikasi 5 Prasyarat Mutlak UKT Anda
                            </h3>
                            {eligibility.is_eligible ? (
                                <Badge variant="emerald" withDot>
                                    Seluruh Syarat Terpenuhi (Siap UKT)
                                </Badge>
                            ) : (
                                <Badge variant="rose" withDot>
                                    Belum Memenuhi Syarat
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* 1. Iuran */}
                            <div className={cn(
                                'p-4 rounded-xl border flex flex-col justify-between space-y-2 shadow-2xs',
                                eligibility.criteria.dues_paid.passed
                                    ? 'bg-white border-[#E8EBEF]'
                                    : 'bg-red-50/50 border-red-200'
                            )}>
                                <div className="flex items-center justify-between">
                                    <Receipt className="w-4 h-4 text-[#718092]" />
                                    {eligibility.criteria.dues_paid.passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#16865C]" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-[#DC3545]" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#17202D]">{eligibility.criteria.dues_paid.label}</h4>
                                    <p className="text-[11px] text-[#718092] mt-0.5">{eligibility.criteria.dues_paid.detail}</p>
                                </div>
                            </div>

                            {/* 2. Presensi */}
                            <div className={cn(
                                'p-4 rounded-xl border flex flex-col justify-between space-y-2 shadow-2xs',
                                eligibility.criteria.attendance.passed
                                    ? 'bg-white border-[#E8EBEF]'
                                    : 'bg-red-50/50 border-red-200'
                            )}>
                                <div className="flex items-center justify-between">
                                    <Calendar className="w-4 h-4 text-[#718092]" />
                                    {eligibility.criteria.attendance.passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#16865C]" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-[#DC3545]" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#17202D]">{eligibility.criteria.attendance.label}</h4>
                                    <p className="text-[11px] text-[#718092] mt-0.5">{eligibility.criteria.attendance.detail}</p>
                                </div>
                            </div>

                            {/* 3. Materi Progress */}
                            <div className={cn(
                                'p-4 rounded-xl border flex flex-col justify-between space-y-2 shadow-2xs',
                                eligibility.criteria.material_progress.passed
                                    ? 'bg-white border-[#E8EBEF]'
                                    : 'bg-red-50/50 border-red-200'
                            )}>
                                <div className="flex items-center justify-between">
                                    <FileText className="w-4 h-4 text-[#718092]" />
                                    {eligibility.criteria.material_progress.passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#16865C]" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-[#DC3545]" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#17202D]">{eligibility.criteria.material_progress.label}</h4>
                                    <p className="text-[11px] text-[#718092] mt-0.5">{eligibility.criteria.material_progress.detail}</p>
                                </div>
                            </div>

                            {/* 4. Coach Evaluation */}
                            <div className={cn(
                                'p-4 rounded-xl border flex flex-col justify-between space-y-2 shadow-2xs',
                                eligibility.criteria.coach_evaluation.passed
                                    ? 'bg-white border-[#E8EBEF]'
                                    : 'bg-red-50/50 border-red-200'
                            )}>
                                <div className="flex items-center justify-between">
                                    <UserCheck className="w-4 h-4 text-[#718092]" />
                                    {eligibility.criteria.coach_evaluation.passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#16865C]" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-[#DC3545]" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#17202D]">{eligibility.criteria.coach_evaluation.label}</h4>
                                    <p className="text-[11px] text-[#718092] mt-0.5">{eligibility.criteria.coach_evaluation.detail}</p>
                                </div>
                            </div>

                            {/* 5. Membership Active */}
                            <div className={cn(
                                'p-4 rounded-xl border flex flex-col justify-between space-y-2 shadow-2xs',
                                eligibility.criteria.membership_active.passed
                                    ? 'bg-white border-[#E8EBEF]'
                                    : 'bg-red-50/50 border-red-200'
                            )}>
                                <div className="flex items-center justify-between">
                                    <Award className="w-4 h-4 text-[#718092]" />
                                    {eligibility.criteria.membership_active.passed ? (
                                        <CheckCircle2 className="w-4 h-4 text-[#16865C]" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-[#DC3545]" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#17202D]">{eligibility.criteria.membership_active.label}</h4>
                                    <p className="text-[11px] text-[#718092] mt-0.5">{eligibility.criteria.membership_active.detail}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upcoming Examination Sessions */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] p-5 space-y-4 shadow-2xs">
                    <h3 className="text-sm font-bold text-[#17202D]">
                        Jadwal Sesi Ujian Kenaikan Tingkat Terdekat
                    </h3>

                    <div className="divide-y divide-[#E8EBEF]">
                        {upcomingExaminations.map((exam) => (
                            <div key={exam.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#102B40] text-white">
                                            {exam.level_scope.replace(/_/g, ' ')}
                                        </span>
                                        <h4 className="text-sm font-bold text-[#17202D]">{exam.title}</h4>
                                    </div>
                                    <div className="text-xs text-[#718092] flex flex-wrap items-center gap-4">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {exam.date}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {exam.location_name}</span>
                                    </div>
                                </div>

                                <div>
                                    {activeRegistration ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled
                                        >
                                            Sudah Terdaftar
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            disabled={!eligibility?.is_eligible}
                                            onClick={() => handleRegister(exam.id)}
                                        >
                                            Daftar Ujian UKT
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {upcomingExaminations.length === 0 && (
                        <p className="text-xs text-[#718092] py-6 text-center">
                            Belum ada jadwal sesi ujian terbuka yang dapat didaftarkan saat ini.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
