import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardHeader, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Shield,
} from 'lucide-react';

interface Props {
    totalDojos: number;
    totalMembers: number;
}

export default function Finance({ totalDojos, totalMembers }: Props) {
    const transactions = [
        { desc: 'Iuran Bulanan Kenshi Cabang Surabaya (42 Anggota)', date: '24 Oktober 2026', type: 'in', amount: 'Rp 4.200.000', cat: 'Iuran Dojo' },
        { desc: 'Pengadaan Perlengkapan Matras Tatami & Dōgi', date: '21 Oktober 2026', type: 'out', amount: 'Rp 6.850.000', cat: 'Peralatan' },
        { desc: 'Biaya Pendaftaran Kontingen Kejurda 2026', date: '18 Oktober 2026', type: 'out', amount: 'Rp 2.500.000', cat: 'Kompetisi' },
        { desc: 'Registrasi Anggota Baru & Sertifikasi KTA Digital (6 Kenshi)', date: '15 Oktober 2026', type: 'in', amount: 'Rp 1.500.000', cat: 'Registrasi' },
    ];

    return (
        <AppLayout>
            <Head title="Finance & Accounting - Keuangan Dojo Perkemi" />

            <div className="space-y-6">
                <PageHeading
                    title="Finance & Accounting Dojo"
                    description="Pencatatan kas dan pembukuan transparan kas dojo, iuran bulanan kenshi, biaya pendaftaran kejuaraan, dan logistik latihan."
                    actions={
                        <Link href="/reports">
                            <Button variant="outline" size="sm">
                                Ekspor Buku Kas
                            </Button>
                        </Link>
                    }
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Saldo Kas Dojo</span>
                        <p className="text-2xl font-black text-slate-900 mt-2">Rp 48.650.000</p>
                        <span className="text-[11px] text-emerald-600 font-medium">Likuiditas Sehat</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Pemasukan Bulan Ini</span>
                        <p className="text-2xl font-black text-emerald-600 mt-2">Rp 12.400.000</p>
                        <span className="text-[11px] text-emerald-600 font-medium">+8.2% vs target</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Pengeluaran Operasional</span>
                        <p className="text-2xl font-black text-slate-700 mt-2">Rp 7.850.000</p>
                        <span className="text-[11px] text-slate-500 font-medium">Sewa dojo & logistik</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Kepatuhan Iuran Anggota</span>
                        <p className="text-2xl font-black text-amber-500 mt-2">93.8%</p>
                        <span className="text-[11px] text-slate-500 font-medium">Tertagih otomatis</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <h4 className="text-sm font-bold text-slate-900">Mutasi Buku Kas & Transaksi Terkini</h4>
                        <p className="text-xs text-slate-500">Arus kas transparan terlacak secara digital.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {transactions.map((trx, idx) => (
                                <div key={idx} className="py-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl shrink-0 ${trx.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {trx.type === 'in' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{trx.desc}</p>
                                            <p className="text-[10px] text-slate-400">{trx.date} • {trx.cat}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-black ${trx.type === 'in' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {trx.type === 'in' ? `+${trx.amount}` : `-${trx.amount}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
