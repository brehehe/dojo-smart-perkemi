import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Attendance, Kenshi, TrainingSchedule } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { RankBadge } from '@/Components/UI/DataDisplay/RankBadge';
import { Avatar } from '@/Components/UI/Elements/Avatar';
import { ActionMenuDropdown } from '@/Components/UI/Navigation/ActionMenuDropdown';
import { Modal } from '@/Components/UI/Overlays/Modal';
import { SelectSearch } from '@/Components/UI/Forms/SelectSearch';
import { formatDate } from '@/lib/utils';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    Eye,
    FileText,
    HeartPulse,
    MapPin,
    Shield,
    ShieldAlert,
    Upload,
    User,
    UserCheck,
    Users,
    X,
} from 'lucide-react';

interface Props {
    schedule: { data: TrainingSchedule } | TrainingSchedule;
    attendances: { data: Attendance[] } | Attendance[];
    unmarked_kenshis: { data: Kenshi[] } | Kenshi[];
    dojo_kenshis?: { data: Kenshi[] } | Kenshi[];
    can_manage_attendance?: boolean;
    is_kenshi_view?: boolean;
    is_session_finished?: boolean;
    current_kenshi?: { data: Kenshi } | Kenshi | null;
    my_attendance?: { data: Attendance } | Attendance | null;
    stats: {
        total_members: number;
        total_attended: number;
        present_count: number;
        late_count: number;
        excused_count: number;
        sick_count: number;
        absent_count: number;
        attendance_percentage: number;
    };
    attendance_statuses: Array<{
        value: string;
        label: string;
        color: string;
    }>;
}

