import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/DataDisplay/Table';
import { 
    AlertTriangle, 
    CheckCircle2, 
    CreditCard, 
    Download, 
    FileText, 
    Receipt, 
    ShieldAlert, 
    Wallet, 
    X,
    XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceItem {
    id: string;
    type: string;
    period: string;
    amount: number;
    status: string;
    due_date: string;
    paid_at: string | null;
}

interface PageProps {
    currentKenshi: any;
    invoices: InvoiceItem[];
    stats: {
        total_invoices: number;
        unpaid_count: number;
        unpaid_sum: number;
        is_delinquent: boolean;
        status_label: string;
    };
}

export default function KenshiInvoices({ currentKenshi, invoices, stats }: PageProps) {
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        invoice_id: '',
        amount: 50000,
        channel: 'bri_transfer',
        notes: '',
    });

    const handleOpenPay = (inv: InvoiceItem) => {
        setSelectedInvoice(inv);
        setData({
            invoice_id: inv.id,
            amount: inv.amount,
            channel: 'bri_transfer',
            notes: '',
        });
    };

    const handlePaySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/payments', {
            onSuccess: () => {
                setSelectedInvoice(null);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Tagihan & Riwayat Iuran Kenshi" />

            <PageHeading
                title="Tagihan & Status Iuran Anggota"
                description={`Kenshi: ${currentKenshi?.full_name || 'Kenshi'} (NIK: ${currentKenshi?.id_card_number || '-'}) • Cabang: ${currentKenshi?.dojo?.name || '-'}`}
                badge={
                    <Badge variant={stats.unpaid_count === 0 ? 'emerald' : 'rose'} withDot>
                        {stats.unpaid_count === 0 ? 'Lunas Seluruh Kewajiban' : `${stats.unpaid_count} Tagihan Belum Lunas`}
                    </Badge>
                }
            />

            <div className="space-y-6">
                {/* Delinquency Alert Banner if 12 months unpaid */}
                {stats.is_delinquent && (
                    <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 text-red-950 flex items-start gap-3.5 shadow-2xs">
                        <ShieldAlert className="w-6 h-6 text-[#DC3545] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-[#DC3545]">
                                Peringatan: Status Keanggotaan Tidak Aktif Sementara (Inactive Temporary)
                            </h3>
                            <p className="text-xs text-[#718092] leading-relaxed">
                                Berdasarkan SK PB PERKEMI No. 045/SK-PB/VII/2025 Diktum V, kenshi yang menunggak iuran 12 bulan berturut-turut berstatus tidak aktif sementara. Hak mengikuti Ujian Kenaikan Tingkat (UKT), kejuaraan, dan penataran dibekukan hingga seluruh tunggakan diselesaikan.
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Total Tunggakan
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#C51C2A]">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-extrabold text-[#C51C2A] font-mono tracking-tight">
                            Rp{stats.unpaid_sum.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-[#718092]">
                            {stats.unpaid_count} periode pembayaran belum diselesaikan.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Status Kelayakan UKT
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-[#17202D]">
                                <CreditCard className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            {stats.unpaid_count === 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-base font-bold text-[#16865C]">
                                    <CheckCircle2 className="w-5 h-5 text-[#16865C]" /> Memenuhi Syarat Lunas
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-base font-bold text-[#DC3545]">
                                    <AlertTriangle className="w-5 h-5 text-[#DC3545]" /> Terkunci (Ada Tunggakan)
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-[#718092]">
                            Wajib bebas tunggakan untuk mengikuti UKT dan kejuaraan.
                        </p>
                    </div>

                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Kanal Pembayaran Resmi
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xs text-[#17202D] space-y-1 pt-1">
                            <div className="font-medium">• Rekening BRI (Iuran): Sesuai Virtual Account</div>
                            <div className="font-medium">• Rekening BNI (WSKO): No. Rekening PB PERKEMI</div>
                        </div>
                        <p className="text-[11px] text-[#718092]">
                            Terintegrasi dengan pencatatan aplikasi MyPerkemi.
                        </p>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] overflow-hidden shadow-2xs">
                    <div className="px-5 py-4 border-b border-[#E8EBEF] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#718092]" />
                            Daftar Tagihan Iuran & Kewajiban Organisasi
                        </h3>
                        <span className="text-xs text-[#718092]">
                            {invoices.length} catatan tagihan
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jenis Kewajiban</TableHead>
                                    <TableHead>Periode</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Jatuh Tempo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-[#718092]">
                                            Belum ada tagihan iuran yang diterbitkan untuk akun Anda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-bold text-[#17202D]">
                                                {inv.type === 'kyu_monthly' ? 'Iuran Bulanan Kyukenshi' :
                                                 inv.type === 'dan_monthly' ? 'Iuran Bulanan Yudansha' :
                                                 inv.type === 'wsko_annual' ? 'Membership Fee WSKO (Tahunan)' :
                                                 'Pendaftaran Anggota Baru'}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-[#718092]">{inv.period}</TableCell>
                                            <TableCell className="font-mono font-bold text-[#17202D]">
                                                Rp{inv.amount.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell className="text-xs text-[#718092]">{inv.due_date}</TableCell>
                                            <TableCell>
                                                {inv.status === 'paid' ? (
                                                    <Badge variant="emerald" withDot>
                                                        Lunas
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="rose" withDot>
                                                        Belum Lunas
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {inv.status !== 'paid' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleOpenPay(inv)}
                                                    >
                                                        Bayar Sekarang
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-[#16865C] font-semibold inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal Payment */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E8EBEF] text-xs">
                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                            <h3 className="text-sm font-bold text-[#17202D]">
                                Konfirmasi Pembayaran Iuran
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="text-[#718092] hover:text-[#17202D] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E8EBEF] space-y-1">
                            <div className="text-xs text-[#718092]">Periode: <span className="font-bold text-[#17202D]">{selectedInvoice.period}</span></div>
                            <div className="text-xs text-[#718092]">Nominal: <span className="font-mono font-bold text-[#C51C2A] text-sm">Rp{selectedInvoice.amount.toLocaleString('id-ID')}</span></div>
                        </div>

                        <form onSubmit={handlePaySubmit} className="space-y-4">
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">Kanal Pembayaran</label>
                                <select
                                    value={data.channel}
                                    onChange={(e) => setData('channel', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                >
                                    <option value="bri_transfer">Bank BRI (Virtual Account / Transfer)</option>
                                    <option value="bni_transfer">Bank BNI (Transfer Rekening PB)</option>
                                    <option value="myperkemi">MyPerkemi Payment Gateway</option>
                                    <option value="manual_receipt">Setoran Tunai ke Pengurus Dojo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">Catatan Tambahan (Opsional)</label>
                                <input
                                    type="text"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Contoh: No. Ref Transfer 98371928"
                                    className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-[#E8EBEF] flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedInvoice(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    type="submit"
                                    disabled={processing}
                                    isLoading={processing}
                                >
                                    Konfirmasi Bayar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
