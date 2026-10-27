import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { Button } from '@/Components/UI/Elements/Button';
import { ArrowLeft, MapPin, Save } from 'lucide-react';
import { DojoMapPicker } from '@/Components/Map/DojoMapPicker';

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
        latitude: -7.3183485 as number | null,
        longitude: 112.7177549 as number | null,
        radius_meters: 150,
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
                description="Lengkapi data cabang latihan dojo untuk diakui dalam pangkalan data nasional Perkemi beserta titik geolokasi & radius absensi."
                actions={
                    <Link href="/dojos">
                        <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Kembali ke Daftar
                        </Button>
                    </Link>
                }
            />

            <div className="max-w-4xl">
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Cabang Dojo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Kode Dojo"
                                    required
                                    placeholder="Contoh: DOJO-SBY-001"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    error={errors.code}
                                    hint="Kode unik resmi terbitan Pengprov/PB."
                                />
                                <Input
                                    label="Nama Dojo"
                                    required
                                    placeholder="Contoh: Dojo Gelora Pancasila Surabaya"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={errors.name}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Pengprov Perkemi"
                                    required
                                    placeholder="Contoh: Jawa Timur"
                                    value={data.pengprov}
                                    onChange={(e) => setData('pengprov', e.target.value)}
                                    error={errors.pengprov}
                                />
                                <Input
                                    label="Pengkab / Pengkot"
                                    required
                                    placeholder="Contoh: Kota Surabaya"
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
                    </Card>

                    {/* Geolocation & Attendance Radius Map Picker */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle>Titik Lokasi & Radius Presensi Dojo</CardTitle>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Tentukan koordinat GPS tatami dan radius zona geofencing presensi kenshi secara presisi.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DojoMapPicker
                                latitude={data.latitude}
                                longitude={data.longitude}
                                radiusMeters={data.radius_meters}
                                dojoName={data.name || 'Dojo Baru'}
                                address={data.address}
                                onChange={({ latitude, longitude, radiusMeters }) => {
                                    setData((prev) => ({
                                        ...prev,
                                        latitude,
                                        longitude,
                                        radius_meters: radiusMeters,
                                    }));
                                }}
                            />

                            {/* Direct numeric inputs for Lat, Lng, Radius */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Input
                                    label="Latitude"
                                    type="number"
                                    step="any"
                                    value={data.latitude ?? ''}
                                    onChange={(e) =>
                                        setData('latitude', e.target.value ? parseFloat(e.target.value) : null)
                                    }
                                    error={errors.latitude}
                                    placeholder="-7.318348"
                                />
                                <Input
                                    label="Longitude"
                                    type="number"
                                    step="any"
                                    value={data.longitude ?? ''}
                                    onChange={(e) =>
                                        setData('longitude', e.target.value ? parseFloat(e.target.value) : null)
                                    }
                                    error={errors.longitude}
                                    placeholder="112.717755"
                                />
                                <Input
                                    label="Radius Presensi (Meter)"
                                    type="number"
                                    min="10"
                                    max="5000"
                                    value={data.radius_meters}
                                    onChange={(e) =>
                                        setData('radius_meters', parseInt(e.target.value, 10) || 150)
                                    }
                                    error={errors.radius_meters}
                                    hint="Jarak toleransi absensi kenshi (rekomendasi 100 - 250m)."
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
