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
import { DojoMapViewer } from '@/Components/Map/DojoMapViewer';

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

    const lat = dojo.latitude ? Number(dojo.latitude) : -7.3183485;
    const lng = dojo.longitude ? Number(dojo.longitude) : 112.7177549;
    const radius = dojo.radius_meters ? Number(dojo.radius_meters) : 150;

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
                            <CardTitle className="text-base font-bold text-[#17202D]">
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
                                withDot
                            >
                                {dojo.status.label}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092] block mb-1">
                                        Nomor Registrasi / Kode Dojo
                                    </span>
                                    <span className="font-mono text-sm font-bold text-[#17202D]">
                                        {dojo.code}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092] block mb-1">
                                        Wilayah Pengprov / Pengkab
                                    </span>
                                    <span className="text-sm font-bold text-[#17202D]">
                                        {dojo.pengprov} • {dojo.pengkab}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092] block mb-1">
                                    Alamat Fasilitas / Tempat Latihan
                                </span>
                                <div className="flex items-start gap-2 mt-1">
                                    <MapPin className="w-4 h-4 text-[#718092] shrink-0 mt-0.5" />
                                    <p className="text-xs text-[#17202D] leading-relaxed">
                                        {dojo.address || 'Alamat belum dilengkapi.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092] block mb-1">
                                        Kontak WhatsApp
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="w-4 h-4 text-[#718092] shrink-0" />
                                        <span className="text-xs font-semibold text-[#17202D]">
                                            {dojo.contact_phone || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092] block mb-1">
                                        Email Dojo
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4 text-[#718092] shrink-0" />
                                        <span className="text-xs font-semibold text-[#17202D]">
                                            {dojo.contact_email || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Geolocation Map & Geofence Viewer */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#C51C2A] border border-red-100 shrink-0">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-[#17202D]">
                                        Titik Lokasi &amp; Radius Absensi Tatami
                                    </CardTitle>
                                    <p className="text-xs text-[#718092]">
                                        Peta titik koordinat resmi dan batas geofence absensi kenshi di dojo ini.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DojoMapViewer
                                latitude={lat}
                                longitude={lng}
                                radiusMeters={radius}
                                dojoName={dojo.name}
                                address={dojo.address}
                                height="380px"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Stats & Head Sensei */}
                <div className="space-y-6">
                    {/* Head Sensei Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-[#C51C2A]" />
                                Sensei Penanggung Jawab
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dojo.head_sensei ? (
                                <div className="p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA] space-y-1">
                                    <p className="text-sm font-bold text-[#17202D]">
                                        {dojo.head_sensei.name}
                                    </p>
                                    <p className="text-xs text-[#718092]">
                                        {dojo.head_sensei.email}
                                    </p>
                                    <div className="pt-2">
                                        <Badge variant="navy" size="sm">
                                            Head Sensei
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-[#718092]">
                                    Sensei penanggung jawab belum ditetapkan.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#718092]" />
                                Statistik Kenshi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-baseline justify-between p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                <span className="text-xs text-[#718092] font-medium">
                                    Kenshi Terdaftar Aktif
                                </span>
                                <span className="text-xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                    {dojo.kenshis_count ?? 0}
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between p-3.5 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                                <span className="text-xs text-[#718092] font-medium">
                                    Radius Presensi
                                </span>
                                <span className="text-sm font-bold text-[#102B40] font-mono">
                                    {radius} Meter
                                </span>
                            </div>

                            <Link href="/my-dojo" className="block w-full pt-1">
                                <Button variant="outline" size="sm" className="w-full">
                                    Buka Evaluasi &amp; UKT Roster
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
