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
                        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
                            <span className="text-xl font-bold text-slate-900 block">
                                {kenshi.rank.is_dan ? 'Yudansha' : 'Mudansha'}
                            </span>
                            <span className="text-[11px] text-slate-500">Kategori Tingkat</span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xs">
                            <span className="text-xl font-bold text-emerald-600 block">
                                94%
                            </span>
                            <span className="text-[11px] text-slate-500">Presensi Latihan</span>
                        </div>
                    </div>
                </div>

                {/* UKT Progression Roadmap (Right Column) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-red-600" />
                                Peta Kemajuan Tingkatan (UKT Roadmap)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-slate-500">
                                Jalur kurikulum Shorinji Kempo dari sabuk putih (Minarai) hingga pemegang tingkatan Dan (Yudansha).
                            </p>

                            <div className="relative pl-6 space-y-5 border-l-2 border-slate-200 ml-2">
                                {roadmap.map((step, index) => {
                                    return (
                                        <div key={step.rank} className="relative flex items-start gap-4">
                                            {/* Milestone Icon */}
                                            <div
                                                className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${
                                                    step.is_completed
                                                        ? 'border-emerald-600 text-emerald-600'
                                                        : step.is_current
                                                        ? 'border-red-600 bg-red-600 text-white shadow-xs animate-pulse'
                                                        : 'border-slate-300 text-slate-400'
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
                                                                ? 'text-red-600 font-extrabold'
                                                                : step.is_completed
                                                                ? 'text-slate-800'
                                                                : 'text-slate-400'
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
                                                        <span className="text-[11px] text-emerald-600 font-medium">
                                                            ✓ Lulus Ujian
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 block">
                                                    Warna Sabuk: <strong className="capitalize">{step.belt_color}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Presensi Kamera & Geotag GPS Live Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-[#0B132B] via-slate-900 to-[#1A1024] p-5 sm:p-6 text-white shadow-lg">
                        {/* Decorative background glow */}
                        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-red-600/15 blur-3xl" />
                        <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-purple-600/10 blur-2xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shrink-0 shadow-md shadow-red-950/40 mt-0.5">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <div className="space-y-1.5 max-w-xl">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                                            Presensi Latihan Mandiri (Kamera & GPS)
                                        </h4>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 whitespace-nowrap">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                                            Live Tatami
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                        Lakukan absensi selfie dengan dogi lengkap saat berada di dojo untuk meningkatkan persentase kehadiran syarat UKT Anda.
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                                <Link href="/attendance/check-in" className="w-full sm:w-auto">
                                    <Button
                                        variant="primary"
                                        className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-md shadow-red-950/40 whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                        leftIcon={<Camera className="w-4 h-4" />}
                                    >
                                        Buka Kamera Presensi
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Training Schedule & Dojo Contact */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Informasi Dojo & Kalender Jadwal</CardTitle>
                                <Link href="/schedules" className="text-xs text-red-600 hover:underline font-semibold">
                                    Lihat Kalender Lengkap →
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs text-slate-600">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                                <span>
                                    Hari Latihan: <strong>Selasa & Kamis (19.00 - 21.00), Sabtu (08.00 - 11.00)</strong>
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>
                                    Dojo Terdaftar: <strong>{kenshi.dojo?.name || 'Dojo Senayan'}</strong> ({kenshi.dojo?.pengprov})
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
