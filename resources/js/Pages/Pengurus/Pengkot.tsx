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
                                className="rounded-lg border-[#E8EBEF] text-xs sm:text-sm bg-white text-[#17202D] py-1.5 px-3 focus:border-[#102B40] focus:ring-1 focus:ring-[#102B40]"
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

            {/* 4 Top Metric Cards (Responsive Grid: 2 cols on mobile, 4 cols on desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6">
                {/* Card 1: Atlet Prestasi */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#C51C2A] shrink-0">
                            <Trophy className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xs font-medium text-[#718092] block">Atlet Prestasi Pengkot</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                {stats.total_athletes}
                            </span>
                            <span className="text-[11px] font-bold text-[#16865C] flex items-center">
                                Bina Kota
                            </span>
                        </div>
                        <span className="text-[11px] text-[#718092] block mt-1">
                            Atlet binaan kota/kabupaten
                        </span>
                    </div>
                </div>

                {/* Card 2: Total Cabang Dojo */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xs font-medium text-[#718092] block">Dojo Cabang Se-Kota</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                {stats.total_dojos}
                            </span>
                            <span className="text-[11px] font-bold text-[#16865C] flex items-center">
                                Terdaftar
                            </span>
                        </div>
                        <span className="text-[11px] text-[#718092] block mt-1">
                            Cabang dojo di wilayah kota
                        </span>
                    </div>
                </div>

                {/* Card 3: Yudansha */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xs font-medium text-[#718092] block">Yudansha (Dan)</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                {stats.yudansha_count}
                            </span>
                            <span className="text-[11px] font-bold text-amber-600 flex items-center">
                                Sabuk Hitam
                            </span>
                        </div>
                        <span className="text-[11px] text-[#718092] block mt-1">
                            Tingkatan I Dan hingga V Dan
                        </span>
                    </div>
                </div>

                {/* Card 4: Mudansha */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 lg:p-5 shadow-2xs hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <span className="text-xs font-medium text-[#718092] block">Mudansha (Kyu)</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl lg:text-3xl font-extrabold text-[#17202D] font-mono tracking-tight">
                                {stats.mudansha_count}
                            </span>
                            <span className="text-[11px] font-bold text-[#16865C] flex items-center">
                                Tingkat Kyu
                            </span>
                        </div>
                        <span className="text-[11px] text-[#718092] block mt-1">
                            Kyu 1 s/d Minarai terdaftar
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile & Organization Info Box (Clean Enterprise White Card) */}
            <div className="bg-white rounded-xl border border-[#E8EBEF] p-5 lg:p-6 shadow-2xs mb-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8EBEF]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-[#C51C2A] border border-red-100 flex items-center justify-center shrink-0">
                            <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base lg:text-lg font-bold text-[#17202D]">
                                    {pengkot.name}
                                </h2>
                                <Badge variant="rose" size="sm">
                                    Pengurus Kota / Kabupaten Resmi
                                </Badge>
                            </div>
                            <p className="text-xs text-[#718092] mt-0.5">
                                Wilayah kerja pembinaan atlet Shorinji Kempo cabang {pengkot.region}. Berorientasi pada pembinaan karakter Bushido, sport science, dan prestasi kejuaraan multievent.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Left: Organization Info Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-[#718092] mb-1">
                                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                                Ketua Umum / Sensei
                            </div>
                            <div className="font-bold text-[#17202D] text-xs sm:text-sm">
                                {pengkot.leader_name || '-'}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-[#718092] mb-1">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                Sekretaris Pengkot
                            </div>
                            <div className="font-bold text-[#17202D] text-xs sm:text-sm">
                                {pengkot.secretary_name || '-'}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-[#718092] mb-1">
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                No. SK &amp; Masa Bakti
                            </div>
                            <div className="font-bold text-[#17202D] text-xs">
                                {pengkot.sk_number || '-'} {pengkot.sk_period ? `(${pengkot.sk_period})` : ''}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA]">
                            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-[#718092] mb-1">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                Kontak Sekretariat
                            </div>
                            <div className="font-bold text-[#17202D] text-xs">
                                {pengkot.contact_phone || '-'}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg border border-[#E8EBEF] bg-[#F8F9FA] sm:col-span-2">
                            <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-[#718092] mb-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                Alamat Sekretariat Pengkot
                            </div>
                            <div className="font-medium text-[#17202D] text-xs leading-relaxed">
                                {pengkot.address || '-'}
                            </div>
                        </div>
                    </div>

                    {/* Right: Target & Visi Box */}
                    {pengkot.metadata && (
                        <div className="lg:w-80 shrink-0 bg-[#F8F9FA] rounded-xl border border-[#E8EBEF] p-4 space-y-3">
                            <div className="flex items-center gap-2 text-[#C51C2A] text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-4 h-4" /> Target &amp; Slogan
                            </div>
                            {pengkot.metadata.target_porprov && (
                                <div className="space-y-0.5">
                                    <span className="text-2xs text-[#718092] uppercase font-semibold block">Target Prestasi Porprov</span>
                                    <span className="text-xs sm:text-sm font-bold text-[#17202D] block">{pengkot.metadata.target_porprov}</span>
                                </div>
                            )}
                            {pengkot.metadata.motto && (
                                <div className="space-y-0.5">
                                    <span className="text-2xs text-[#718092] uppercase font-semibold block">Motto Daerah</span>
                                    <p className="text-xs italic text-[#17202D]">"{pengkot.metadata.motto}"</p>
                                </div>
                            )}
                            <div className="pt-2 border-t border-[#E8EBEF] text-[11px] text-[#718092] flex items-center justify-between">
                                <span>Akun Login:</span>
                                <span className="font-mono text-xs font-medium text-[#17202D] truncate max-w-[160px]">
                                    {pengkot.contact_email || 'pengkot.surabaya@perkemi.id'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Search, Filter & Tabs Container (Unified Design matching Dojos/Index.tsx) */}
            <div className="rounded-xl border border-[#E8EBEF] bg-white p-3.5 sm:p-4 mb-5 sm:mb-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1 border-b border-[#E8EBEF] sm:border-b-0 pb-2 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('athletes')}
                            className={`pb-2 sm:pb-1 px-3 text-xs sm:text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                                activeTab === 'athletes'
                                    ? 'text-[#17202D] border-b-2 border-[#C51C2A]'
                                    : 'text-[#718092] hover:text-[#17202D]'
                            }`}
                        >
                            <Trophy className={`w-4 h-4 ${activeTab === 'athletes' ? 'text-[#C51C2A]' : 'text-[#718092]'}`} />
                            Daftar Atlet Pengkot ({athletesList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('dojos')}
                            className={`pb-2 sm:pb-1 px-3 text-xs sm:text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                                activeTab === 'dojos'
                                    ? 'text-[#17202D] border-b-2 border-[#C51C2A]'
                                    : 'text-[#718092] hover:text-[#17202D]'
                            }`}
                        >
                            <Building2 className={`w-4 h-4 ${activeTab === 'dojos' ? 'text-[#C51C2A]' : 'text-[#718092]'}`} />
                            Cabang Dojo Surabaya ({dojosList.length})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-[#718092] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari atlet, NIK, atau dojo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-[#E8EBEF] bg-white text-[#17202D] focus:border-[#102B40] focus:ring-1 focus:ring-[#102B40]"
                        />
                    </div>
                </div>
            </div>

            {/* Tab 1: Athletes Table (Responsive: Desktop Table + Mobile Cards) */}
            {activeTab === 'athletes' && (
                <div className="bg-white rounded-xl border border-[#E8EBEF] shadow-2xs overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-[#F8F9FA] border-b border-[#E8EBEF] text-[#718092] uppercase tracking-wider text-2xs font-semibold">
                                <tr>
                                    <th className="py-3 px-4">Kenshi</th>
                                    <th className="py-3 px-4">Nomor KTA / NIK</th>
                                    <th className="py-3 px-4">Tingkatan Sabuk</th>
                                    <th className="py-3 px-4">Asal Dojo</th>
                                    <th className="py-3 px-4">Status Pengkot</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8EBEF]">
                                {filteredAthletes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-[#718092]">
                                            Tidak ada atlet prestasi Pengkot yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAthletes.map((athlete) => {
                                        const rankLabel = typeof athlete.rank === 'object' && athlete.rank !== null ? athlete.rank.label : String(athlete.rank || '-');
                                        return (
                                            <tr key={athlete.id} className="hover:bg-[#F8F9FA]/80 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-[#17202D]">
                                                        {athlete.full_name}
                                                    </div>
                                                    <div className="text-2xs text-[#718092]">
                                                        {athlete.gender === 'M' ? 'Putra' : 'Putri'} • {athlete.phone || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-medium text-[#17202D]">
                                                    {athlete.id_card_number}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={athlete.rank?.is_dan ? 'rose' : 'blue'}>
                                                        {rankLabel}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-[#17202D]">
                                                    {athlete.dojo?.name || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="rose" size="sm" withDot>
                                                        Atlet Prestasi
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Link
                                                        href={`/kenshis/${athlete.id}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#102B40] hover:text-[#C51C2A] transition-colors"
                                                    >
                                                        Profil &amp; KTA <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y divide-[#E8EBEF]">
                        {filteredAthletes.length === 0 ? (
                            <div className="py-8 text-center text-xs text-[#718092]">
                                Tidak ada atlet prestasi Pengkot yang cocok dengan pencarian.
                            </div>
                        ) : (
                            filteredAthletes.map((athlete) => {
                                const rankLabel = typeof athlete.rank === 'object' && athlete.rank !== null ? athlete.rank.label : String(athlete.rank || '-');
                                return (
                                    <div key={athlete.id} className="p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/kenshis/${athlete.id}`}
                                                    className="font-bold text-sm text-[#17202D] hover:text-[#C51C2A] transition-colors block"
                                                >
                                                    {athlete.full_name}
                                                </Link>
                                                <span className="font-mono text-2xs text-[#718092] block mt-0.5">
                                                    {athlete.id_card_number}
                                                </span>
                                            </div>
                                            <Badge variant={athlete.rank?.is_dan ? 'rose' : 'blue'} size="sm">
                                                {rankLabel}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-[#718092] pt-1">
                                            <span>{athlete.dojo?.name || '-'}</span>
                                            <Badge variant="rose" size="sm" withDot>
                                                Atlet Prestasi
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Tab 2: Dojos List */}
            {activeTab === 'dojos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDojos.length === 0 ? (
                        <div className="col-span-full py-8 text-center text-[#718092] bg-white rounded-xl border border-[#E8EBEF]">
                            Tidak ada dojo yang cocok dengan pencarian.
                        </div>
                    ) : (
                        filteredDojos.map((dojo) => (
                            <div key={dojo.id} className="bg-white rounded-xl border border-[#E8EBEF] shadow-2xs hover:border-[#102B40] transition-colors p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-base font-bold text-[#17202D]">
                                        {dojo.name}
                                    </h3>
                                    <span className="font-mono text-2xs px-2 py-0.5 rounded bg-[#F8F9FA] text-[#718092] border border-[#E8EBEF]">
                                        {dojo.code}
                                    </span>
                                </div>
                                <p className="text-xs text-[#718092]">
                                    Sensei: {dojo.head_sensei?.name || 'Pelatih Kepala'}
                                </p>
                                <div className="space-y-2 text-xs text-[#718092]">
                                    <div className="flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-[#718092] shrink-0 mt-0.5" />
                                        <span className="line-clamp-2 text-[#17202D]">{dojo.address || dojo.city || 'Kota Surabaya'}</span>
                                    </div>
                                    <div className="pt-2 border-t border-[#E8EBEF] flex items-center justify-between">
                                        <span className="text-2xs text-[#718092]">
                                            Wilayah: {dojo.pengkab || dojo.city || pengkot.region}
                                        </span>
                                        <Link
                                            href={`/dojos/${dojo.id}`}
                                            className="text-xs font-semibold text-[#102B40] hover:text-[#C51C2A] flex items-center gap-0.5 transition-colors"
                                        >
                                            Detail Dojo <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
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
                icon={<Landmark className="w-5 h-5 text-[#C51C2A]" />}
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
