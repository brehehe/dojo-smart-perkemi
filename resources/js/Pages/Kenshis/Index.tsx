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
    Download,
    Edit3,
    FileSpreadsheet,
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
    isCoachOnly?: boolean;
}

export default function KenshisIndex({ kenshis, filters, dojos, ranks, pageTitle, isCoachOnly }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.roles?.includes('SuperAdmin');
    const isPengprovAdmin = auth.user?.roles?.includes('PengprovAdmin');
    const isSensei = auth.user?.roles?.includes('Sensei');
    const canKenshiCreate = Boolean(
        auth.user?.can?.kenshi_create ?? (isSuperAdmin || isPengprovAdmin || isSensei)
    );

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [rankFilter, setRankFilter] = useState(filters.rank || '');
    const [memberTypeFilter, setMemberTypeFilter] = useState(filters.member_type || (isCoachOnly ? 'coach' : ''));
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
    const coachCount = kenshis.data.filter((k) => k.member_type === 'coach').length;
    const yudanshaCount = kenshis.data.filter((k) => k.rank?.is_dan).length;

    return (
        <AppLayout>
            <Head title={pageTitle ? `${pageTitle} - Perkemi` : "Direktori Kenshi & Pelatih - Perkemi"} />

            <PageHeading
                title={pageTitle || "Pangkalan Data Kenshi & Pelatih"}
                description={
                    isCoachOnly
                        ? "Direktori resmi pelatih, instruktur Yudansha, dan Sensei Dojo PB Perkemi se-Indonesia."
                        : "Registrasi kenshi dan pelatih terpusat nasional, pencatatan tingkatan (Kyu/Dan), import/export Excel, dan akun KTA digital."
                }
                actions={
                    <ActionMenuDropdown
                        triggerLabel="Kelola & Aksi Pangkalan"
                        size="md"
                        align="right"
                        buttonClassName="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
                        items={[
                            {
                                label: 'Registrasi Anggota Baru',
                                icon: Plus,
                                href: '/kenshis/create',
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

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatsCard
                    title="Total Anggota Terdaftar"
                    value={totalCount}
                    description="Kenshi & Pelatih terverifikasi di pangkalan data"
                    icon={<Users className="w-5 h-5 text-red-600" />}
                />
                <StatsCard
                    title="Pelatih & Sensei Dojo"
                    value={coachCount}
                    description="Instruktur bersertifikasi dan kepala dojo"
                    icon={<Award className="w-5 h-5 text-amber-500" />}
                />
                <StatsCard
                    title="Pemegang Sabuk Hitam (Yudansha)"
                    value={yudanshaCount}
                    description="Tingkatan I Dan hingga V Dan aktif"
                    icon={<Shield className="w-5 h-5 text-indigo-600" />}
                />
            </div>

            {/* Search & Filter Bar */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 mb-5 sm:mb-6 shadow-xs">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nama kenshi/pelatih, nomor induk (NIK), atau telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full sm:w-52">
                        <SelectSearch
                            value={memberTypeFilter}
                            onChange={(val) => handleMemberTypeChange(val)}
                            options={[
                                { value: '', label: 'Semua Kategori' },
                                { value: 'athlete', label: 'Atlet / Kenshi' },
                                { value: 'coach', label: 'Pelatih / Sensei' },
                            ]}
                            placeholder="Semua Kategori"
                            searchPlaceholder="Cari kategori..."
                        />
                    </div>
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

            {/* Kenshi Display: Desktop Table + Mobile Cards */}
            {kenshis.data.length > 0 ? (
                <>
                    {/* Desktop & Tablet Table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kenshi / Pelatih</TableHead>
                                    <TableHead>Nomor Induk (NIK)</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Dojo Asal</TableHead>
                                    <TableHead>Tingkatan (Rank)</TableHead>
                                    <TableHead>Akun Login</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kenshis.data.map((kenshi) => (
                                    <TableRow key={kenshi.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar name={kenshi.full_name} size="sm" />
                                                <div>
                                                    <Link
                                                        href={`/kenshis/${kenshi.id}`}
                                                        className="font-bold text-slate-900 block leading-tight hover:text-red-600 transition-colors"
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
                                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                {kenshi.id_card_number}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <Badge
                                                    variant={kenshi.member_type === 'coach' ? 'amber' : 'slate'}
                                                    className="text-[11px]"
                                                >
                                                    {kenshi.member_type === 'coach' ? 'Pelatih' : 'Atlet'}
                                                </Badge>
                                                {kenshi.is_atlet_pengkot && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                                                        Pengkot {kenshi.pengkot ? `(${kenshi.pengkot})` : ''}
                                                    </span>
                                                )}
                                                {kenshi.is_atlet_pengprov && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                                                        Pengprov {kenshi.pengprov ? `(${kenshi.pengprov})` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">
                                                <span className="font-medium text-slate-800 block">
                                                    {kenshi.dojo?.name || '-'}
                                                </span>
                                                <span className="text-slate-500">{kenshi.dojo?.pengprov}</span>
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
                                            <div className="text-xs font-mono text-slate-600">
                                                {kenshi.user?.email ? (
                                                    <span className="text-emerald-700 font-medium">
                                                        {kenshi.user.email}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Belum ada akun</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={kenshi.is_active ? 'emerald' : 'slate'}
                                                withDot
                                            >
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
                                                            show: canKenshiCreate,
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

                    {/* Mobile Cards */}
                    <div className="block md:hidden space-y-3">
                        {kenshis.data.map((kenshi) => (
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
                                                className="font-bold text-slate-900 text-sm block truncate hover:text-red-600 transition-colors"
                                            >
                                                {kenshi.full_name}
                                            </Link>
                                            <span className="text-[11px] font-mono text-slate-500 block">
                                                {kenshi.id_card_number}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge
                                            variant={kenshi.member_type === 'coach' ? 'amber' : 'slate'}
                                            className="text-[11px]"
                                        >
                                            {kenshi.member_type === 'coach' ? 'Pelatih' : 'Atlet'}
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
                                                    show: canKenshiCreate,
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
                                        <span className="text-slate-400">Dojo:</span>
                                        <span className="font-medium text-slate-800 break-words text-right">
                                            {kenshi.dojo?.name || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <Link href={`/kenshis/${kenshi.id}`} className="flex-1">
                                        <Button variant="secondary" size="sm" className="w-full text-xs">
                                            Profil Kenshi
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
                        ))}
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
                    title="Tidak Ada Kenshi Ditemukan"
                    description="Belum ada data kenshi atau pelatih yang sesuai dengan pencarian Anda. Daftarkan baru atau gunakan fitur impor berkas Excel."
                    action={
                        canKenshiCreate ? (
                            <Link href="/kenshis/create">
                                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                    Registrasi Kenshi Baru
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
