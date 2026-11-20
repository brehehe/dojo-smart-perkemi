import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { 
    BookOpen, 
    Building2, 
    Clock, 
    FileText, 
    Globe, 
    Landmark, 
    Layers, 
    Play, 
    Plus, 
    ShieldCheck, 
    UploadCloud, 
    Video, 
    X,
    XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DojoMaterial {
    id: string;
    title: string;
    slug: string;
    pillar: string;
    pillar_label: string;
    target_rank: string;
    target_rank_label: string;
    video_url: string | null;
    video_duration: string | null;
    pdf_path: string | null;
    media_type: 'video' | 'pdf' | 'both';
    scope_type: 'national' | 'pengprov' | 'pengkot' | 'dojo';
    scope_label: string;
    summary: string | null;
    created_at: string;
}

interface PageProps {
    currentScope: string;
    currentPengprov: any;
    currentPengkot: any;
    currentDojo: any;
    pengprovList: Array<{ id: string; name: string; region: string }>;
    pengkotList: Array<{ id: string; name: string; region: string }>;
    dojoList: Array<{ id: string; name: string; code: string; pengprov: string; pengkab: string }>;
    materials: DojoMaterial[];
    pillars: Array<{ value: string; label: string }>;
    ranks: Array<{ value: string; label: string }>;
}

export default function DojoMateriIndex({
    currentScope,
    currentPengprov,
    currentPengkot,
    currentDojo,
    pengprovList = [],
    pengkotList = [],
    dojoList = [],
    materials = [],
    pillars = [],
    ranks = [],
}: PageProps) {
    const { auth } = usePage<any>().props;
    const userRoles = auth?.user?.roles || [];
    const isSuperAdmin = userRoles.includes('SuperAdmin');
    const isPengprovAdmin = userRoles.includes('PengprovAdmin');
    const isPengkabAdmin = userRoles.includes('PengkabAdmin');
    const isSensei = userRoles.includes('Sensei');

    const [showModal, setShowModal] = useState(false);
    const [mediaChoice, setMediaChoice] = useState<'video' | 'pdf' | 'both'>('video');

    const { data, setData, post, processing, reset, errors } = useForm<{
        title: string;
        pillar: string;
        target_rank: string;
        scope_type: 'national' | 'pengprov' | 'pengkot' | 'dojo';
        pengprov_id: string;
        pengkot_id: string;
        dojo_id: string;
        video_url: string;
        video_file: File | null;
        video_duration: string;
        pdf_file: File | null;
        summary: string;
    }>({
        title: '',
        pillar: 'goho',
        target_rank: 'kyu_1',
        scope_type: isSuperAdmin ? 'national' : isPengprovAdmin ? 'pengprov' : isPengkabAdmin ? 'pengkot' : 'dojo',
        pengprov_id: currentPengprov?.id || '',
        pengkot_id: currentPengkot?.id || '',
        dojo_id: currentDojo?.id || '',
        video_url: '',
        video_file: null,
        video_duration: '10:00',
        pdf_file: null,
        summary: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dojo/materi', {
            forceFormData: true,
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    // Determine current level title
    const scopeBadgeTitle = isSuperAdmin
        ? 'Pusat Komando PB PERKEMI'
        : isPengprovAdmin
          ? `Pengprov ${currentPengprov?.region || 'Provinsi'}`
          : isPengkabAdmin
            ? `Pengkot ${currentPengkot?.region || 'Kota'}`
            : `Cabang Dojo ${currentDojo?.name || ''}`;

    return (
        <AppLayout>
            <Head title="Manajemen Kurikulum, Video & Buku Dokuhon" />

            <PageHeading
                title="Manajemen Materi, Video Latihan & Buku Dokuhon"
                description={`Kelola modul teknik, rekaman video drill latihan tatami, dan buku pedoman PDF berjenjang (${scopeBadgeTitle}).`}
                actions={
                    <Button
                        variant="primary"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowModal(true)}
                    >
                        Unggah Materi / Video / PDF
                    </Button>
                }
            />

            {/* Scope Information Card */}
            <div className="bg-white rounded-xl border border-[#E8EBEF] p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#102B40] text-white flex items-center justify-center font-bold">
                        {isSuperAdmin ? <Globe className="w-5 h-5" /> :
                         isPengprovAdmin ? <Landmark className="w-5 h-5" /> :
                         isPengkabAdmin ? <ShieldCheck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#102B40]">
                                Lingkup Wewenang Unggah:
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#C51C2A] text-white">
                                {scopeBadgeTitle}
                            </span>
                        </div>
                        <p className="text-xs text-[#718092] mt-0.5">
                            {isSuperAdmin && 'PB PERKEMI: Materi nasional otomatis dapat diakses oleh seluruh atlet dan dojo di Indonesia.'}
                            {isPengprovAdmin && 'Pengprov: Materi otomatis tersinkronisasi untuk seluruh kenshi dan dojo binaan di provinsi ini.'}
                            {isPengkabAdmin && 'Pengkot/Pengkab: Materi otomatis dapat diakses oleh kenshi dan cabang dojo di kota ini.'}
                            {isSensei && 'Dojo: Materi khusus drill latihan rutin untuk kenshi terdaftar di dojo Anda.'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/materials"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8EBEF] text-xs font-semibold text-[#17202D] hover:bg-slate-50 transition-colors"
                    >
                        <BookOpen className="w-3.5 h-3.5 text-[#C51C2A]" /> Lihat Direktori Kenshi
                    </Link>
                </div>
            </div>

            {/* Materials List */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map((m) => (
                        <div key={m.id} className="bg-white rounded-xl border border-[#E8EBEF] p-5 space-y-3 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#102B40] text-white">
                                        {m.pillar_label || m.pillar}
                                    </span>
                                    <span className="text-xs text-[#718092] font-medium flex items-center gap-1">
                                        {m.video_duration ? (
                                            <>
                                                <Clock className="w-3.5 h-3.5" /> {m.video_duration}
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-3.5 h-3.5 text-amber-600" /> Dokumen PDF
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-[#718092]">
                                            {m.scope_label}
                                        </span>
                                        <span className="text-[10px] font-semibold text-[#17202D]">
                                            Sabuk: {m.target_rank_label || m.target_rank}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-[#17202D] line-clamp-2 leading-snug">
                                        {m.title}
                                    </h3>
                                    {m.summary && (
                                        <p className="text-xs text-[#718092] line-clamp-2 leading-relaxed mt-1">
                                            {m.summary}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-[#E8EBEF] flex items-center gap-2">
                                <Link
                                    href={`/materials/${m.slug}`}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#102B40] hover:bg-[#1A3B52] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                    {m.media_type === 'pdf' ? (
                                        <>
                                            <BookOpen className="w-3.5 h-3.5" /> Buka Flipbook 3D
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-3.5 h-3.5 fill-current" /> Tonton Video
                                        </>
                                    )}
                                </Link>
                                {m.pdf_path && (
                                    <a
                                        href={m.pdf_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        download
                                        title="Unduh Dokumen PDF"
                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-[#17202D] rounded-lg transition-colors cursor-pointer"
                                    >
                                        <FileText className="w-4 h-4 text-amber-700" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {materials.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#E8EBEF] shadow-2xs">
                        <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-[#17202D]">Belum Ada Modul Materi di Lingkup Ini</h4>
                        <p className="text-xs text-[#718092] max-w-sm mx-auto mt-1 mb-4">
                            Klik tombol "Unggah Materi / Video / PDF" di atas untuk menambahkan rekaman drill latihan atau dokumen kurikulum.
                        </p>
                        <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowModal(true)}
                        >
                            Unggah Materi Sekarang
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal Upload Multi-Tier & Multi-Media */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-[#E8EBEF] max-h-[90vh] overflow-y-auto custom-scrollbar my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-[#E8EBEF]">
                            <div>
                                <h3 className="text-base font-bold text-[#17202D]">
                                    Unggah Modul Kurikulum & Video Latihan
                                </h3>
                                <p className="text-xs text-[#718092]">
                                    Mendukung file rekaman video, embed streaming, serta modul buku PDF interaktif.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            {/* Media Type Switcher */}
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1.5">
                                    Jenis Media yang Ingin Diunggah:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMediaChoice('video')}
                                        className={cn(
                                            'p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1',
                                            mediaChoice === 'video'
                                                ? 'bg-[#102B40] text-white border-[#102B40] shadow-xs'
                                                : 'bg-white text-[#718092] border-[#E8EBEF] hover:bg-slate-50'
                                        )}
                                    >
                                        <Video className="w-4 h-4" />
                                        <span>Video Drill</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMediaChoice('pdf')}
                                        className={cn(
                                            'p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1',
                                            mediaChoice === 'pdf'
                                                ? 'bg-[#C51C2A] text-white border-[#C51C2A] shadow-xs'
                                                : 'bg-white text-[#718092] border-[#E8EBEF] hover:bg-slate-50'
                                        )}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        <span>Buku PDF (Flipbook)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMediaChoice('both')}
                                        className={cn(
                                            'p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1',
                                            mediaChoice === 'both'
                                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                                : 'bg-white text-[#718092] border-[#E8EBEF] hover:bg-slate-50'
                                        )}
                                    >
                                        <Layers className="w-4 h-4" />
                                        <span>Video + PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Organizational Scope Selection (if SuperAdmin) */}
                            {isSuperAdmin && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-[#E8EBEF] space-y-2">
                                    <label className="block font-semibold text-[#17202D]">
                                        Tingkat Wewenang / Lingkup Relasi Distribusi:
                                    </label>
                                    <select
                                        value={data.scope_type}
                                        onChange={(e) => setData('scope_type', e.target.value as any)}
                                        className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] text-xs font-semibold text-[#17202D] bg-white focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    >
                                        <option value="national">Nasional PB PERKEMI (Akses Seluruh Indonesia)</option>
                                        <option value="pengprov">Tingkat Pengurus Provinsi (Pengprov)</option>
                                        <option value="pengkot">Tingkat Pengurus Kota/Kabupaten (Pengkot)</option>
                                        <option value="dojo">Tingkat Cabang Dojo Spesifik</option>
                                    </select>

                                    {data.scope_type === 'pengprov' && (
                                        <div>
                                            <label className="block font-medium text-[#718092] mb-1">Pilih Pengprov Target:</label>
                                            <select
                                                value={data.pengprov_id}
                                                onChange={(e) => setData('pengprov_id', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] bg-white"
                                            >
                                                <option value="">-- Pilih Pengprov --</option>
                                                {pengprovList.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.region})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {data.scope_type === 'pengkot' && (
                                        <div>
                                            <label className="block font-medium text-[#718092] mb-1">Pilih Pengkot Target:</label>
                                            <select
                                                value={data.pengkot_id}
                                                onChange={(e) => setData('pengkot_id', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] bg-white"
                                            >
                                                <option value="">-- Pilih Pengkot --</option>
                                                {pengkotList.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.region})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {data.scope_type === 'dojo' && (
                                        <div>
                                            <label className="block font-medium text-[#718092] mb-1">Pilih Dojo Target:</label>
                                            <select
                                                value={data.dojo_id}
                                                onChange={(e) => setData('dojo_id', e.target.value)}
                                                className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] bg-white"
                                            >
                                                <option value="">-- Pilih Dojo --</option>
                                                {dojoList.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name} ({d.pengkab})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">Judul Materi / Modul *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Dokuhon Sejohun & Silabus Drill Goho Waza"
                                    className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                                {errors.title && <p className="text-red-600 text-[11px] mt-1">{errors.title}</p>}
                            </div>

                            {/* Pillar & Rank */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-[#17202D] mb-1">Pilar Teknik</label>
                                    <select
                                        value={data.pillar}
                                        onChange={(e) => setData('pillar', e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    >
                                        {pillars.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-[#17202D] mb-1">Target Tingkat Sabuk</label>
                                    <select
                                        value={data.target_rank}
                                        onChange={(e) => setData('target_rank', e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                    >
                                        {ranks.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Video Inputs (If video or both) */}
                            {(mediaChoice === 'video' || mediaChoice === 'both') && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-[#E8EBEF] space-y-3">
                                    <span className="font-bold text-[#17202D] flex items-center gap-1.5">
                                        <Video className="w-4 h-4 text-[#102B40]" />
                                        Konfigurasi Video Pembelajaran:
                                    </span>

                                    <div>
                                        <label className="block font-semibold text-[#17202D] mb-1">
                                            Upload File Video (.mp4, .mov, .webm - maks 200MB):
                                        </label>
                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={(e) => setData('video_file', e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#102B40] file:text-white hover:file:bg-[#1A3B52] file:cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-400">
                                        <div className="flex-1 h-[1px] bg-slate-200" />
                                        <span className="text-[11px] font-bold">ATAU URL STREAMING</span>
                                        <div className="flex-1 h-[1px] bg-slate-200" />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-[#17202D] mb-1">
                                            URL Video (YouTube / Vimeo / Cloudflare Streaming):
                                        </label>
                                        <input
                                            type="url"
                                            value={data.video_url}
                                            onChange={(e) => setData('video_url', e.target.value)}
                                            placeholder="https://www.youtube.com/embed/... atau https://youtu.be/..."
                                            className="w-full h-9 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] bg-white focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-[#17202D] mb-1">Durasi Video (Contoh: 12:45)</label>
                                        <input
                                            type="text"
                                            value={data.video_duration}
                                            onChange={(e) => setData('video_duration', e.target.value)}
                                            placeholder="12:45"
                                            className="w-32 h-9 px-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* PDF Inputs (If pdf or both) */}
                            {(mediaChoice === 'pdf' || mediaChoice === 'both') && (
                                <div className="p-3 bg-red-50/40 rounded-xl border border-red-100 space-y-3">
                                    <span className="font-bold text-[#17202D] flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4 text-[#C51C2A]" />
                                        Konfigurasi Buku Dokuhon / PDF Flipbook:
                                    </span>

                                    <div>
                                        <label className="block font-semibold text-[#17202D] mb-1">
                                            Upload File Dokumen PDF (.pdf - maks 50MB):
                                        </label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => setData('pdf_file', e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#C51C2A] file:text-white hover:file:bg-[#a51522] file:cursor-pointer"
                                        />
                                        <p className="text-[11px] text-[#718092] mt-1">
                                            Sistem akan mengonversi modul ke pembaca Flipbook 3D interaktif dengan pemisah halaman ganjil (kanan) & genap (kiri).
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="block font-semibold text-[#17202D] mb-1">Deskripsi & Catatan Pelatih</label>
                                <textarea
                                    rows={3}
                                    value={data.summary}
                                    onChange={(e) => setData('summary', e.target.value)}
                                    placeholder="Fokus perbaikan: gerakan putaran kote nuki dan sinkronisasi tenaga kime..."
                                    className="w-full p-3 rounded-lg border border-[#E8EBEF] text-xs text-[#17202D] focus:ring-2 focus:ring-[#102B40] focus:outline-none"
                                />
                            </div>

                            <div className="pt-3 border-t border-[#E8EBEF] flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowModal(false)}
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
                                    Simpan & Publikasikan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
