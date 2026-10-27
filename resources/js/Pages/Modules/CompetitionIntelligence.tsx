import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import {
    Trophy,
    Medal,
    Swords,
    Target,
    Flag,
    Calendar,
} from 'lucide-react';

interface Props {
    totalDojos: number;
}

export default function CompetitionIntelligence({ totalDojos }: Props) {
    const upcomingEvents = [
        { name: 'KEJURNAS SHORINJI KEMPO 2026', date: '15 - 18 November 2026', location: 'Surabaya, Jawa Timur', category: 'Embu & Randori', status: 'Pendaftaran Terbuka' },
        { name: 'PRA-PON SHORINJI KEMPO INDONESIA', date: '04 - 08 Februari 2027', location: 'Jakarta International Velodrome', category: 'Seleksi Nasional', status: 'Fase Pelatda' },
        { name: 'KEJURDA JATIM PIALA GUBERNUR', date: '20 - 22 Desember 2026', location: 'GOR Kertajaya Surabaya', category: 'Antar Pengkab / Pengkot', status: 'Konfirmasi Kontingen' },
    ];

    return (
        <AppLayout>
            <Head title="Competition Intelligence - Turnamen & Scouting Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Competition Intelligence & Tournament Scouting"
                    description="Pusat data kejuaraan Shorinji Kempo, analisis rekam jejak lawan, bracket turnamen, dan strategi taktik tanding."
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Total Medali Emas Kontingen</span>
                        <p className="text-2xl font-black text-amber-500 mt-2">24 Emas</p>
                        <span className="text-[11px] text-slate-500 font-medium">Musim Kompetisi 2025/2026</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Medali Perak & Perunggu</span>
                        <p className="text-2xl font-black text-slate-700 mt-2">18 Perak • 12 Prg</p>
                        <span className="text-[11px] text-slate-500 font-medium">Podium finish 82%</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Win Rate Randori</span>
                        <p className="text-2xl font-black text-emerald-600 mt-2">78.6%</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Dominasi Serangan Balik</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Dojo Pengirim Kontingen</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalDojos}</p>
                        <span className="text-[11px] text-slate-500 font-medium">Cabang Terdaftar Aktif</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <h4 className="text-sm font-bold text-slate-900">Agenda Kalender Turnamen Resmi 2026/2027</h4>
                        <p className="text-xs text-slate-500">Jadwal kejuaraan nasional dan regional Shorinji Kempo PB Perkemi.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {upcomingEvents.map((evt, idx) => (
                                <div key={idx} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-900">{evt.name}</h5>
                                            <p className="text-xs text-slate-500">{evt.date} • {evt.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                            {evt.status}
                                        </span>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            Scouting Atlet
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
