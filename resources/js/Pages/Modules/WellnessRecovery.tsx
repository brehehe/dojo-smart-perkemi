import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import {
    Heart,
    Moon,
    BatteryCharging,
    ShieldAlert,
    Smile,
    Activity,
} from 'lucide-react';

interface Props {
    monitoredAthletes: number;
}

export default function WellnessRecovery({ monitoredAthletes }: Props) {
    const recoveryStates = [
        { label: 'Kualitas Tidur Rata-rata', val: '7.8 Jam', status: 'Optimal', icon: Moon, color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Tingkat Nyeri Otot (DOMS)', val: '2.1 / 10', status: 'Rendah (Aman)', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Skor Kebugaran Mental', val: '8.9 / 10', status: 'Motivasi Tinggi', icon: Smile, color: 'text-amber-600 bg-amber-50' },
        { label: 'Status Risiko Cedera', val: 'Minimal', status: '0 Insiden Akut', icon: ShieldAlert, color: 'text-blue-600 bg-blue-50' },
    ];

    return (
        <AppLayout>
            <Head title="Wellness & Recovery - Pemulihan Atlet Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Wellness, Recovery & Injury Prevention"
                    description="Pusat pemantauan kebugaran harian, kualitas istirahat, beban latihan (training load), dan pencegahan overtraining kenshi."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recoveryStates.map((state, idx) => {
                        const Icon = state.icon;
                        return (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${state.color} shrink-0`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase">{state.label}</span>
                                    <p className="text-xl font-black text-slate-900">{state.val}</p>
                                    <span className="text-[10px] text-emerald-600 font-bold">{state.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <h4 className="text-sm font-bold text-slate-900">Protokol Pemulihan Tatami PB Perkemi</h4>
                            <p className="text-xs text-slate-500">Standar pemulihan fisik wajib pasca latihan intensif & randori.</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <h5 className="text-xs font-bold text-slate-900">1. Hidrasi & Elektrolit Terjadwal</h5>
                                <p className="text-[11px] text-slate-600 mt-0.5">Asupan 500ml cairan isotonic dalam 30 menit pasca latihan intensitas tinggi.</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <h5 className="text-xs font-bold text-slate-900">2. Cool-Down Dinamis & Peregangan Statis</h5>
                                <p className="text-[11px] text-slate-600 mt-0.5">15 menit relaksasi otot fleksor panggul, bahu, dan pergelangan tangan (kote).</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <h5 className="text-xs font-bold text-slate-900">3. Cold Water Immersion (Opsional Pasca Randori)</h5>
                                <p className="text-[11px] text-slate-600 mt-0.5">Terapi es 10-12°C selama 8-10 menit untuk menekan inflamasi jaringan otot.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h4 className="text-sm font-bold text-slate-900">Monitoring Atlet Pantauan Khusus</h4>
                            <p className="text-xs text-slate-500">Atlet dalam fase rehabilitasi atau pemulihan beban bertahap.</p>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-slate-100">
                                <div className="py-2.5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Kenshi Budi Santoso</p>
                                        <p className="text-[10px] text-slate-400">Strain Ringan Bahu Kanan (Juho Drill)</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                                        Fase Pemulihan 85%
                                    </span>
                                </div>
                                <div className="py-2.5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Kenshi Siti Rahma</p>
                                        <p className="text-[10px] text-slate-400">Kelelahan Otot Tungkai (Intensif Randori)</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                                        Siap Kembali Tatami
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
