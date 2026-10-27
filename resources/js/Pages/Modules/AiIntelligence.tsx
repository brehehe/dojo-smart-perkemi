import React from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import {
    Brain,
    Sparkles,
    Eye,
    Zap,
    TrendingUp,
    ShieldCheck,
    Cpu,
} from 'lucide-react';

interface Props {
    analyzedAthletes: number;
}

export default function AiIntelligence({ analyzedAthletes }: Props) {
    const aiInsights = [
        {
            title: 'Analisis Biomekanika Sudut Keri (Mawashi Geri)',
            athlete: 'Kenshi Surya Adiputra (I Dan)',
            observation: 'Sudut rotasi panggul terdeteksi 82° (ideal: 90°). Koreksi rotasi tumit tumpuan untuk meningkatkan daya penetrasi benturan sebesar +14%.',
            confidence: '98.2%',
            type: 'Optimalisasi Kinematik',
        },
        {
            title: 'Deteksi Asimetri Tekanan Kaki (Stance Balance)',
            athlete: 'Kenshi Siti Rahma (1 Kyu)',
            observation: 'Distribusi beban pada kuda-kuda Kiba Dachi condong 64% pada kaki kiri. Disarankan penyeimbangan latihan unilateral untuk cegah cedera lutut.',
            confidence: '94.7%',
            type: 'Mitigasi Cedera',
        },
        {
            title: 'Prediksi Titik Puncak Performa Kejurnas 2026',
            athlete: 'Skuad Kontingen Surabaya',
            observation: 'Periodisasi beban latihan menunjukkan atlet akan mencapai puncak kapasitas anaerobik dan fokus kognitif pada minggu ke-2 November 2026.',
            confidence: '96.5%',
            type: 'Periodisasi Cerdas',
        },
    ];

    return (
        <AppLayout>
            <Head title="AI Athlete Intelligence - Komando Pintar Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="AI Athlete Intelligence & Sport Analytics"
                    description="Kecerdasan komputasi buatan untuk analisis biomekanika visual gerakan Shorinji Kempo, prediksi puncak performa tanding, dan deteksi dini kelelahan atlet."
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Model AI Engine</span>
                        <p className="text-xl font-black text-indigo-600 mt-2">KempoVision v4</p>
                        <span className="text-[11px] text-slate-500 font-medium">Pose Estimation 60fps</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Atlet Dianalisis AI</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">{analyzedAthletes}</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Profiling Biomekanik</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Akurasi Rekomendasi</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">97.4%</p>
                        <span className="text-[11px] text-slate-500 font-medium">Validasi Dewan Guru</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Peningkatan Efisiensi</span>
                        <p className="text-2xl font-black text-emerald-600 mt-2">+23.8%</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Reduksi Beban Pelatih</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">Rekomendasi AI Otomatis Terbaru</h4>
                                <p className="text-xs text-slate-500">Temuan motorik dan evaluasi otomatis dari sensor dan rekaman tatami.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {aiInsights.map((insight, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                                {insight.type}
                                            </span>
                                            <h5 className="text-sm font-bold text-slate-900">{insight.title}</h5>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start sm:self-auto">
                                            Konfidensi AI: {insight.confidence}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-red-600">{insight.athlete}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed">{insight.observation}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
