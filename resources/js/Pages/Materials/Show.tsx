import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { FlipbookViewer, FlipbookPage } from '@/Components/UI/Media/FlipbookViewer';
import { 
    ArrowLeft, 
    BookOpen, 
    CheckCircle2, 
    Circle, 
    Clock, 
    FileText, 
    Layers, 
    Play, 
    ShieldCheck, 
    Video 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chapter {
    title: string;
    timestamp: string;
    seconds: number;
}

interface MaterialDetail {
    id: string;
    title: string;
    slug: string;
    pillar: string;
    pillar_label: string;
    target_rank: string;
    target_rank_label: string;
    summary: string | null;
    video_url: string | null;
    video_duration: string | null;
    video_chapters: Chapter[];
    pdf_path: string | null;
    media_type: 'video' | 'pdf' | 'both';
    scope_type: 'national' | 'pengprov' | 'pengkot' | 'dojo';
    scope_label: string;
    pdf_pages_count: number;
    pages_data: FlipbookPage[];
    is_official_pb: boolean;
    is_completed: boolean;
}

interface PageProps {
    material: MaterialDetail;
    currentKenshi: any;
}

export default function MaterialShow({ material, currentKenshi }: PageProps) {
    // If both video and pdf exist, allow toggling tabs
    const hasBoth = Boolean(material.video_url && (material.pdf_path || (material.pages_data && material.pages_data.length > 0)));
    const initialTab = material.media_type === 'pdf' || (!material.video_url && Boolean(material.pdf_path || material.pages_data?.length))
        ? 'pdf'
        : 'video';

    const [activeTab, setActiveTab] = useState<'video' | 'pdf'>(initialTab);

    const handleToggleComplete = () => {
        router.post(`/materials/${material.id}/toggle-complete`, {}, {
            preserveScroll: true,
        });
    };

    // Check if video is YouTube / Vimeo iframe or local HTML5 video
    const isEmbedVideo = material.video_url && (
        material.video_url.includes('youtube.com') ||
        material.video_url.includes('youtu.be') ||
        material.video_url.includes('vimeo.com')
    );

    return (
        <AppLayout>
            <Head title={`${material.title} - Kurikulum e-Dojo PERKEMI`} />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Back Nav & Progress Action */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/materials"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#718092] hover:text-[#17202D] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Direktori Kurikulum
                    </Link>

                    {currentKenshi && (
                        <button
                            type="button"
                            onClick={handleToggleComplete}
                            className={cn(
                                'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs',
                                material.is_completed
                                    ? 'bg-[#16865C] text-white hover:bg-emerald-700'
                                    : 'bg-white border border-[#E8EBEF] text-[#17202D] hover:bg-slate-50'
                            )}
                        >
                            {material.is_completed ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Sudah Selesai Dipelajari
                                </>
                            ) : (
                                <>
                                    <Circle className="w-4 h-4 text-[#718092]" />
                                    Tandai Selesai Dipelajari
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Scope & Media Type Tabs (When both exist) */}
                {hasBoth && (
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E8EBEF] shadow-2xs">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('video')}
                                className={cn(
                                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                    activeTab === 'video'
                                        ? 'bg-[#102B40] text-white shadow-xs'
                                        : 'text-[#718092] hover:bg-slate-50'
                                )}
                            >
                                <Video className="w-4 h-4" /> Video Pembelajaran
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('pdf')}
                                className={cn(
                                    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
                                    activeTab === 'pdf'
                                        ? 'bg-[#C51C2A] text-white shadow-xs'
                                        : 'text-[#718092] hover:bg-slate-50'
                                )}
                            >
                                <BookOpen className="w-4 h-4" /> Dokuhon & Modul PDF (Flipbook)
                            </button>
                        </div>

                        <span className="text-[11px] font-semibold text-[#718092] pr-3 hidden sm:inline">
                            Tersedia Video + Dokumen Buku
                        </span>
                    </div>
                )}

                {/* Primary Player Container: Flipbook or Video */}
                {activeTab === 'pdf' ? (
                    <FlipbookViewer
                        title={material.title}
                        subtitle={material.summary || 'Pedoman Kurikulum & Falsafah Shorinji Kempo'}
                        organization={material.scope_label}
                        pdfUrl={material.pdf_path}
                        pages={material.pages_data || []}
                    />
                ) : (
                    <div className="bg-white rounded-xl border border-[#E8EBEF] overflow-hidden shadow-2xs">
                        {material.video_url ? (
                            <div className="relative aspect-video bg-black flex items-center justify-center">
                                {isEmbedVideo ? (
                                    <iframe
                                        src={material.video_url}
                                        title={material.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        controls
                                        className="w-full h-full"
                                        src={material.video_url}
                                    >
                                        Browser Anda tidak mendukung tag video.
                                    </video>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-[#102B40] text-white">
                                <FileText className="w-14 h-14 text-amber-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold">Modul Dokumen Pedoman Resmi (PDF)</h3>
                                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 mb-4">
                                    Dokumen kurikulum, juklak teknik, dan lembar kamoku Shorinji Kempo.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('pdf')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#C51C2A] hover:bg-[#a51522] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                                >
                                    <BookOpen className="w-4 h-4" /> Buka Pembaca Flipbook 3D
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Metadata & Description Card */}
                <div className="bg-white rounded-xl border border-[#E8EBEF] p-6 lg:p-7 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Scope Badge */}
                        <span className={cn(
                            'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded text-white flex items-center gap-1.5',
                            material.scope_type === 'national' ? 'bg-[#102B40]' :
                            material.scope_type === 'pengprov' ? 'bg-indigo-700' :
                            material.scope_type === 'pengkot' ? 'bg-purple-700' : 'bg-emerald-700'
                        )}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {material.scope_label}
                        </span>

                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-[#17202D] border border-[#E8EBEF]">
                            Pilar: {material.pillar_label}
                        </span>

                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#F8F9FA] text-[#17202D] border border-[#E8EBEF]">
                            Tingkat: {material.target_rank_label}
                        </span>

                        {material.video_duration && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-[#F8F9FA] text-[#718092] border border-[#E8EBEF]">
                                <Clock className="w-3.5 h-3.5 text-[#718092]" />
                                {material.video_duration}
                            </span>
                        )}

                        {material.pdf_path && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                Modul PDF Tersedia
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-[#17202D] tracking-tight">
                            {material.title}
                        </h1>
                        {material.summary && (
                            <p className="text-xs lg:text-sm text-[#718092] mt-2 leading-relaxed">
                                {material.summary}
                            </p>
                        )}
                    </div>

                    {/* Chapters / Timestamps if available */}
                    {material.video_chapters && material.video_chapters.length > 0 && (
                        <div className="pt-4 border-t border-[#E8EBEF] space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17202D] flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#C51C2A]" />
                                Penanda Bagian Teknik (Chapter Drills)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {material.video_chapters.map((ch, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E8EBEF] text-xs text-[#17202D]"
                                    >
                                        <span className="font-medium truncate pr-2">{ch.title}</span>
                                        <span className="font-mono font-bold text-[#C51C2A] text-[11px] shrink-0">
                                            {ch.timestamp}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
