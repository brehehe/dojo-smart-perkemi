import React from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Award,
    Building2,
    CheckCircle2, 
    CreditCard, 
    DollarSign, 
    FileText, 
    Receipt, 
    Users, 
    Wallet 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceData {
    id: string;
    kenshi: { id: string; full_name: string; id_card_number: string };
    type: string;
    period: string;
    amount: number;
    status: string;
    paid_at: string | null;
}

interface PageProps {
    currentDojo: any;
    invoices: { data: InvoiceData[] };
    stats: {
        total_invoiced: number;
        total_paid: number;
        total_unpaid: number;
        dojo_share_earned: number;
        pelatih_share_earned: number;
    };
}

export default function DojoInvoicesIndex({ currentDojo, invoices, stats }: PageProps) {
    return (
        <AppLayout>
            <Head title="Kas & Iuran Cabang Dojo" />

            <PageHeading
                title={`Kas & Rekapitulasi Iuran ${currentDojo ? `Dojo ${currentDojo.name}` : 'Cabang Dojo'}`}
                description="Monitoring tagihan anggota, status pelunasan SK PB PERKEMI, serta pembagian alokasi 20% Pengurus Dojo & 40% Pelatih Dojo."
                actions={
                    <Link href="/dojo/settings/iuran">
                        <Button variant="navy" leftIcon={<CreditCard className="w-4 h-4" />}>
                            Pengaturan Tarif Dojo
                        </Button>
                    </Link>
                }
            />

            <div className="space-y-6">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Total Tagihan
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-[#17202D]">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-[#17202D] font-mono tracking-tight">
                            Rp{stats.total_invoiced.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-[#718092]">Akumulasi seluruh periode berjalan.</p>
                    </div>

                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Terbayar Lunas
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#16865C]">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-[#16865C] font-mono tracking-tight">
                            Rp{stats.total_paid.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-[#718092]">Telah terverifikasi masuk rekening.</p>
                    </div>

                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Hak Dojo (20%)
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                <Building2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-amber-600 font-mono tracking-tight">
                            Rp{stats.dojo_share_earned.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-[#718092]">Kas operasional cabang dojo.</p>
                    </div>

                    <div className="p-5 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#718092] uppercase tracking-wider">
                                Hak Pelatih (40%)
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#C51C2A]">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-[#C51C2A] font-mono tracking-tight">
                            Rp{stats.pelatih_share_earned.toLocaleString('id-ID')}
                        </div>
                        <p className="text-[11px] text-[#718092]">Honorarium pelatih & sensei.</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] overflow-hidden shadow-2xs">
                    <div className="px-5 py-4 border-b border-[#E8EBEF] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#718092]" />
                            Daftar Tagihan & Iuran Anggota Dojo
                        </h3>
                        <span className="text-xs text-[#718092]">
                            {invoices.data.length} transaksi tercatat
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Kenshi</TableHead>
                                    <TableHead>NIK / ID</TableHead>
                                    <TableHead>Jenis Tagihan</TableHead>
                                    <TableHead>Periode</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Status Pembayaran</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-[#718092]">
                                            Belum ada tagihan iuran yang diterbitkan untuk cabang ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.data.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-bold text-[#17202D]">{inv.kenshi?.full_name || '-'}</TableCell>
                                            <TableCell className="font-mono text-xs text-[#718092]">{inv.kenshi?.id_card_number || '-'}</TableCell>
                                            <TableCell className="capitalize text-slate-700">
                                                {inv.type.replace(/_/g, ' ')}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-[#718092]">{inv.period}</TableCell>
                                            <TableCell className="font-mono font-bold text-[#17202D]">
                                                Rp{inv.amount.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                {inv.status === 'paid' ? (
                                                    <Badge variant="emerald" withDot>
                                                        Terbayar Lunas
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="rose" withDot>
                                                        Menunggak
                                                    </Badge>
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
        </AppLayout>
    );
}
