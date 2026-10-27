import React, { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Attendance, Kenshi, TrainingSchedule } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    Camera,
    Check,
    CheckCircle2,
    Clock,
    Compass,
    ExternalLink,
    LocateFixed,
    MapPin,
    Navigation,
    RefreshCw,
    RotateCcw,
    Shield,
    Sparkles,
    SwitchCamera,
    User,
    VideoOff,
} from 'lucide-react';
import { DojoMapViewer } from '@/Components/Map/DojoMapViewer';

interface Props {
    schedule: { data: TrainingSchedule } | TrainingSchedule | null;
    available_schedules: { data: TrainingSchedule[] } | TrainingSchedule[];
    current_kenshi: { data: Kenshi } | Kenshi | null;
    existing_attendance: { data: Attendance } | Attendance | null;
    kenshis: { data: Kenshi[] } | Kenshi[];
    attendance_statuses: Array<{
        value: string;
        label: string;
        color: string;
    }>;
}

export default function AttendanceCheckIn({
    schedule: rawSchedule,
    available_schedules: rawSchedules,
    current_kenshi: rawCurrentKenshi,
    existing_attendance: rawExistingAttendance,
    kenshis: rawKenshis,
    attendance_statuses,
}: Props) {
    const schedule = rawSchedule && 'data' in rawSchedule ? rawSchedule.data : rawSchedule;
    const availableSchedules = Array.isArray(rawSchedules) ? rawSchedules : (rawSchedules?.data ?? []);
    const currentKenshi = rawCurrentKenshi && 'data' in rawCurrentKenshi ? rawCurrentKenshi.data : rawCurrentKenshi;
    const existingAttendance = rawExistingAttendance && 'data' in rawExistingAttendance ? rawExistingAttendance.data : rawExistingAttendance;
    const kenshis = Array.isArray(rawKenshis) ? rawKenshis : (rawKenshis?.data ?? []);

    // Stepper State: 1 = Kamera Selfie, 2 = Lokasi GPS, 3 = Konfirmasi Kehadiran
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    // Camera State
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isSnapping, setIsSnapping] = useState<boolean>(false);

    // Geolocation State
    const [gpsCoordinates, setGpsCoordinates] = useState<{
        latitude: number | null;
        longitude: number | null;
        accuracy: number | null;
    }>({
        latitude: null,
        longitude: null,
        accuracy: null,
    });
    const [gpsLoading, setGpsLoading] = useState<boolean>(false);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

    // Resolved Tatami Location Info
    const tatamiLat = schedule?.latitude ?? schedule?.dojo?.latitude ?? null;
    const tatamiLng = schedule?.longitude ?? schedule?.dojo?.longitude ?? null;
    const tatamiAddress = schedule?.dojo?.address || null;
    const tatamiCity = schedule?.dojo?.city || schedule?.dojo?.pengkab || null;
    const tatamiPengprov = schedule?.dojo?.pengprov || null;
    const tatamiLocationName = schedule?.location_name || schedule?.dojo?.name || 'Tatami Dojo';
    const tatamiRadius = schedule?.radius_meters || 150;

    const googleMapsTatamiUrl =
        schedule?.dojo?.google_maps_url ||
        (tatamiLat && tatamiLng
            ? `https://www.google.com/maps?q=${tatamiLat},${tatamiLng}`
            : null);

    const googleMapsNavUrl =
        gpsCoordinates.latitude && gpsCoordinates.longitude && tatamiLat && tatamiLng
            ? `https://www.google.com/maps/dir/?api=1&origin=${gpsCoordinates.latitude},${gpsCoordinates.longitude}&destination=${tatamiLat},${tatamiLng}`
            : googleMapsTatamiUrl;

    // Form setup
    const { data, setData, post, processing, errors } = useForm({
        training_schedule_id: schedule?.id || '',
        kenshi_id: currentKenshi?.id || kenshis[0]?.id || '',
        status: 'present',
        latitude: '' as string | number,
        longitude: '' as string | number,
        location_accuracy: '' as string | number,
        photo: '' as string,
        notes: '',
    });

    // Haversine distance calculator
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    // Request GPS location
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setGpsError('Perangkat atau browser tidak mendukung fitur GPS Geolocation.');
            return;
        }

        setGpsLoading(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(7));
                const lng = Number(pos.coords.longitude.toFixed(7));
                const acc = Number(pos.coords.accuracy.toFixed(1));

                setGpsCoordinates({
                    latitude: lat,
                    longitude: lng,
                    accuracy: acc,
                });

                setData((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    location_accuracy: acc,
                }));

                if (tatamiLat && tatamiLng) {
                    const dist = calculateDistance(lat, lng, tatamiLat, tatamiLng);
                    setDistanceMeters(dist);
                }

                setGpsLoading(false);
            },
            (err) => {
                console.warn('GPS error:', err);
                let message = 'Izin akses lokasi GPS belum diaktifkan pada browser/ponsel Anda.';
                if (err.code === 1) {
                    message = 'Akses lokasi ditolak. Silakan izinkan akses lokasi pada pengaturan browser/ponsel Anda.';
                } else if (err.code === 2) {
                    message = 'Sinyal GPS tidak terdeteksi. Pastikan GPS/Location perangkat aktif.';
                } else if (err.code === 3) {
                    message = 'Waktu deteksi GPS habis. Silakan coba kembali.';
                }
                setGpsError(message);
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    // Start Camera Stream
    const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
        try {
            setCameraError(null);
            if (cameraStream) {
                cameraStream.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 720 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            setCameraStream(stream);
            setCameraActive(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err: any) {
            console.error('Camera error:', err);
            setCameraError(
                'Tidak dapat mengakses kamera perangkat. Pastikan izin kamera telah diizinkan pada browser atau aplikasi.'
            );
            setCameraActive(false);
        }
    };

    // Stop Camera Stream
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
            setCameraActive(false);
        }
    };

    // Switch Front / Back Camera
    const switchCameraFacing = () => {
        const nextMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(nextMode);
        startCamera(nextMode);
    };

    // Snap / Capture Photo from live video stream
    const captureSnapshot = () => {
        if (!videoRef.current) return;

        setIsSnapping(true);
        setTimeout(() => setIsSnapping(false), 300);

        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 640;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If front camera, mirror image for natural selfie feel
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Watermark with timestamp & dojo code
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        const timestampStr = new Date().toLocaleString('id-ID', { timeZoneName: 'short' });
        ctx.fillText(`PERKEMI PRESENSI • ${timestampStr} • ${schedule?.dojo?.code || 'DOJO'}`, 12, canvas.height - 13);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
        setData('photo', dataUrl);

        // Stop camera stream after snapshot
        stopCamera();
    };

    // Retake photo
    const retakePhoto = () => {
        setCapturedPhoto(null);
        setData('photo', '');
        startCamera();
    };

    // Step 1 -> Step 2
    const handleProceedToGps = () => {
        if (!capturedPhoto) {
            alert('Silakan ambil foto selfie kehadiran terlebih dahulu.');
            return;
        }
        setCurrentStep(2);
        requestLocation();
    };

    // Step 2 -> Step 3
    const handleProceedToConfirmation = () => {
        setCurrentStep(3);
    };

    // Lifecycle
    useEffect(() => {
        if (currentStep === 1 && !capturedPhoto) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [currentStep, capturedPhoto]);

    // Re-check distance whenever schedule changes
    useEffect(() => {
        if (tatamiLat && tatamiLng && gpsCoordinates.latitude && gpsCoordinates.longitude) {
            const dist = calculateDistance(
                gpsCoordinates.latitude,
                gpsCoordinates.longitude,
                tatamiLat,
                tatamiLng
            );
            setDistanceMeters(dist);
        }
    }, [schedule?.id, tatamiLat, tatamiLng, gpsCoordinates.latitude, gpsCoordinates.longitude]);

    const submitAttendance = (e: React.FormEvent) => {
        e.preventDefault();
        if (!capturedPhoto) {
            alert('Wajib mengambil foto selfie presensi.');
            setCurrentStep(1);
            return;
        }
        post('/attendance');
    };

    const isWithinRadius =
        distanceMeters !== null && tatamiRadius
            ? distanceMeters <= tatamiRadius
            : false;

    return (
        <AppLayout>
            <Head title="Presensi Latihan Kamera & Geotag - Perkemi" />

            {/* Container with ample bottom padding for mobile navigation bar clearance */}
            <div className="max-w-xl mx-auto pb-32 sm:pb-16 pt-1">
                {/* Header Back & Info */}
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/schedules"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kalender Jadwal</span>
                    </Link>

                    {schedule && (
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                            {schedule.dojo?.code || 'PERKEMI'}
                        </span>
                    )}
                </div>

                {/* Session Context Banner with Rich Location Detail */}
                {schedule && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white mb-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                <span>{schedule.dojo?.name || 'PERKEMI'}</span>
                            </span>
                            <Badge variant="rose" size="sm">
                                {schedule.program_type?.label || 'Rutin'}
                            </Badge>
                        </div>

                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                                {schedule.title}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <span>
                                    {schedule.date
                                        ? new Date(schedule.date).toLocaleDateString('id-ID', {
                                              weekday: 'long',
                                              day: 'numeric',
                                              month: 'long',
                                              year: 'numeric',
                                          })
                                        : 'Hari ini'}{' '}
                                    • {schedule.start_time} - {schedule.end_time} WIB
                                </span>
                            </p>
                        </div>

                        {/* Location Detail Box */}
                        <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/80 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                                        <span className="truncate">{tatamiLocationName}</span>
                                    </div>
                                    {(tatamiAddress || tatamiCity) && (
                                        <p className="text-[11px] text-slate-300 leading-relaxed pl-5">
                                            {tatamiAddress}
                                            {tatamiCity ? `, ${tatamiCity}` : ''}
                                            {tatamiPengprov ? `, ${tatamiPengprov}` : ''}
                                        </p>
                                    )}
                                </div>

                                {googleMapsTatamiUrl && (
                                    <a
                                        href={googleMapsTatamiUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition-colors"
                                    >
                                        <MapPin className="w-3 h-3 text-amber-400" />
                                        <span>Maps</span>
                                        <ExternalLink className="w-3 h-3 opacity-70" />
                                    </a>
                                )}
                            </div>

                            {tatamiLat && tatamiLng && (
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-700/60 font-mono">
                                    <span>
                                        Koordinat: {tatamiLat}, {tatamiLng}
                                    </span>
                                    <span className="text-emerald-400 font-sans font-semibold">
                                        Radius: {tatamiRadius}m
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Session Switcher if multiple available schedules */}
                        {availableSchedules.length > 1 && (
                            <div className="pt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                                <span>Pilihan Sesi Latihan:</span>
                                <select
                                    value={schedule.id}
                                    onChange={(e) =>
                                        router.get(
                                            '/attendance/check-in',
                                            { schedule_id: e.target.value },
                                            { preserveState: false }
                                        )
                                    }
                                    className="bg-slate-800 text-white text-[11px] rounded-lg border-slate-700 py-1 px-2 max-w-[210px] truncate focus:border-red-500 focus:ring-red-500"
                                >
                                    {availableSchedules.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.date} ({s.start_time}) - {s.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {/* Existing Attendance Notice if already checked-in */}
                {existingAttendance && (
                    <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold">Anda Sudah Tercatat Hadir</p>
                                <p className="text-[11px] text-emerald-700">
                                    Status: <strong>{existingAttendance.status?.label || 'Hadir'}</strong> • Waktu:{' '}
                                    {existingAttendance.check_in_time || existingAttendance.check_in_at || 'Sesi ini'}
                                </p>
                            </div>
                        </div>
                        <Link href={`/schedules/${schedule?.id || ''}`}>
                            <Button variant="outline" size="sm" className="text-xs bg-white">
                                Rekap
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Guided Stepper Tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-2 mb-5 shadow-2xs">
                    <div className="grid grid-cols-3 gap-1 text-center">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                currentStep === 1
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : capturedPhoto
                                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                                {capturedPhoto ? '✓' : '1'}
                            </span>
                            <span>Kamera</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => capturedPhoto && setCurrentStep(2)}
                            disabled={!capturedPhoto}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                currentStep === 2
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : gpsCoordinates.latitude
                                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                    : 'text-slate-400 opacity-60'
                            }`}
                        >
                            <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                                {gpsCoordinates.latitude ? '✓' : '2'}
                            </span>
                            <span>Lokasi GPS</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => capturedPhoto && setCurrentStep(3)}
                            disabled={!capturedPhoto}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                currentStep === 3
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'text-slate-400 opacity-60'
                            }`}
                        >
                            <span className="h-4 w-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                                3
                            </span>
                            <span>Konfirmasi</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* STEP 1: KAMERA SELFIE LANGSUNG (NO FILE UPLOAD)                          */}
                {/* ========================================================================= */}
                {currentStep === 1 && (
                    <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-900 text-white py-3.5 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-red-600/30 flex items-center justify-center text-red-400">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white">
                                        Langkah 1: Foto Selfie Dogi
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Ambil foto selfie langsung dengan kamera perangkat
                                    </p>
                                </div>
                            </div>

                            {cameraActive && !capturedPhoto && (
                                <button
                                    type="button"
                                    onClick={switchCameraFacing}
                                    className="text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
                                >
                                    <SwitchCamera className="w-3.5 h-3.5" />
                                    <span>Putar</span>
                                </button>
                            )}
                        </CardHeader>

                        <CardContent className="p-4 sm:p-5">
                            {/* Camera Viewport / Captured Preview */}
                            <div className="relative aspect-square max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                                {isSnapping && (
                                    <div className="absolute inset-0 bg-white z-20 animate-fade-out" />
                                )}

                                {capturedPhoto ? (
                                    // Captured Photo Display
                                    <div className="relative w-full h-full">
                                        <img
                                            src={capturedPhoto}
                                            alt="Captured Attendance Selfie"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-emerald-400 text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Foto Terjepret</span>
                                        </div>
                                    </div>
                                ) : cameraActive ? (
                                    // Live Camera Stream
                                    <div className="relative w-full h-full">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className={`w-full h-full object-cover ${
                                                facingMode === 'user' ? 'scale-x-[-1]' : ''
                                            }`}
                                        />

                                        {/* Viewfinder Target Guidelines */}
                                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                            <div className="w-56 h-64 border-2 border-dashed border-red-500/80 rounded-3xl relative">
                                                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-3 border-l-3 border-red-500" />
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-3 border-r-3 border-red-500" />
                                                <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-3 border-l-3 border-red-500" />
                                                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-3 border-r-3 border-red-500" />
                                            </div>
                                            <span className="text-[11px] font-semibold text-white bg-slate-900/70 backdrop-blur-xs px-3 py-1 rounded-full mt-3 shadow-xs">
                                                Posisikan wajah & lambang Perkemi di sini
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    // Camera Permission Request / Fallback
                                    <div className="text-center p-6 text-slate-400 space-y-3">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500 border border-slate-800">
                                            <VideoOff className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-200">
                                                Kamera Perangkat Belum Aktif
                                            </p>
                                            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                                                {cameraError || 'Mohon izinkan akses kamera pada peramban Anda untuk mengambil foto bukti presensi latihan.'}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="sm"
                                            onClick={() => startCamera()}
                                            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                            leftIcon={<Camera className="w-4 h-4" />}
                                        >
                                            Aktifkan Kamera Sekarang
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Camera Action Buttons */}
                            <div className="mt-5 pt-3 border-t border-slate-100">
                                {capturedPhoto ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={retakePhoto}
                                            className="w-full sm:w-1/2 py-2.5 text-xs font-semibold"
                                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                                        >
                                            Foto Ulang
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={handleProceedToGps}
                                            className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold shadow-xs"
                                            rightIcon={<ArrowRight className="w-4 h-4" />}
                                        >
                                            Lanjut: Cek Lokasi GPS
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            disabled={!cameraActive}
                                            onClick={captureSnapshot}
                                            className="group relative h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center shadow-lg hover:shadow-red-500/30 active:scale-95"
                                            title="Jepret Foto"
                                        >
                                            <div className="h-12 w-12 rounded-full border-2 border-white flex items-center justify-center">
                                                <div className="h-9 w-9 rounded-full bg-white group-hover:scale-90 transition-transform" />
                                            </div>
                                        </button>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Tekan tombol di atas untuk mengambil foto
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ========================================================================= */}
                {/* STEP 2: VERIFIKASI LOKASI GPS (GEOTAG TATAMI)                            */}
                {/* ========================================================================= */}
                {currentStep === 2 && (
                    <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-900 text-white py-3.5 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-400">
                                    <Compass className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white">
                                        Langkah 2: Verifikasi Lokasi GPS
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Detail lokasi sasaran tatami dan verifikasi posisi GPS kenshi
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={requestLocation}
                                loading={gpsLoading}
                                className="text-xs text-white border-slate-700 hover:bg-slate-800"
                                leftIcon={<RefreshCw className="w-3 h-3" />}
                            >
                                Perbarui GPS
                            </Button>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-5 space-y-4">
                            {/* GPS Status / Error */}
                            {gpsError && (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                                    <div className="flex items-start gap-2.5">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">Lokasi GPS Belum Terdeteksi</p>
                                            <p className="text-[11px] text-amber-800 leading-relaxed">{gpsError}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={requestLocation}
                                            className="text-xs bg-white text-slate-800 border-amber-300"
                                            leftIcon={<RefreshCw className="w-3 h-3" />}
                                        >
                                            Coba Deteksi Ulang GPS
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* DETAIL LOKASI TATAMI TARGET (DOJO PRESENSI) */}
                            <div className="bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-2xl border border-amber-200/80 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                                            <Building2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">
                                            Detail Lokasi Tatami (Titik Sasaran)
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                        Radius: {tatamiRadius}m
                                    </span>
                                </div>

                                {/* Venue Name & Full Address */}
                                <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                        <span>{tatamiLocationName}</span>
                                    </div>
                                    {(tatamiAddress || tatamiCity) && (
                                        <p className="text-[11px] text-slate-600 leading-relaxed pl-5">
                                            {tatamiAddress}
                                            {tatamiCity ? `, ${tatamiCity}` : ''}
                                            {tatamiPengprov ? `, ${tatamiPengprov}` : ''}
                                        </p>
                                    )}
                                </div>

                                {/* Official Tatami Coordinates */}
                                {tatamiLat && tatamiLng && (
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                                Latitude Resmi Tatami
                                            </span>
                                            <span className="font-semibold text-slate-900 font-mono text-xs">
                                                {tatamiLat}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                                Longitude Resmi Tatami
                                            </span>
                                            <span className="font-semibold text-slate-900 font-mono text-xs">
                                                {tatamiLng}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Visual Map Embed */}
                                {tatamiLat && tatamiLng && (
                                    <div className="rounded-xl overflow-hidden shadow-2xs">
                                        <DojoMapViewer
                                            latitude={Number(tatamiLat)}
                                            longitude={Number(tatamiLng)}
                                            radiusMeters={tatamiRadius}
                                            dojoName={tatamiLocationName}
                                            address={tatamiAddress || undefined}
                                            height="260px"
                                        />
                                    </div>
                                )}

                                {/* Quick Maps & Direction Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {googleMapsTatamiUrl && (
                                        <a
                                            href={googleMapsTatamiUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs transition-colors"
                                        >
                                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                                            <span>Titik Tatami (Google Maps)</span>
                                            <ExternalLink className="w-3 h-3 text-slate-400" />
                                        </a>
                                    )}

                                    {gpsCoordinates.latitude && gpsCoordinates.longitude && googleMapsNavUrl && (
                                        <a
                                            href={googleMapsNavUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-semibold shadow-2xs transition-colors"
                                        >
                                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Petunjuk Arah Navigasi</span>
                                            <ExternalLink className="w-3 h-3 text-blue-400" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* DETAIL POSISI GPS KENSHI TERDETEKSI */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                                            <LocateFixed className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">
                                            Posisi GPS Anda (Kenshi Terdeteksi)
                                        </span>
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            gpsCoordinates.latitude
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                : 'bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {gpsCoordinates.latitude ? 'GPS Aktif' : 'Mencari Sinyal...'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                            Latitude Anda
                                        </span>
                                        <span className="font-semibold text-slate-900 font-mono text-xs">
                                            {gpsCoordinates.latitude !== null ? gpsCoordinates.latitude : 'Mencari...'}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                            Longitude Anda
                                        </span>
                                        <span className="font-semibold text-slate-900 font-mono text-xs">
                                            {gpsCoordinates.longitude !== null ? gpsCoordinates.longitude : 'Mencari...'}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                            Akurasi Sensor
                                        </span>
                                        <span className="font-semibold text-slate-900 text-xs">
                                            {gpsCoordinates.accuracy !== null ? `± ${gpsCoordinates.accuracy} m` : '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Distance & Geofence Radius Gauge */}
                                {distanceMeters !== null ? (
                                    <div
                                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                                            isWithinRadius
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                : 'bg-amber-50 border-amber-200 text-amber-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                    isWithinRadius
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-amber-100 text-amber-600'
                                                }`}
                                            >
                                                <Navigation className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold">
                                                    Jarak Anda: {distanceMeters} Meter ke Tatami
                                                </p>
                                                <p className="text-[11px] opacity-80 mt-0.5">
                                                    Batas radius toleransi: {tatamiRadius} meter.
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                                isWithinRadius
                                                    ? 'bg-emerald-200 text-emerald-800'
                                                    : 'bg-amber-200 text-amber-800'
                                            }`}
                                        >
                                            {isWithinRadius ? 'Di Dalam Radius' : 'Di Luar Radius'}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Thumbnail of Captured Photo */}
                            {capturedPhoto && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={capturedPhoto}
                                            alt="Selfie"
                                            className="h-12 w-12 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">
                                                Foto Selfie Siap
                                            </span>
                                            <span className="text-[11px] text-emerald-600 font-medium">
                                                ✓ Terverifikasi Kamera
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="text-xs text-slate-600 hover:text-red-600 font-semibold"
                                    >
                                        Ubah Foto
                                    </button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setCurrentStep(1)}
                                    className="w-1/3 py-2.5 text-xs font-semibold"
                                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                                >
                                    Kembali
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleProceedToConfirmation}
                                    className="w-2/3 bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-bold shadow-xs"
                                    rightIcon={<ArrowRight className="w-4 h-4" />}
                                >
                                    Lanjut: Konfirmasi Presensi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ========================================================================= */}
                {/* STEP 3: KONFIRMASI KEHADIRAN & STATUS PRESENSI                             */}
                {/* ========================================================================= */}
                {currentStep === 3 && (
                    <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-900 text-white py-3.5 px-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-white">
                                        Langkah 3: Konfirmasi Kehadiran
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Periksa data kehadiran kenshi dan kirim presensi sesi
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 sm:p-5">
                            <form onSubmit={submitAttendance} className="space-y-4">
                                {/* Summary Overview: Foto & Detail Lokasi */}
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {capturedPhoto && (
                                                <img
                                                    src={capturedPhoto}
                                                    alt="Selfie"
                                                    className="h-14 w-14 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                                                />
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                                                        Foto Selfie & Geotag Terlampir
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        Hadir
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                                    {distanceMeters !== null
                                                        ? `Jarak ke Tatami: ${distanceMeters}m (${isWithinRadius ? 'Dalam Radius Tatami' : 'Luar Radius'})`
                                                        : 'Koordinat GPS tervalidasi'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="text-xs text-red-600 hover:text-red-700 hover:underline font-semibold shrink-0 px-2 py-1"
                                        >
                                            Ubah
                                        </button>
                                    </div>

                                    {/* Location Summary Breakdown */}
                                    <div className="pt-2.5 border-t border-slate-200/80 text-xs space-y-1">
                                        <div className="flex items-start gap-1.5 text-slate-700">
                                            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <span className="font-semibold text-slate-900 block truncate">
                                                    {tatamiLocationName}
                                                </span>
                                                {(tatamiAddress || tatamiCity) && (
                                                    <span className="text-[11px] text-slate-500 block leading-tight">
                                                        {tatamiAddress}
                                                        {tatamiCity ? `, ${tatamiCity}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {tatamiLat && tatamiLng && (
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 pl-5">
                                                <span>
                                                    Titik: {tatamiLat}, {tatamiLng}
                                                </span>
                                                {googleMapsTatamiUrl && (
                                                    <a
                                                        href={googleMapsTatamiUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline font-sans inline-flex items-center gap-0.5"
                                                    >
                                                        <span>Maps</span>
                                                        <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Kenshi Selector / Locked Identity */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                                        Kenshi yang Melakukan Presensi
                                    </label>
                                    {currentKenshi ? (
                                        <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 flex items-center justify-between shadow-2xs">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-9 w-9 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {currentKenshi.full_name?.charAt(0) || 'K'}
                                                </div>
                                                <div>
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                                                        {currentKenshi.full_name} ({currentKenshi.id_card_number})
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 block mt-0.5">
                                                        {currentKenshi.rank?.label || 'Kenshi'} • {currentKenshi.dojo?.name || schedule?.dojo?.name || 'PERKEMI'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 shrink-0">
                                                <Shield className="w-3 h-3 text-red-600" />
                                                Identitas Anda
                                            </span>
                                        </div>
                                    ) : (
                                        <select
                                            value={data.kenshi_id}
                                            onChange={(e) => setData('kenshi_id', e.target.value)}
                                            className="w-full text-xs sm:text-sm rounded-lg border-slate-200 bg-white focus:border-red-500 focus:ring-red-500 shadow-2xs"
                                        >
                                            {kenshis.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.full_name} ({k.id_card_number}) • {k.rank?.label || 'Kenshi'}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Status Kehadiran: di-hide untuk menyederhanakan alur presensi tatami (default otomatis 'present') */}

                                {/* Notes input */}
                                <Textarea
                                    label="Catatan Kehadiran (Opsional)"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="e.g. Catatan latihan tatami, materi teknik, atau keterangan kehadiran"
                                    rows={2}
                                />

                                {/* Hidden canvas for snapshot rendering */}
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Submit & Back Buttons */}
                                <div className="pt-2 flex items-center gap-2.5">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setCurrentStep(2)}
                                        className="w-1/3 py-3 text-xs font-semibold"
                                        leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={processing}
                                        className="w-2/3 bg-red-600 hover:bg-red-700 text-white py-3 shadow-md font-bold text-xs sm:text-sm"
                                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                                    >
                                        Konfirmasi & Kirim Presensi
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Shorinji Kempo Integrity Footer */}
                <div className="mt-5 text-center text-[11px] text-slate-400">
                    <p className="font-semibold text-slate-600">Persaudaraan Bela Diri Kempo Indonesia</p>
                    <p className="italic mt-0.5">
                        "Gouju Ittai, Riki Ai Funi • Kehadiran dan kejujuran adalah cermin budi pekerti kenshi."
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
