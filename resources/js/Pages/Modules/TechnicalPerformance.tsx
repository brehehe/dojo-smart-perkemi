import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import {
    Award,
    Crosshair,
    Shield,
    Sparkles,
    CheckCircle2,
    Layers,
    BookOpen,
} from 'lucide-react';

interface Props {
    totalAthletes: number;
}

export default function TechnicalPerformance({ totalAthletes }: Props) {
    const technicalCurriculum = [
        { category: 'Goho (Teknik Keras / Serangan)', items: 'Tsuki (Pukulan), Keri (Tendangan), Uke (Tangkisan), Tenshin (Langkah Hindar)', mastery: '91.5%' },
        { category: 'Juho (Teknik Lembut / Kuncian)', items: 'Gyaku Gote, Maki Gote, Kote Nage, Ryote Oshi Otoshi, Eri Jime', mastery: '86.2%' },
        { category: 'Embu (Kerapian Gerakan Pasangan/Regu)', items: 'Sinkronisasi, Zanshin (Kesiagaan Jiwa), Kecepatan & Irama, Kiai', mastery: '93.0%' },
        { category: 'Randori / Bogu (Pertarungan Bebas)', items: 'Jarak Serang (Ma-ai), Antisipasi Serangan, Efektivitas Poin, Ketahanan Mental', mastery: '88.4%' },
    ];

    return (
        <AppLayout>
            <Head title="Technical Performance - Penguasaan Waza Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Technical Performance & Penguasaan Waza"
                    description="Evaluasi presisi teknik Shorinji Kempo: Goho (pukulan/tendangan), Juho (kuncian/lemparan), Sinkronisasi Embu, dan Efektivitas Randori."
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="/performance/evaluations">
                                <Button variant="outline" size="sm">
                                    Input Penilaian Sensei
                                </Button>
                            </Link>
                            <Link href="/reports">
                                <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                    Buka di Pusat Laporan
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {/* Score Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Presisi Goho (Keras)</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">91.5%</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Kecepatan & Akurasi Prima</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Presisi Juho (Lembut)</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">86.2%</p>
                        <span className="text-[11px] text-indigo-600 font-medium">Titik Ungkit & Kuncian</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Sinkronisasi Embu</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">93.0%</p>
                        <span className="text-[11px] text-amber-600 font-medium">Harmonisasi & Jiwa Zanshin</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Efektivitas Randori</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">88.4%</p>
                        <span className="text-[11px] text-red-600 font-medium">Point Conversion Rate</span>
                    </div>
                </div>

                {/* Technical Mastery Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Kurikulum & Standar Evaluasi Waza</h4>
                                <p className="text-xs text-slate-500">Pedoman penguasaan teknik baku Persaudaraan Beladiri Shorinji Kempo Indonesia.</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 rounded-full">
                                Dokoh & Tokuhon 2026
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {technicalCurriculum.map((tech, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-600" />
                                            <h5 className="text-sm font-bold text-slate-900">{tech.category}</h5>
                                        </div>
                                        <p className="text-xs text-slate-600 max-w-2xl">{tech.items}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-lg font-black text-slate-900">{tech.mastery}</span>
                                        <span className="block text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Tingkat Penguasaan</span>
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
