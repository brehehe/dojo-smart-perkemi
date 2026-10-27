import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { Button } from '@/Components/UI/Elements/Button';
import { Card, CardContent } from '@/Components/UI/Layout/Card';
import { Alert } from '@/Components/UI/Feedback/Alert';
import { ArrowLeft, LogIn, Shield, Sparkles, Trophy, UserPlus } from 'lucide-react';

interface DojoOption {
    id: string;
    name: string;
    code: string;
    pengprov: string;
    pengkab?: string;
    city?: string;
}

interface RankOption {
    value: string;
    label: string;
}

interface PengurusOption {
    id: string;
    name: string;
    code: string;
    region: string;
}

interface Props {
    dojos: DojoOption[];
    ranks: RankOption[];
    pengkots?: PengurusOption[];
    pengprovs?: PengurusOption[];
}

export default function Register({ dojos, ranks, pengkots = [], pengprovs = [] }: Props) {
    const defaultDojoId = dojos.length > 0 ? dojos[0].id : '';

    // Find default Surabaya and Jawa Timur
    const defaultPengkot = pengkots.find(
        (p) => p.region.toLowerCase().includes('surabaya') || p.name.toLowerCase().includes('surabaya')
    ) || pengkots[0];

    const defaultPengprov = pengprovs.find(
        (p) => p.region.toLowerCase().includes('jawa timur') || p.name.toLowerCase().includes('jawa timur')
    ) || pengprovs[0];

    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        dojo_id: defaultDojoId,
        gender: 'M',
        rank: 'minarai',
        id_card_number: '',
        is_atlet_pengkot: false,
        pengkot_id: defaultPengkot?.id || '',
        pengkot: defaultPengkot?.region || 'Kota Surabaya',
        is_atlet_pengprov: false,
        pengprov_id: defaultPengprov?.id || '',
        pengprov: defaultPengprov?.region || 'Jawa Timur',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    const selectedDojo = dojos.find((d) => d.id === data.dojo_id);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
            <Head title="Registrasi Kenshi Baru - Perkemi e-Dojo" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-[#0B132B] border-2 border-red-600 flex items-center justify-center text-white shadow-md">
                    <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    Registrasi Kenshi Baru
                </h2>
                <p className="mt-1 text-xs uppercase tracking-widest font-semibold text-amber-700">
                    Persaudaraan Shorinji Kempo Indonesia
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    Daftar keanggotaan atlet untuk penerbitan KTA Digital & integrasi Dojo
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        {errors.email && (
                            <Alert variant="error" message={errors.email} />
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <Input
                                label="Nama Lengkap Kenshi"
                                type="text"
                                required
                                placeholder="Contoh: Budi Prasetyo"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                error={errors.full_name}
                            />

                            {/* Pilihan Asal Dojo * */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Asal Dojo <span className="text-red-600">*</span>
                                </label>
                                <select
                                    required
                                    value={data.dojo_id}
                                    onChange={(e) => setData('dojo_id', e.target.value)}
                                    className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white focus:border-red-500 focus:ring-red-500 shadow-2xs py-2 px-3"
                                >
                                    {dojos.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} — {d.pengprov} {d.pengkab ? `(${d.pengkab})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.dojo_id && (
                                    <p className="text-xs text-rose-600 mt-1">{errors.dojo_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Jenis Kelamin"
                                    required
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    options={[
                                        { value: 'M', label: 'Laki-laki (Pria)' },
                                        { value: 'F', label: 'Perempuan (Wanita)' },
                                    ]}
                                    error={errors.gender}
                                />

                                <Select
                                    label="Tingkatan Sabuk Awal"
                                    required
                                    value={data.rank}
                                    onChange={(e) => setData('rank', e.target.value)}
                                    options={ranks.map((r) => ({
                                        value: r.value,
                                        label: r.label,
                                    }))}
                                    error={errors.rank}
                                />
                            </div>

                            {/* Afiliasi Atlet Prestasi (Pengkot / Pengprov) */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Status Atlet Berprestasi Perkemi
                                    </span>
                                </div>

                                {/* Atlet Pengkot */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
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
                                            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-xs font-medium text-slate-800">
                                            Atlet Pengkot (Opsional)
                                        </span>
                                    </label>

                                    {data.is_atlet_pengkot && (
                                        <div className="pl-6 space-y-2">
                                            {pengkots.length > 0 && (
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-semibold text-slate-700">
                                                        Pilih Pengurus Cabang Kota/Kab
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
                                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white focus:border-red-500 focus:ring-red-500 shadow-2xs py-2 px-3"
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
                                                label="Nama Pengkot / Kota Atlet"
                                                placeholder="Contoh: Kota Surabaya"
                                                value={data.pengkot}
                                                onChange={(e) => setData('pengkot', e.target.value)}
                                                error={errors.pengkot}
                                                hint="Default terdaftar di Pengkot Surabaya."
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Atlet Pengprov */}
                                <div className="space-y-2 pt-2 border-t border-slate-200/70">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
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
                                        <span className="text-xs font-medium text-slate-800">
                                            Atlet Pengprov (Opsional)
                                        </span>
                                    </label>

                                    {data.is_atlet_pengprov && (
                                        <div className="pl-6 space-y-2">
                                            {pengprovs.length > 0 && (
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-semibold text-slate-700">
                                                        Pilih Pengurus Provinsi
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
                                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white focus:border-purple-500 focus:ring-purple-500 shadow-2xs py-2 px-3"
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
                                                label="Nama Pengprov / Provinsi Atlet"
                                                placeholder="Contoh: Jawa Timur"
                                                value={data.pengprov}
                                                onChange={(e) => setData('pengprov', e.target.value)}
                                                error={errors.pengprov}
                                                hint="Default terdaftar di Pengprov Jawa Timur."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nomor KTA / NIK (Opsional)"
                                    type="text"
                                    placeholder="Contoh: KNS-SBY-009"
                                    value={data.id_card_number}
                                    onChange={(e) => setData('id_card_number', e.target.value)}
                                    error={errors.id_card_number}
                                    hint="Kosongkan jika anggota baru (sistem otomatis menerbitkan nomor)"
                                />

                                <Input
                                    label="Nomor WhatsApp / HP"
                                    type="tel"
                                    placeholder="Contoh: 08123456789"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                />
                            </div>

                            <Input
                                label="Alamat Email (Untuk Login)"
                                type="email"
                                required
                                placeholder="nama@email.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Kata Sandi"
                                    type="password"
                                    required
                                    placeholder="Minimal 6 karakter"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />

                                <Input
                                    label="Konfirmasi Kata Sandi"
                                    type="password"
                                    required
                                    placeholder="Ulangi kata sandi"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 font-bold shadow-md"
                                    isLoading={processing}
                                    leftIcon={<UserPlus className="w-4 h-4" />}
                                >
                                    Daftar sebagai Kenshi
                                </Button>
                            </div>

                            <div className="pt-3 text-center border-t border-slate-100 text-xs text-slate-500">
                                Sudah terdaftar dan memiliki akun?{' '}
                                <Link
                                    href="/login"
                                    className="font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    Masuk ke Portal
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
