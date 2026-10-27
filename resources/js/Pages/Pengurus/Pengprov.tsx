import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Input } from '@/Components/UI/Forms/Input';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { Modal } from '@/Components/UI/Overlays/Modal';
import { Dojo, Kenshi, PengurusOrg } from '@/types';
import {
    Award,
    Building2,
    Calendar,
    ChevronRight,
    Edit3,
    FileText,
    Globe,
    Landmark,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    Shield,
    Sparkles,
    Trophy,
    User,
    UserCheck,
    Users,
} from 'lucide-react';

interface Props {
    pengprov: PengurusOrg;
    allPengprovs: PengurusOrg[];
    dojos: { data: Dojo[] } | Dojo[];
    athletes: { data: Kenshi[] } | Kenshi[];
    stats: {
        total_dojos: number;
        total_athletes: number;
        yudansha_count: number;
        mudansha_count: number;
    };
    canEdit: boolean;
}

export default function PengprovIndex({
    pengprov,
    allPengprovs,
    dojos,
    athletes,
    stats,
    canEdit,
}: Props) {
    const dojosList = Array.isArray(dojos) ? dojos : dojos.data;
    const athletesList = Array.isArray(athletes) ? athletes : athletes.data;

    const [activeTab, setActiveTab] = useState<'athletes' | 'dojos'>('athletes');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Edit form state
    const { data, setData, put, processing, errors } = useForm({
        leader_name: pengprov.leader_name || '',
        secretary_name: pengprov.secretary_name || '',
        sk_number: pengprov.sk_number || '',
        sk_period: pengprov.sk_period || '',
        contact_phone: pengprov.contact_phone || '',
        contact_email: pengprov.contact_email || '',
        address: pengprov.address || '',
        metadata: {
            motto: pengprov.metadata?.motto || '',
            target_pon: pengprov.metadata?.target_pon || '',
        },
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/pengurus/${pengprov.id}`, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const handleSwitchPengprov = (id: string) => {
        router.get('/pengprov', { id }, { preserveState: true });
    };

    const filteredAthletes = athletesList.filter(
        (a) =>
            a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.id_card_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.dojo?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDojos = dojosList.filter(
        (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.city || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title={`Pengprov PERKEMI ${pengprov.region} - Database Daerah`} />

            <PageHeading
                title={pengprov.name}
                description={`Pusat Komando & Pembinaan Tingkat Provinsi Perkemi • SK PB: ${pengprov.sk_number || 'Dalam Proses'} (${pengprov.sk_period || '2024-2028'})`}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        {allPengprovs.length > 1 && (
                            <select
                                value={pengprov.id}
                                onChange={(e) => handleSwitchPengprov(e.target.value)}
                                className="rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 py-1.5 px-3"
                            >
                                {allPengprovs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {canEdit && (
                            <Button
                                variant="outline"
                                leftIcon={<Edit3 className="w-4 h-4" />}
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                Edit Kepengurusan
                            </Button>
                        )}
                        <Link href="/kenshis/create">
                            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                Tambah Atlet Pengprov
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-purple-600">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                Atlet Pelatda Pengprov
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.total_athletes}
                            </p>
                            <p className="text-2xs text-slate-400">Atlet binaan provinsi</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-600">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                Total Dojo Se-Provinsi
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.total_dojos}
                            </p>
                            <p className="text-2xs text-slate-400">Cabang dojo terafiliasi</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                Yudansha (Dan)
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.yudansha_count}
                            </p>
                            <p className="text-2xs text-slate-400">Sabuk Hitam senior</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                Mudansha (Kyu)
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.mudansha_count}
                            </p>
                            <p className="text-2xs text-slate-400">Kyu 1 s/d Minarai</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile & Organization Info Box */}
            <Card className="mb-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white shadow-xl overflow-hidden border border-purple-800/40">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold uppercase tracking-wider">
                                <Globe className="w-3.5 h-3.5 text-purple-400" />
                                Pengurus Daerah Tingkat I Resmi
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                {pengprov.name}
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Pengurus Daerah Perkemi {pengprov.region}. Bertanggung jawab atas koordinasi Pengkab/Pengkot, standarisasi UKT sabuk nasional, seleksi atlet PON/Kejurnas, dan pembinaan persaudaraan.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-200">
                                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span><strong>Ketua Umum:</strong> {pengprov.leader_name || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span><strong>Sekretaris Umum:</strong> {pengprov.secretary_name || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span><strong>No. SK PB:</strong> {pengprov.sk_number || '-'} ({pengprov.sk_period || '-'})</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span><strong>Kontak:</strong> {pengprov.contact_phone || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200 sm:col-span-2">
                                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span><strong>Sekretariat Pengprov:</strong> {pengprov.address || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {pengprov.metadata && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 md:w-72 shrink-0 space-y-3">
                                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4" /> Visi PON & Motto
                                </div>
                                {pengprov.metadata.target_pon && (
                                    <div>
                                        <p className="text-2xs text-slate-400 uppercase font-semibold">Target PON</p>
                                        <p className="text-sm font-semibold text-white">{pengprov.metadata.target_pon}</p>
                                    </div>
                                )}
                                {pengprov.metadata.motto && (
                                    <div>
                                        <p className="text-2xs text-slate-400 uppercase font-semibold">Motto Pengprov</p>
                                        <p className="text-xs italic text-slate-200">"{pengprov.metadata.motto}"</p>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-white/10 text-2xs text-slate-400">
                                    Terhubung Akun Login: <span className="text-slate-200">{pengprov.contact_email || 'pengprov.jatim@perkemi.id'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabs & Search Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('athletes')}
                        className={`pb-2.5 px-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                            activeTab === 'athletes'
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        Daftar Atlet Pengprov ({athletesList.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('dojos')}
                        className={`pb-2.5 px-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                            activeTab === 'dojos'
                                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Cabang Dojo Se-Jawa Timur ({dojosList.length})
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari atlet, NIK, atau dojo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                </div>
            </div>

            {/* Tab 1: Athletes Table */}
            {activeTab === 'athletes' && (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-2xs">
                                <tr>
                                    <th className="py-3 px-4">Kenshi</th>
                                    <th className="py-3 px-4">Nomor KTA / NIK</th>
                                    <th className="py-3 px-4">Tingkatan Sabuk</th>
                                    <th className="py-3 px-4">Asal Dojo</th>
                                    <th className="py-3 px-4">Status Pengprov</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAthletes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            Tidak ada atlet pelatda Pengprov yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAthletes.map((athlete) => {
                                        const rankLabel = typeof athlete.rank === 'object' && athlete.rank !== null ? athlete.rank.label : String(athlete.rank || '-');
                                        return (
                                            <tr key={athlete.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {athlete.full_name}
                                                    </div>
                                                    <div className="text-2xs text-slate-400">
                                                        {athlete.gender === 'M' ? 'Putra' : 'Putri'} • {athlete.phone || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                                    {athlete.id_card_number}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={athlete.rank?.is_dan ? 'danger' : 'info'}>
                                                        {rankLabel}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                                    {athlete.dojo?.name || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                                                        <Trophy className="w-3 h-3 text-purple-500" /> Atlet Pelatda Jatim
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link
                                                        href={`/kenshis/${athlete.id}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                                                    >
                                                        Profil & KTA <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Tab 2: Dojos List */}
            {activeTab === 'dojos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDojos.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            Tidak ada dojo yang cocok dengan pencarian.
                        </div>
                    ) : (
                        filteredDojos.map((dojo) => (
                            <Card key={dojo.id} className="hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                                            {dojo.name}
                                        </CardTitle>
                                        <span className="font-mono text-2xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {dojo.code}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Sensei: {dojo.head_sensei?.name || 'Pelatih Kepala'}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{dojo.address || dojo.city || pengprov.region}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-2xs text-slate-400">
                                            Kota/Kab: {dojo.pengkab || dojo.city || 'Jawa Timur'}
                                        </span>
                                        <Link
                                            href={`/dojos/${dojo.id}`}
                                            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5"
                                        >
                                            Detail Dojo <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Perbarui Profil ${pengprov.name}`}
                description="Perbarui data kepengurusan daerah, SK PB resmi, kontak sekretariat, dan target PON."
                icon={<Building2 className="w-5 h-5 text-purple-600" />}
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Ketua Umum Pengprov"
                            required
                            value={data.leader_name}
                            onChange={(e) => setData('leader_name', e.target.value)}
                            error={errors.leader_name}
                        />
                        <Input
                            label="Sekretaris Umum"
                            value={data.secretary_name}
                            onChange={(e) => setData('secretary_name', e.target.value)}
                            error={errors.secretary_name}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Nomor SK PB Perkemi"
                            value={data.sk_number}
                            onChange={(e) => setData('sk_number', e.target.value)}
                            error={errors.sk_number}
                        />
                        <Input
                            label="Masa Periode / Bakti"
                            placeholder="Contoh: 2024 - 2028"
                            value={data.sk_period}
                            onChange={(e) => setData('sk_period', e.target.value)}
                            error={errors.sk_period}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Telepon / WhatsApp"
                            value={data.contact_phone}
                            onChange={(e) => setData('contact_phone', e.target.value)}
                            error={errors.contact_phone}
                        />
                        <Input
                            label="Email Resmi"
                            type="email"
                            value={data.contact_email}
                            onChange={(e) => setData('contact_email', e.target.value)}
                            error={errors.contact_email}
                        />
                    </div>

                    <Textarea
                        label="Alamat Sekretariat Pengprov"
                        rows={2}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        error={errors.address}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Target Prestasi PON"
                            value={data.metadata.target_pon}
                            onChange={(e) =>
                                setData('metadata', {
                                    ...data.metadata,
                                    target_pon: e.target.value,
                                })
                            }
                        />
                        <Input
                            label="Motto / Slogan Pengprov"
                            value={data.metadata.motto}
                            onChange={(e) =>
                                setData('metadata', {
                                    ...data.metadata,
                                    motto: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" loading={processing}>
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
