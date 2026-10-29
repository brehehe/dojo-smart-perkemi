import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Kenshi } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { Button } from '@/Components/UI/Elements/Button';
import { ArrowLeft, Save, Shield, Trophy, User } from 'lucide-react';

interface PengurusOption {
    id: string;
    name: string;
    code: string;
    region: string;
}

interface Props {
    kenshi: Kenshi | { data: Kenshi };
    dojos: Array<{ id: string; name: string; code: string; pengprov: string; pengkab?: string }> | { data: Array<{ id: string; name: string; code: string; pengprov: string; pengkab?: string }> };
    ranks: Array<{ value: string; label: string }>;
    pengkots?: PengurusOption[];
    pengprovs?: PengurusOption[];
}

export default function KenshisEdit({ kenshi: rawKenshi, dojos, ranks, pengkots = [], pengprovs = [] }: Props) {
    const kenshi = (rawKenshi && 'data' in rawKenshi ? rawKenshi.data : rawKenshi) as Kenshi;
    const dojosList = Array.isArray(dojos) ? dojos : (dojos?.data ?? []);

    const { data, setData, put, processing, errors } = useForm({
        id_card_number: kenshi.id_card_number || '',
        dojo_id: kenshi.dojo?.id || dojosList[0]?.id || '',
        full_name: kenshi.full_name || '',
        nickname: kenshi.nickname || '',
        gender: kenshi.gender || 'M',
        place_of_birth: kenshi.place_of_birth || '',
        date_of_birth: kenshi.date_of_birth || '',
        blood_type: kenshi.blood_type || 'O',
        rank: (typeof kenshi.rank === 'object' && kenshi.rank !== null ? (kenshi.rank as any).value : kenshi.rank) || 'minarai',
        is_atlet_pengkot: Boolean(kenshi.is_atlet_pengkot),
        pengkot_id: kenshi.is_atlet_pengkot ? (kenshi.pengkot_id || '') : '',
        pengkot: kenshi.is_atlet_pengkot ? (kenshi.pengkot || '') : '',
        is_atlet_pengprov: Boolean(kenshi.is_atlet_pengprov),
        pengprov_id: kenshi.is_atlet_pengprov ? (kenshi.pengprov_id || '') : '',
        pengprov: kenshi.is_atlet_pengprov ? (kenshi.pengprov || '') : '',
        phone: kenshi.phone || '',
        address: kenshi.address || '',
        joined_at: kenshi.joined_at || '',
        is_active: kenshi.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/kenshis/${kenshi.id}`);
    };

    const selectedDojo = dojosList.find((d) => d.id === data.dojo_id);

    return (
        <AppLayout>
            <Head title={`Edit Kenshi: ${kenshi.full_name} - Perkemi`} />

            <PageHeading
                title={`Perbarui Biodata: ${kenshi.full_name}`}
                description={`KTA: ${kenshi.id_card_number} • Evaluasi data, tingkatan sabuk, dan status atlet pengkot/pengprov kenshi.`}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/kenshis">
                            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                Kembali
                            </Button>
                        </Link>
                        <Link href={`/kenshis/${kenshi.id}`}>
                            <Button variant="outline" leftIcon={<User className="w-4 h-4" />}>
                                Profil Kenshi
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="max-w-3xl">
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Biodata Kenshi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Input
                                    label="Nomor Pokok / KTA"
                                    required
                                    value={data.id_card_number}
                                    onChange={(e) => setData('id_card_number', e.target.value)}
                                    error={errors.id_card_number}
                                    hint="Nomor registrasi identitas Kenshi resmi."
                                />
                            </div>

                            {/* Asal Organisasi & Pembinaan Kenshi (Dojo, Pengkot/Pengkab, Pengprov) */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4 dark:border-slate-800 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/80 dark:border-slate-800">
                                    <Shield className="h-4 w-4 text-red-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Asal Organisasi & Afiliasi Atlet
                                    </span>
                                </div>

                                {/* 2.1. Asal Dojo (Wajib) */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Asal Dojo <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        required
                                        value={data.dojo_id}
                                        onChange={(e) => setData('dojo_id', e.target.value)}
                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 py-2 px-3 focus:border-red-500 focus:ring-red-500 shadow-2xs"
                                    >
                                        <option value="" disabled>-- Pilih Asal Dojo --</option>
                                        {dojosList.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} — {d.pengprov} {d.pengkab ? `(${d.pengkab})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Untuk aplikasi Dojo dan jadwal latihan rutin dojo.
                                    </p>
                                    {errors.dojo_id && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.dojo_id}</p>
                                    )}
                                </div>

                                {/* 2.2. Asal Pengkot / Pengkab (Opsional) */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Asal Pengkot / Pengkab <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        {data.is_atlet_pengkot && (
                                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60">
                                                Atlet Pengkot
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        value={data.pengkot_id}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selected = pengkots.find((p) => p.id === selectedId);
                                            setData((prev) => ({
                                                ...prev,
                                                pengkot_id: selectedId,
                                                pengkot: selected ? (selected.region || selected.name) : '',
                                                is_atlet_pengkot: Boolean(selectedId),
                                            }));
                                        }}
                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 py-2 px-3 focus:border-red-500 focus:ring-red-500 shadow-2xs"
                                    >
                                        <option value="">-- Tidak / Belum Terdaftar di Pengkot (Opsional) --</option>
                                        {pengkots.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.region ? `(${p.region})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Kewenangan untuk atlet kota/kabupaten dan TC serta jadwal TC.
                                    </p>
                                    {errors.pengkot_id && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.pengkot_id}</p>
                                    )}
                                </div>

                                {/* 2.3. Asal Pengprov (Opsional) */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            Asal Pengprov <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        {data.is_atlet_pengprov && (
                                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60">
                                                Atlet Puslatda / Pengprov
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        value={data.pengprov_id}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selected = pengprovs.find((p) => p.id === selectedId);
                                            setData((prev) => ({
                                                ...prev,
                                                pengprov_id: selectedId,
                                                pengprov: selected ? (selected.region || selected.name) : '',
                                                is_atlet_pengprov: Boolean(selectedId),
                                            }));
                                        }}
                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 py-2 px-3 focus:border-purple-500 focus:ring-purple-500 shadow-2xs"
                                    >
                                        <option value="">-- Tidak / Belum Terdaftar di Pengprov (Opsional) --</option>
                                        {pengprovs.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.region ? `(${p.region})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Hak tim Puslatda TC dan jadwal TC Puslatda.
                                    </p>
                                    {errors.pengprov_id && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.pengprov_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nama Lengkap"
                                    required
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    error={errors.full_name}
                                />
                                <Input
                                    label="Nama Panggilan"
                                    value={data.nickname}
                                    onChange={(e) => setData('nickname', e.target.value)}
                                    error={errors.nickname}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Select
                                    label="Jenis Kelamin"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value as 'M' | 'F')}
                                    options={[
                                        { value: 'M', label: 'Laki-Laki (M)' },
                                        { value: 'F', label: 'Perempuan (F)' },
                                    ]}
                                    error={errors.gender}
                                />
                                <Select
                                    label="Tingkatan Sabuk (Rank)"
                                    value={data.rank}
                                    onChange={(e) => setData('rank', e.target.value)}
                                    options={ranks.map((r) => ({
                                        value: r.value,
                                        label: r.label,
                                    }))}
                                    error={errors.rank}
                                />
                                <Select
                                    label="Golongan Darah"
                                    value={data.blood_type}
                                    onChange={(e) => setData('blood_type', e.target.value)}
                                    options={[
                                        { value: 'A', label: 'Golongan A' },
                                        { value: 'B', label: 'Golongan B' },
                                        { value: 'AB', label: 'Golongan AB' },
                                        { value: 'O', label: 'Golongan O' },
                                    ]}
                                    error={errors.blood_type}
                                />
                            </div>



                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Tempat Lahir"
                                    value={data.place_of_birth}
                                    onChange={(e) => setData('place_of_birth', e.target.value)}
                                    error={errors.place_of_birth}
                                />
                                <Input
                                    label="Tanggal Lahir"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    error={errors.date_of_birth}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Nomor HP / WhatsApp"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                />
                                <Input
                                    label="Tanggal Bergabung"
                                    type="date"
                                    value={data.joined_at}
                                    onChange={(e) => setData('joined_at', e.target.value)}
                                    error={errors.joined_at}
                                />
                                <Select
                                    label="Status Keaktifan"
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) => setData('is_active', e.target.value === '1')}
                                    options={[
                                        { value: '1', label: 'Aktif Berlatih' },
                                        { value: '0', label: 'Non-Aktif' },
                                    ]}
                                />
                            </div>

                            <Textarea
                                label="Alamat Domisili"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                error={errors.address}
                                rows={2}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Link href="/kenshis">
                                <Button variant="secondary" disabled={processing}>
                                    Batal
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                leftIcon={<Save className="w-4 h-4" />}
                            >
                                Simpan Perubahan
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
