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

    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        dojo_id: defaultDojoId,
        gender: 'M',
        rank: 'minarai',
        id_card_number: '',
        is_atlet_pengkot: false,
        pengkot_id: '',
        pengkot: '',
        is_atlet_pengprov: false,
        pengprov_id: '',
        pengprov: '',
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

                            {/* Asal Organisasi & Pembinaan Kenshi (Dojo, Pengkot/Pengkab, Pengprov) */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/80">
                                    <Shield className="h-4 w-4 text-red-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Asal Organisasi & Afiliasi Atlet
                                    </span>
                                </div>

                                {/* 2.1. Asal Dojo (Wajib) */}
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
                                        <option value="" disabled>-- Pilih Asal Dojo --</option>
                                        {dojos.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} — {d.pengprov} {d.pengkab ? `(${d.pengkab})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500">
                                        Untuk aplikasi Dojo dan jadwal latihan rutin dojo.
                                    </p>
                                    {errors.dojo_id && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.dojo_id}</p>
                                    )}
                                </div>

                                {/* 2.2. Asal Pengkot / Pengkab (Opsional) */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Asal Pengkot / Pengkab <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        {data.is_atlet_pengkot && (
                                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
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
                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white focus:border-red-500 focus:ring-red-500 shadow-2xs py-2 px-3"
                                    >
                                        <option value="">-- Tidak / Belum Terdaftar di Pengkot (Opsional) --</option>
                                        {pengkots.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.region ? `(${p.region})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500">
                                        Yang punya kewenangan untuk atlet kota/kabupaten dan TC serta jadwal TC.
                                    </p>
                                    {errors.pengkot_id && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.pengkot_id}</p>
                                    )}
                                </div>

                                {/* 2.3. Asal Pengprov (Opsional) */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Asal Pengprov <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        {data.is_atlet_pengprov && (
                                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
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
                                        className="w-full rounded-lg border-slate-300 text-xs sm:text-sm bg-white focus:border-purple-500 focus:ring-purple-500 shadow-2xs py-2 px-3"
                                    >
                                        <option value="">-- Tidak / Belum Terdaftar di Pengprov (Opsional) --</option>
                                        {pengprovs.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.region ? `(${p.region})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-slate-500">
                                        Yang punya hak tim Puslatda TC dan jadwal TC Puslatda.
                                    </p>
                                    {errors.pengprov_id && (
                                        <p className="text-xs text-rose-600 mt-1">{errors.pengprov_id}</p>
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
