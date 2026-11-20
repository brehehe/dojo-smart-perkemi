import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Kenshi } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import {
    Award,
    Calendar,
    Camera,
    Check,
    CheckCircle2,
    Clock,
    Flame,
    Lock,
    QrCode,
    RotateCw,
    Shield,
    Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { KenshiCard3D } from '@/Components/UI/DataDisplay/KenshiCard3D';

interface Props {
    kenshi: Kenshi | { data: Kenshi };
    roadmap: Array<{
        rank: string;
        label: string;
        belt_color: string;
        is_completed: boolean;
        is_current: boolean;
        is_upcoming: boolean;
    }>;
    cardSecurityHash: string;
}

export default function KenshiPortal({ kenshi: rawKenshi, roadmap, cardSecurityHash }: Props) {
    const kenshi = (rawKenshi && 'data' in rawKenshi ? rawKenshi.data : rawKenshi) as Kenshi;
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <AppLayout>
            <Head title={`Portal Kenshi - ${kenshi.full_name}`} />

            <PageHeading
                title="Kartu Anggota & Portal Kenshi"
                description="Kartu Tanda Anggota (KTA) Digital resmi PB Perkemi, peta kurikulum UKT, dan catatan jam latihan."
                badge={
                    <Badge variant={kenshi.is_active ? 'emerald' : 'slate'} withDot>
                        {kenshi.is_active ? 'Status Kenshi Aktif' : 'Non-Aktif'}
                    </Badge>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-10">
                {/* 3D Flippable KTA Card (Left Column) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <KenshiCard3D kenshi={kenshi} />

                    {/* Quick Stats below card */}
                    <div className="w-full max-w-sm mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[#E8EBEF] bg-white p-3.5 text-center shadow-2xs">
                            <span className="text-xl font-bold text-[#17202D] block">
                                {kenshi.rank?.is_dan ? 'Yudansha' : 'Mudansha'}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092]">Kategori Tingkat</span>
                        </div>
                        <div className="rounded-xl border border-[#E8EBEF] bg-white p-3.5 text-center shadow-2xs">
                            <span className="text-xl font-bold text-[#16865C] block">
                                94%
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092]">Presensi Latihan</span>
                        </div>
                    </div>
                </div>

                {/* UKT Progression Roadmap (Right Column) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border border-[#E8EBEF] bg-white shadow-2xs">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-bold text-[#17202D]">
                                <Award className="w-5 h-5 text-[#C51C2A]" />
                                Peta Kemajuan Tingkatan (UKT Roadmap)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-[#718092]">
                                Jalur kurikulum Shorinji Kempo dari sabuk putih (Minarai) hingga pemegang tingkatan Dan (Yudansha).
                            </p>

                            <div className="relative pl-6 space-y-5 border-l-2 border-[#E8EBEF] ml-2">
                                {roadmap.map((step, index) => {
                                    return (
                                        <div key={step.rank} className="relative flex items-start gap-4">
                                            {/* Milestone Icon */}
                                            <div
                                                className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                                                    step.is_completed
                                                        ? 'border-[#16865C] text-[#16865C]'
                                                        : step.is_current
                                                        ? 'border-[#C51C2A] bg-[#C51C2A] text-white shadow-2xs'
                                                        : 'border-[#E8EBEF] text-[#718092]'
                                                }`}
                                            >
                                                {step.is_completed ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : step.is_current ? (
                                                    <Flame className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Lock className="w-3 h-3" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 -mt-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-sm font-bold ${
                                                            step.is_current
                                                                ? 'text-[#C51C2A]'
                                                                : step.is_completed
                                                                ? 'text-[#17202D]'
                                                                : 'text-[#718092]'
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </span>
                                                    {step.is_current && (
                                                        <Badge variant="rose" size="sm">
                                                            Tingkat Anda Saat Ini
                                                        </Badge>
                                                    )}
                                                    {step.is_completed && (
                                                        <span className="text-[11px] text-[#16865C] font-semibold">
                                                            ✓ Lulus Ujian
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-[#718092] block mt-0.5">
                                                    Warna Sabuk: <strong className="capitalize text-[#17202D]">{step.belt_color}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Presensi Kamera & Geotag GPS Live Card */}
                    <Card className="border border-[#E8EBEF] bg-white shadow-2xs">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div className="flex items-start gap-4">
                                    <div className="h-11 w-11 rounded-xl bg-[#F8F9FA] border border-[#E8EBEF] flex items-center justify-center text-[#C51C2A] shrink-0 mt-0.5">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1 max-w-xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-sm sm:text-base font-bold text-[#17202D]">
                                                Presensi Latihan Mandiri (Kamera & GPS)
                                            </h4>
                                            <Badge variant="rose" size="sm" withDot>
                                                Live Tatami
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-[#718092] leading-relaxed">
                                            Lakukan absensi mandiri dengan foto berseragam Dogi lengkap saat berada di radius dojo untuk memenuhi syarat presensi UKT.
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center">
                                    <Link href="/attendance/check-in" className="w-full sm:w-auto">
                                        <Button
                                            variant="danger"
                                            className="w-full sm:w-auto bg-[#C51C2A] hover:bg-[#a51522] text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-lg shadow-2xs whitespace-nowrap"
                                            leftIcon={<Camera className="w-4 h-4" />}
                                        >
                                            Buka Kamera Presensi
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Training Schedule & Dojo Contact */}
                    <Card className="border border-[#E8EBEF] bg-white shadow-2xs">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold text-[#17202D]">Informasi Dojo & Kalender Jadwal</CardTitle>
                                <Link href="/schedules" className="text-xs text-[#C51C2A] hover:underline font-semibold">
                                    Lihat Kalender Lengkap →
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs text-[#718092]">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-[#C51C2A] shrink-0" />
                                <span>
                                    Hari Latihan: <strong className="text-[#17202D]">Selasa & Kamis (19.00 - 21.00), Sabtu (08.00 - 11.00)</strong>
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-[#102B40] shrink-0" />
                                <span>
                                    Dojo Terdaftar: <strong className="text-[#17202D]">{kenshi.dojo?.name || 'Dojo Senayan'}</strong> ({kenshi.dojo?.pengprov})
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
