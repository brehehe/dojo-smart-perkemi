import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import {
    Activity,
    Flame,
    HeartPulse,
    Gauge,
    Trophy,
    ArrowUpRight,
    TrendingUp,
    Shield,
    Users,
} from 'lucide-react';

interface Props {
    totalAthletes: number;
    totalDojos: number;
}

export default function PhysicalPerformance({ totalAthletes, totalDojos }: Props) {
    const benchmarks = [
        { metric: 'VO2 Max (Kapasitas Aerobik)', standard: '≥ 52.5 ml/kg/min', currentAvg: '54.2 ml/kg/min', status: 'Optimal', change: '+3.4%' },
        { metric: 'Daya Ledak Otot (Vertical Jump)', standard: '≥ 55 cm', currentAvg: '58.4 cm', status: 'Optimal', change: '+5.1%' },
        { metric: 'Ketahanan Otot (Push Up 1-Min)', standard: '≥ 50 reps', currentAvg: '52 reps', status: 'Memenuhi', change: '+2 reps' },
        { metric: 'Kelenturan Tubuh (Sit & Reach)', standard: '≥ +12 cm', currentAvg: '+14.5 cm', status: 'Optimal', change: '+1.5 cm' },
        { metric: 'Kelincahan (Shuttle Run 4x10m)', standard: '≤ 10.2 sec', currentAvg: '10.05 sec', status: 'Memenuhi', change: '-0.2s' },
    ];

    const athletes = [
        { name: 'Kenshi Surya Adiputra', rank: 'I Dan', dojo: 'PERKEMI PENGKOT SURABAYA', score: 94, status: 'Elite A' },
        { name: 'Kenshi Budi Santoso', rank: '1 Kyu', dojo: 'PERKEMI PENGKOT SURABAYA', score: 88, status: 'Siap Tanding' },
        { name: 'Kenshi Siti Rahma', rank: '1 Kyu', dojo: 'PERKEMI PENGKOT SURABAYA', score: 91, status: 'Elite A' },
        { name: 'Kenshi Rizky Pratama', rank: '2 Kyu', dojo: 'Dojo Gelora Bung Karno', score: 85, status: 'Progresif' },
    ];

    return (
        <AppLayout>
            <Head title="Physical Performance - Sport Science Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Physical Performance & Sport Science"
                    description="Monitoring parameter biomotorik, daya tahan kardiovaskular, eksplosifitas otot, dan indeks kebugaran atlet Shorinji Kempo."
                    actions={
                        <Link href="/reports">
                            <Button variant="outline" size="sm" leftIcon={<ArrowUpRight className="w-4 h-4" />}>
                                Ekspor Laporan Fisik
                            </Button>
                        </Link>
                    }
                />

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-semibold uppercase">Indeks Kebugaran Nasional</span>
                            <Gauge className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">89.4%</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Status Prima (Puslatda)</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-semibold uppercase">Atlet Teruji Fisik</span>
                            <Users className="w-4 h-4 text-red-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">{totalAthletes}</p>
                        <span className="text-[11px] text-slate-500 font-medium">100% dari Kuota Atlet</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-semibold uppercase">Kesiapan Bertanding</span>
                            <Flame className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">92.6%</p>
                        <span className="text-[11px] text-amber-600 font-medium">Fase Pra-Kompetisi</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-semibold uppercase">Tingkat Fatigue (Lelah)</span>
                            <HeartPulse className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2">18.2%</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Zona Aman Pemulihan</span>
                    </div>
                </div>

                {/* Benchmark Standards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Standar Biomotorik PB Perkemi</h4>
                                    <p className="text-xs text-slate-500">Target parameter fisik resmi atlet Shorinji Kempo Pelatda / Pelatnas.</p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 rounded-full">
                                    Standar Puslatda 2026
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-slate-100">
                                {benchmarks.map((b, idx) => (
                                    <div key={idx} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{b.metric}</p>
                                            <p className="text-[11px] text-slate-400">Standar Minimal: {b.standard}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-extrabold text-slate-900">{b.currentAvg}</p>
                                            <span className="text-[10px] text-emerald-600 font-semibold">{b.change} bulan ini</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h4 className="text-sm font-bold text-slate-900">Top Atlet Skor Fisik</h4>
                            <p className="text-xs text-slate-500">Peringkat performa fisik tertinggi.</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {athletes.map((a, idx) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{a.name}</p>
                                        <p className="text-[10px] text-slate-500">{a.rank} • {a.dojo}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-red-600">{a.score}</span>
                                        <span className="block text-[9px] font-bold uppercase text-slate-400">{a.status}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