export default function ScheduleAttendance({
    schedule: rawSchedule,
    attendances: rawAttendances,
    unmarked_kenshis: rawUnmarked,
    dojo_kenshis: rawDojoKenshis,
    can_manage_attendance = false,
    is_kenshi_view = false,
    is_session_finished = false,
    current_kenshi: rawCurrentKenshi,
    my_attendance: rawMyAttendance,
    stats,
    attendance_statuses,
}: Props) {
    const schedule = (rawSchedule && 'data' in rawSchedule ? rawSchedule.data : rawSchedule) as TrainingSchedule;
    const attendances = Array.isArray(rawAttendances) ? rawAttendances : (rawAttendances?.data ?? []);
    const unmarkedKenshis = Array.isArray(rawUnmarked) ? rawUnmarked : (rawUnmarked?.data ?? []);
    const dojoKenshis = Array.isArray(rawDojoKenshis) ? rawDojoKenshis : (rawDojoKenshis?.data ?? []);
    const currentKenshi = rawCurrentKenshi && 'data' in rawCurrentKenshi ? rawCurrentKenshi.data : rawCurrentKenshi;
    const myAttendance = rawMyAttendance && 'data' in rawMyAttendance ? rawMyAttendance.data : (rawMyAttendance ?? (attendances[0] ?? null));

    const [activeTab, setActiveTab] = useState<'attended' | 'unmarked'>('attended');
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Kenshi Permit (Izin / Sakit) Modal State
    const [permitModalOpen, setPermitModalOpen] = useState(false);
    const [selectedPermitKenshiId, setSelectedPermitKenshiId] = useState<string>('');
    const [permitStatus, setPermitStatus] = useState<'excused' | 'sick'>('excused');
    const [permitNotes, setPermitNotes] = useState('');
    const [permitFile, setPermitFile] = useState<File | null>(null);
    const [permitPreview, setPermitPreview] = useState<string | null>(null);
    const [isSubmittingPermit, setIsSubmittingPermit] = useState(false);
    const [approvingAttendanceId, setApprovingAttendanceId] = useState<string | null>(null);

    // Sensei Override Modal State
    const [overrideModalOpen, setOverrideModalOpen] = useState(false);
    const [overrideTargetKenshi, setOverrideTargetKenshi] = useState<{ id: string; name: string } | null>(null);
    const [overrideStatus, setOverrideStatus] = useState<string>('present');
    const [overrideNotes, setOverrideNotes] = useState('');
    const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

    // Quick Manual Mark by Sensei
    const markManualPresent = (kenshiId: string) => {
        router.post(
            '/attendance',
            {
                training_schedule_id: schedule.id,
                kenshi_id: kenshiId,
                status: 'present',
                notes: 'Ditandai hadir secara manual oleh Sensei',
            },
            { preserveScroll: true }
        );
    };

    // Handle Approve Permit by Sensei / Admin
    const handleApprovePermit = (attendanceId: string) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui (approve) izin/sakit kenshi ini?')) return;
        setApprovingAttendanceId(attendanceId);
        router.post(
            `/attendance/${attendanceId}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setApprovingAttendanceId(null),
            }
        );
    };

    // Handle Permit Form Submit
    const handlePermitSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!is_kenshi_view && !selectedPermitKenshiId) {
            alert('Silakan pilih kenshi yang berhalangan hadir.');
            return;
        }

        setIsSubmittingPermit(true);

        const formData = new FormData();
        formData.append('training_schedule_id', schedule.id);
        if (!is_kenshi_view && selectedPermitKenshiId) {
            formData.append('kenshi_id', selectedPermitKenshiId);
        }
        formData.append('status', permitStatus);
        formData.append('notes', permitNotes);
        if (permitFile) {
            formData.append('photo', permitFile);
        }

        router.post('/attendance/permit', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPermitModalOpen(false);
                setPermitNotes('');
                setPermitFile(null);
                setPermitPreview(null);
                setSelectedPermitKenshiId('');
            },
            onFinish: () => setIsSubmittingPermit(false),
        });
    };

    // Handle Sensei Override Submit
    const handleOverrideSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!overrideTargetKenshi) return;

        setIsSubmittingOverride(true);
        router.post(
            '/attendance/override-status',
            {
                training_schedule_id: schedule.id,
                kenshi_id: overrideTargetKenshi.id,
                status: overrideStatus,
                notes: overrideNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOverrideModalOpen(false);
                    setOverrideTargetKenshi(null);
                    setOverrideNotes('');
                },
                onFinish: () => setIsSubmittingOverride(false),
            }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPermitFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => setPermitPreview(event.target?.result as string);
                reader.readAsDataURL(file);
            } else {
                setPermitPreview(null);
            }
        }
    };

    return (
        <AppLayout>
            <Head title={`Presensi Sesi: ${schedule.title} - Perkemi`} />

            <PageHeading
                title={is_kenshi_view ? `Presensi Latihan: ${schedule.title}` : schedule.title}
                description={
                    is_kenshi_view
                        ? `Pantau kehadiran tatami Anda, status verifikasi GPS, atau ajukan izin / sakit jika berhalangan.`
                        : `Rekap kehadiran kenshi, bukti foto selfie, dan verifikasi radius geotagging tatami.`
                }
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/schedules">
                            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                                Kembali ke Kalender
                            </Button>
                        </Link>

                        {is_kenshi_view ? (
                            <>
                                {(!myAttendance || myAttendance.status?.value === 'excused' || myAttendance.status?.value === 'sick') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setPermitModalOpen(true)}
                                        className="border-violet-300 text-violet-700 hover:bg-violet-50"
                                        leftIcon={<FileText className="w-4 h-4 text-violet-600" />}
                                    >
                                        {myAttendance ? 'Perbarui Izin / Sakit' : 'Ajukan Izin / Sakit'}
                                    </Button>
                                )}

                                {!is_session_finished && (!myAttendance || myAttendance.status?.value === 'absent') && (
                                    <Link href={`/attendance/check-in?schedule_id=${schedule.id}`}>
                                        <Button
                                            variant="primary"
                                            className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
                                            leftIcon={<Camera className="w-4 h-4" />}
                                        >
                                            Presensi Kamera & GPS
                                        </Button>
                                    </Link>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedPermitKenshiId('');
                                        setPermitNotes('');
                                        setPermitFile(null);
                                        setPermitPreview(null);
                                        setPermitModalOpen(true);
                                    }}
                                    className="border-amber-300 text-amber-800 hover:bg-amber-50"
                                    leftIcon={<FileText className="w-4 h-4 text-amber-600" />}
                                >
                                    Catat Izin / Sakit Kenshi
                                </Button>

                                <Link href={`/attendance/check-in?schedule_id=${schedule.id}`}>
                                    <Button
                                        variant="primary"
                                        className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
                                        leftIcon={<Camera className="w-4 h-4" />}
                                    >
                                        Input Presensi Kamera
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Session Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Cabang Dojo
                        </span>
                        <p className="text-sm font-bold text-slate-900">{schedule.dojo?.name}</p>
                        <p className="text-slate-500">{schedule.dojo?.pengprov}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Waktu & Tanggal
                        </span>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>{formatDate(schedule.date, { withDay: true, month: 'long' })}</span>
                        </p>
                        <p className="text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                                {schedule.start_time} - {schedule.end_time} WIB
                            </span>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Lokasi & Geotag
                        </span>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span className="truncate">{schedule.location_name || 'Tatami Dojo'}</span>
                        </p>
                        <p className="text-slate-500">Radius Validasi: {schedule.radius_meters || 150}m</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Instruktur / Pelatih
                        </span>
                        <p className="text-sm font-semibold text-slate-900">
                            {schedule.instructor_name || 'Sensei Dojo'}
                        </p>
                        <Badge variant="secondary" size="sm">
                            {schedule.program_type?.label || 'Latihan Rutin'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* IF KENSHI ROLE: SHOW PERSONAL ATTENDANCE CARD ONLY */}
            {is_kenshi_view ? (
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0B132B] text-white">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    name={currentKenshi?.full_name || 'Kenshi'}
                                    size="lg"
                                    className="ring-2 ring-red-500"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-white">
                                            {currentKenshi?.full_name || 'Kenshi e-Dojo'}
                                        </h3>
                                        {currentKenshi?.rank && (
                                            <RankBadge
                                                label={currentKenshi.rank.label}
                                                beltColor={currentKenshi.rank.belt_color}
                                                isDan={currentKenshi.rank.is_dan}
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                                        NIK: {currentKenshi?.id_card_number || '-'} • Dojo: {schedule.dojo?.name}
                                    </p>
                                </div>
                            </div>

                            {/* Status Pill Badge */}
                            <div>
                                {myAttendance ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-slate-300 font-medium">Status Anda:</span>
                                        <Badge
                                            variant={
                                                myAttendance.status?.value === 'present'
                                                    ? 'success'
                                                    : myAttendance.status?.value === 'late'
                                                    ? 'warning'
                                                    : myAttendance.status?.value === 'excused'
                                                    ? 'info'
                                                    : myAttendance.status?.value === 'sick'
                                                    ? 'danger'
                                                    : 'secondary'
                                            }
                                            className="text-xs px-3 py-1 font-bold uppercase tracking-wider"
                                        >
                                            {myAttendance.status?.label || 'Tercatat'}
                                        </Badge>

                                        {(myAttendance.status?.value === 'excused' || myAttendance.status?.value === 'sick') && (
                                            myAttendance.is_approved ? (
                                                <Badge variant="success" className="text-xs px-2.5 py-1 font-bold">
                                                    Disetujui Pelatih
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning" className="text-xs px-2.5 py-1 font-bold animate-pulse">
                                                    Menunggu Approval
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                ) : is_session_finished ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-300 font-medium">Status Anda:</span>
                                        <Badge variant="danger" className="text-xs px-3 py-1 font-bold uppercase tracking-wider">
                                            Alpha (Tanpa Keterangan)
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-300 font-medium">Status Anda:</span>
                                        <Badge variant="warning" className="text-xs px-3 py-1 font-bold uppercase tracking-wider">
                                            Belum Presensi
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-6">
                            {myAttendance ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left Details */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                                    Waktu Masuk / Tercatat
                                                </span>
                                                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-900">
                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                    <span>{myAttendance.check_in_time || myAttendance.check_in_at || '-'}</span>
                                                </div>
                                            </div>

                                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                                    Radius & Geofence GPS
                                                </span>
                                                <div className="flex items-center gap-1.5 text-sm font-bold">
                                                    {myAttendance.latitude && myAttendance.longitude ? (
                                                        <>
                                                            <MapPin className="w-4 h-4 text-red-500" />
                                                            <span className={myAttendance.is_within_radius ? 'text-emerald-700' : 'text-amber-700'}>
                                                                {myAttendance.distance_meters !== null ? `${myAttendance.distance_meters}m` : 'Valid Geotag'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 font-normal">Tanpa Koordinat GPS</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes / Reason */}
                                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                                                Keterangan / Catatan Sesi
                                            </span>
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                {myAttendance.notes || 'Tidak ada catatan tambahan untuk presensi ini.'}
                                            </p>
                                        </div>

                                        {/* Approval Status Banner if Excused/Sick */}
                                        {(myAttendance.status?.value === 'excused' || myAttendance.status?.value === 'sick') && (
                                            <div
                                                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                                                    myAttendance.is_approved
                                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                                                }`}
                                            >
                                                {myAttendance.is_approved ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                )}
                                                <div className="space-y-0.5 text-xs">
                                                    <h5 className="font-bold">
                                                        {myAttendance.is_approved
                                                            ? 'Status Izin / Sakit: Disetujui (Approved)'
                                                            : 'Status Izin / Sakit: Menunggu Approval Sensei / Admin'}
                                                    </h5>
                                                    <p className="text-[11px] leading-relaxed">
                                                        {myAttendance.is_approved
                                                            ? `Permohonan ketidakhadiran Anda telah diverifikasi dan disetujui secara resmi oleh ${myAttendance.verifier?.name || 'Pelatih / Sensei Dojo'}.`
                                                            : 'Permohonan izin Anda telah diterima oleh sistem dan sedang menunggu konfirmasi/persetujuan oleh Sensei Dojo atau Admin.'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Actions if Excused/Sick */}
                                        {(myAttendance.status?.value === 'excused' || myAttendance.status?.value === 'sick') && (
                                            <div className="flex items-center gap-3 pt-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPermitStatus(myAttendance.status?.value as 'excused' | 'sick');
                                                        setPermitNotes(myAttendance.notes || '');
                                                        setPermitModalOpen(true);
                                                    }}
                                                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                                                >
                                                    Edit Keterangan Izin
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Photo / Proof Preview */}
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-slate-700 block">
                                            Bukti Foto / Lampiran Presensi:
                                        </span>
                                        {myAttendance.photo_url ? (
                                            <div
                                                onClick={() => setSelectedPhoto(myAttendance.photo_url || null)}
                                                className="relative group w-full h-44 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs hover:border-red-500 transition-colors bg-slate-100"
                                            >
                                                <img
                                                    src={myAttendance.photo_url}
                                                    alt="Bukti Presensi"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-xs gap-1.5">
                                                    <Eye className="w-4 h-4" />
                                                    <span>Perbesar Foto</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-44 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                                                <Camera className="w-8 h-8 text-slate-300 mb-2" />
                                                <span>Tidak ada foto selfie atau lampiran dokumen surat.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : is_session_finished ? (
                                <div className="py-6 px-4 bg-red-50/70 border border-red-200 rounded-xl flex items-start gap-3.5">
                                    <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-red-900">
                                            Status Presensi Tercatat: Alpha (Tanpa Keterangan)
                                        </h4>
                                        <p className="text-xs text-red-700 leading-relaxed">
                                            Sesi latihan ini telah berakhir pada{' '}
                                            <span className="font-semibold">{formatDate(schedule.date)}, {schedule.end_time} WIB</span>{' '}
                                            dan sistem tidak mendeteksi rekaman presensi kamera selfie maupun permohonan izin/sakit dari akun Anda.
                                        </p>
                                        <p className="text-[11px] text-red-600 italic pt-1">
                                            * Catatan: Jika Anda berhalangan dengan alasan mendesak dan telah melapor ke Sensei Dojo, silakan konfirmasi ke Sensei atau Admin Dojo agar status dapat diperbarui (di-override) dengan justifikasi resmi.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-1">
                                        <h4 className="text-base font-bold text-slate-900">
                                            Anda Belum Melakukan Presensi Sesi Ini
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Sesi latihan sedang dibuka. Jika Anda sudah berada di tatami dojo, lakukan presensi kamera dan GPS. Jika berhalangan hadir karena urusan mendesak atau sakit, silakan ajukan izin.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                        <Link href={`/attendance/check-in?schedule_id=${schedule.id}`}>
                                            <Button
                                                variant="primary"
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                leftIcon={<Camera className="w-4 h-4" />}
                                            >
                                                Presensi Kamera Selfie & GPS
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setPermitModalOpen(true)}
                                            leftIcon={<FileText className="w-4 h-4" />}
                                        >
                                            Ajukan Izin / Sakit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* ADMIN / SENSEI VIEW: FULL STATS & ROSTER MONITORING */
                <>
                    {/* Attendance KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block">Total Hadir</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                                        {stats.total_attended}
                                    </span>
                                    <span className="text-xs text-slate-500">/ {stats.total_members} Anggota</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${stats.attendance_percentage}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block">Tepat Waktu</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold text-emerald-600 tracking-tight">
                                        {stats.present_count}
                                    </span>
                                    <span className="text-xs text-slate-500">Kenshi</span>
                                </div>
                                <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                                    Mengikuti seluruh sesi
                                </span>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block">Terlambat</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold text-amber-600 tracking-tight">
                                        {stats.late_count}
                                    </span>
                                    <span className="text-xs text-slate-500">Kenshi</span>
                                </div>
                                <span className="text-[10px] text-amber-700 font-medium block mt-1">
                                    Dispensasi latihan
                                </span>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-xs">
                            <CardContent className="p-4">
                                <span className="text-xs font-semibold text-slate-500 block">Izin, Sakit & Alpha</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold text-violet-600 tracking-tight">
                                        {stats.excused_count + stats.sick_count + stats.absent_count}
                                    </span>
                                    <span className="text-xs text-slate-500">Kenshi</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                                    {stats.excused_count} Izin • {stats.sick_count} Sakit • {stats.absent_count} Alpha
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attendance Roster Tabs */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3">
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('attended')}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        activeTab === 'attended'
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                                    }`}
                                >
                                    <UserCheck className="w-4 h-4" />
                                    <span>Tercatat Presensi ({attendances.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('unmarked')}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        activeTab === 'unmarked'
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:text-slate-900 bg-slate-50'
                                    }`}
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Belum Presensi / Alpa ({unmarkedKenshis.length})</span>
                                </button>
                            </div>

                            <Link href={`/attendance/check-in?schedule_id=${schedule.id}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    leftIcon={<Camera className="w-3.5 h-3.5 text-red-600" />}
                                >
                                    Input Presensi
                                </Button>
                            </Link>
                        </div>

                        {/* Tab 1: Attended / Recorded Kenshis */}
                        {activeTab === 'attended' && (
                            <div>
                                {attendances.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-medium">Belum ada kenshi yang mencatat presensi.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4 whitespace-nowrap min-w-[260px]">Kenshi</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Bukti Foto (Selfie)</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Waktu Check-In</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Geotag & Radius</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                                                    <th className="py-3 px-4 whitespace-nowrap min-w-[200px]">Catatan</th>
                                                    <th className="py-3 px-4 text-right whitespace-nowrap w-14">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {attendances.map((att) => (
                                                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                                                        {/* Kenshi Details */}
                                                        <td className="py-3 px-4 whitespace-nowrap min-w-[260px]">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    name={att.kenshi?.full_name || 'Kenshi'}
                                                                    size="sm"
                                                                />
                                                                <div className="whitespace-nowrap">
                                                                    <Link
                                                                        href={`/kenshis/${att.kenshi_id}`}
                                                                        className="font-bold text-slate-900 hover:text-red-600 flex items-center gap-1.5 whitespace-nowrap"
                                                                    >
                                                                        <span className="whitespace-nowrap">{att.kenshi?.full_name}</span>
                                                                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                                                    </Link>
                                                                    <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                                                                        <span className="text-[11px] text-slate-600 font-mono font-medium whitespace-nowrap tracking-tight bg-slate-100 px-1.5 py-0.5 rounded">
                                                                            {att.kenshi?.id_card_number}
                                                                        </span>
                                                                        {att.kenshi?.rank && (
                                                                            <RankBadge
                                                                                label={att.kenshi.rank.label}
                                                                                beltColor={att.kenshi.rank.belt_color}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Selfie Photo Thumbnail */}
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            {att.photo_url ? (
                                                                <div
                                                                    onClick={() => setSelectedPhoto(att.photo_url || null)}
                                                                    className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-200 cursor-pointer shadow-2xs hover:border-red-500 transition-colors"
                                                                >
                                                                    <img
                                                                        src={att.photo_url}
                                                                        alt="Selfie"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                                        <Eye className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 italic whitespace-nowrap">
                                                                    Manual / Tanpa Foto
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Check-In Timestamp */}
                                                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5 font-mono text-slate-800 whitespace-nowrap">
                                                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                <span>{att.check_in_time || att.check_in_at || '-'}</span>
                                                            </div>
                                                        </td>

                                                        {/* Geotag & Distance */}
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            {att.latitude && att.longitude ? (
                                                                <div className="space-y-0.5 whitespace-nowrap">
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${att.latitude},${att.longitude}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap"
                                                                    >
                                                                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                                                        <span>
                                                                            {att.latitude.toFixed(4)}, {att.longitude.toFixed(4)}
                                                                        </span>
                                                                    </a>
                                                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                        <span
                                                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                                                                att.is_within_radius
                                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                                    : 'bg-amber-100 text-amber-800'
                                                                            }`}
                                                                        >
                                                                            {att.distance_meters !== null
                                                                                ? `${att.distance_meters}m`
                                                                                : 'Tervalidasi'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 italic whitespace-nowrap">
                                                                    Koordinat GPS nihil
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Status & Approval */}
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            <div className="space-y-1">
                                                                <Badge
                                                                    variant={
                                                                        att.status?.value === 'present'
                                                                            ? 'success'
                                                                            : att.status?.value === 'late'
                                                                            ? 'warning'
                                                                            : att.status?.value === 'excused'
                                                                            ? 'info'
                                                                            : att.status?.value === 'sick'
                                                                            ? 'danger'
                                                                            : 'secondary'
                                                                    }
                                                                    size="sm"
                                                                    className="whitespace-nowrap"
                                                                >
                                                                    {att.status?.label || 'Hadir'}
                                                                </Badge>

                                                                {(att.status?.value === 'excused' || att.status?.value === 'sick') && (
                                                                    <div className="pt-0.5">
                                                                        {att.is_approved ? (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                                <span>Disetujui ({att.verifier?.name || 'Pelatih'})</span>
                                                                            </span>
                                                                        ) : (
                                                                            <div className="space-y-1">
                                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                                                    <AlertCircle className="w-3 h-3 text-amber-600" />
                                                                                    <span>Menunggu Approval</span>
                                                                                </span>
                                                                                {can_manage_attendance && (
                                                                                    <div>
                                                                                        <button
                                                                                            type="button"
                                                                                            disabled={approvingAttendanceId === att.id}
                                                                                            onClick={() => handleApprovePermit(att.id)}
                                                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded shadow-2xs transition-colors cursor-pointer"
                                                                                        >
                                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                                            <span>{approvingAttendanceId === att.id ? 'Memproses...' : 'Setujui Izin'}</span>
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Notes */}
                                                        <td className="py-3 px-4 text-slate-500 min-w-[200px] max-w-sm whitespace-normal break-words leading-relaxed">
                                                            {att.notes || '-'}
                                                        </td>

                                                        {/* Action Menu */}
                                                        <td className="py-3 px-4 text-right whitespace-nowrap w-14">
                                                            <div className="flex items-center justify-end">
                                                                <ActionMenuDropdown
                                                                    title={`Aksi Presensi ${att.kenshi?.full_name}`}
                                                                    items={[
                                                                        ...(can_manage_attendance && (att.status?.value === 'excused' || att.status?.value === 'sick') && !att.is_approved
                                                                            ? [
                                                                                  {
                                                                                      label: 'Setujui Permohonan Izin (Approve)',
                                                                                      onClick: () => handleApprovePermit(att.id),
                                                                                      icon: CheckCircle2,
                                                                                  },
                                                                              ]
                                                                            : []),
                                                                        {
                                                                            label: 'Ubah Status Presensi (Override)',
                                                                            onClick: () => {
                                                                                setOverrideTargetKenshi({
                                                                                    id: att.kenshi_id,
                                                                                    name: att.kenshi?.full_name || 'Kenshi',
                                                                                });
                                                                                setOverrideStatus(att.status?.value || 'present');
                                                                                setOverrideNotes(att.notes || '');
                                                                                setOverrideModalOpen(true);
                                                                            },
                                                                            icon: Edit3,
                                                                        },
                                                                        {
                                                                            label: 'Lihat Profil Kenshi',
                                                                            href: `/kenshis/${att.kenshi_id}`,
                                                                            icon: User,
                                                                        },
                                                                    ]}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Unmarked Members */}
                        {activeTab === 'unmarked' && (
                            <div>
                                {unmarkedKenshis.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-800">
                                            Seluruh kenshi dojo sudah tercatat pada sesi ini!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4 whitespace-nowrap">Kenshi</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Nomor Pokok KTA</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Tingkatan Sabuk</th>
                                                    <th className="py-3 px-4 whitespace-nowrap">Status Sesi</th>
                                                    <th className="py-3 px-4 text-right whitespace-nowrap w-14">Aksi Sensei</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {unmarkedKenshis.map((kenshi) => (
                                                    <tr key={kenshi.id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar name={kenshi.full_name} size="sm" />
                                                                <span className="font-bold text-slate-900 whitespace-nowrap">
                                                                    {kenshi.full_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap tracking-tight">
                                                            {kenshi.id_card_number}
                                                        </td>
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            <RankBadge
                                                                label={kenshi.rank?.label || 'Kenshi'}
                                                                beltColor={kenshi.rank?.belt_color || 'white'}
                                                                isDan={kenshi.rank?.is_dan}
                                                            />
                                                        </td>
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            {is_session_finished ? (
                                                                <Badge variant="danger" size="sm" className="whitespace-nowrap">
                                                                    Alpha (Sesi Selesai)
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" size="sm" className="whitespace-nowrap">
                                                                    Belum Check-In
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right whitespace-nowrap w-14">
                                                            <div className="flex items-center justify-end">
                                                                <ActionMenuDropdown
                                                                    title={`Aksi Presensi ${kenshi.full_name}`}
                                                                    items={[
                                                                        {
                                                                            label: 'Tandai Hadir (Presensi)',
                                                                            onClick: () => markManualPresent(kenshi.id),
                                                                            icon: UserCheck,
                                                                        },
                                                                        {
                                                                            label: 'Catat Izin / Sakit Kenshi',
                                                                            onClick: () => {
                                                                                setSelectedPermitKenshiId(kenshi.id);
                                                                                setPermitStatus('excused');
                                                                                setPermitNotes('');
                                                                                setPermitFile(null);
                                                                                setPermitPreview(null);
                                                                                setPermitModalOpen(true);
                                                                            },
                                                                            icon: FileText,
                                                                        },
                                                                        {
                                                                            label: 'Tetapkan Status Khusus (Override)',
                                                                            onClick: () => {
                                                                                setOverrideTargetKenshi({
                                                                                    id: kenshi.id,
                                                                                    name: kenshi.full_name,
                                                                                });
                                                                                setOverrideStatus(is_session_finished ? 'absent' : 'present');
                                                                                setOverrideNotes('');
                                                                                setOverrideModalOpen(true);
                                                                            },
                                                                            icon: Edit3,
                                                                        },
                                                                        {
                                                                            label: 'Lihat Profil Kenshi',
                                                                            href: `/kenshis/${kenshi.id}`,
                                                                            icon: User,
                                                                        },
                                                                    ]}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* LIGHTBOX SELFIE / PROOF MODAL */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div
                        className="bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden border border-slate-700 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
                            <span className="text-xs font-bold flex items-center gap-1.5">
                                <Camera className="w-4 h-4 text-red-500" />
                                <span>Bukti Foto / Lampiran Presensi</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedPhoto(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 bg-black flex items-center justify-center">
                            <img
                                src={selectedPhoto}
                                alt="Bukti Presensi"
                                className="w-full max-h-[75vh] object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* KENSHI PERMIT MODAL (AJUKAN IZIN / SAKIT) */}
            <Modal
                isOpen={permitModalOpen}
                onClose={() => setPermitModalOpen(false)}
                title={is_kenshi_view ? 'Form Permohonan Izin / Sakit' : 'Form Catat Izin / Sakit Kenshi (Pelatih & Admin)'}
                description={
                    is_kenshi_view
                        ? 'Ajukan keterangan ketidakhadiran resmi pada sesi latihan ini (memerlukan persetujuan pelatih)'
                        : 'Catat izin atau sakit anggota kenshi secara langsung dengan status persetujuan resmi'
                }
                icon={<FileText className="w-5 h-5 text-amber-500" />}
                maxWidth="md"
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setPermitModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="kenshi-permit-form"
                            variant="primary"
                            size="sm"
                            disabled={isSubmittingPermit || !permitNotes.trim() || (!is_kenshi_view && !selectedPermitKenshiId)}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {is_kenshi_view
                                ? isSubmittingPermit
                                    ? 'Mengirim...'
                                    : 'Kirim Permohonan Izin'
                                : isSubmittingPermit
                                ? 'Menyimpan...'
                                : 'Simpan Izin / Sakit'}
                        </Button>
                    </>
                }
            >
                <form id="kenshi-permit-form" onSubmit={handlePermitSubmit} className="space-y-4">
                    {!is_kenshi_view && (
                        <div>
                            <SelectSearch
                                label="Pilih Atlet / Kenshi *"
                                value={selectedPermitKenshiId}
                                onChange={(val) => setSelectedPermitKenshiId(val)}
                                placeholder="-- Cari Nama Kenshi atau Nomor Pokok KTA --"
                                options={(dojoKenshis.length > 0 ? dojoKenshis : unmarkedKenshis).map((k) => ({
                                    value: k.id,
                                    label: `${k.full_name} (${k.id_card_number})`,
                                    badge: k.rank?.label || 'Kenshi',
                                }))}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Jenis Keterangan
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPermitStatus('excused')}
                                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    permitStatus === 'excused'
                                        ? 'bg-violet-50 border-violet-500 text-violet-800 ring-2 ring-violet-500/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <FileText className="w-4 h-4 text-violet-600" />
                                <span>Izin Kegiatan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPermitStatus('sick')}
                                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    permitStatus === 'sick'
                                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <HeartPulse className="w-4 h-4 text-rose-600" />
                                <span>Sakit / Medis</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Alasan / Keterangan Lengkap <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={permitNotes}
                            onChange={(e) => setPermitNotes(e.target.value)}
                            rows={3}
                            required
                            placeholder="Contoh: Mengikuti ujian akhir di sekolah, atau sedang demam dan istirahat dokter."
                            className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Lampiran Dokumen / Foto Bukti <span className="text-slate-400 font-normal lowercase">(opsional)</span>
                        </label>
                        <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {permitPreview ? (
                                <div className="space-y-2">
                                    <img
                                        src={permitPreview}
                                        alt="Preview Bukti"
                                        className="max-h-32 mx-auto rounded-lg object-contain border border-slate-200"
                                    />
                                    <p className="text-[11px] text-slate-600 font-medium">Klik untuk mengganti gambar</p>
                                </div>
                            ) : permitFile ? (
                                <div className="text-xs text-slate-700 font-medium flex items-center justify-center gap-1.5">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <span>{permitFile.name}</span>
                                </div>
                            ) : (
                                <div className="space-y-1 text-slate-500">
                                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                    <p className="text-xs font-medium text-slate-700">Upload Foto Surat Dokter / Bukti Izin</p>
                                    <p className="text-[10px] text-slate-400">JPG, PNG, atau PDF (Maks. 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>

            {/* SENSEI / ADMIN OVERRIDE ATTENDANCE MODAL */}
            {overrideTargetKenshi && (
                <Modal
                    isOpen={overrideModalOpen}
                    onClose={() => setOverrideModalOpen(false)}
                    title="Ubah Status Presensi (Sensei Override)"
                    description={`Pembaruan manual untuk ${overrideTargetKenshi.name}`}
                    icon={<Edit3 className="w-5 h-5 text-amber-500" />}
                    maxWidth="md"
                    footer={
                        <>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setOverrideModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                form="sensei-override-form"
                                variant="primary"
                                size="sm"
                                disabled={isSubmittingOverride}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isSubmittingOverride ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </>
                    }
                >
                    <form id="sensei-override-form" onSubmit={handleOverrideSubmit} className="space-y-4">
                        <div>
                            <SelectSearch
                                label="Pilih Status Baru"
                                value={overrideStatus}
                                onChange={(val) => setOverrideStatus(val)}
                                options={[
                                    { value: 'present', label: 'Hadir (Tepat Waktu)', badge: 'Hadir' },
                                    { value: 'late', label: 'Hadir (Terlambat)', badge: 'Terlambat' },
                                    { value: 'excused', label: 'Izin (Disetujui Sensei)', badge: 'Izin' },
                                    { value: 'sick', label: 'Sakit (Keterangan Medis)', badge: 'Sakit' },
                                    { value: 'absent', label: 'Alpha (Tanpa Keterangan)', badge: 'Alpha' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Alasan Pembaruan / Justifikasi Sensei
                            </label>
                            <textarea
                                value={overrideNotes}
                                onChange={(e) => setOverrideNotes(e.target.value)}
                                rows={3}
                                placeholder="Contoh: Kenshi telah mengabari via telepon sebelumnya karena ada tugas dinas luar kota."
                                className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:outline-hidden focus:ring-2 focus:ring-red-500 text-slate-900"
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </AppLayout>
    );
}
