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
import { ArrowLeft, Save, Trophy, User } from 'lucide-react';

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

    const defaultPengkot = pengkots.find(
        (p) => p.region.toLowerCase().includes('surabaya') || p.name.toLowerCase().includes('surabaya')
    ) || pengkots[0];

    const defaultPengprov = pengprovs.find(
        (p) => p.region.toLowerCase().includes('jawa timur') || p.name.toLowerCase().includes('jawa timur')
    ) || pengprovs[0];

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
        pengkot_id: kenshi.pengkot_id || defaultPengkot?.id || '',
        pengkot: kenshi.pengkot || defaultPengkot?.region || '',
        is_atlet_pengprov: Boolean(kenshi.is_atlet_pengprov),
        pengprov_id: kenshi.pengprov_id || defaultPengprov?.id || '',
        pengprov: kenshi.pengprov || defaultPengprov?.region || '',
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nomor Pokok / KTA"
                                    required
                                    value={data.id_card_number}
                                    onChange={(e) => setData('id_card_number', e.target.value)}
                                    error={errors.id_card_number}
                                    hint="Nomor registrasi identitas Kenshi resmi."
                                />
                                <Select
                                    label="Asal Dojo"
                                    required
                                    value={data.dojo_id}
                                    onChange={(e) => setData('dojo_id', e.target.value)}
                                    options={dojosList.map((d) => ({
                                        value: d.id,
                                        label: `${d.name} (${d.pengprov})`,
                                    }))}
                                    error={errors.dojo_id}
                                />
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

                            {/* Afiliasi Atlet Prestasi (Pengkot / Pengprov) */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Status Atlet Berprestasi Perkemi
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Atlet Pengkot */}
                                    <div className="space-y-2 p-3 rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_atlet_pengkot}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        is_atlet_pengkot: checked,
                                                        pengkot_id: checked ? (prev.pengkot_id || defaultPengkot?.id || '') : '',
                                                        pengkot: checked ? (prev.pengkot || defaultPengkot?.region || 'Kota Surabaya') : '',
                                                    }));
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                            />
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Atlet Pengkot (Opsional)
                                            </span>
                                        </label>

                                        {data.is_atlet_pengkot && (
                                            <div className="space-y-2 pt-1">
                                                {pengkots.length > 0 && (
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                                            Pilih Pengurus Cabang (Pengkot/Pengkab)
                                                        </label>
                                                        <select
                                                            value={data.pengkot_id}
                                                            onChange={(e) => {
                                                                const selected = pengkots.find((p) => p.id === e.target.value);
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    pengkot_id: e.target.value,
                                                                    pengkot: selected ? selected.region : prev.pengkot,
                                                                }));
                                                            }}
                                                            className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 py-2 px-3"
                                                        >
                                                            {pengkots.map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} ({p.region})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <Input
                                                    label="Nama Wilayah Pengkot"
                                                    placeholder="Contoh: Kota Surabaya"
                                                    value={data.pengkot}
                                                    onChange={(e) => setData('pengkot', e.target.value)}
                                                    error={errors.pengkot}
                                                    hint="Tersimpan di pangkalan Pengkot Kota Surabaya."
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Atlet Pengprov */}
                                    <div className="space-y-2 p-3 rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_atlet_pengprov}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        is_atlet_pengprov: checked,
                                                        pengprov_id: checked ? (prev.pengprov_id || defaultPengprov?.id || '') : '',
                                                        pengprov: checked ? (prev.pengprov || defaultPengprov?.region || 'Jawa Timur') : '',
                                                    }));
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Atlet Pengprov (Opsional)
                                            </span>
                                        </label>

                                        {data.is_atlet_pengprov && (
                                            <div className="space-y-2 pt-1">
                                                {pengprovs.length > 0 && (
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                                                            Pilih Pengurus Daerah (Pengprov)
                                                        </label>
                                                        <select
                                                            value={data.pengprov_id}
                                                            onChange={(e) => {
                                                                const selected = pengprovs.find((p) => p.id === e.target.value);
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    pengprov_id: e.target.value,
                                                                    pengprov: selected ? selected.region : prev.pengprov,
                                                                }));
                                                            }}
                                                            className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 py-2 px-3"
                                                        >
                                                            {pengprovs.map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} ({p.region})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                <Input
                                                    label="Nama Wilayah Pengprov"
                                                    placeholder="Contoh: Jawa Timur"
                                                    value={data.pengprov}
                                                    onChange={(e) => setData('pengprov', e.target.value)}
                                                    error={errors.pengprov}
                                                    hint="Tersimpan di pangkalan Pengprov Jawa Timur."
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
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
