import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
    AlertCircle, 
    Building2,
    Check, 
    CheckCircle2, 
    Clock, 
    CreditCard, 
    Edit3,
    FileCheck2, 
    FileText, 
    Globe,
    HelpCircle, 
    Percent,
    PieChart,
    Plus, 
    RotateCcw,
    ShieldAlert, 
    Sliders,
    Sparkles,
    X,
    XCircle 
} from 'lucide-react';

interface FeeSetting {
    id: string;
    dojo: { id: string; name: string; code: string };
    category: string;
    amount: number;
    effective_from: string;
    effective_to: string | null;
    status: string;
    status_label?: string;
    change_reason: string | null;
    approval_sk_number: string | null;
    rejection_reason: string | null;
    requested_at: string | null;
    approved_at: string | null;
    metadata?: {
        allocation_rates?: AllocationRates;
    } | null;
}

interface AllocationRates {
    pb: number;
    pengprov: number;
    pengkot: number;
    dojo: number;
    pelatih: number;
}

interface DojoOption {
    id: string;
    name: string;
    code: string;
    pengprov: string;
    pengkab: string;
}

interface PageProps {
    currentDojo: any;
    allDojos?: DojoOption[];
    activeApprovedSetting: FeeSetting | null;
    currentRates?: AllocationRates;
    settings: { data: FeeSetting[] };
    pendingProposals: FeeSetting[];
    isPBOrAdmin: boolean;
    isSensei: boolean;
}

