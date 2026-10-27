import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Dojo, PaginatedData, PageProps } from '@/types';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { StatsCard } from '@/Components/UI/DataDisplay/StatsCard';
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
import { Building2, Edit3, Plus, Search, ShieldCheck, Users, MapPin } from 'lucide-react';


interface Props {
    dojos: PaginatedData<Dojo>;
    filters: {
        search?: string;
        status?: string;
        pengprov?: string;
    };
}

export default function DojosIndex({ dojos, filters }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.roles?.includes('SuperAdmin');
    const isPengprovAdmin = auth.user?.roles?.includes('PengprovAdmin');
    const canCreateDojo = Boolean(auth.user?.can?.dojo_create ?? (isSuperAdmin || isPengprovAdmin));

    const canEditDojo = (dojoItem: Dojo) => Boolean(
        isSuperAdmin ||
        isPengprovAdmin ||
        (auth.user?.roles?.includes('Sensei') && dojoItem.head_sensei?.id === auth.user?.id)
    );

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/dojos',
            { search: searchTerm, status: statusFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        router.get(
            '/dojos',
            { search: searchTerm, status: val },
            { preserveState: true, replace: true }
        );
    };

    const totalDojos = dojos.meta?.total ?? dojos.total ?? dojos.data.length;
    const activeDojos = dojos.data.filter((d) => d.status.value === 'active').length;

    return (
        <AppLayout>
            <Head title="Manajemen Dojo - Perkemi" />

            <PageHeading
                title="Daftar Dojo Perkemi"
                description="Kelola cabang tempat latihan, instruktur kepala (Sensei), dan sebaran wilayah pengprov Shorinji Kempo se-Indonesia."
                actions={
                    canCreateDojo ? (
                        <Link href="/dojos/create">
                            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                Tambah Dojo Baru
                            </Button>
                        </Link>
                    ) : undefined
                }
            />

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatsCard
                    title="Total Dojo Terdaftar"
                    value={totalDojos}
                    description="Cabang aktif di seluruh Pengprov"
                    icon={<Building2 className="w-5 h-5 text-red-600" />}
                />
                <StatsCard
                    title="Dojo Aktif"
                    value={activeDojos}
                    description="Melaksanakan latihan rutin mingguan"
                    icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
                />
                <StatsCard
                    title="Sebaran Pengprov"
                    value="34"
                    description="Provinsi dengan kepengurusan resmi"
                    icon={<MapPin className="w-5 h-5 text-sky-600" />}
                />
                <StatsCard
                    title="Total Kenshi Aktif"
                    value="1.420"
                    description="Anggota terdata di pangkalan data"
                    icon={<Users className="w-5 h-5 text-amber-600" />}
                />
            </div>

            {/* Filter & Search Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 mb-5 sm:mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari kode, nama dojo, atau kota/kabupaten..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            options={[
                                { value: '', label: 'Semua Status' },
                                { value: 'active', label: 'Aktif' },
                                { value: 'inactive', label: 'Non-Aktif' },
                                { value: 'suspended', label: 'Ditangguhkan' },
                            ]}
                        />
                    </div>
                    <Button type="submit" variant="navy" className="w-full sm:w-auto">
                        Terapkan Filter
                    </Button>
                </form>
            </div>

            {/* Data Display: Desktop Table + Mobile Cards */}
            {dojos.data.length > 0 ? (
                <>
                    {/* Desktop & Tablet Table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode & Nama Dojo</TableHead>
                                    <TableHead>Wilayah / Pengprov</TableHead>
                                    <TableHead>Sensei Pembina</TableHead>
                                    <TableHead>Jumlah Kenshi</TableHead>
                                    <TableHead>Radius & Peta</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dojos.data.map((dojo) => (
                                    <TableRow key={dojo.id}>
                                        <TableCell>
                                            <div>
                                                <Link
                                                    href={`/dojos/${dojo.id}`}
                                                    className="font-bold text-slate-900 block hover:text-red-600 transition-colors"
                                                >
                                                    {dojo.name}
                                                </Link>
                                                <span className="text-xs font-mono text-slate-500">
                                                    {dojo.code}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                <span className="font-medium text-slate-800 block">
                                                    {dojo.pengprov}
                                                </span>
                                                <span className="text-slate-500">{dojo.pengkab}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-slate-700 font-medium">
                                                {dojo.head_sensei?.name || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                {dojo.kenshis_count ?? 0} Kenshi
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                                    {dojo.radius_meters ?? 150}m
                                                </span>
                                                {dojo.latitude && dojo.longitude ? (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${dojo.latitude},${dojo.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 hover:underline"
                                                    >
                                                        <MapPin className="w-3 h-3 text-red-500" />
                                                        Peta Absensi
                                                    </a>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">Belum diset</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    dojo.status.value === 'active'
                                                        ? 'emerald'
                                                        : dojo.status.value === 'suspended'
                                                        ? 'rose'
                                                        : 'slate'
                                                }
                                                withDot
                                            >
                                                {dojo.status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap w-14">
                                            <div className="flex items-center justify-end">
                                                <ActionMenuDropdown
                                                    title={`Aksi Cabang ${dojo.name}`}
                                                    items={[
                                                        {
                                                            label: 'Profil Cabang Dojo',
                                                            href: `/dojos/${dojo.id}`,
                                                            icon: Building2,
                                                        },
                                                        {
                                                            label: 'Panel & Roster Kenshi',
                                                            href: `/dojos/${dojo.id}/analytics`,
                                                            icon: Users,
                                                        },
                                                        {
                                                            label: 'Ubah Data Cabang',
                                                            href: `/dojos/${dojo.id}/edit`,
                                                            icon: Edit3,
                                                            show: canEditDojo(dojo),
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
                        {dojos.data.map((dojo) => (
                            <div
                                key={dojo.id}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/dojos/${dojo.id}`}
                                            className="font-bold text-slate-900 text-sm hover:text-red-600 transition-colors block break-words"
                                        >
                                            {dojo.name}
                                        </Link>
                                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                                            {dojo.code}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge
                                            variant={
                                                dojo.status.value === 'active'
                                                    ? 'emerald'
                                                    : dojo.status.value === 'suspended'
                                                    ? 'rose'
                                                    : 'slate'
                                            }
                                            withDot
                                        >
                                            {dojo.status.label}
                                        </Badge>
                                        <ActionMenuDropdown
                                            title={`Aksi Cabang ${dojo.name}`}
                                            items={[
                                                {
                                                    label: 'Profil Cabang Dojo',
                                                    href: `/dojos/${dojo.id}`,
                                                    icon: Building2,
                                                },
                                                {
                                                    label: 'Panel & Roster Kenshi',
                                                    href: `/dojos/${dojo.id}/analytics`,
                                                    icon: Users,
                                                },
                                                {
                                                    label: 'Ubah Data Cabang',
                                                    href: `/dojos/${dojo.id}/edit`,
                                                    icon: Edit3,
                                                    show: canEditDojo(dojo),
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-600 mb-3 pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Wilayah:</span>
                                        <span className="font-medium text-slate-800 break-words text-right">
                                            {dojo.pengprov} • {dojo.pengkab}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Sensei:</span>
                                        <span className="font-medium text-slate-800 break-words text-right">
                                            {dojo.head_sensei?.name || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Kenshi:</span>
                                        <span className="font-bold text-red-600">
                                            {dojo.kenshis_count ?? 0} Kenshi
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <Link href={`/dojos/${dojo.id}`} className="flex-1">
                                        <Button variant="secondary" size="sm" className="w-full text-xs">
                                            Profil Dojo
                                        </Button>
                                    </Link>
                                    <Link href={`/dojos/${dojo.id}/analytics`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full text-xs">
                                            Roster Kenshi
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        links={dojos.meta?.links || dojos.links}
                        meta={dojos.meta}
                        from={dojos.meta?.from ?? dojos.from}
                        to={dojos.meta?.to ?? dojos.to}
                        total={dojos.meta?.total ?? dojos.total}
                    />
                </>
            ) : (
                <EmptyState
                    title="Tidak Ada Dojo Ditemukan"
                    description="Belum ada dojo yang sesuai dengan kriteria pencarian Anda. Silakan ubah filter atau tambahkan dojo baru."
                    action={
                        canCreateDojo ? (
                            <Link href="/dojos/create">
                                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                    Tambah Dojo Baru
                                </Button>
                            </Link>
                        ) : undefined
                    }
                />
            )}
        </AppLayout>
    );
}
