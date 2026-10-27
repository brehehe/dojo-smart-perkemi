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
import { ArrowLeft, Save, User } from 'lucide-react';

interface Props {
    kenshi: Kenshi | { data: Kenshi };
    dojos: Array<{ id: string; name: string; code: string; pengprov: string }> | { data: Array<{ id: string; name: string; code: string; pengprov: string }> };
    ranks: Array<{ value: string; label: string }>;
}

export default function KenshisEdit({ kenshi: rawKenshi, dojos, ranks }: Props) {
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
        rank: kenshi.rank?.value || 'minarai',
        phone: kenshi.phone || '',
        address: kenshi.address || '',
        joined_at: kenshi.joined_at || '',
        is_active: kenshi.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/kenshis/${kenshi.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Kenshi: ${kenshi.full_name} - Perkemi`} />

            <PageHeading
                title={`Perbarui Biodata: ${kenshi.full_name}`}
                description={`KTA: ${kenshi.id_card_number} • Evaluasi data dan tingkatan sabuk kenshi.`}
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
