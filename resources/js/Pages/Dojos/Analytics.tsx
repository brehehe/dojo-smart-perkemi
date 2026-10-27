import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Dojo, Kenshi, PaginatedData } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { StatsCard } from '@/Components/UI/DataDisplay/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/DataDisplay/Table';
import { Pagination } from '@/Components/UI/Navigation/Pagination';
import { ActionMenuDropdown } from '@/Components/UI/Navigation/ActionMenuDropdown';
import { EmptyState } from '@/Components/UI/DataDisplay/EmptyState';
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import {
    Award,
    Calendar,
    CheckCircle2,
    Clock,
    Edit3,
    GraduationCap,
    MapPin,
    Plus,
    Search,
    Shield,
    User,
    Users,
} from 'lucide-react';

import { motion } from 'framer-motion';

interface Props {
    dojo: Dojo;
    stats: {
        total_kenshis: number;
        active_kenshis: number;
        inactive_kenshis: number;
        active_percentage: number;
        yudansha_count: number;
        mudansha_count: number;
        ready_for_ukt_count: number;
        rank_distribution: Record<string, number>;
    };
    roster: PaginatedData<Kenshi>;
    filters: {
        search?: string;
        rank?: string;
    };
    ranks: Array<{ value: string; label: string }>;
}

export default function DojoAnalytics({ dojo, stats, roster, filters, ranks }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [rankFilter, setRankFilter] = useState(filters.rank || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/my-dojo',
            { search: searchTerm, rank: rankFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleRankChange = (val: string) => {
        setRankFilter(val);
        router.get(
            '/my-dojo',
            { search: searchTerm, rank: val },
            { preserveState: true, replace: true }
        );
    };

    const totalRosterCount = roster.meta?.total ?? roster.total ?? roster.data.length;

    return (
        <AppLayout>
            <Head title={`Panel Monitoring - ${dojo.name}`} />

            {/* Dojo Hero Banner */}
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] p-6 sm:p-8 text-white shadow-md border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                {dojo.code}
                            </span>
                            <Badge variant="emerald" withDot>
                                {dojo.status.label}
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            {dojo.name}
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            {dojo.address || dojo.city}, {dojo.pengkab} · Pengprov {dojo.pengprov}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/kenshis/create">
                            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                Registrasi Kenshi Dojo
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                            Instruktur Kepala (Sensei):{' '}
                            <strong className="text-white">{dojo.head_sensei?.name || '-'}</strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                            Jadwal Latihan:{' '}
                            <strong className="text-white">
                                {dojo.contact_phone ? `Kontak: ${dojo.contact_phone}` : 'Latihan Rutin Mingguan'}
                            </strong>
                        </span>
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                    title="Total Anggota Kenshi"
                    value={stats.total_kenshis}
                    description="Kenshi terdaftar aktif di pangkalan data dojo"
                    icon={<Users className="w-5 h-5 text-red-600" />}
                />
                <StatsCard
                    title="Rasio Keaktifan"
                    value={`${stats.active_percentage}%`}
                    description={`${stats.active_kenshis} aktif · ${stats.inactive_kenshis} non-aktif`}
                    trend={{ value: `${stats.active_kenshis} aktif`, isPositive: true }}
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                />
                <StatsCard
                    title="Sabuk Hitam (Yudansha)"
                    value={stats.yudansha_count}
                    description={`${stats.mudansha_count} kenshi sabuk Kyu (Mudansha)`}
                    icon={<Award className="w-5 h-5 text-amber-500" />}
                />
                <StatsCard
                    title="Kandidat Ujian UKT"
                    value={stats.ready_for_ukt_count}
                    description="Memenuhi syarat presensi & masa latihan"
                    icon={<GraduationCap className="w-5 h-5 text-sky-600" />}
                />
            </div>

            {/* Interactive Analytics: Rank Distribution & Readiness */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Distribusi Tingkatan Sabuk (Kyu & Dan)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-slate-500">
                            Komposisi tingkat kemahiran kenshi untuk evaluasi materi teknik Goju Ittai.
                        </p>
                        <div className="space-y-3">
                            {Object.entries(stats.rank_distribution).map(([category, count]) => {
                                const percentage =
                                    stats.total_kenshis > 0
                                        ? Math.round((count / stats.total_kenshis) * 100)
                                        : 0;

                                const barColors: Record<string, string> = {
                                    'Dan (Yudansha)': 'bg-slate-900',
                                    'Coklat (Kyu 1 - 3)': 'bg-[#5c3d2e]',
                                    'Hijau/Biru (Kyu 4 - 6)': 'bg-emerald-600',
                                    'Kuning/Putih (Kyu 7 - Minarai)': 'bg-amber-400',
                                };

                                return (
                                    <div key={category} className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                                            <span>{category}</span>
                                            <span>
                                                {count} Kenshi ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                                className={`h-full ${barColors[category] || 'bg-red-600'}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Evaluasi Kesiapan UKT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center">
                            <span className="text-3xl font-extrabold text-red-600 block">
                                {stats.ready_for_ukt_count}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 block mt-1">
                                Kenshi Siap Ujian Kenaikan Tingkat
                            </span>
                            <p className="text-[11px] text-slate-500 mt-1">
                                Berdasarkan catatan presensi latihan di atas 85% dan masa waktu minimum tingkatan.
                            </p>
                        </div>

                        <div className="text-xs space-y-2 text-slate-600">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                <span>Syarat UKT Kyu: min. 4 bulan latihan aktif</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>Syarat UKT Dan: min. 1 tahun dari Kyu 1</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dojo Member Roster */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Roster Anggota Dojo</h2>
                    <p className="text-xs text-slate-500">
                        Daftar lengkap kenshi yang berlatih di {dojo.name}.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Input
                        placeholder="Cari nama kenshi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                        className="w-full sm:w-56"
                    />
                    <div className="flex gap-2">
                        <Select
                            value={rankFilter}
                            onChange={(e) => handleRankChange(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Rank' },
                                ...ranks.map((r) => ({ value: r.value, label: r.label })),
                            ]}
                            className="flex-1 sm:w-44"
                        />
                        <Button type="submit" variant="navy">
                            Cari
                        </Button>
                    </div>
                </form>
            </div>

            {roster.data.length > 0 ? (
                <>
                    {/* Desktop & Tablet Table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kenshi</TableHead>
                                    <TableHead>Nomor Induk (KNS)</TableHead>
                                    <TableHead>Tingkatan (Rank)</TableHead>
                                    <TableHead>Tgl Bergabung</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roster.data.map((kenshi) => (
                                    <TableRow key={kenshi.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={kenshi.full_name} size="sm" />
                                                <div>
                                                    <span className="font-bold text-slate-900 block leading-tight">
                                                        {kenshi.full_name}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {kenshi.gender === 'M' ? 'Putra' : 'Putri'} · {kenshi.phone || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                {kenshi.id_card_number}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <RankBadge
                                                label={kenshi.rank.label}
                                                beltColor={kenshi.rank.belt_color}
                                                isDan={kenshi.rank.is_dan}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-slate-600">
                                                {kenshi.joined_at || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={kenshi.is_active ? 'emerald' : 'slate'} withDot>
                                                {kenshi.is_active ? 'Aktif' : 'Non-Aktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap w-14">
                                            <div className="flex items-center justify-end">
                                                <ActionMenuDropdown
                                                    title={`Aksi Kenshi ${kenshi.full_name}`}
                                                    items={[
                                                        {
                                                            label: 'Profil Lengkap',
                                                            href: `/kenshis/${kenshi.id}`,
                                                            icon: User,
                                                        },
                                                        {
                                                            label: 'Kartu Tanda Anggota (KTA)',
                                                            href: `/kenshis/${kenshi.id}`,
                                                            icon: Award,
                                                        },
                                                        {
                                                            label: 'Ubah Data Kenshi',
                                                            href: `/kenshis/${kenshi.id}/edit`,
                                                            icon: Edit3,
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="block md:hidden space-y-3">
                        {roster.data.map((kenshi) => (
                            <div
                                key={kenshi.id}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <Avatar name={kenshi.full_name} size="sm" />
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={`/kenshis/${kenshi.id}`}
                                                className="font-bold text-slate-900 text-sm block truncate hover:text-red-600 transition-colors"
                                            >
                                                {kenshi.full_name}
                                            </Link>
                                            <span className="text-[11px] font-mono text-slate-400 block">
                                                {kenshi.id_card_number}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge variant={kenshi.is_active ? 'emerald' : 'slate'} withDot>
                                            {kenshi.is_active ? 'Aktif' : 'Non-Aktif'}
                                        </Badge>
                                        <ActionMenuDropdown
                                            title={`Aksi Kenshi ${kenshi.full_name}`}
                                            items={[
                                                {
                                                    label: 'Profil Lengkap',
                                                    href: `/kenshis/${kenshi.id}`,
                                                    icon: User,
                                                },
                                                {
                                                    label: 'Kartu Tanda Anggota (KTA)',
                                                    href: `/kenshis/${kenshi.id}`,
                                                    icon: Award,
                                                },
                                                {
                                                    label: 'Ubah Data Kenshi',
                                                    href: `/kenshis/${kenshi.id}/edit`,
                                                    icon: Edit3,
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-600 mb-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Tingkatan:</span>
                                        <RankBadge
                                            label={kenshi.rank.label}
                                            beltColor={kenshi.rank.belt_color}
                                            isDan={kenshi.rank.is_dan}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Kontak:</span>
                                        <span className="text-slate-700 break-words text-right">
                                            {kenshi.phone || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <Link href={`/kenshis/${kenshi.id}`} className="flex-1">
                                        <Button variant="secondary" size="sm" className="w-full text-xs">
                                            Profil Kenshi
                                        </Button>
                                    </Link>
                                    <Link href={`/kenshis/${kenshi.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full text-xs">
                                            Ubah Biodata
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        links={roster.meta?.links || roster.links}
                        meta={roster.meta}
                        from={roster.meta?.from ?? roster.from}
                        to={roster.meta?.to ?? roster.to}
                        total={totalRosterCount}
                    />
                </>
            ) : (
                <EmptyState
                    title="Tidak Ada Kenshi Ditemukan"
                    description="Belum ada anggota yang terdaftar atau cocok dengan filter pencarian di dojo ini."
                    action={
                        <Link href="/kenshis/create">
                            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                Daftarkan Kenshi Baru
                            </Button>
                        </Link>
                    }
                />
            )}
        </AppLayout>
    );
}
