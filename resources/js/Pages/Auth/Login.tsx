import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/Components/UI/Forms/Input';
import { Checkbox } from '@/Components/UI/Forms/Checkbox';
import { Button } from '@/Components/UI/Elements/Button';
import { Card, CardContent } from '@/Components/UI/Layout/Card';
import { Alert } from '@/Components/UI/Feedback/Alert';
import { Award, Building2, LogIn, Shield, Sparkles, UserCheck, Users } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        demo_role: '',
    });

    const [selectedRoleTab, setSelectedRoleTab] = useState<'superadmin' | 'sensei' | 'kenshi'>('superadmin');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    const handleQuickLogin = (roleKey: string) => {
        data.demo_role = roleKey;
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
            <Head title="Masuk - Perkemi e-Dojo" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-[#0B132B] border-2 border-red-600 flex items-center justify-center text-white shadow-md">
                    <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    e-DOJO PERKEMI
                </h2>
                <p className="mt-1 text-xs uppercase tracking-widest font-semibold text-amber-700">
                    Persaudaraan Bela Diri Kempo Indonesia
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    Sistem Terpadu Manajemen Dojo, Monitoring Kenshi & KTA Digital
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        {errors.email && (
                            <Alert variant="error" message={errors.email} />
                        )}

                        {/* Interactive Role Switcher Tabs */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                                Akses Cepat Berdasarkan Peran (1-Click Demo Login)
                            </label>
                            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRoleTab('superadmin')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                                        selectedRoleTab === 'superadmin'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Shield className="w-3.5 h-3.5 text-red-600" />
                                    PB Perkemi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRoleTab('sensei')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                                        selectedRoleTab === 'sensei'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                                    Sensei Dojo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRoleTab('kenshi')}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                                        selectedRoleTab === 'kenshi'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Award className="w-3.5 h-3.5 text-sky-600" />
                                    Kenshi
                                </button>
                            </div>

                            {/* Role Quick Cards */}
                            <div className="mt-3">
                                {selectedRoleTab === 'superadmin' && (
                                    <div
                                        onClick={() => handleQuickLogin('superadmin')}
                                        className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 hover:bg-red-50 cursor-pointer transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="text-xs font-bold text-red-950 block">
                                                Pengurus Besar (SuperAdmin)
                                            </span>
                                            <span className="text-[11px] text-red-700 block mt-0.5">
                                                admin@perkemi.id · Akses penuh ke seluruh dojo, kenshi & log sistem
                                            </span>
                                        </div>
                                        <Button size="sm" variant="primary">
                                            Masuk
                                        </Button>
                                    </div>
                                )}

                                {selectedRoleTab === 'sensei' && (
                                    <div className="space-y-2">
                                        <div
                                            onClick={() => handleQuickLogin('sensei_senayan')}
                                            className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 hover:bg-amber-50 cursor-pointer transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-xs font-bold text-amber-950 block">
                                                    Sensei Budi Prasetyo (V Dan)
                                                </span>
                                                <span className="text-[11px] text-amber-800 block">
                                                    Head Sensei Dojo Senayan PB Perkemi · Monitor Kenshi
                                                </span>
                                            </div>
                                            <Button size="sm" variant="navy">
                                                Masuk Senayan
                                            </Button>
                                        </div>
                                        <div
                                            onClick={() => handleQuickLogin('sensei_ugm')}
                                            className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 block">
                                                    Sensei Agus Santoso (IV Dan)
                                                </span>
                                                <span className="text-[11px] text-slate-600 block">
                                                    Head Sensei Dojo Gelanggang UGM Sleman
                                                </span>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                Masuk UGM
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {selectedRoleTab === 'kenshi' && (
                                    <div className="space-y-2">
                                        <div
                                            onClick={() => handleQuickLogin('kenshi_arya')}
                                            className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 hover:bg-sky-50 cursor-pointer transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-xs font-bold text-sky-950 block">
                                                    Arya Suryanegara (I Dan - Sabuk Hitam)
                                                </span>
                                                <span className="text-[11px] text-sky-800 block">
                                                    KNS-2026-0001 · KTA Digital & Roadmap UKT
                                                </span>
                                            </div>
                                            <Button size="sm" variant="navy">
                                                Buka KTA
                                            </Button>
                                        </div>
                                        <div
                                            onClick={() => handleQuickLogin('kenshi_dewi')}
                                            className="rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 block">
                                                    Dewi Anggraini (Kyu I - Sabuk Coklat)
                                                </span>
                                                <span className="text-[11px] text-slate-600 block">
                                                    KNS-2026-0002 · Dojo Senayan
                                                </span>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                Buka KTA
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative my-3">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white px-3 text-slate-400 font-medium">
                                    Atau masuk dengan kredensial manual
                                </span>
                            </div>
                        </div>

                        {/* Standard Credential Form */}
                        <form onSubmit={submit} className="space-y-4">
                            <Input
                                label="Alamat Email"
                                type="email"
                                required
                                placeholder="nama@perkemi.id"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />

                            <Input
                                label="Kata Sandi"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                hint="Kata sandi default untuk semua akun demo: password123"
                            />

                            <div className="flex items-center justify-between text-xs">
                                <Checkbox
                                    label="Ingat saya di perangkat ini"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="navy"
                                className="w-full"
                                isLoading={processing}
                                leftIcon={<LogIn className="w-4 h-4" />}
                            >
                                Masuk ke Portal
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
