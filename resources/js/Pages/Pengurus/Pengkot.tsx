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
    pengkot: PengurusOrg;
    allPengkots: PengurusOrg[];
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

export default function PengkotIndex({
    pengkot,
    allPengkots,
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
        leader_name: pengkot.leader_name || '',
        secretary_name: pengkot.secretary_name || '',
        sk_number: pengkot.sk_number || '',
        sk_period: pengkot.sk_period || '',
        contact_phone: pengkot.contact_phone || '',
        contact_email: pengkot.contact_email || '',
        address: pengkot.address || '',
        metadata: {
            motto: pengkot.metadata?.motto || '',
            target_porprov: pengkot.metadata?.target_porprov || '',
        },
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/pengurus/${pengkot.id}`, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const handleSwitchPengkot = (id: string) => {
        router.get('/pengkot', { id }, { preserveState: true });
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
            d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title={`Pengkot PERKEMI ${pengkot.region} - Database & Organisasi`} />

            <PageHeading
                title={pengkot.name}
                description={`Pangkalan Data Resmi Pengurus Kota/Kabupaten Perkemi • SK: ${pengkot.sk_number || 'Dalam Proses'} (${pengkot.sk_period || '2024-2028'})`}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        {allPengkots.length > 1 && (
                            <select
                                value={pengkot.id}
                                onChange={(e) => handleSwitchPengkot(e.target.value)}
                                className="rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 py-1.5 px-3"
                            >
                                {allPengkots.map((p) => (
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
                                Tambah Atlet Pengkot
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                                Atlet Prestasi Pengkot
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.total_athletes}
                            </p>
                            <p className="text-2xs text-slate-400">Atlet binaan kota</p>
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
                                Dojo Cabang
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stats.total_dojos}
                            </p>
                            <p className="text-2xs text-slate-400">Terdaftar di wilayah kota</p>
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
            <Card className="mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl overflow-hidden border border-slate-700/80">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-semibold uppercase tracking-wider">
                                <Landmark className="w-3.5 h-3.5 text-red-400" />
                                Pengurus Kota / Kabupaten Resmi
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                {pengkot.name}
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Wilayah kerja pembinaan atlet Shorinji Kempo cabang {pengkot.region}. Berorientasi pada pembinaan karakter Bushido, sport science, dan prestasi kejuaraan multievent.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-200">
                                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span><strong>Ketua Umum:</strong> {pengkot.leader_name || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <User className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span><strong>Sekretaris:</strong> {pengkot.secretary_name || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span><strong>No. SK:</strong> {pengkot.sk_number || '-'} ({pengkot.sk_period || '-'})</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200">
                                    <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span><strong>Kontak:</strong> {pengkot.contact_phone || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-200 sm:col-span-2">
                                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span><strong>Sekretariat:</strong> {pengkot.address || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {pengkot.metadata && (
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 md:w-72 shrink-0 space-y-3">
                                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4" /> Target & Slogan
                                </div>
                                {pengkot.metadata.target_porprov && (
                                    <div>
                                        <p className="text-2xs text-slate-400 uppercase font-semibold">Target Prestasi</p>
                                        <p className="text-sm font-semibold text-white">{pengkot.metadata.target_porprov}</p>
                                    </div>
                                )}
                                {pengkot.metadata.motto && (
                                    <div>
                                        <p className="text-2xs text-slate-400 uppercase font-semibold">Motto Daerah</p>
                                        <p className="text-xs italic text-slate-200">"{pengkot.metadata.motto}"</p>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-white/10 text-2xs text-slate-400">
                                    Terhubung Akun Login: <span className="text-slate-200">{pengkot.contact_email || 'pengkot.surabaya@perkemi.id'}</span>
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
                                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        Daftar Atlet Pengkot ({athletesList.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('dojos')}
                        className={`pb-2.5 px-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                            activeTab === 'dojos'
                                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Cabang Dojo Surabaya ({dojosList.length})
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
                                    <th className="py-3 px-4">Status Pengkot</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAthletes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            Tidak ada atlet prestasi Pengkot yang cocok dengan pencarian.
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
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                                                        <Trophy className="w-3 h-3 text-rose-500" /> Atlet Pengkot
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link
                                                        href={`/kenshis/${athlete.id}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
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
                            <Card key={dojo.id} className="hover:border-red-400 dark:hover:border-red-600 transition-colors">
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
                                        <span className="line-clamp-2">{dojo.address || dojo.city || 'Kota Surabaya'}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-2xs text-slate-400">
                                            Wilayah: {dojo.pengkab || dojo.city || pengkot.region}
                                        </span>
                                        <Link
                                            href={`/dojos/${dojo.id}`}
                                            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5"
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
                title={`Perbarui Profil ${pengkot.name}`}
                description="Perbarui data kepengurusan, SK resmi, kontak sekretariat, dan target daerah."
                icon={<Landmark className="w-5 h-5 text-red-600" />}
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Ketua Umum / Sensei"
                            required
                            value={data.leader_name}
                            onChange={(e) => setData('leader_name', e.target.value)}
                            error={errors.leader_name}
                        />
                        <Input
                            label="Sekretaris Pengkot"
                            value={data.secretary_name}
                            onChange={(e) => setData('secretary_name', e.target.value)}
                            error={errors.secretary_name}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Nomor SK Pengurus"
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
                        label="Alamat Sekretariat Pengkot"
                        rows={2}
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        error={errors.address}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Target Prestasi / Porprov"
                            value={data.metadata.target_porprov}
                            onChange={(e) =>
                                setData('metadata', {
                                    ...data.metadata,
                                    target_porprov: e.target.value,
                                })
                            }
                        />
                        <Input
                            label="Motto / Slogan Pengkot"
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
