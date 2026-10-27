import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Dojo, PageProps } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Button } from '@/Components/UI/Elements/Button';
import {
    ArrowLeft,
    Building2,
    Calendar,
    Edit3,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Shield,
    TrendingUp,
    Users,
} from 'lucide-react';

interface Props {
    dojo: Dojo | { data: Dojo };
}

export default function DojosShow({ dojo: rawDojo }: Props) {
    const { auth } = usePage<PageProps>().props;
    const dojo = (rawDojo && 'data' in rawDojo ? rawDojo.data : rawDojo) as Dojo;

    const isSuperAdmin = auth.user?.roles?.includes('SuperAdmin');
    const isPengprovAdmin = auth.user?.roles?.includes('PengprovAdmin');
    const canEditDojo = Boolean(
        isSuperAdmin ||
        isPengprovAdmin ||
        (auth.user?.roles?.includes('Sensei') && dojo.head_sensei?.id === auth.user?.id)
    );
    const canViewMonitoring = Boolean(
        isSuperAdmin ||
        isPengprovAdmin ||
        auth.user?.roles?.includes('Sensei')
    );

    return (
        <AppLayout>
            <Head title={`${dojo.name} - Profil Dojo Perkemi`} />

            <PageHeading
                title={dojo.name}
                description={`Cabang Latihan Perkemi • ${dojo.pengprov} - ${dojo.pengkab}`}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/dojos">
                            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                Kembali
                            </Button>
                        </Link>
                        {canEditDojo && (
                            <Link href={`/dojos/${dojo.id}/edit`}>
                                <Button variant="outline" leftIcon={<Edit3 className="w-4 h-4" />}>
                                    Edit Data
                                </Button>
                            </Link>
                        )}
                        {canViewMonitoring && (
                            <Link href="/my-dojo">
                                <Button variant="primary" leftIcon={<TrendingUp className="w-4 h-4" />}>
                                    Panel Monitoring
                                </Button>
                            </Link>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Dojo Profile Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold text-slate-900">
                                Profil Resmi Cabang Latihan
                            </CardTitle>
                            <Badge
                                variant={
                                    dojo.status.value === 'active'
                                        ? 'emerald'
                                        : dojo.status.value === 'inactive'
                                          ? 'slate'
                                          : 'amber'
                                }
                            >
                                {dojo.status.label}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Nomor Registrasi / Kode Dojo
                                    </span>
                                    <span className="font-mono text-sm font-bold text-slate-900">
                                        {dojo.code}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Wilayah Pengprov / Pengkab
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {dojo.pengprov} • {dojo.pengkab}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                    Alamat Fasilitas / Tempat Latihan
                                </span>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        {dojo.address || 'Alamat belum dilengkapi.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Kontak WhatsApp
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-xs font-medium text-slate-800">
                                            {dojo.contact_phone || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                                        Email Dojo
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-xs font-medium text-slate-800">
                                            {dojo.contact_email || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Stats & Head Sensei */}
                <div className="space-y-6">
                    {/* Head Sensei Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-red-600" />
                                Sensei Penanggung Jawab
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dojo.head_sensei ? (
                                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/80">
                                    <p className="text-sm font-bold text-slate-900">
                                        {dojo.head_sensei.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {dojo.head_sensei.email}
                                    </p>
                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-400">
                                        Head Sensei
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    Sensei penanggung jawab belum ditetapkan.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-600" />
                                Statistik Kenshi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-baseline justify-between p-3 rounded-lg bg-slate-50">
                                <span className="text-xs text-slate-600 font-medium">
                                    Kenshi Terdaftar Aktif
                                </span>
                                <span className="text-xl font-extrabold text-slate-900">
                                    {dojo.kenshis_count ?? 0}
                                </span>
                            </div>

                            <Link href="/my-dojo" className="block w-full">
                                <Button variant="secondary" size="sm" className="w-full">
                                    Buka Evaluasi & UKT Roster
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
