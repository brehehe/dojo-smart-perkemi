import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Dojo } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { Button } from '@/Components/UI/Elements/Button';
import { ArrowLeft, Save, Shield } from 'lucide-react';

interface Props {
    dojo: Dojo | { data: Dojo };
}

export default function DojosEdit({ dojo: rawDojo }: Props) {
    const dojo = (rawDojo && 'data' in rawDojo ? rawDojo.data : rawDojo) as Dojo;
    const { data, setData, put, processing, errors } = useForm({
        code: dojo.code || '',
        name: dojo.name || '',
        pengprov: dojo.pengprov || '',
        pengkab: dojo.pengkab || '',
        address: dojo.address || '',
        city: dojo.city || '',
        contact_phone: dojo.contact_phone || '',
        contact_email: dojo.contact_email || '',
        status: dojo.status?.value || 'active',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dojos/${dojo.id}`);
    };

    return (
        <AppLayout>
            <Head title={`Edit Dojo ${dojo.name} - Perkemi`} />

            <PageHeading
                title={`Perbarui Data: ${dojo.name}`}
                description="Perbarui informasi cabang latihan, kontak pengurus dojo, dan status operasional."
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/dojos">
                            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                Kembali
                            </Button>
                        </Link>
                        <Link href={`/dojos/${dojo.id}`}>
                            <Button variant="outline" leftIcon={<Shield className="w-4 h-4" />}>
                                Profil Dojo
                            </Button>
                        </Link>
                    </div>
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
                                    placeholder="Contoh: DOJO-JKT-001"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    error={errors.code}
                                    hint="Kode unik resmi terbitan Pengprov/PB."
                                />
                                <Input
                                    label="Nama Dojo"
                                    required
                                    placeholder="Contoh: Dojo Senayan PB Perkemi"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Pengprov Perkemi"
                                    required
                                    placeholder="Contoh: DKI Jakarta"
                                    value={data.pengprov}
                                    onChange={(e) => setData('pengprov', e.target.value)}
                                    error={errors.pengprov}
                                />
                                <Input
                                    label="Pengkab / Pengkot"
                                    required
                                    placeholder="Contoh: Jakarta Pusat"
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
                                Simpan Perubahan
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
