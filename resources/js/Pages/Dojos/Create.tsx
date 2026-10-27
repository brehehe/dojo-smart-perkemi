import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { Button } from '@/Components/UI/Elements/Button';
import { ArrowLeft, Save } from 'lucide-react';

export default function DojosCreate() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        pengprov: '',
        pengkab: '',
        address: '',
        city: '',
        contact_phone: '',
        contact_email: '',
        status: 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dojos');
    };

    return (
        <AppLayout>
            <Head title="Tambah Dojo Baru - Perkemi" />

            <PageHeading
                title="Pendaftaran Dojo Baru"
                description="Lengkapi data cabang latihan dojo untuk diakui dalam pangkalan data nasional Perkemi."
                actions={
                    <Link href="/dojos">
                        <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Kembali ke Daftar
                        </Button>
                    </Link>
                }
            />

            <div className="max-w-3xl">
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Cabang Dojo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Kode Dojo"
                                    required
                                    placeholder="Contoh: DOJO-BDG-002"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    error={errors.code}
                                    hint="Kode unik resmi terbitan Pengprov/PB."
                                />
                                <Input
                                    label="Nama Dojo"
                                    required
                                    placeholder="Contoh: Dojo Ganesha ITB"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Pengprov Perkemi"
                                    required
                                    placeholder="Contoh: Jawa Barat"
                                    value={data.pengprov}
                                    onChange={(e) => setData('pengprov', e.target.value)}
                                    error={errors.pengprov}
                                />
                                <Input
                                    label="Pengkab / Pengkot"
                                    required
                                    placeholder="Contoh: Kota Bandung"
                                    value={data.pengkab}
                                    onChange={(e) => setData('pengkab', e.target.value)}
                                    error={errors.pengkab}
                                />
                            </div>

                            <Textarea
                                label="Alamat Tempat Latihan"
                                placeholder="Alamat lengkap gedung, GOR, atau fasilitas latihan..."
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                error={errors.address}
                                rows={2}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input
                                    label="Nomor Kontak (WhatsApp)"
                                    placeholder="08123456789"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                    error={errors.contact_phone}
                                />
                                <Input
                                    label="Email Dojo"
                                    type="email"
                                    placeholder="dojo@perkemi.id"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    error={errors.contact_email}
                                />
                                <Select
                                    label="Status Operasional"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    options={[
                                        { value: 'active', label: 'Aktif' },
                                        { value: 'inactive', label: 'Non-Aktif' },
                                        { value: 'suspended', label: 'Ditangguhkan' },
                                    ]}
                                    error={errors.status}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Link href="/dojos">
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
                                Simpan Dojo
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
