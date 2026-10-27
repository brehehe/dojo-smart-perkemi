import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
    Award,
    Building2,
    Calendar,
    CheckCircle2,
    Copy,
    Download,
    QrCode,
    RotateCw,
    Shield,
    Sparkles,
    Star,
    UserCheck,
} from 'lucide-react';
import type { Kenshi } from '@/types';

interface Props {
    kenshi: Kenshi;
    qrValue?: string;
    showControls?: boolean;
}

export function KenshiCard3D({ kenshi, qrValue, showControls = true }: Props) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    // Parallax mouse tilt effect state
    const [rotateX, setRotateX] = useState<number>(0);
    const [rotateY, setRotateY] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const verificationUrl =
        qrValue ||
        (typeof window !== 'undefined'
            ? `${window.location.origin}/kenshis/${kenshi.id}`
            : `https://perkemi.id/kenshis/${kenshi.id}`);

    useEffect(() => {
        QRCode.toDataURL(verificationUrl, {
            width: 320,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
        })
            .then((url) => setQrCodeUrl(url))
            .catch((err) => console.error('Error generating QR Code:', err));
    }, [verificationUrl]);

    // Handle 3D Tilt on Mouse Move
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isFlipped) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;

        // Max 14 degrees rotation
        setRotateX(-deltaY * 12);
        setRotateY(deltaX * 12);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
    };

    const handleCopy = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(verificationUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Format member number or ID
    const memberId =
        (kenshi as any).nomor_induk ||
        (kenshi as any).id_card_number ||
        (kenshi as any).nik ||
        `KNS-${kenshi.id.toString().substring(0, 8).toUpperCase()}`;

    const dojoName = kenshi.dojo?.name || 'PERKEMI Dojo';
    const displayName = kenshi.full_name || (kenshi as any).name || 'Kenshi Perkemi';
    const rankLabel =
        typeof kenshi.rank === 'object' && kenshi.rank !== null
            ? (kenshi.rank as any).label || (kenshi.rank as any).value || 'Kenshi'
            : (kenshi.rank ? String(kenshi.rank) : 'Kenshi');

    return (
        <div className="flex flex-col items-center">
            {/* 3D Perspective Container */}
            <div
                className="relative cursor-pointer select-none"
                style={{ perspective: 1200 }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Flippable Card Wrapper */}
                <div
                    ref={cardRef}
                    className="relative transition-transform duration-500 ease-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${isFlipped ? 180 : rotateY}deg) rotateX(${isFlipped ? 0 : rotateX}deg) ${isHovered && !isFlipped ? 'scale3d(1.02, 1.02, 1.02)' : ''}`,
                        width: 'min(90vw, 420px)',
                        minHeight: '260px',
                    }}
                >
                    {/* ===================== FRONT SIDE ===================== */}
                    <div
                        className="relative overflow-hidden rounded-3xl border border-amber-500/30 p-6 text-white shadow-2xl transition-all"
                        style={{
                            backfaceVisibility: 'hidden',
                            background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 45%, #0f172a 100%)',
                            boxShadow: isHovered
                                ? '0 25px 50px -12px rgba(99, 102, 241, 0.35), 0 0 40px rgba(245, 158, 11, 0.2)'
                                : '0 20px 35px -10px rgba(0, 0, 0, 0.6)',
                        }}
                    >
                        {/* Shimmer / Hologram Overlay */}
                        <div
                            className="pointer-events-none absolute -inset-full opacity-20 transition-opacity"
                            style={{
                                background:
                                    'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                                transform: `translate(${rotateY * 15}px, ${rotateX * 15}px)`,
                            }}
                        />

                        {/* Gold Foil Accent Line */}
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />

                        {/* Header: PERKEMI & Crest */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 shadow-md">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                                        Persaudaraan Shorinji Kempo
                                    </div>
                                    <div className="text-xs font-bold tracking-tight text-white">
                                        KARTU TANDA ANGGOTA (KTA)
                                    </div>
                                </div>
                            </div>

                            {/* Status Chip */}
                            <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                AKTIF
                            </div>
                        </div>

                        {/* Body Details */}
                        <div className="mt-4 flex items-center gap-4">
                            {/* Avatar / Photo with Gold Frame */}
                            <div className="relative shrink-0">
                                <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-slate-800 shadow-inner">
                                    {kenshi.photo_url ? (
                                        <img
                                            src={kenshi.photo_url}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-700 to-slate-900 text-amber-300">
                                            <span className="text-2xl font-black">
                                                {displayName.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="min-w-0 flex-1 space-y-1">
                                <h3 className="truncate text-base font-black tracking-wide text-white">
                                    {displayName}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                                    <Award className="h-3.5 w-3.5 shrink-0" />
                                    <span>{rankLabel}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                    <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    <span className="truncate">{dojoName}</span>
                                </div>
                                <div className="text-[11px] font-mono tracking-wider text-slate-400">
                                    ID: <span className="text-amber-200 font-semibold">{memberId}</span>
                                </div>
                            </div>

                            {/* Small Front QR Code */}
                            {qrCodeUrl && (
                                <div className="hidden sm:block shrink-0 rounded-xl bg-white p-1.5 shadow-md">
                                    <img src={qrCodeUrl} alt="KTA QR Code" className="h-16 w-16 rounded" />
                                </div>
                            )}
                        </div>

                        {/* Athlete Badges (Pengkot & Pengprov) */}
                        <div className="mt-4 flex flex-wrap items-center gap-1.5">
                            {kenshi.is_atlet_pengkot && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                                    <Sparkles className="h-3 w-3 text-rose-400" />
                                    Atlet Pengkot {kenshi.pengkot ? `(${kenshi.pengkot})` : ''}
                                </span>
                            )}
                            {kenshi.is_atlet_pengprov && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                                    <Award className="h-3 w-3 text-purple-400" />
                                    Atlet Pengprov {kenshi.pengprov ? `(${kenshi.pengprov})` : ''}
                                </span>
                            )}
                            {!kenshi.is_atlet_pengkot && !kenshi.is_atlet_pengprov && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-700/50 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                                    Anggota Reguler
                                </span>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                                <RotateCw className="h-3 w-3 animate-spin text-amber-400" />
                                Klik untuk melihat sisi belakang
                            </span>
                            <span className="font-mono text-slate-500">PERKEMI DIGITAL</span>
                        </div>
                    </div>

                    {/* ===================== BACK SIDE ===================== */}
                    <div
                        className="absolute inset-0 overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #030712 100%)',
                        }}
                    >
                        <div className="flex h-full flex-col justify-between">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div className="text-xs font-bold text-amber-400 tracking-wider">
                                    VERIFIKASI DIGITAL KTA
                                </div>
                                <div className="text-[10px] text-slate-400">Shorinji Kempo Indonesia</div>
                            </div>

                            {/* Big QR Code & Security details */}
                            <div className="flex items-center justify-center gap-5 my-2">
                                {qrCodeUrl ? (
                                    <div className="rounded-2xl bg-white p-2.5 shadow-xl ring-4 ring-amber-400/20">
                                        <img
                                            src={qrCodeUrl}
                                            alt="KTA QR Code Large"
                                            className="h-28 w-28 rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-800">
                                        <QrCode className="h-10 w-10 text-slate-500 animate-pulse" />
                                    </div>
                                )}

                                <div className="text-xs space-y-1.5 text-slate-300">
                                    <div className="font-bold text-white">Scan untuk Validasi</div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Pindai QR Code ini untuk memvalidasi keabsahan data kenshi, status keanggotaan aktif, dan riwayat ujian.
                                    </p>
                                    <div className="text-[10px] font-mono text-amber-300">
                                        Hash: {kenshi.id.toString().substring(0, 16)}...
                                    </div>
                                </div>
                            </div>

                            {/* Motto / Sumpah */}
                            <div className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800/80 text-center">
                                <div className="text-[10px] italic text-slate-400">
                                    "Kasih sayang tanpa kekuatan adalah kelemahan, kekuatan tanpa kasih sayang adalah kezaliman."
                                </div>
                                <div className="text-[9px] font-semibold text-amber-400/90 mt-1">
                                    — Doshin So, Pendiri Shorinji Kempo
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-500">
                                <span>PENGURUS BESAR PERKEMI</span>
                                <span>Klik untuk membalik kartu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar (Flip, Copy QR, Download) */}
            {showControls && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <RotateCw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        {isFlipped ? 'Lihat Sisi Depan' : 'Putar Kartu (Sisi Belakang)'}
                    </button>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                Salin URL Verifikasi
                            </>
                        )}
                    </button>

                    {qrCodeUrl && (
                        <a
                            href={qrCodeUrl}
                            download={`KTA-QR-${displayName.replace(/\s+/g, '_')}.png`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-red-700 hover:to-amber-700"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Download QR Code
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
