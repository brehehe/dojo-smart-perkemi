import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { 
    BookOpen, 
    Building2,
    CheckCircle2, 
    FileText, 
    Filter, 
    Globe, 
    Layers, 
    Lock, 
    Play, 
    ShieldCheck, 
    Sparkles, 
    Video 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialItem {
    id: string;
    title: string;
    slug: string;
    pillar: string;
    pillar_label: string;
    pillar_color: string;
    target_rank: string;
    target_rank_label: string;
    summary: string | null;
    has_video: boolean;
    video_duration: string | null;
    has_pdf: boolean;
    pdf_path: string | null;
    media_type: 'video' | 'pdf' | 'both';
    scope_type: 'national' | 'pengprov' | 'pengkot' | 'dojo';
    scope_label: string;
    is_official_pb: boolean;
    is_locked: boolean;
    is_completed: boolean;
}

interface PageProps {
    materials: MaterialItem[];
    currentKenshi: any;
    pillars: Array<{ value: string; label: string }>;
    ranks: Array<{ value: string; label: string }>;
    filters: {
        pillar?: string;
        rank?: string;
        media_type?: string;
        scope_type?: string;
    };
}

export default function MaterialsIndex({ materials, currentKenshi, pillars, ranks, filters }: PageProps) {
    const handleFilterChange = (key: string, val: string) => {
        router.get('/materials', {
            ...filters,
            [key]: val || undefined,
        }, { preserveState: true });
    };

    const completedCount = materials.filter(m => m.is_completed).length;
    const totalCount = materials.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <AppLayout>
            <Head title="Kurikulum, Video & Buku Dokuhon Shorinji Kempo" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-xl bg-[#102B40] p-6 lg:p-7 text-white shadow-2xs border border-[#1A3B52]">
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#C51C2A]/20 px-3 py-1 text-xs font-semibold text-red-300 border border-[#C51C2A]/40">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Kurikulum Resmi PB PERKEMI & WSKO
                        </div>
                        <h1 className="text-xl lg:text-3xl font-bold tracking-tight text-white">
                            Repositori Video Latihan & Buku Dokuhon Digital
                        </h1>
                        <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
                            Materi teknik presisi Shorinji Kempo: Dokuhon (Falsafah Flipbook 3D), Kihon (Dasar), Goho (Teknik Keras), Juho (Teknik Lunak), Kumi Embu, dan Randori dengan relasi hak akses bertingkat: Nasional PB, Pengprov, Pengkot, dan Cabang Dojo.
                        </p>

                        {/* Progress Bar for Kenshi */}
                        {currentKenshi && (
                            <div className="pt-2 max-w-md">
                                <div className="flex justify-between text-xs text-slate-300 mb-1">
                                    <span>Kemajuan Kurikulum Sabuk Anda ({currentKenshi.rank_label || 'Minarai'})</span>
                                    <span className="font-bold text-amber-400">{progressPercent}% Selesai</span>
                                </div>
                                <div className="w-full bg-[#1A3B52] rounded-full h-2 overflow-hidden border border-[#24475E]">
                                    <div 
                                        className="bg-[#C51C2A] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters Bar: Media Type, Scope, Pillar, Rank */}
                <div className="bg-white p-4 rounded-xl border border-[#E8EBEF] shadow-2xs space-y-3">
                    {/* Top Row: Media Type Tabs & Scope Filter */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8EBEF]">
                        {/* Media Type Tabs */}
                        <div className="inline-flex rounded-lg bg-[#F8F9FA] p-1 border border-[#E8EBEF] text-xs">
                            <button
                                type="button"
                                onClick={() => handleFilterChange('media_type', 'all')}
                                className={cn(
                                    'px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
                                    (!filters.media_type || filters.media_type === 'all')
                                        ? 'bg-[#102B40] text-white shadow-xs'
                                        : 'text-[#718092] hover:text-[#17202D]'
                                )}
                            >
                                Semua Media ({materials.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('media_type', 'video')}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
                                    filters.media_type === 'video'
                                        ? 'bg-[#102B40] text-white shadow-xs'
                                        : 'text-[#718092] hover:text-[#17202D]'
                                )}
                            >
                                <Video className="w-3.5 h-3.5" /> Video Latihan
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('media_type', 'pdf')}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer',
                                    filters.media_type === 'pdf'
                                        ? 'bg-[#C51C2A] text-white shadow-xs'
                                        : 'text-[#718092] hover:text-[#17202D]'
                                )}
                            >
                                <BookOpen className="w-3.5 h-3.5" /> Dokuhon & PDF (Flipbook)
                            </button>
                        </div>

                        {/* Scope Selection */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#718092] flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" /> Lingkup:
                            </span>
                            <select
                                value={filters.scope_type || 'all'}
                                onChange={(e) => handleFilterChange('scope_type', e.target.value)}
                                className="h-8 px-2.5 rounded-lg border border-[#E8EBEF] text-xs font-semibold text-[#17202D] bg-[#F8F9FA] focus:ring-2 focus:ring-[#102B40] focus:outline-none cursor-pointer"
                            >
                                <option value="all">Semua Lingkup Wilayah</option>
                                <option value="national">Nasional (PB PERKEMI)</option>
                                <option value="pengprov">Pengurus Provinsi (Pengprov)</option>
                                <option value="pengkot">Pengurus Kota/Kabupaten (Pengkot)</option>
                                <option value="dojo">Cabang Dojo Latihan</option>
                            </select>
                        </div>
                    </div>

                    {/* Bottom Row: Pillars & Belt Ranks */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#718092] mr-1">Pilar:</span>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('pillar', '')}
                                className={cn(
                                    'px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer',
                                    !filters.pillar
                                        ? 'bg-[#102B40] text-white'
                                        : 'bg-[#F8F9FA] text-[#718092] hover:bg-slate-200'
                                )}
                            >
                                Semua
                            </button>
                            {pillars.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handleFilterChange('pillar', p.value)}
                                    className={cn(
                                        'px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer',
                                        filters.pillar === p.value
                                            ? 'bg-[#102B40] text-white'
                                            : 'bg-[#F8F9FA] text-[#718092] hover:bg-slate-200'
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#718092]">Tingkat Sabuk:</span>
                            <select
                                value={filters.rank || ''}
                                onChange={(e) => handleFilterChange('rank', e.target.value)}
                                className="h-8 px-2.5 rounded-lg border border-[#E8EBEF] text-xs font-semibold text-[#17202D] bg-[#F8F9FA] focus:ring-2 focus:ring-[#102B40] focus:outline-none cursor-pointer"
                            >
                                <option value="">Semua Sabuk</option>
                                {ranks.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Materials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {materials.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                'group rounded-xl border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between',
                                m.is_locked ? 'border-slate-200 opacity-80' : 'border-[#E8EBEF]'
                            )}
                        >
                            {/* Card Media Preview Header */}
                            <div className="relative aspect-video bg-[#0B132B] overflow-hidden">
                                {m.has_video ? (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:scale-102 transition-transform duration-300">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </div>
                                        {m.video_duration && (
                                            <span className="absolute bottom-2 right-2 text-[10px] font-mono font-semibold bg-black/80 text-white px-2 py-0.5 rounded">
                                                {m.video_duration}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-[#102B40] flex flex-col items-center justify-center text-slate-200 p-4 border-b border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white mb-2 shadow-2xs">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-white tracking-wide">
                                            Dokuhon & Modul Resmi
                                        </span>
                                        <span className="text-[11px] text-slate-300 font-medium mt-0.5">
                                            Pembaca Flipbook 3D
                                        </span>
                                    </div>
                                )}

                                {/* Top Badges */}
                                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/75 text-white backdrop-blur-xs">
                                        {m.pillar_label}
                                    </span>
                                    {m.media_type === 'both' && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C51C2A] text-white shadow-xs">
                                            Video + PDF
                                        </span>
                                    )}
                                </div>

                                {m.is_completed && (
                                    <div className="absolute top-3 right-3 bg-[#16865C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                        <CheckCircle2 className="w-3 h-3" /> Selesai
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    {/* Belt Level & Pillar */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                                            {m.target_rank_label}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400 truncate max-w-[140px]">
                                            {m.pillar_label}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-bold text-[#17202D] group-hover:text-[#102B40] transition-colors leading-snug line-clamp-2">
                                        {m.title}
                                    </h3>

                                    {/* Scope / Dojo Affiliation */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate font-medium">{m.scope_label}</span>
                                    </div>

                                    {/* Summary */}
                                    {m.summary && (
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {m.summary}
                                        </p>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="pt-3 border-t border-[#E8EBEF]">
                                    {m.is_locked ? (
                                        <div className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-500 bg-slate-100/80 rounded-lg border border-slate-200">
                                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                                            Terkunci (Perlu Ujian Sabuk)
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/materials/${m.slug}`}
                                            className={cn(
                                                'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs',
                                                m.media_type === 'pdf'
                                                    ? 'bg-[#102B40] hover:bg-[#1A3B52] text-white'
                                                    : 'bg-[#C51C2A] hover:bg-[#a51522] text-white'
                                            )}
                                        >
                                            {m.media_type === 'pdf' ? (
                                                <>
                                                    <BookOpen className="w-3.5 h-3.5" /> Buka Buku Dokuhon
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-3.5 h-3.5 fill-current" /> Pelajari Modul
                                                </>
                                            )}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {materials.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#E8EBEF] shadow-2xs">
                        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-[#17202D]">Belum Ada Materi untuk Filter Terpilih</h4>
                        <p className="text-xs text-[#718092] max-w-sm mx-auto mt-1">
                            Silakan sesuaikan filter pilar, jenis media, atau lingkup wilayah di atas untuk melihat modul lain.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
