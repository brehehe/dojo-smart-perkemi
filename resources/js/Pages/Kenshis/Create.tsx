import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { Button } from '@/Components/UI/Elements/Button';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

interface Props {
    dojos: Array<{ id: string; name: string; code: string; pengprov: string }> | { data: Array<{ id: string; name: string; code: string; pengprov: string }> };
    ranks: Array<{ value: string; label: string }>;
}

export default function KenshisCreate({ dojos, ranks }: Props) {
    const dojosList = Array.isArray(dojos) ? dojos : dojos.data;

    const { data, setData, post, processing, errors } = useForm({
        id_card_number: '',
        dojo_id: dojosList[0]?.id || '',
        full_name: '',
        nickname: '',
        gender: 'M',
        member_type: 'athlete',
        place_of_birth: '',
        date_of_birth: '',
        blood_type: 'O',
        rank: ranks[0]?.value || 'minarai',
        phone: '',
        address: '',
        joined_at: new Date().toISOString().slice(0, 10),
        is_active: true,
        create_user_account: true,
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/kenshis');
    };

    return (
        <AppLayout>
            <Head title="Pendaftaran Kenshi & Pelatih Baru - Perkemi" />

            <PageHeading
                title="Pendaftaran Kenshi & Pelatih Baru"
                description="Input data kenshi atau pelatih untuk penerbitan Nomor Pokok KTA, penempatan dojo, dan aktivasi akun login."
                actions={
                    <Link href="/kenshis">
                        <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Kembali ke Pangkalan
                        </Button>
                    </Link>
                }
            />

            <div className="max-w-3xl">
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Biodata Kenshi / Pelatih</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Nomor Pokok / NIK / KTA"
                                    required
                                    placeholder="Contoh: KNS-2026-0099"
                                    value={data.id_card_number}
                                    onChange={(e) => setData('id_card_number', e.target.value)}
                                    error={errors.id_card_number}
                                    hint="Nomor pokok resmi identitas Perkemi."
                                />
                                <Select
                                    label="Kategori Anggota"
                                    required
                                    value={data.member_type}
                                    onChange={(e) => setData('member_type', e.target.value)}
                                    options={[
                                        { value: 'athlete', label: 'Atlet / Kenshi' },
                                        { value: 'coach', label: 'Pelatih / Sensei' },
                                    ]}
                                    error={errors.member_type}
                                />
                                <Select
                                    label="Cabang Latihan (Dojo)"
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
                                    placeholder="Contoh: Bambang Pamungkas"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    error={errors.full_name}
                                />
                                <Input
                                    label="Nama Panggilan"
                                    placeholder="Contoh: Bambang"
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
                                    placeholder="Kota / Kabupaten"
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nomor HP / WhatsApp"
                                    placeholder="08123456789"
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
                            </div>

                            <Textarea
                                label="Alamat Domisili"
                                placeholder="Alamat tempat tinggal kenshi..."
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                error={errors.address}
                                rows={2}
                            />

                            {/* Akun Login Pengguna & Password NIK */}
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.create_user_account}
                                        onChange={(e) => setData('create_user_account', e.target.checked)}
                                        className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-4 w-4"
                                    />
                                    <span className="text-xs font-bold text-slate-800">
                                        Buatkan Akun Login Pengguna & KTA Digital
                                    </span>
                                </label>

                                {data.create_user_account && (
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                        <Input
                                            label="Alamat Email Akun"
                                            type="email"
                                            required={data.create_user_account}
                                            placeholder="Contoh: atlet@perkemi.id"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            error={errors.email}
                                            hint="Digunakan untuk login ke portal atlet/pelatih."
                                        />
                                        <p className="text-[11px] text-slate-500">
                                            ℹ️ <strong>Password default otomatis menggunakan NIK (Nomor Pokok)</strong> yang dimasukkan di atas. Pengguna dapat mengubah kata sandi setelah masuk ke portal.
                                        </p>
                                    </div>
                                )}
                            </div>
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
                                Daftarkan Kenshi
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
