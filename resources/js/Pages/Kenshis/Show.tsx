import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Kenshi, PageProps } from '@/types';
import { formatDate } from '@/lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Button } from '@/Components/UI/Elements/Button';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { KenshiCard3D } from '@/Components/UI/DataDisplay/KenshiCard3D';
import {
    ArrowLeft,
    Award,
    Building2,
    Calendar,
    Edit3,
    GraduationCap,
    HeartPulse,
    Mail,
    MapPin,
    Phone,
    QrCode,
    Shield,
    Sparkles,
    Trophy,
    UserCheck,
} from 'lucide-react';

interface Props {
    kenshi: Kenshi | { data: Kenshi };
}

export default function KenshisShow({ kenshi: rawKenshi }: Props) {
    const { auth } = usePage<PageProps>().props;
    const kenshi = (rawKenshi && 'data' in rawKenshi ? rawKenshi.data : rawKenshi) as Kenshi;

    const isSuperAdmin = auth.user?.roles?.includes('SuperAdmin');
    const isPengprovAdmin = auth.user?.roles?.includes('PengprovAdmin');
    const isSensei = auth.user?.roles?.includes('Sensei');
    const canEditKenshi = Boolean(
        auth.user?.can?.kenshi_create ?? (isSuperAdmin || isPengprovAdmin || isSensei)
    );

    const rank = kenshi?.rank || {
        value: 'minarai',
        label: 'Minarai (Putih)',
        belt_color: 'white',
        is_dan: false,
    };

    return (
        <AppLayout>
            <Head title={`${kenshi.full_name} (${kenshi.id_card_number}) - Profil Kenshi Perkemi`} />

            <PageHeading
                title={kenshi.full_name}
                description={`KTA: ${kenshi.id_card_number} • ${kenshi.dojo?.name || 'Dojo Perkemi'}`}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/kenshis">
                            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                Kembali ke Pangkalan
                            </Button>
                        </Link>
                        {canEditKenshi && (
                            <Link href={`/kenshis/${kenshi.id}/edit`}>
                                <Button variant="outline" leftIcon={<Edit3 className="w-4 h-4" />}>
                                    Edit Biodata
                                </Button>
                            </Link>
                        )}
                        <Link href="/portal/kenshi">
                            <Button variant="primary" leftIcon={<Award className="w-4 h-4" />}>
                                Portal Kenshi
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Profile Info Card (Left Column) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar name={kenshi.full_name} size="lg" />
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        {kenshi.full_name}
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Nomor Pokok / KTA: {kenshi.id_card_number}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <RankBadge
                                    label={rank.label}
                                    beltColor={rank.belt_color}
                                    isDan={rank.is_dan}
                                />
                                <Badge variant={kenshi.is_active ? 'emerald' : 'slate'}>
                                    {kenshi.is_active ? 'Aktif' : 'Non-Aktif'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Nama Panggilan
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {kenshi.nickname || '-'}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Jenis Kelamin
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {kenshi.gender === 'M' ? 'Laki-Laki' : 'Perempuan'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Tempat, Tanggal Lahir
                                    </span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {kenshi.place_of_birth || '-'}
                                        {kenshi.date_of_birth ? `, ${formatDate(kenshi.date_of_birth)}` : ''}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Golongan Darah
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {kenshi.blood_type || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Asal Afiliasi Organisasi & Pembinaan (Dojo, Pengkot, Pengprov) */}
                            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Asal Organisasi & Afiliasi Pembinaan
                                </span>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-800">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">1. Asal Dojo (Latihan Rutin):</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{kenshi.dojo?.name || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 dark:border-slate-800">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">2. Asal Pengkot / Pengkab (Kewenangan TC):</span>
                                        {kenshi.is_atlet_pengkot ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60">
                                                <Sparkles className="h-3 w-3 text-rose-500" />
                                                {kenshi.pengkot || 'Kota Surabaya'}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Belum Terdaftar</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-xs py-1">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">3. Asal Pengprov (Hak Tim Puslatda):</span>
                                        {kenshi.is_atlet_pengprov ? (
                                            <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60">
                                                <Trophy className="h-3 w-3 text-purple-500" />
                                                {kenshi.pengprov || 'Jawa Timur'}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">Belum Terdaftar</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Alamat Domisili
                                </span>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {kenshi.address || 'Alamat domisili belum dilengkapi.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Nomor Telepon / WhatsApp
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                            {kenshi.phone || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Tanggal Bergabung
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                            {kenshi.joined_at ? formatDate(kenshi.joined_at) : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dojo Affiliation Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600" />
                                Cabang Latihan (Dojo)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {kenshi.dojo ? (
                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                {kenshi.dojo.name}
                                            </p>
                                            <p className="text-xs font-mono text-slate-500 mt-0.5">
                                                {kenshi.dojo.code}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                {kenshi.dojo.pengprov} {kenshi.dojo.pengkab ? `• ${kenshi.dojo.pengkab}` : ''}
                                            </p>
                                        </div>
                                        <Link href={`/dojos/${kenshi.dojo.id}`}>
                                            <Button variant="outline" size="sm">
                                                Profil Dojo
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    Belum terafiliasi ke dojo mana pun.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 3D Interactive KTA Card & QR Code (Right Column) */}
                <div className="lg:col-span-5 space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <QrCode className="w-4 h-4 text-amber-500" />
                                    KTA Digital 3D & Verifikasi QR
                                </CardTitle>
                                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold dark:bg-amber-950/60 dark:text-amber-400">
                                    INTERAKTIF
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <KenshiCard3D kenshi={kenshi} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
