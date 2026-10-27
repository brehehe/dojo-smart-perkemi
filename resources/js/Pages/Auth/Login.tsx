import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/Components/UI/Forms/Input';
import { Checkbox } from '@/Components/UI/Forms/Checkbox';
import { Button } from '@/Components/UI/Elements/Button';
import { Card, CardContent } from '@/Components/UI/Layout/Card';
import { Alert } from '@/Components/UI/Feedback/Alert';
import { LogIn, Shield } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
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