export default function FeeSettings({
    currentDojo,
    allDojos = [],
    activeApprovedSetting,
    currentRates = { pb: 20, pengprov: 10, pengkot: 10, dojo: 20, pelatih: 40 },
    settings,
    pendingProposals,
    isPBOrAdmin,
    isSensei,
}: PageProps) {
    const [showProposeModal, setShowProposeModal] = useState(false);
    const [selectedPending, setSelectedPending] = useState<FeeSetting | null>(null);
    const [skNumber, setSkNumber] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showCustomRates, setShowCustomRates] = useState(false);

    const currentFeeAmount = activeApprovedSetting ? activeApprovedSetting.amount : 50000;

    const { data, setData, post, processing, errors, reset } = useForm({
        dojo_id: currentDojo?.id || '',
        amount: currentFeeAmount,
        effective_from: new Date().toISOString().slice(0, 7),
        change_reason: '',
        apply_to_all_dojos: false,
        rates: {
            pb: currentRates.pb,
            pengprov: currentRates.pengprov,
            pengkot: currentRates.pengkot,
            dojo: currentRates.dojo,
            pelatih: currentRates.pelatih,
        },
    });

    useEffect(() => {
        if (currentDojo?.id) {
            setData((prev) => ({
                ...prev,
                dojo_id: currentDojo.id,
                amount: activeApprovedSetting ? activeApprovedSetting.amount : 50000,
                rates: {
                    pb: currentRates.pb,
                    pengprov: currentRates.pengprov,
                    pengkot: currentRates.pengkot,
                    dojo: currentRates.dojo,
                    pelatih: currentRates.pelatih,
                },
            }));
        }
    }, [currentDojo?.id, activeApprovedSetting, currentRates]);

    const handleDojoSwitch = (dojoId: string) => {
        router.get('/dojo/settings/iuran', { dojo_id: dojoId }, { preserveState: true });
    };

    const openModalWithScope = (applyToAll: boolean, defaultAmount?: number, focusRates: boolean = false) => {
        setData((prev) => ({
            ...prev,
            dojo_id: currentDojo?.id || '',
            amount: defaultAmount ?? currentFeeAmount,
            effective_from: new Date().toISOString().slice(0, 7),
            change_reason: applyToAll ? 'Penyetelan tarif standar serentak seluruh dojo' : '',
            apply_to_all_dojos: applyToAll,
            rates: {
                pb: currentRates.pb,
                pengprov: currentRates.pengprov,
                pengkot: currentRates.pengkot,
                dojo: currentRates.dojo,
                pelatih: currentRates.pelatih,
            },
        }));
        setShowCustomRates(focusRates);
        setShowProposeModal(true);
    };

    const handleProposeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dojo/settings/iuran', {
            onSuccess: () => {
                setShowProposeModal(false);
                reset();
            },
        });
    };

    const handleApprove = (settingId: string) => {
        if (!skNumber) {
            alert('Mohon masukkan Nomor SK PB PERKEMI dasar persetujuan.');
            return;
        }
        router.post(`/pb/fee-settings/${settingId}/approve`, {
            approval_sk_number: skNumber,
        }, {
            onSuccess: () => {
                setSelectedPending(null);
                setSkNumber('');
            },
        });
    };

    const handleReject = (settingId: string) => {
        if (!rejectReason) {
            alert('Mohon masukkan alasan penolakan usulan tarif.');
            return;
        }
        router.post(`/pb/fee-settings/${settingId}/reject`, {
            rejection_reason: rejectReason,
        }, {
            onSuccess: () => {
                setSelectedPending(null);
                setRejectReason('');
            },
        });
    };

    // Rate sum calculation
    const totalRate = Number(data.rates.pb) + Number(data.rates.pengprov) + Number(data.rates.pengkot) + Number(data.rates.dojo) + Number(data.rates.pelatih);
    const isRateValid = Math.abs(totalRate - 100) < 0.01;

    const resetRatesToStandard = () => {
        setData('rates', {
            pb: 20,
            pengprov: 10,
            pengkot: 10,
            dojo: 20,
            pelatih: 40,
        });
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Iuran Dojo & Persetujuan PB" />

            <PageHeading
                title={`Pengaturan Tarif & Alokasi Iuran ${currentDojo ? `Dojo ${currentDojo.name}` : 'Dojo'}`}
                description="Konfigurasi nominal iuran bulanan Kyukenshi, distribusi 5 pihak SK PB PERKEMI No. 045/SK-PB/VII/2025, dan penyesuaian persentase alokasi oleh PB PERKEMI / Admin."
                badge={
                    <Badge variant="rose">
                        SK PB No. 045/SK-PB/VII/2025
                    </Badge>
                }
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        {isPBOrAdmin && (
                            <>
                                <Button
                                    variant="outline"
                                    leftIcon={<Sliders className="w-4 h-4 text-[#102B40]" />}
                                    onClick={() => openModalWithScope(false, undefined, true)}
                                >
                                    Atur Persentase 5 Pihak
                                </Button>
                                <Button
                                    variant="outline"
                                    leftIcon={<Globe className="w-4 h-4 text-[#102B40]" />}
                                    onClick={() => openModalWithScope(true, 50000)}
                                >
                                    Setel Sekali untuk Semua Dojo
                                </Button>
                            </>
                        )}
                        {(isSensei || isPBOrAdmin) && currentDojo && (
                            <Button
                                variant="primary"
                                leftIcon={<Edit3 className="w-4 h-4" />}
                                onClick={() => openModalWithScope(false)}
                            >
                                Ubah Tarif Dojo Ini
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="space-y-6">
                {/* Dojo Switcher Bar (Dropdown Pemilih Dojo) */}
                <div className="p-4 rounded-xl bg-white border border-[#E8EBEF] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF] flex items-center justify-center text-[#102B40] shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-[#718092] uppercase tracking-wider block">
                                Cabang Dojo Aktif
                            </span>
                            <span className="text-sm font-bold text-[#17202D]">
                                {currentDojo ? `${currentDojo.name} (${currentDojo.code})` : 'Pilih Cabang Dojo'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <label htmlFor="dojo-select" className="text-xs font-medium text-[#718092] whitespace-nowrap">
                            Ganti Dojo:
                        </label>
                        <select
                            id="dojo-select"
                            value={currentDojo?.id || ''}
                            onChange={(e) => handleDojoSwitch(e.target.value)}
                            className="h-9 px-3 py-1 rounded-lg border border-[#E8EBEF] bg-white text-xs font-semibold text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none min-w-[240px]"
                        >
                            {allDojos.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.code} • {d.pengkab || d.pengprov})
                                </option>
                            ))}
                        </select>
                        <Badge variant="navy" size="sm">
                            {allDojos.length} Dojo Terdaftar
                        </Badge>
                    </div>
                </div>

                {/* Status Kartu Tarif & Skema Persentase 5 Pihak */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Kartu Tarif Aktif */}
                    <div className="p-5 rounded-xl bg-[#102B40] text-white border border-[#1A3B52] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                                Tarif Iuran Aktif Berjalan
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Aktif Otomatis
                            </span>
                        </div>
                        <div className="text-2xl lg:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                            Rp{currentFeeAmount.toLocaleString('id-ID')}
                            <span className="text-xs font-normal text-slate-300 ml-1">/ bulan</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                            {activeApprovedSetting && activeApprovedSetting.amount > 50000 
                                ? `Disahkan per SK No. ${activeApprovedSetting.approval_sk_number || '-'}` 
                                : 'Tarif resmi standar SK PB PERKEMI No. 045'}
                        </p>
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-300">
                                Berlaku otomatis setiap bulan sampai dirubah.
                            </span>
                            <button
                                type="button"
                                onClick={() => openModalWithScope(false)}
                                className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                            >
                                Ubah Tarif
                            </button>
                        </div>
                    </div>

                    {/* Alokasi Internal Dojo */}
                    <div className="p-5 rounded-xl bg-white text-[#17202D] border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#718092] uppercase tracking-wider">
                                Alokasi Internal Dojo ({currentRates.dojo + currentRates.pelatih}%)
                            </span>
                            <span className="text-xs font-mono font-bold text-[#16865C]">
                                Rp{Math.round(currentFeeAmount * ((currentRates.dojo + currentRates.pelatih) / 100)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="space-y-1.5 pt-1 text-xs">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF]">
                                <span className="text-[#718092]">Kas Pengurus Dojo ({currentRates.dojo}%):</span>
                                <span className="font-mono font-bold text-[#17202D]">
                                    Rp{Math.round(currentFeeAmount * (currentRates.dojo / 100)).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF]">
                                <span className="text-[#718092]">Pelatih / Sensei ({currentRates.pelatih}%):</span>
                                <span className="font-mono font-bold text-[#16865C]">
                                    Rp{Math.round(currentFeeAmount * (currentRates.pelatih / 100)).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Alokasi Setoran Struktur Organisasi */}
                    <div className="p-5 rounded-xl bg-white text-[#17202D] border border-[#E8EBEF] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-[#718092] uppercase tracking-wider">
                                Setoran Organisasi ({currentRates.pb + currentRates.pengprov + currentRates.pengkot}%)
                            </span>
                            <span className="text-xs font-mono font-bold text-[#102B40]">
                                Rp{Math.round(currentFeeAmount * ((currentRates.pb + currentRates.pengprov + currentRates.pengkot) / 100)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="space-y-1.5 pt-1 text-xs">
                            <div className="flex justify-between items-center px-2 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF]">
                                <span className="text-[#718092]">PB PERKEMI ({currentRates.pb}%):</span>
                                <span className="font-mono font-bold text-[#17202D]">
                                    Rp{Math.round(currentFeeAmount * (currentRates.pb / 100)).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-2 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF]">
                                <span className="text-[#718092]">Pengprov ({currentRates.pengprov}%):</span>
                                <span className="font-mono font-bold text-[#17202D]">
                                    Rp{Math.round(currentFeeAmount * (currentRates.pengprov / 100)).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-2 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF]">
                                <span className="text-[#718092]">Pengkot ({currentRates.pengkot}%):</span>
                                <span className="font-mono font-bold text-[#17202D]">
                                    Rp{Math.round(currentFeeAmount * (currentRates.pengkot / 100)).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Proposals Section (PB PERKEMI Review Queue) */}
                {isPBOrAdmin && pendingProposals.length > 0 && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                            <Clock className="w-4 h-4 text-amber-600" />
                            Antrean Persetujuan Usulan Tarif di Atas Rp50.000 (Opsi A) — Khusus PB PERKEMI
                        </div>
                        <p className="text-xs text-amber-800">
                            Sesuai SK, tarif di atas Rp50.000 wajib diverifikasi dokumen dasarnya oleh PB PERKEMI sebelum tagihan kenshi dapat diterbitkan dengan nominal baru.
                        </p>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dojo Pengusul</TableHead>
                                        <TableHead>Kode Cabang</TableHead>
                                        <TableHead>Nominal Diajukan</TableHead>
                                        <TableHead>Periode Efektif</TableHead>
                                        <TableHead>Alasan Perubahan</TableHead>
                                        <TableHead className="text-right">Aksi Otorisasi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingProposals.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-bold text-[#17202D]">{p.dojo.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-[#718092]">{p.dojo.code}</TableCell>
                                            <TableCell className="font-mono font-bold text-[#C51C2A]">
                                                Rp{p.amount.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell className="font-medium text-[#17202D]">{p.effective_from}</TableCell>
                                            <TableCell className="text-[#718092] max-w-xs truncate">{p.change_reason || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="navy"
                                                    size="sm"
                                                    onClick={() => setSelectedPending(p)}
                                                >
                                                    Tinjau Usulan
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* History Table */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] overflow-hidden shadow-2xs">
                    <div className="px-5 py-4 border-b border-[#E8EBEF] flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#17202D] flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#718092]" />
                            Riwayat Konfigurasi &amp; Status Tarif Dojo
                        </h3>
                        <span className="text-xs text-[#718092]">
                            {settings.data.length} catatan riwayat
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dojo</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Skema Pembagian (%)</TableHead>
                                    <TableHead>Periode Berlaku</TableHead>
                                    <TableHead>Status Otorisasi</TableHead>
                                    <TableHead>Nomor SK Persetujuan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {settings.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-[#718092]">
                                            Belum ada riwayat konfigurasi tarif tercatat untuk dojo ini.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    settings.data.map((s) => {
                                        const rates = s.metadata?.allocation_rates || { pb: 20, pengprov: 10, pengkot: 10, dojo: 20, pelatih: 40 };
                                        return (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-bold text-[#17202D]">{s.dojo?.name || '-'}</TableCell>
                                                <TableCell className="capitalize text-[#718092]">{s.category}</TableCell>
                                                <TableCell className="font-mono font-bold text-[#17202D]">
                                                    Rp{s.amount.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-[#718092]">
                                                    {rates.pb}/{rates.pengprov}/{rates.pengkot}/{rates.dojo}/{rates.pelatih}
                                                </TableCell>
                                                <TableCell className="text-xs text-[#718092]">{s.effective_from} {s.effective_to ? `s/d ${s.effective_to}` : ''}</TableCell>
                                                <TableCell>
                                                    {s.status === 'approved' ? (
                                                        <Badge variant="emerald" withDot>
                                                            Disetujui PB
                                                        </Badge>
                                                    ) : s.status === 'pending_pb' ? (
                                                        <Badge variant="amber" withDot>
                                                            Menunggu Otorisasi
                                                        </Badge>
                                                    ) : s.status === 'superseded' ? (
                                                        <Badge variant="slate">
                                                            Tergantikan
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="rose" withDot>
                                                            Ditolak
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-[#718092]">{s.approval_sk_number || '-'}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal Form Konfigurasi Tarif & Persentase Alokasi */}
            {showProposeModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8EBEF] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#17202D]">
                                    {data.apply_to_all_dojos ? 'Penyetelan Tarif & Alokasi Global (Seluruh Dojo)' : `Konfigurasi Tarif & Alokasi — ${currentDojo?.name}`}
                                </h3>
                                <p className="text-[11px] text-[#718092] mt-0.5">
                                    Disetting sekali oleh PB/Admin dan otomatis berlaku seterusnya, serta dapat disesuaikan kembali kapan saja.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowProposeModal(false)}
                                className="text-[#718092] hover:text-[#17202D] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleProposeSubmit} className="space-y-4 text-xs">
                            {/* Pilihan Cakupan Pengaturan (Khusus Admin / PB) */}
                            {isPBOrAdmin && (
                                <div className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E8EBEF] space-y-2">
                                    <span className="text-[11px] font-semibold text-[#17202D] block">
                                        Cakupan Penyetelan:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('apply_to_all_dojos', false)}
                                            className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                                                !data.apply_to_all_dojos
                                                    ? 'border-[#102B40] bg-white font-bold text-[#102B40] shadow-2xs'
                                                    : 'border-[#E8EBEF] bg-[#F8F9FA] text-[#718092]'
                                            }`}
                                        >
                                            <div className="text-xs">Dojo Terpilih Saja</div>
                                            <div className="text-[10px] font-normal text-[#718092] truncate">{currentDojo?.name}</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('apply_to_all_dojos', true)}
                                            className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                                                data.apply_to_all_dojos
                                                    ? 'border-[#102B40] bg-white font-bold text-[#102B40] shadow-2xs'
                                                    : 'border-[#E8EBEF] bg-[#F8F9FA] text-[#718092]'
                                            }`}
                                        >
                                            <div className="text-xs">Semua Dojo (Global)</div>
                                            <div className="text-[10px] font-normal text-[#718092]">Setel sekali untuk {allDojos.length} dojo</div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Pilihan Cepat Nominal (Presets) */}
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1.5">
                                    Pilih Cepat Nominal Iuran:
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[50000, 75000, 100000, 150000].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setData('amount', preset)}
                                            className={`py-1.5 px-2 rounded-lg border text-center font-mono text-xs transition cursor-pointer ${
                                                data.amount === preset
                                                    ? 'border-[#102B40] bg-[#102B40] text-white font-bold'
                                                    : 'border-[#E8EBEF] bg-white text-[#17202D] hover:bg-[#F8F9FA]'
                                            }`}
                                        >
                                            Rp{(preset / 1000)}rb
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Nominal Manual */}
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">
                                    Nominal Iuran Bulanan Kyukenshi (Rupiah)
                                </label>
                                <input
                                    type="number"
                                    min="50000"
                                    step="5000"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', parseInt(e.target.value) || 50000)}
                                    className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] font-mono text-sm font-bold text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                                {data.amount > 50000 ? (
                                    <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        Nominal di atas Rp50.000 berstatus Usulan (Opsi A) dan disahkan oleh PB PERKEMI.
                                    </p>
                                ) : (
                                    <p className="text-[11px] text-[#16865C] mt-1 flex items-center gap-1 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        Tarif resmi standar SK Rp50.000 otomatis aktif langsung tanpa persetujuan tambahan.
                                    </p>
                                )}
                            </div>

                            {/* Accordion / Bagian Pengaturan Persentase Alokasi 5 Pihak (Khusus PB/Admin) */}
                            {isPBOrAdmin && (
                                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-[#E8EBEF] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <PieChart className="w-4 h-4 text-[#102B40]" />
                                            <span className="font-bold text-[#17202D] text-xs">
                                                Konfigurasi Persentase Pembagian 5 Pihak:
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={resetRatesToStandard}
                                            className="text-[11px] font-semibold text-[#102B40] hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Reset Standar SK (20/10/10/20/40)
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="block text-[11px] font-medium text-[#718092] mb-0.5">
                                                PB PERKEMI (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.rates.pb}
                                                onChange={(e) => setData('rates', { ...data.rates, pb: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-8 px-2 rounded-lg border border-[#E8EBEF] font-mono text-xs font-bold text-[#17202D] bg-white focus:ring-1 focus:ring-[#102B40]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-medium text-[#718092] mb-0.5">
                                                Pengprov (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.rates.pengprov}
                                                onChange={(e) => setData('rates', { ...data.rates, pengprov: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-8 px-2 rounded-lg border border-[#E8EBEF] font-mono text-xs font-bold text-[#17202D] bg-white focus:ring-1 focus:ring-[#102B40]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-medium text-[#718092] mb-0.5">
                                                Pengkot (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.rates.pengkot}
                                                onChange={(e) => setData('rates', { ...data.rates, pengkot: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-8 px-2 rounded-lg border border-[#E8EBEF] font-mono text-xs font-bold text-[#17202D] bg-white focus:ring-1 focus:ring-[#102B40]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-medium text-[#718092] mb-0.5">
                                                Kas Dojo (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.rates.dojo}
                                                onChange={(e) => setData('rates', { ...data.rates, dojo: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-8 px-2 rounded-lg border border-[#E8EBEF] font-mono text-xs font-bold text-[#17202D] bg-white focus:ring-1 focus:ring-[#102B40]"
                                            />
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-[11px] font-medium text-[#718092] mb-0.5">
                                                Pelatih / Sensei (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={data.rates.pelatih}
                                                onChange={(e) => setData('rates', { ...data.rates, pelatih: parseFloat(e.target.value) || 0 })}
                                                className="w-full h-8 px-2 rounded-lg border border-[#E8EBEF] font-mono text-xs font-bold text-[#17202D] bg-white focus:ring-1 focus:ring-[#102B40]"
                                            />
                                        </div>

                                        <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                                            <div className={`p-1.5 rounded-lg border text-center font-mono font-bold text-xs ${
                                                isRateValid ? 'bg-emerald-50 text-[#16865C] border-emerald-200' : 'bg-red-50 text-[#DC3545] border-red-200'
                                            }`}>
                                                Total: {totalRate}% {isRateValid ? '✓' : '⚠️'}
                                            </div>
                                        </div>
                                    </div>

                                    {!isRateValid && (
                                        <p className="text-[11px] text-[#DC3545] font-semibold flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Total persentase harus tepat 100% sebelum dapat disimpan.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Realtime 5-Beneficiary Calculator */}
                            <div className="p-3 bg-[#F8F9FA] rounded-lg border border-[#E8EBEF] space-y-1.5">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#718092] block">
                                    Simulasi Distribusi Berdasarkan Nominal &amp; Persentase di Atas:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                                    <div className="p-1.5 bg-white rounded border border-[#E8EBEF]">
                                        <span className="text-[#718092] block text-[10px]">PB Perkemi ({data.rates.pb}%)</span>
                                        <span className="font-bold text-[#17202D]">Rp{Math.round(data.amount * (data.rates.pb / 100)).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="p-1.5 bg-white rounded border border-[#E8EBEF]">
                                        <span className="text-[#718092] block text-[10px]">Pengprov ({data.rates.pengprov}%)</span>
                                        <span className="font-bold text-[#17202D]">Rp{Math.round(data.amount * (data.rates.pengprov / 100)).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="p-1.5 bg-white rounded border border-[#E8EBEF]">
                                        <span className="text-[#718092] block text-[10px]">Pengkot ({data.rates.pengkot}%)</span>
                                        <span className="font-bold text-[#17202D]">Rp{Math.round(data.amount * (data.rates.pengkot / 100)).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="p-1.5 bg-white rounded border border-[#E8EBEF]">
                                        <span className="text-[#718092] block text-[10px]">Kas Dojo ({data.rates.dojo}%)</span>
                                        <span className="font-bold text-[#16865C]">Rp{Math.round(data.amount * (data.rates.dojo / 100)).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="p-1.5 bg-white rounded border border-[#E8EBEF] col-span-2 sm:col-span-1">
                                        <span className="text-[#718092] block text-[10px]">Pelatih ({data.rates.pelatih}%)</span>
                                        <span className="font-bold text-[#16865C]">Rp{Math.round(data.amount * (data.rates.pelatih / 100)).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">
                                    Periode Mulai Berlaku (YYYY-MM)
                                </label>
                                <input
                                    type="month"
                                    value={data.effective_from}
                                    onChange={(e) => setData('effective_from', e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">
                                    Alasan Penyesuaian Tarif / Alokasi
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.change_reason}
                                    onChange={(e) => setData('change_reason', e.target.value)}
                                    placeholder="Contoh: Penyesuaian persentase operasional dojo berdasarkan kesepakatan Musprov/Rakerprov..."
                                    className="w-full p-2.5 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-[#E8EBEF] flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowProposeModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    type="submit"
                                    disabled={processing || !isRateValid}
                                    isLoading={processing}
                                >
                                    Simpan &amp; Terapkan Konfigurasi
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal PB Approval Review */}
            {selectedPending && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8EBEF] text-xs">
                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-3">
                            <h3 className="text-sm font-bold text-[#17202D]">
                                Otorisasi Persetujuan Tarif — PB PERKEMI
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedPending(null)}
                                className="text-[#718092] hover:text-[#17202D] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 bg-[#F8F9FA] rounded-lg border border-[#E8EBEF] space-y-1">
                            <div className="font-bold text-[#17202D]">{selectedPending.dojo.name}</div>
                            <div className="text-[#718092]">Nominal Usulan: <span className="font-bold text-[#C51C2A]">Rp{selectedPending.amount.toLocaleString('id-ID')}</span></div>
                            <div className="text-[#718092]">Periode: <span className="font-medium text-[#17202D]">{selectedPending.effective_from}</span></div>
                            <div className="text-[#718092]">Alasan: <span className="text-[#17202D]">{selectedPending.change_reason || '-'}</span></div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">
                                    Nomor SK PB PERKEMI Dasar Persetujuan
                                </label>
                                <input
                                    type="text"
                                    value={skNumber}
                                    onChange={(e) => setSkNumber(e.target.value)}
                                    placeholder="Contoh: 088/SK-PB/IX/2026"
                                    className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] font-mono text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">
                                    Alasan Penolakan (Jika Menolak)
                                </label>
                                <textarea
                                    rows={2}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Alasan penolakan jika usulan tidak disahkan..."
                                    className="w-full p-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#E8EBEF] flex justify-end gap-2">
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleReject(selectedPending.id)}
                            >
                                Tolak Usulan
                            </Button>
                            <Button
                                variant="navy"
                                size="sm"
                                onClick={() => handleApprove(selectedPending.id)}
                            >
                                Setujui &amp; Sahkan Tarif
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
