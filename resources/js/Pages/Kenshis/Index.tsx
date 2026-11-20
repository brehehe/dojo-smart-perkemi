import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Dojo, Kenshi, PaginatedData, PageProps } from '@/types';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { SelectSearch } from '@/Components/UI/Forms/SelectSearch';
import { Modal } from '@/Components/UI/Overlays/Modal';
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
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import {
    Award,
    CheckCircle2,
    Download,
    Edit3,
    FileSpreadsheet,
    GraduationCap,
    Plus,
    Search,
    Shield,
    Upload,
    User,
    Users,
    X,
} from 'lucide-react';


interface Props {
    kenshis: PaginatedData<Kenshi>;
    filters: {
        search?: string;
        rank?: string;
        dojo_id?: string;
        member_type?: string;
    };
    dojos?: Dojo[];
    ranks: Array<{ value: string; label: string }>;
    pageTitle?: string;
    pageSubtitle?: string;
    isCoachOnly?: boolean;
    stats?: {
        total_kenshi: number;
        total_coach: number;
        active_count: number;
        total_yudansha: number;
    };
}

export default function KenshisIndex({ kenshis, filters, dojos, ranks, pageTitle, pageSubtitle, isCoachOnly, stats }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.roles?.includes('SuperAdmin');
    const isPengprovAdmin = auth.user?.roles?.includes('PengprovAdmin');
    const isSensei = auth.user?.roles?.includes('Sensei');
    const canKenshiCreate = Boolean(
        auth.user?.can?.kenshi_create ?? (isSuperAdmin || isPengprovAdmin || isSensei)
    );

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [rankFilter, setRankFilter] = useState(filters.rank || '');
    const [memberTypeFilter, setMemberTypeFilter] = useState(filters.member_type || (isCoachOnly ? 'coach' : 'athlete'));
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const basePath = isCoachOnly ? '/coaches' : '/kenshis';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            basePath,
            { search: searchTerm, rank: rankFilter, member_type: memberTypeFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleRankChange = (val: string) => {
        setRankFilter(val);
        router.get(
            basePath,
            { search: searchTerm, rank: val, member_type: memberTypeFilter },
            { preserveState: true, replace: true }
        );
    };

    const handleMemberTypeChange = (val: string) => {
        setMemberTypeFilter(val);
        router.get(
            basePath,
            { search: searchTerm, rank: rankFilter, member_type: val },
            { preserveState: true, replace: true }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        router.post('/kenshis/import', formData, {
            forceFormData: true,
            onFinish: () => {
                setIsImporting(false);
                setIsImportModalOpen(false);
                setSelectedFile(null);
            },
        });
    };

    const exportUrl = `/kenshis/export?${new URLSearchParams({
        search: searchTerm,
        rank: rankFilter,
        member_type: memberTypeFilter,
    }).toString()}`;

    const totalCount = kenshis.meta?.total ?? kenshis.total ?? kenshis.data.length;
    const yudanshaCount = kenshis.data.filter((k) => k.rank?.is_dan).length;

    return (
        <AppLayout>
            <Head title={pageTitle ? `${pageTitle} - Perkemi` : (isCoachOnly ? "Pangkalan Data Pelatih & Sensei - Perkemi" : "Pangkalan Data Kenshi - Perkemi")} />

            <PageHeading
                title={pageTitle || (isCoachOnly ? "Pangkalan Data Pelatih & Sensei" : "Pangkalan Data Kenshi")}
                description={
                    pageSubtitle || (isCoachOnly
                        ? "Direktori resmi pelatih, instruktur Yudansha, dan Sensei Dojo PB Perkemi se-Indonesia."
                        : "Registrasi dan direktori kenshi atlet terpusat nasional, pencatatan tingkatan (Kyu/Dan), import/export Excel, dan KTA digital.")
                }
                actions={
                    <ActionMenuDropdown
                        triggerLabel={isCoachOnly ? "Kelola & Aksi Pelatih" : "Kelola & Aksi Kenshi"}
                        size="md"
                        align="right"
                        buttonClassName="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
                        items={[
                            {
                                label: isCoachOnly ? 'Registrasi Pelatih Baru' : 'Registrasi Kenshi Baru',
                                icon: Plus,
                                href: isCoachOnly ? '/kenshis/create?type=coach' : '/kenshis/create',
                                show: canKenshiCreate,
                            },
                            {
                                label: 'Impor Data Excel / CSV',
                                icon: Upload,
                                onClick: () => setIsImportModalOpen(true),
                                show: canKenshiCreate,
                            },
                            {
                                label: 'Unduh Rekap Excel / CSV',
                                icon: Download,
                                onClick: () => {
                                    window.location.href = exportUrl;
                                },
                            },
                        ]}
                    />
                }
            />

            {/* Dedicated Mode / Role Tabs (Kenshi vs Pelatih) */}
            <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
                <Link
                    href="/kenshis"
                    className={cn(
                        'px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer',
                        !isCoachOnly
                            ? 'border-[#102B40] text-[#102B40]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                >
                    <Users className="w-4 h-4" />
                    <span>Anggota & Atlet Kenshi</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {stats?.total_kenshi ?? (isCoachOnly ? 0 : totalCount)}
                    </span>
                </Link>
                <Link
                    href="/coaches"
                    className={cn(
                        'px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer',
                        isCoachOnly
                            ? 'border-[#102B40] text-[#102B40]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    )}
                >
                    <GraduationCap className="w-4 h-4" />
                    <span>Pelatih & Sensei Dojo</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {stats?.total_coach ?? (isCoachOnly ? totalCount : 0)}
                    </span>
                </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatsCard
                    title={isCoachOnly ? "Total Pelatih & Sensei" : "Total Anggota Kenshi"}
                    value={isCoachOnly ? (stats?.total_coach ?? totalCount) : (stats?.total_kenshi ?? totalCount)}
                    description={isCoachOnly ? "Instruktur dan Sensei terdaftar nasional" : "Kenshi & atlet terverifikasi di pangkalan data"}
                    icon={isCoachOnly ? <GraduationCap className="w-5 h-5 text-amber-600" /> : <Users className="w-5 h-5 text-red-600" />}
                />
                <StatsCard
                    title={isCoachOnly ? "Pelatih Aktif Dojo" : "Kenshi Aktif Berlatih"}
                    value={stats?.active_count ?? totalCount}
                    description={isCoachOnly ? "Aktif membina latihan dojo cabang" : "Keanggotaan aktif semester berjalan"}
                    icon={<Award className="w-5 h-5 text-emerald-600" />}
                />
                <StatsCard
                    title={isCoachOnly ? "Sensei Yudansha" : "Pemegang Sabuk Hitam (Yudansha)"}
                    value={stats?.total_yudansha ?? yudanshaCount}
                    description={isCoachOnly ? "Instruktur tingkatan I Dan ke atas" : "Atlet tingkatan I Dan hingga V Dan"}
                    icon={<Shield className="w-5 h-5 text-[#102B40]" />}
                />
            </div>

            {/* Search & Filter Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 mb-5 sm:mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder={isCoachOnly ? "Cari nama pelatih, nomor induk (NIK), atau telepon..." : "Cari nama kenshi/atlet, nomor induk (NIK), atau telepon..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    {!isCoachOnly && (
                        <div className="w-full sm:w-52">
                            <SelectSearch
                                value={memberTypeFilter}
                                onChange={(val) => handleMemberTypeChange(val)}
                                options={[
                                    { value: 'athlete', label: 'Semua Kenshi & Atlet' },
                                    { value: 'all', label: 'Semua Status Anggota' },
                                ]}
                                placeholder="Status Kenshi"
                                searchPlaceholder="Cari status..."
                            />
                        </div>
                    )}
                    <div className="w-full sm:w-56">
                        <SelectSearch
                            value={rankFilter}
                            onChange={(val) => handleRankChange(val)}
                            options={[
                                { value: '', label: 'Semua Tingkatan Rank' },
                                ...ranks.map((r) => ({ value: r.value, label: r.label })),
                            ]}
                            placeholder="Semua Tingkatan Rank"
                            searchPlaceholder="Cari tingkatan / Dan / Kyu..."
                        />
                    </div>
                    <Button type="submit" variant="navy" className="w-full sm:w-auto">
                        Terapkan
                    </Button>
                </form>
            </div>

            {/* Kenshi / Coach Display: Desktop Table + Mobile Cards */}
            {kenshis.data.length > 0 ? (
                <>
                    {/* Desktop & Tablet Table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{isCoachOnly ? 'Pelatih & Sensei' : 'Kenshi / Atlet'}</TableHead>
                                    <TableHead>Nomor Induk (NIK)</TableHead>
                                    <TableHead>{isCoachOnly ? 'Penugasan Pelatih' : 'Peran & Wilayah'}</TableHead>
                                    <TableHead>Dojo Asal</TableHead>
                                    <TableHead>Tingkatan (Rank)</TableHead>
                                    <TableHead>Akun Login</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kenshis.data.map((kenshi) => {
                                    const isCoach = kenshi.member_type === 'coach';
                                    const roleTitle = isCoach
                                        ? 'Pelatih & Sensei Dojo'
                                        : kenshi.is_atlet_pengprov && kenshi.is_atlet_pengkot
                                          ? 'Atlet Puslatda & Puslatcab'
                                          : kenshi.is_atlet_pengprov
                                            ? 'Atlet Pengprov'
                                            : kenshi.is_atlet_pengkot
                                              ? 'Atlet Pengkot'
                                              : 'Anggota Kenshi';

                                    const roleSubtitle = isCoach
                                        ? (kenshi.dojo?.name || 'Instruktur PB Perkemi')
                                        : kenshi.is_atlet_pengprov && kenshi.is_atlet_pengkot
                                          ? `${kenshi.pengprov || 'Pengprov'} · ${kenshi.pengkot || 'Pengkot'}`
                                          : kenshi.is_atlet_pengprov
                                            ? (kenshi.pengprov || 'Jawa Timur')
                                            : kenshi.is_atlet_pengkot
                                              ? (kenshi.pengkot || 'Kota Surabaya')
                                              : (kenshi.dojo?.name || 'Dojo Cabang');

                                    return (
                                        <TableRow key={kenshi.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={kenshi.full_name} size="sm" />
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/kenshis/${kenshi.id}`}
                                                            className="font-bold text-slate-900 block leading-tight hover:text-[#C51C2A] transition-colors truncate max-w-[200px]"
                                                        >
                                                            {kenshi.full_name}
                                                        </Link>
                                                        <span className="text-xs text-slate-500">
                                                            {kenshi.gender === 'M' ? 'Putra' : 'Putri'}
                                                            {kenshi.blood_type ? ` · Gol. ${kenshi.blood_type}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                                                    {kenshi.id_card_number}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <span className="font-semibold text-slate-800 block">
                                                        {roleTitle}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {roleSubtitle}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <span className="font-medium text-slate-800 block truncate max-w-[180px]">
                                                        {kenshi.dojo?.name || '-'}
                                                    </span>
                                                    <span className="text-slate-500">{kenshi.dojo?.pengprov || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <RankBadge
                                                    label={kenshi.rank.label}
                                                    beltColor={kenshi.rank.belt_color}
                                                    isDan={kenshi.rank.is_dan}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {kenshi.user?.email ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        <span className="truncate max-w-[140px]" title={kenshi.user.email}>
                                                            {kenshi.user.email}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Belum terhubung</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                                    <span className={cn('w-2 h-2 rounded-full', kenshi.is_active ? 'bg-emerald-500' : 'bg-slate-400')} />
                                                    <span className={kenshi.is_active ? 'text-emerald-700' : 'text-slate-500'}>
                                                        {kenshi.is_active ? 'Aktif' : 'Non-Aktif'}
                                                    </span>
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap w-14">
                                                <div className="flex items-center justify-end">
                                                    <ActionMenuDropdown
                                                        title={`Aksi ${kenshi.full_name}`}
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
                                                                label: 'Ubah Data',
                                                                href: `/kenshis/${kenshi.id}/edit`,
                                                                icon: Edit3,
                                                                show: canKenshiCreate,
                                                            },
                                                        ]}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block md:hidden space-y-3">
                        {kenshis.data.map((kenshi) => {
                            const isCoach = kenshi.member_type === 'coach';
                            const roleTitle = isCoach
                                ? 'Pelatih & Sensei Dojo'
                                : kenshi.is_atlet_pengprov && kenshi.is_atlet_pengkot
                                  ? 'Atlet Puslatda & Puslatcab'
                                  : kenshi.is_atlet_pengprov
                                    ? 'Atlet Pengprov'
                                    : kenshi.is_atlet_pengkot
                                      ? 'Atlet Pengkot'
                                      : 'Anggota Kenshi';

                            return (
                                <div
                                    key={kenshi.id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                                >
                                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <Avatar name={kenshi.full_name} size="sm" />
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/kenshis/${kenshi.id}`}
                                                    className="font-bold text-slate-900 text-sm block truncate hover:text-[#C51C2A] transition-colors"
                                                >
                                                    {kenshi.full_name}
                                                </Link>
                                                <span className="text-[11px] font-mono text-slate-500 block">
                                                    {kenshi.id_card_number}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <ActionMenuDropdown
                                                title={`Aksi ${kenshi.full_name}`}
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
                                                        label: 'Ubah Data',
                                                        href: `/kenshis/${kenshi.id}/edit`,
                                                        icon: Edit3,
                                                        show: canKenshiCreate,
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-slate-600 mb-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Peran:</span>
                                            <span className="font-semibold text-slate-800">{roleTitle}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Tingkatan:</span>
                                            <RankBadge
                                                label={kenshi.rank.label}
                                                beltColor={kenshi.rank.belt_color}
                                                isDan={kenshi.rank.is_dan}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Dojo:</span>
                                            <span className="font-medium text-slate-800 break-words text-right">
                                                {kenshi.dojo?.name || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <Link href={`/kenshis/${kenshi.id}`} className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full text-xs">
                                                Lihat Profil
                                            </Button>
                                        </Link>
                                        {canKenshiCreate && (
                                            <Link href={`/kenshis/${kenshi.id}/edit`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full text-xs">
                                                    Edit Biodata
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination
                        links={kenshis.meta?.links || kenshis.links}
                        meta={kenshis.meta}
                        from={kenshis.meta?.from ?? kenshis.from}
                        to={kenshis.meta?.to ?? kenshis.to}
                        total={kenshis.meta?.total ?? kenshis.total}
                    />
                </>
            ) : (
                <EmptyState
                    title={isCoachOnly ? "Tidak Ada Pelatih Ditemukan" : "Tidak Ada Kenshi Ditemukan"}
                    description={isCoachOnly ? "Belum ada data pelatih atau Sensei yang sesuai dengan filter pencarian Anda." : "Belum ada data kenshi atau atlet yang sesuai dengan filter pencarian Anda. Daftarkan baru atau gunakan fitur impor berkas Excel."}
                    action={
                        canKenshiCreate ? (
                            <Link href={isCoachOnly ? "/kenshis/create?type=coach" : "/kenshis/create"}>
                                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                    {isCoachOnly ? "Registrasi Pelatih Baru" : "Registrasi Kenshi Baru"}
                                </Button>
                            </Link>
                        ) : undefined
                    }
                />
            )}

            {/* Modal Impor Excel */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Impor Data Kenshi & Pelatih"
                description="Unggah berkas CSV atau Excel pangkalan kenshi."
                icon={<FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                size="lg"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <a
                            href="/kenshis/export-template"
                            download
                            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Unduh Format Template CSV
                        </a>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsImportModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                disabled={!selectedFile || isImporting}
                                isLoading={isImporting}
                                onClick={(e) => {
                                    const form = document.getElementById('import-kenshi-form') as HTMLFormElement;
                                    if (form) form.requestSubmit();
                                }}
                            >
                                Mulai Impor Data
                            </Button>
                        </div>
                    </div>
                }
            >
                <form id="import-kenshi-form" onSubmit={submitImport} className="space-y-4">
                    {/* Info Note on NIK Password */}
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-amber-600" />
                            Ketentuan Otomatis Akun Login
                        </p>
                        <p className="text-amber-800 leading-relaxed">
                            Setiap baris yang berhasil diimpor akan otomatis dibuatkan akun login User dengan
                            <strong> Password default = NIK (Nomor Induk Kenshi)</strong>.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Pilih Berkas Spreadsheet (.csv, .xlsx, .xls)
                        </label>
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls, .txt"
                            onChange={handleFileChange}
                            required
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-lg p-2"
                        />
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
