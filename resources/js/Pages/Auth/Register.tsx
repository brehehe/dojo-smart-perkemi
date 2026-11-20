import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    Info,
    Lock,
    LogIn,
    MapPin,
    Shield,
    Sparkles,
    User,
    UserCheck,
    UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DojoOption {
    id: string;
    name: string;
    code: string;
    pengprov: string;
    pengkab?: string;
    city?: string;
}

interface RankOption {
    value: string;
    label: string;
}

interface PengurusOption {
    id: string;
    name: string;
    code: string;
    region: string;
}

interface Props {
    dojos: DojoOption[];
    ranks: RankOption[];
    pengkots?: PengurusOption[];
    pengprovs?: PengurusOption[];
}

export default function Register({ dojos, ranks, pengkots = [], pengprovs = [] }: Props) {
    const defaultDojoId = dojos.length > 0 ? dojos[0].id : '';

    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [termsError, setTermsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        gender: 'M',
        rank: ranks.length > 0 ? ranks[0].value : 'minarai',
        id_card_number: '',
        dojo_id: defaultDojoId,
        is_atlet_pengkot: false,
        pengkot_id: '',
        pengkot: '',
        is_atlet_pengprov: false,
        pengprov_id: '',
        pengprov: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const steps = [
        { number: 1, id: '01', title: 'Identitas Kenshi', short: 'Identitas' },
        { number: 2, id: '02', title: 'Afiliasi Dojo', short: 'Afiliasi' },
        { number: 3, id: '03', title: 'Akun & Keamanan', short: 'Akun' },
        { number: 4, id: '04', title: 'Konfirmasi Pendaftaran', short: 'Konfirmasi' },
    ];

    // Auto-detect backend errors and navigate user to corresponding step
    useEffect(() => {
        if (errors.full_name || errors.gender || errors.rank || errors.id_card_number) {
            setCurrentStep(1);
        } else if (errors.dojo_id || errors.pengkot_id || errors.pengprov_id) {
            setCurrentStep(2);
        } else if (errors.email || errors.password || errors.password_confirmation || errors.phone) {
            setCurrentStep(3);
        }
    }, [errors]);

    // Validate Step 1 before proceeding
    const validateStep1 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!data.full_name.trim()) {
            errs.full_name = 'Nama lengkap Kenshi wajib diisi.';
        }
        if (!data.gender) {
            errs.gender = 'Silakan pilih jenis kelamin.';
        }
        if (!data.rank) {
            errs.rank = 'Silakan pilih tingkatan sabuk awal.';
        }
        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Validate Step 2 before proceeding
    const validateStep2 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!data.dojo_id) {
            errs.dojo_id = 'Pilih asal cabang dojo tempat Anda terdaftar.';
        }
        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Validate Step 3 before proceeding
    const validateStep3 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!data.email.trim()) {
            errs.email = 'Alamat email wajib diisi.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errs.email = 'Format alamat email tidak valid.';
        }

        if (!data.password) {
            errs.password = 'Kata sandi wajib diisi.';
        } else if (data.password.length < 6) {
            errs.password = 'Kata sandi minimal 6 karakter.';
        }

        if (!data.password_confirmation) {
            errs.password_confirmation = 'Konfirmasi kata sandi wajib diisi.';
        } else if (data.password !== data.password_confirmation) {
            errs.password_confirmation = 'Konfirmasi kata sandi tidak sesuai dengan kata sandi.';
        }

        setStepErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (validateStep1()) setCurrentStep(2);
        } else if (currentStep === 2) {
            if (validateStep2()) setCurrentStep(3);
        } else if (currentStep === 3) {
            if (validateStep3()) setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setStepErrors({});
            setCurrentStep((prev) => prev - 1);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreedToTerms) {
            setTermsError(true);
            return;
        }

        setTermsError(false);
        post('/register', {
            onError: () => {
                // If backend error returns, useEffect will navigate to the erroneous step
            },
            onSuccess: () => {
                setIsSuccess(true);
            },
        });
    };

    // Resolvers for confirmation summary display
    const selectedDojo = dojos.find((d) => d.id === data.dojo_id);
    const selectedRank = ranks.find((r) => r.value === data.rank);
    const selectedPengkot = pengkots.find((p) => p.id === data.pengkot_id);
    const selectedPengprov = pengprovs.find((p) => p.id === data.pengprov_id);

    // Progress percentage calculation
    const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#17202D] font-sans antialiased flex flex-col justify-between p-0 lg:p-6 selection:bg-[#C51C2A] selection:text-white">
            <Head title="Registrasi Kenshi Baru - e-DOJO PERKEMI INDONESIA" />

            {/* Desktop Top Breadcrumb */}
            <div className="max-w-[1440px] w-full mx-auto px-4 py-3 hidden lg:flex items-center gap-2 text-xs text-[#718092]">
                <div className="w-5 h-5 rounded-md bg-[#C51C2A] flex items-center justify-center text-white shrink-0">
                    <Shield className="w-3 h-3 fill-white/10 stroke-white" />
                </div>
                <span className="font-bold text-[#17202D]">e-DOJO</span>
                <span>/</span>
                <span>Pendaftaran Kenshi</span>
            </div>

            {/* Main Application Container */}
            <div className="w-full max-w-[1440px] mx-auto min-h-screen lg:min-h-[840px] bg-white lg:rounded-2xl lg:border lg:border-[#E8EBEF] shadow-xs overflow-hidden flex flex-col lg:flex-row my-auto">
                
                {/* ======================================================== */}
                {/* LEFT PANEL: BRAND & VERTICAL STEPPER (30% width)        */}
                {/* ======================================================== */}
                <div className="hidden lg:flex lg:w-4/12 xl:w-3/12 bg-[#102B40] text-white flex-col justify-between p-8 xl:p-10 select-none border-r border-[#1A3B52]">
                    {/* Brand Header */}
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C51C2A] shadow-inner">
                            <Shield className="w-9 h-9 fill-[#C51C2A]/20 stroke-[#C51C2A] stroke-[1.75]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-white">e-DOJO</h2>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300 mt-0.5">
                                PERKEMI INDONESIA
                            </p>
                            <div className="w-8 h-1 bg-[#C51C2A] rounded-full my-2.5" />
                            <p className="text-xs italic text-slate-300">
                                Pendaftaran anggota kenshi
                            </p>
                        </div>
                    </div>

                    {/* Vertical Stepper */}
                    <div className="py-8 my-auto space-y-6">
                        {steps.map((s, idx) => {
                            const isCompleted = currentStep > s.number;
                            const isActive = currentStep === s.number;
                            const isUpcoming = currentStep < s.number;

                            return (
                                <div key={s.number} className="relative flex items-center gap-3.5 group">
                                    {/* Vertical connecting line */}
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={cn(
                                                'absolute left-4 top-8 -bottom-6 w-0.5 transition-colors duration-200',
                                                isCompleted ? 'bg-[#C51C2A]' : 'bg-[#1A3B52]'
                                            )}
                                        />
                                    )}

                                    {/* Step Circle Indicator */}
                                    <div
                                        className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200 z-10',
                                            isActive && 'bg-[#C51C2A] text-white ring-4 ring-[#C51C2A]/20',
                                            isCompleted && 'bg-[#16865C] text-white',
                                            isUpcoming && 'border border-[#24475E] bg-[#102B40] text-slate-400'
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                        ) : (
                                            <span>{s.id}</span>
                                        )}
                                    </div>

                                    {/* Step Label */}
                                    <div className="leading-tight">
                                        <span
                                            className={cn(
                                                'text-xs font-semibold block transition-colors duration-200',
                                                isActive && 'text-white font-bold',
                                                isCompleted && 'text-slate-200',
                                                isUpcoming && 'text-slate-400'
                                            )}
                                        >
                                            {s.title}
                                        </span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5">
                                            {isActive ? 'Langkah Aktif' : isCompleted ? 'Selesai' : 'Berikutnya'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-[#1A3B52] text-[11px] text-slate-400 flex items-center justify-between">
                        <span>PB Perkemi &copy; 2026</span>
                        <span className="font-mono text-[10px] bg-[#1A3B52] px-2 py-0.5 rounded text-slate-300">
                            v1.0.0
                        </span>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* RIGHT PANEL: REGISTRATION WIZARD FORM (70% width)        */}
                {/* ======================================================== */}
                <div className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-y-auto">
                    
                    {/* Mobile Header (< lg screens) */}
                    <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#E8EBEF] mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#C51C2A] flex items-center justify-center text-white shrink-0">
                                <Shield className="w-4 h-4 fill-white/10 stroke-white" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-[#17202D] block">e-DOJO</span>
                                <span className="text-[9px] uppercase tracking-wider font-semibold text-[#718092] block">
                                    PERKEMI INDONESIA
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#17202D] bg-[#F8F9FA] border border-[#E8EBEF] px-2.5 py-1 rounded-full">
                            Langkah {currentStep} / 4
                        </span>
                    </div>

                    {/* Form Container (Max Width 720px) */}
                    <div className="w-full max-w-[720px] mx-auto py-2 flex-1 flex flex-col justify-between">
                        
                        {/* Step Header & Progress */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17202D]">
                                Registrasi Kenshi Baru
                            </h1>
                            <p className="text-xs sm:text-sm text-[#718092] mt-1">
                                Langkah {currentStep} dari 4 •{' '}
                                <span className="font-semibold text-[#17202D]">
                                    {steps[currentStep - 1].title}
                                </span>
                            </p>

                            {/* Horizontal Progress Bar */}
                            <div className="w-full h-1.5 bg-[#E8EBEF] rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full bg-[#C51C2A] rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${((currentStep) / 4) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* General Backend Error Alert */}
                        {errors.email && (
                            <div
                                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-[#DC3545] text-xs flex items-start gap-2.5"
                                role="alert"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span className="font-medium leading-snug">{errors.email}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="flex-1 flex flex-col justify-between" noValidate>
                            
                            {/* ==================================================== */}
                            {/* STEP 1: IDENTITAS KENSHI                            */}
                            {/* ==================================================== */}
                            {currentStep === 1 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    {/* Field: Nama Lengkap Kenshi */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="full_name"
                                            className="block text-xs font-semibold text-[#17202D]"
                                        >
                                            Nama lengkap Kenshi <span className="text-[#C51C2A]">*</span>
                                        </label>
                                        <input
                                            id="full_name"
                                            type="text"
                                            required
                                            placeholder="Contoh: Budi Prasetyo"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            className={cn(
                                                'w-full h-12 rounded-lg border bg-white px-3.5 text-xs sm:text-sm text-[#17202D] placeholder:text-slate-400',
                                                'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40]',
                                                (stepErrors.full_name || errors.full_name)
                                                    ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                                    : 'border-[#E8EBEF]'
                                            )}
                                        />
                                        {(stepErrors.full_name || errors.full_name) && (
                                            <p className="text-[11px] font-medium text-[#DC3545] mt-1">
                                                {stepErrors.full_name || errors.full_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Two Column Grid: Jenis Kelamin & Tingkatan Sabuk */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Jenis Kelamin */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="gender"
                                                className="block text-xs font-semibold text-[#17202D]"
                                            >
                                                Jenis kelamin <span className="text-[#C51C2A]">*</span>
                                            </label>
                                            <select
                                                id="gender"
                                                required
                                                value={data.gender}
                                                onChange={(e) => setData('gender', e.target.value)}
                                                className="w-full h-12 rounded-lg border border-[#E8EBEF] bg-white px-3.5 text-xs sm:text-sm text-[#17202D] focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition cursor-pointer"
                                            >
                                                <option value="M">Laki-laki (Pria)</option>
                                                <option value="F">Perempuan (Wanita)</option>
                                            </select>
                                        </div>

                                        {/* Tingkatan Sabuk Awal */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="rank"
                                                className="block text-xs font-semibold text-[#17202D]"
                                            >
                                                Tingkatan sabuk awal <span className="text-[#C51C2A]">*</span>
                                            </label>
                                            <select
                                                id="rank"
                                                required
                                                value={data.rank}
                                                onChange={(e) => setData('rank', e.target.value)}
                                                className="w-full h-12 rounded-lg border border-[#E8EBEF] bg-white px-3.5 text-xs sm:text-sm text-[#17202D] focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition cursor-pointer"
                                            >
                                                {ranks.map((r) => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Field: Nomor Induk Kenshi (NIK Kenshi) */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="id_card_number"
                                            className="block text-xs font-semibold text-[#17202D]"
                                        >
                                            Nomor Induk Kenshi <span className="text-slate-400 font-normal">(opsional)</span>
                                        </label>
                                        <input
                                            id="id_card_number"
                                            type="text"
                                            placeholder="Contoh: KNS-SBY-009"
                                            value={data.id_card_number}
                                            onChange={(e) => setData('id_card_number', e.target.value)}
                                            className="w-full h-12 rounded-lg border border-[#E8EBEF] bg-white px-3.5 text-xs sm:text-sm text-[#17202D] focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition"
                                        />
                                        <p className="text-[11px] text-[#718092]">
                                            Kosongkan jika anggota baru (sistem akan menerbitkan nomor secara otomatis).
                                        </p>
                                    </div>

                                    {/* Callout Notice matching screenshot */}
                                    <div className="rounded-xl border border-[#E8EBEF] bg-[#F8F9FA] p-4 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#C51C2A] shrink-0">
                                            <Shield className="w-4 h-4 fill-white/10 stroke-[#C51C2A]" />
                                        </div>
                                        <div className="leading-tight text-xs">
                                            <span className="font-bold text-[#17202D] block">
                                                Asal Dojo: Belum dipilih
                                            </span>
                                            <span className="text-[#718092] mt-0.5 block">
                                                Informasi dojo akan Anda lengkapi pada langkah berikutnya.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* STEP 2: AFILIASI DOJO & ORGANISASI                  */}
                            {/* ==================================================== */}
                            {currentStep === 2 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    {/* 2.1. Asal Dojo (Wajib) */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="dojo_id"
                                            className="block text-xs font-semibold text-[#17202D]"
                                        >
                                            Asal Dojo <span className="text-[#C51C2A]">*</span>
                                        </label>
                                        <select
                                            id="dojo_id"
                                            required
                                            value={data.dojo_id}
                                            onChange={(e) => setData('dojo_id', e.target.value)}
                                            className={cn(
                                                'w-full h-12 rounded-lg border bg-white px-3.5 text-xs sm:text-sm text-[#17202D]',
                                                'focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition cursor-pointer',
                                                (stepErrors.dojo_id || errors.dojo_id)
                                                    ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                                    : 'border-[#E8EBEF]'
                                            )}
                                        >
                                            <option value="" disabled>-- Pilih Asal Dojo --</option>
                                            {dojos.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} — {d.pengprov} {d.city ? `(${d.city})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-[#718092]">
                                            Untuk afiliasi Dojo dan jadwal latihan rutin dojo.
                                        </p>
                                        {(stepErrors.dojo_id || errors.dojo_id) && (
                                            <p className="text-[11px] font-medium text-[#DC3545] mt-1">
                                                {stepErrors.dojo_id || errors.dojo_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* 2.2. Asal Pengkot / Pengkab (Opsional) */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="pengkot_id"
                                                className="block text-xs font-semibold text-[#17202D]"
                                            >
                                                Asal Pengkot / Pengkab <span className="text-slate-400 font-normal">(Opsional)</span>
                                            </label>
                                            {data.is_atlet_pengkot && (
                                                <span className="text-[10px] font-bold text-[#C51C2A] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                                    Atlet Pengkot
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            id="pengkot_id"
                                            value={data.pengkot_id}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const selected = pengkots.find((p) => p.id === selectedId);
                                                setData((prev) => ({
                                                    ...prev,
                                                    pengkot_id: selectedId,
                                                    pengkot: selected ? (selected.region || selected.name) : '',
                                                    is_atlet_pengkot: Boolean(selectedId),
                                                }));
                                            }}
                                            className="w-full h-12 rounded-lg border border-[#E8EBEF] bg-white px-3.5 text-xs sm:text-sm text-[#17202D] focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition cursor-pointer"
                                        >
                                            <option value="">-- Tidak / Belum Terdaftar di Pengkot (Opsional) --</option>
                                            {pengkots.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} {p.region ? `(${p.region})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-[#718092]">
                                            Yang punya kewenangan untuk atlet kota/kabupaten dan TC serta jadwal TC.
                                        </p>
                                    </div>

                                    {/* 2.3. Asal Pengprov (Opsional) */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label
                                                htmlFor="pengprov_id"
                                                className="block text-xs font-semibold text-[#17202D]"
                                            >
                                                Asal Pengprov <span className="text-slate-400 font-normal">(Opsional)</span>
                                            </label>
                                            {data.is_atlet_pengprov && (
                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                    Atlet Puslatda / Pengprov
                                                </span>
                                            )}
                                        </div>
                                        <select
                                            id="pengprov_id"
                                            value={data.pengprov_id}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const selected = pengprovs.find((p) => p.id === selectedId);
                                                setData((prev) => ({
                                                    ...prev,
                                                    pengprov_id: selectedId,
                                                    pengprov: selected ? (selected.region || selected.name) : '',
                                                    is_atlet_pengprov: Boolean(selectedId),
                                                }));
                                            }}
                                            className="w-full h-12 rounded-lg border border-[#E8EBEF] bg-white px-3.5 text-xs sm:text-sm text-[#17202D] focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition cursor-pointer"
                                        >
                                            <option value="">-- Tidak / Belum Terdaftar di Pengprov (Opsional) --</option>
                                            {pengprovs.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} {p.region ? `(${p.region})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-[#718092]">
                                            Yang punya hak tim Puslatda TC dan jadwal TC Puslatda.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* STEP 3: INFORMASI KONTAK & AKUN                      */}
                            {/* ==================================================== */}
                            {currentStep === 3 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    {/* Nomor WhatsApp / HP */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="phone"
                                            className="block text-xs font-semibold text-[#17202D]"
                                        >
                                            Nomor WhatsApp / HP
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            placeholder="Contoh: 08123456789"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="w-full h-12 rounded-lg border border-[#E8EBEF] bg-white px-3.5 text-xs sm:text-sm text-[#17202D] focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition"
                                        />
                                        <p className="text-[11px] text-[#718092]">
                                            Digunakan untuk notifikasi presensi, kegiatan dojo, dan tagihan iuran.
                                        </p>
                                    </div>

                                    {/* Alamat Email */}
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="email"
                                            className="block text-xs font-semibold text-[#17202D]"
                                        >
                                            Alamat email (Untuk Login) <span className="text-[#C51C2A]">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="nama@email.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={cn(
                                                'w-full h-12 rounded-lg border bg-white px-3.5 text-xs sm:text-sm text-[#17202D]',
                                                'focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition',
                                                (stepErrors.email || errors.email)
                                                    ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                                    : 'border-[#E8EBEF]'
                                            )}
                                        />
                                        {(stepErrors.email || errors.email) && (
                                            <p className="text-[11px] font-medium text-[#DC3545] mt-1">
                                                {stepErrors.email || errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Kata Sandi */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="password"
                                                className="block text-xs font-semibold text-[#17202D]"
                                            >
                                                Kata sandi <span className="text-[#C51C2A]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    autoComplete="new-password"
                                                    placeholder="Minimal 6 karakter"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={cn(
                                                        'w-full h-12 rounded-lg border bg-white px-3.5 pr-11 text-xs sm:text-sm text-[#17202D]',
                                                        'focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition',
                                                        (stepErrors.password || errors.password)
                                                            ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                                            : 'border-[#E8EBEF]'
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-[#17202D] transition focus:outline-none"
                                                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {(stepErrors.password || errors.password) && (
                                                <p className="text-[11px] font-medium text-[#DC3545] mt-1">
                                                    {stepErrors.password || errors.password}
                                                </p>
                                            )}
                                        </div>

                                        {/* Konfirmasi Kata Sandi */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="password_confirmation"
                                                className="block text-xs font-semibold text-[#17202D]"
                                            >
                                                Konfirmasi kata sandi <span className="text-[#C51C2A]">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    required
                                                    autoComplete="new-password"
                                                    placeholder="Ulangi kata sandi"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className={cn(
                                                        'w-full h-12 rounded-lg border bg-white px-3.5 pr-11 text-xs sm:text-sm text-[#17202D]',
                                                        'focus:outline-none focus:ring-2 focus:ring-[#102B40]/15 focus:border-[#102B40] transition',
                                                        (stepErrors.password_confirmation || errors.password_confirmation)
                                                            ? 'border-[#DC3545] focus:ring-red-100 focus:border-[#DC3545]'
                                                            : 'border-[#E8EBEF]'
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-[#17202D] transition focus:outline-none"
                                                    aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {(stepErrors.password_confirmation || errors.password_confirmation) && (
                                                <p className="text-[11px] font-medium text-[#DC3545] mt-1">
                                                    {stepErrors.password_confirmation || errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* STEP 4: RINGKASAN & KONFIRMASI                      */}
                            {/* ==================================================== */}
                            {currentStep === 4 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-[#E8EBEF] text-xs text-[#718092] flex items-start gap-2.5">
                                        <Info className="w-4 h-4 text-[#102B40] shrink-0 mt-0.5" />
                                        <span>
                                            Periksa kembali data pendaftaran Anda sebelum mengirim. Anda dapat mengklik tombol <strong>Ubah</strong> pada masing-masing seksi jika terdapat data yang perlu dikoreksi.
                                        </span>
                                    </div>

                                    {/* Ringkasan Seksi 1: Identitas */}
                                    <div className="rounded-xl border border-[#E8EBEF] p-4 bg-white shadow-2xs space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-2">
                                            <span className="text-xs font-bold text-[#17202D] uppercase tracking-wider flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#C51C2A]" /> Identitas Kenshi
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="text-xs font-semibold text-[#C51C2A] hover:underline"
                                            >
                                                Ubah
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[#718092] block">Nama Lengkap</span>
                                                <span className="font-semibold text-[#17202D] block">{data.full_name}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#718092] block">Jenis Kelamin</span>
                                                <span className="font-semibold text-[#17202D] block">
                                                    {data.gender === 'M' ? 'Laki-laki (Pria)' : 'Perempuan (Wanita)'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#718092] block">Tingkatan Sabuk</span>
                                                <span className="font-semibold text-[#17202D] block">
                                                    {selectedRank?.label || data.rank}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#718092] block">Nomor Induk Kenshi (NIK)</span>
                                                <span className="font-semibold text-[#17202D] block font-mono">
                                                    {data.id_card_number || '(Diterbitkan Otomatis)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ringkasan Seksi 2: Afiliasi */}
                                    <div className="rounded-xl border border-[#E8EBEF] p-4 bg-white shadow-2xs space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-2">
                                            <span className="text-xs font-bold text-[#17202D] uppercase tracking-wider flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-[#C51C2A]" /> Afiliasi Dojo & Organisasi
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="text-xs font-semibold text-[#C51C2A] hover:underline"
                                            >
                                                Ubah
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="col-span-2">
                                                <span className="text-[#718092] block">Asal Dojo</span>
                                                <span className="font-semibold text-[#17202D] block">
                                                    {selectedDojo ? `${selectedDojo.name} (${selectedDojo.pengprov})` : '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#718092] block">Pengkot / Pengkab</span>
                                                <span className="font-semibold text-[#17202D] block">
                                                    {selectedPengkot?.name || 'Tidak / Belum Terdaftar'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[#718092] block">Pengprov</span>
                                                <span className="font-semibold text-[#17202D] block">
                                                    {selectedPengprov?.name || 'Tidak / Belum Terdaftar'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ringkasan Seksi 3: Kontak & Akun */}
                                    <div className="rounded-xl border border-[#E8EBEF] p-4 bg-white shadow-2xs space-y-2.5">
                                        <div className="flex items-center justify-between border-b border-[#E8EBEF] pb-2">
                                            <span className="text-xs font-bold text-[#17202D] uppercase tracking-wider flex items-center gap-1.5">
                                                <Lock className="w-3.5 h-3.5 text-[#C51C2A]" /> Kontak & Kredensial Akun
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(3)}
                                                className="text-xs font-semibold text-[#C51C2A] hover:underline"
                                            >
                                                Ubah
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[#718092] block">Alamat Email</span>
                                                <span className="font-semibold text-[#17202D] block font-mono">{data.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#718092] block">Nomor WhatsApp</span>
                                                <span className="font-semibold text-[#17202D] block font-mono">
                                                    {data.phone || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Persetujuan Ketentuan */}
                                    <div className="pt-2">
                                        <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                                            <input
                                                type="checkbox"
                                                checked={agreedToTerms}
                                                onChange={(e) => {
                                                    setAgreedToTerms(e.target.checked);
                                                    if (e.target.checked) setTermsError(false);
                                                }}
                                                className="w-4 h-4 rounded border-[#E8EBEF] text-[#102B40] focus:ring-[#102B40]/20 mt-0.5"
                                            />
                                            <span className="text-[#17202D] leading-relaxed">
                                                Saya menyatakan bahwa data yang diisikan adalah benar dan bersedia mematuhi{' '}
                                                <span className="font-bold">Anggaran Dasar / Anggaran Rumah Tangga (AD/ART)</span>{' '}
                                                serta kebijakan resmi Persaudaraan Bela Diri Kempo Indonesia (PERKEMI).
                                            </span>
                                        </label>
                                        {termsError && (
                                            <p className="text-[11px] font-medium text-[#DC3545] mt-1 pl-6">
                                                Harap setujui ketentuan organisasi sebelum mengirimkan pendaftaran.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* ACTION BUTTONS & WIZARD NAVIGATION                   */}
                            {/* ==================================================== */}
                            <div className="pt-8 border-t border-[#E8EBEF] mt-10 mb-8 flex items-center justify-between gap-4">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        disabled={processing}
                                        className="h-12 px-6 rounded-lg border border-[#E8EBEF] text-[#17202D] hover:bg-slate-50 font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Kembali</span>
                                    </button>
                                ) : (
                                    <div className="text-xs text-[#718092]">
                                        Sudah memiliki akun?{' '}
                                        <Link
                                            href="/login"
                                            className="font-semibold text-[#C51C2A] hover:underline"
                                        >
                                            Masuk
                                        </Link>
                                    </div>
                                )}

                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="h-12 px-7 rounded-lg bg-[#102B40] hover:bg-[#1A3B52] active:bg-[#24475E] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer ml-auto"
                                    >
                                        <span>Lanjutkan</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="h-12 px-8 rounded-lg bg-[#C51C2A] hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-70 ml-auto"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Mendaftarkan Kenshi…</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" />
                                                <span>Kirim Pendaftaran</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Desktop Sub-footer with Clean Spacing */}
                    <div className="mt-8 pt-6 pb-2 border-t border-[#E8EBEF] hidden sm:flex items-center justify-between text-[11px] text-[#718092]">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16865C]" />
                            <span>Pendaftaran Resmi Sistem e-DOJO PERKEMI Indonesia</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="hover:text-[#17202D]">Bantuan Pendaftaran</Link>
                            <span>•</span>
                            <Link href="/login" className="hover:text-[#17202D]">Kebijakan Privasi</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
