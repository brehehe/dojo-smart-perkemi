import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { 
    Calendar, 
    CheckCircle2, 
    ChevronRight, 
    GraduationCap, 
    MapPin, 
    ShieldCheck, 
    Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExaminationItem {
    id: string;
    title: string;
    level_scope: string;
    location_name: string;
    date: string;
    start_time: string;
    quota: number;
    status: string;
    registrations_count: number;
}

interface PageProps {
    examinations: { data: ExaminationItem[] };
}

export default function ExaminationsIndex({ examinations }: PageProps) {
    return (
        <AppLayout>
            <Head title="Jadwal Ujian Kenaikan Tingkat (UKT) Shorinji Kempo" />

            <PageHeading
                title="Penyelenggaraan Ujian Kenaikan Tingkat (UKT) PERKEMI"
                description="Sistem penjadwalan terpadu UKT tingkat Pengkot (Kyu), Pengprov (Dan I-III), dan PB PERKEMI (Dan IV ke atas) dengan verifikasi 5 prasyarat mutlak."
                badge={
                    <Badge variant="rose">
                        Evaluasi UKT
                    </Badge>
                }
                actions={
                    <Link href="/portal/kenshi/ukt">
                        <Button variant="primary" leftIcon={<ShieldCheck className="w-4 h-4" />}>
                            Cek Kelayakan & Daftar Ujian
                        </Button>
                    </Link>
                }
            />

            <div className="space-y-6">
                {/* Examinations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {examinations.data.map((exam) => (
                        <div key={exam.id} className="bg-white rounded-xl border border-[#E8EBEF] p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-2xs">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#102B40] text-white">
                                        {exam.level_scope.replace(/_/g, ' ')}
                                    </span>
                                    {exam.status === 'registration_open' ? (
                                        <Badge variant="emerald" withDot>
                                            Buka Pendaftaran
                                        </Badge>
                                    ) : (
                                        <Badge variant="slate">
                                            {exam.status}
                                        </Badge>
                                    )}
                                </div>

                                <h3 className="text-sm font-bold text-[#17202D] line-clamp-2">
                                    {exam.title}
                                </h3>

                                <div className="space-y-1.5 text-xs text-[#718092]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-[#718092]" />
                                        <span>{exam.date} • {exam.start_time} WIB</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-[#718092]" />
                                        <span className="truncate">{exam.location_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-[#718092]" />
                                        <span>{exam.registrations_count} / {exam.quota} Peserta Terdaftar</span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/examinations/${exam.id}`}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#17202D] text-xs font-semibold rounded-lg transition-colors"
                            >
                                Lihat Detail & Lembar Ujian <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>

                {examinations.data.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#E8EBEF] shadow-2xs">
                        <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-[#17202D]">Belum Ada Sesi UKT yang Terjadwal</h4>
                        <p className="text-xs text-[#718092] max-w-sm mx-auto mt-1">
                            Jadwal Ujian Kenaikan Tingkat berikutnya akan diumumkan oleh Pengurus Cabang dan Pengprov.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
