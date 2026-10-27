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
import { ArrowLeft, MapPin, Save, Shield } from 'lucide-react';
import { DojoMapPicker } from '@/Components/Map/DojoMapPicker';

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
        latitude: dojo.latitude ? Number(dojo.latitude) : -7.3183485,
        longitude: dojo.longitude ? Number(dojo.longitude) : 112.7177549,
        radius_meters: dojo.radius_meters ? Number(dojo.radius_meters) : 150,
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
                description="Perbarui informasi cabang latihan, kontak pengurus dojo, titik koordinat GPS, dan radius presensi geofence."
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
                                        Geser pin merah di peta untuk menentukan koordinat presisi. Anda juga dapat menguji radius presensi dengan klik "Mode Uji Radius".
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DojoMapPicker
                                latitude={data.latitude}
                                longitude={data.longitude}
                                radiusMeters={data.radius_meters}
                                dojoName={data.name || dojo.name}
                                address={data.address || dojo.address}
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
                                    hint="Batas jarak absensi presensi kenshi."
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
