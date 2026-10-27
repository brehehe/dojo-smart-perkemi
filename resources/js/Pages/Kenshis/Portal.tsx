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
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 font-medium">
                        <RotateCw className="w-3.5 h-3.5 text-red-600" />
                        Klik kartu untuk membalik (Front / Back)
                    </p>

                    <div
                        className="w-full max-w-[335px] sm:max-w-sm h-60 sm:h-64 perspective-1000 cursor-pointer select-none mx-auto"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                            style={{ transformStyle: 'preserve-3d' }}
                            className="relative w-full h-full rounded-2xl shadow-xl border border-slate-700/60"
                        >
                            {/* FRONT OF KTA */}
                            <div
                                style={{ backfaceVisibility: 'hidden' }}
                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#070b1a] p-5 text-white flex flex-col justify-between overflow-hidden border border-amber-500/30"
                            >
                                {/* Gold Hologram Foil Accent */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/20 via-yellow-300/10 to-transparent blur-xl pointer-events-none" />

                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400 block leading-tight">
                                                KARTU TANDA ANGGOTA DIGITAL
                                            </span>
                                            <span className="text-xs font-bold tracking-tight text-white block">
                                                PB PERKEMI INDONESIA
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 font-semibold">
                                        OFFICIAL
                                    </span>
                                </div>

                                {/* Body Information */}
                                <div className="flex items-center gap-4 my-auto">
                                    <Avatar name={kenshi.full_name} size="lg" className="ring-2 ring-amber-400/50" />
                                    <div>
                                        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                                            {kenshi.full_name}
                                        </h3>
                                        <span className="text-[11px] font-mono font-semibold text-slate-300 block">
                                            {kenshi.id_card_number}
                                        </span>
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <RankBadge
                                                label={kenshi.rank.label}
                                                beltColor={kenshi.rank.belt_color}
                                                isDan={kenshi.rank.is_dan}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="flex items-end justify-between border-t border-slate-700/60 pt-2.5 text-[10px] text-slate-400">
                                    <div>
                                        <span className="block text-slate-400">Dojo Latihan:</span>
                                        <span className="font-semibold text-white">
                                            {kenshi.dojo?.name || 'Dojo Senayan'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-slate-400">Bergabung:</span>
                                        <span className="font-mono text-white">{kenshi.joined_at || '2024'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* BACK OF KTA */}
                            <div
                                style={{
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                }}
                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1C2541] to-[#0B132B] p-5 text-white flex flex-col justify-between overflow-hidden border border-slate-700"
                            >
                                <div className="border-b border-slate-700 pb-2">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                                        IKRAR KENSHI INDONESIA (DOKUN)
                                    </p>
                                    <p className="text-[10px] text-slate-300 italic mt-0.5 leading-relaxed">
                                        "Kasih sayang tanpa kekuatan adalah kelemahan. Kekuatan tanpa kasih sayang adalah kezaliman."
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 my-auto">
                                    <div className="h-16 w-16 bg-white p-1.5 rounded-lg flex items-center justify-center shrink-0">
                                        <QrCode className="w-full h-full text-slate-900" />
                                    </div>
                                    <div className="text-[10px] text-slate-300 space-y-1">
                                        <span className="font-semibold text-white block">Verifikasi Keaslian</span>
                                        <p className="leading-tight text-slate-400">
                                            Pindai QR untuk validasi status sertifikasi UKT dan nomor induk nasional di pusat data PB Perkemi.
                                        </p>
                                        <span className="font-mono text-[9px] text-amber-400 block truncate">
                                            SHA: {cardSecurityHash.substring(0, 24)}...
                                        </span>
                                    </div>
                                </div>

                                <div className="text-[9px] text-center text-slate-400 border-t border-slate-700 pt-2">
                                    Pengurus Besar Persaudaraan Bela Diri Kempo Indonesia (PB PERKEMI)
                                </div>
                            </div>
                        </motion.div>
                    </div>

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
                    <Card className="border-red-500/30 bg-linear-to-r from-red-950/20 to-slate-900 border text-white p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                                    <Camera className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span>Presensi Latihan Mandiri (Kamera & GPS)</span>
                                        <Badge variant="rose" size="sm">Live Tatami</Badge>
                                    </h4>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Lakukan absensi selfie dengan dogi lengkap saat berada di dojo untuk meningkatkan persentase kehadiran syarat UKT Anda.
                                    </p>
                                </div>
                            </div>
                            <Link href="/attendance/check-in" className="shrink-0">
                                <Button
                                    variant="primary"
                                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto shadow-xs text-xs font-bold"
                                    leftIcon={<Camera className="w-4 h-4" />}
                                >
                                    Buka Kamera Presensi
                                </Button>
                            </Link>
                        </div>
                    </Card>

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
