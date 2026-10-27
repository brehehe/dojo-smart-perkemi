import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Dojo, PageProps, TrainingSchedule } from '@/types';
import { AppLayout } from '@/Layouts/AppLayout';
import { PageHeading } from '@/Components/UI/Layout/PageHeading';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Layout/Card';
import { Button } from '@/Components/UI/Elements/Button';
import { Badge } from '@/Components/UI/Elements/Badge';
import { ActionMenuDropdown } from '@/Components/UI/Navigation/ActionMenuDropdown';

import { Input } from '@/Components/UI/Forms/Input';
import { Select } from '@/Components/UI/Forms/Select';
import { SelectSearch } from '@/Components/UI/Forms/SelectSearch';
import { Textarea } from '@/Components/UI/Forms/Textarea';
import { formatDate } from '@/lib/utils';
import {
    Calendar as CalendarIcon,
    Camera,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Compass,
    Layers,
    MapPin,
    Plus,
    Repeat,
    Shield,
    Trash2,
    Users,
    X,
} from 'lucide-react';

interface Props {
    schedules: { data: TrainingSchedule[] } | TrainingSchedule[];
    today_schedules: { data: TrainingSchedule[] } | TrainingSchedule[];
    dojos: { data: Dojo[] } | Dojo[];
    can_create_schedule?: boolean;
    managed_dojo_id?: string | null;
    current_month: {
        year: number;
        month: number;
        name: string;
        days_in_month: number;
        first_day_of_week: number;
    };
    filters: {
        dojo_id?: string | null;
        year: number;
        month: number;
    };
    program_types: Array<{
        value: string;
        label: string;
        color: string;
    }>;
}

export default function ScheduleCalendar({
    schedules: rawSchedules,
    today_schedules: rawTodaySchedules,
    dojos: rawDojos,
    can_create_schedule: propCanCreate,
    managed_dojo_id,
    current_month,
    filters,
    program_types,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const userRoles = auth.user?.roles || [];
    const canManageSchedules = propCanCreate ?? Boolean(
        auth.user && (
            auth.user?.can?.schedule_create ||
            userRoles.includes('SuperAdmin') ||
            userRoles.includes('PengprovAdmin') ||
            userRoles.includes('PengkabAdmin') ||
            userRoles.includes('Sensei') ||
            auth.user?.permissions?.includes('kenshi.manage')
        )
    );

    const schedules = Array.isArray(rawSchedules) ? rawSchedules : (rawSchedules?.data ?? []);
    const todaySchedules = Array.isArray(rawTodaySchedules) ? rawTodaySchedules : (rawTodaySchedules?.data ?? []);
    const dojos = Array.isArray(rawDojos) ? rawDojos : (rawDojos?.data ?? []);

    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date().toISOString().slice(0, 10);
        return today;
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [scheduleMode, setScheduleMode] = useState<'single' | 'multi' | 'recurring'>('single');
    const [multiDates, setMultiDates] = useState<string[]>([new Date().toISOString().slice(0, 10)]);
    const [newMultiDateInput, setNewMultiDateInput] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);

    // Multi-schedule form
    const initialDojoId = managed_dojo_id || filters.dojo_id || dojos[0]?.id || '';
    const { data, setData, post, processing, errors, reset } = useForm({
        dojo_id: initialDojoId,
        title: 'Latihan Rutin Embu & Randori',
        program_type: 'regular',
        mode: 'single',
        date: new Date().toISOString().slice(0, 10),
        dates: [] as string[],
        days_of_week: [2, 4] as number[], // default Selasa & Kamis
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        start_time: '19:00',
        end_time: '21:00',
        location_name: 'Dojo Perkemi',
        latitude: -6.2185700,
        longitude: 106.8026100,
        radius_meters: 150,
        instructor_name: 'Sensei Penguji / Pelatih',
        notes: '',
    });

    // Month Navigation
    const navigateMonth = (step: number) => {
        let newMonth = current_month.month + step;
        let newYear = current_month.year;

        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }

        router.get(
            '/schedules',
            {
                year: newYear,
                month: newMonth,
                dojo_id: filters.dojo_id || undefined,
            },
            { preserveState: true }
        );
    };

    const handleDojoFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            '/schedules',
            {
                year: current_month.year,
                month: current_month.month,
                dojo_id: e.target.value || undefined,
            },
            { preserveState: true }
        );
    };

    // Auto-detect browser GPS coordinates for dojo setting
    const detectCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser tidak mendukung pendeteksian lokasi Geolocation.');
            return;
        }

        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData((prev) => ({
                    ...prev,
                    latitude: Number(pos.coords.latitude.toFixed(7)),
                    longitude: Number(pos.coords.longitude.toFixed(7)),
                }));
                setGpsLoading(false);
            },
            (err) => {
                alert(`Gagal mengambil koordinat GPS: ${err.message}`);
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const submitCreateSchedule = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...data,
            mode: scheduleMode,
            dates: scheduleMode === 'multi' ? multiDates : [],
        };

        router.post('/schedules', payload, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleDeleteSchedule = (schedule: TrainingSchedule) => {
        if (confirm(`Apakah Anda yakin ingin menghapus jadwal [${schedule.title}] tanggal ${schedule.date}?`)) {
            router.delete(`/schedules/${schedule.id}`, {
                preserveScroll: true,
            });
        }
    };

    const addMultiDate = () => {
        if (!newMultiDateInput) return;
        if (!multiDates.includes(newMultiDateInput)) {
            setMultiDates([...multiDates, newMultiDateInput].sort());
        }
        setNewMultiDateInput('');
    };

    const removeMultiDate = (d: string) => {
        setMultiDates(multiDates.filter((item) => item !== d));
    };

    const toggleDayOfWeek = (dayIndex: number) => {
        const current = data.days_of_week;
        if (current.includes(dayIndex)) {
            setData('days_of_week', current.filter((d) => d !== dayIndex));
        } else {
            setData('days_of_week', [...current, dayIndex]);
        }
    };

    // Filter schedules for the day panel
    const selectedDateSchedules = schedules.filter((s) => s.date === selectedDate);

    // Build calendar matrix
    const daysInMonth = current_month.days_in_month;
    const firstDay = current_month.first_day_of_week; // 0 = Sunday, 1 = Monday...
    const calendarCells: Array<{ day: number | null; dateString: string | null }> = [];

    for (let i = 0; i < firstDay; i++) {
        calendarCells.push({ day: null, dateString: null });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const mm = String(current_month.month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateString = `${current_month.year}-${mm}-${dd}`;
        calendarCells.push({ day, dateString });
    }

    const todayDateString = new Date().toISOString().slice(0, 10);

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <AppLayout>
            <Head title="Kalender & Jadwal Latihan Perkemi" />

            <PageHeading
                title="Jadwal Latihan & Kalender Dojo"
                description="Kelola multi-jadwal sesi latihan Shorinji Kempo, pantau kehadiran tatami, dan koordinat geotag presensi."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/attendance/check-in">
                            <Button
                                variant="primary"
                                className="bg-red-600 hover:bg-red-700 text-white shadow-xs"
                                leftIcon={<Camera className="w-4 h-4" />}
                            >
                                Presensi (Kamera & GPS)
                            </Button>
                        </Link>
                        {canManageSchedules && (
                            <Button
                                variant="secondary"
                                onClick={() => setIsCreateModalOpen(true)}
                                leftIcon={<Plus className="w-4 h-4 text-amber-600" />}
                            >
                                Tambah Multi-Jadwal
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Top Alert: Today's Active Training Sessions */}
            {todaySchedules.length > 0 && (
                <div className="mb-6 bg-linear-to-r from-[#0B132B] to-slate-900 border border-amber-500/30 rounded-xl p-4 sm:p-5 text-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                                <Clock className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white">
                                        Latihan Hari Ini
                                    </span>
                                    <span className="text-xs text-slate-300">
                                        {todaySchedules.length} Sesi Terjadwal
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-white mt-1">
                                    {todaySchedules[0]?.title}
                                </h3>
                                <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                        {todaySchedules[0]?.start_time} - {todaySchedules[0]?.end_time} WIB
                                    </span>
                                    <span>•</span>
                                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{todaySchedules[0]?.location_name || todaySchedules[0]?.dojo?.name}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Link href={`/attendance/check-in?schedule_id=${todaySchedules[0]?.id}`}>
                                <Button
                                    variant="primary"
                                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                                    leftIcon={<Camera className="w-4 h-4" />}
                                >
                                    Check-In Presensi
                                </Button>
                            </Link>
                            <Link href={`/schedules/${todaySchedules[0]?.id}`}>
                                <Button variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700">
                                    Daftar Hadir
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar & Month Navigator */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateMonth(-1)}
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Bulan Lalu
                    </Button>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-red-600" />
                        <span>{current_month.name}</span>
                    </h2>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateMonth(1)}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                        Bulan Depan
                    </Button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <select
                            value={filters.dojo_id || ''}
                            onChange={handleDojoFilterChange}
                            className="w-full text-xs sm:text-sm rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-red-500 transition-colors py-2"
                        >
                            <option value="">Semua Cabang Dojo Perkemi</option>
                            {dojos.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.pengprov})
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const now = new Date();
                            router.get('/schedules', { year: now.getFullYear(), month: now.getMonth() + 1 });
                        }}
                    >
                        Hari Ini
                    </Button>
                </div>
            </div>

            {/* Main Calendar & Day Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* 2 Cols: Calendar Month View */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {dayNames.map((name, idx) => (
                            <div key={idx} className={idx === 0 ? 'text-red-600 font-bold' : ''}>
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Day Matrix */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {calendarCells.map((cell, idx) => {
                            if (!cell.day) {
                                return (
                                    <div
                                        key={`empty-${idx}`}
                                        className="min-h-16 sm:min-h-24 bg-slate-50/50 rounded-lg border border-transparent"
                                    />
                                );
                            }

                            const isToday = cell.dateString === todayDateString;
                            const isSelected = cell.dateString === selectedDate;
                            const daySchedules = schedules.filter((s) => s.date === cell.dateString);

                            return (
                                <div
                                    key={`day-${cell.day}`}
                                    onClick={() => cell.dateString && setSelectedDate(cell.dateString)}
                                    className={`min-h-16 sm:min-h-24 p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                            ? 'border-red-600 bg-red-50/30 ring-2 ring-red-500/20'
                                            : isToday
                                            ? 'border-amber-400 bg-amber-50/20 hover:border-slate-300'
                                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                                                isToday
                                                    ? 'bg-red-600 text-white'
                                                    : isSelected
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-700'
                                            }`}
                                        >
                                            {cell.day}
                                        </span>

                                        {daySchedules.length > 0 && (
                                            <span className="hidden sm:inline-flex text-[10px] font-semibold text-slate-500">
                                                {daySchedules.length} Sesi
                                            </span>
                                        )}
                                    </div>

                                    {/* Session Mini Chips */}
                                    <div className="mt-1 space-y-1">
                                        {daySchedules.slice(0, 2).map((s) => (
                                            <div
                                                key={s.id}
                                                className={`text-[9px] sm:text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                                                    s.program_type?.color === 'rose'
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                        : s.program_type?.color === 'amber'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                                                }`}
                                                title={`${s.start_time} - ${s.title}`}
                                            >
                                                <span className="font-semibold">{s.start_time}</span>{' '}
                                                <span className="hidden md:inline">{s.title}</span>
                                            </div>
                                        ))}

                                        {daySchedules.length > 2 && (
                                            <div className="text-[9px] text-slate-500 text-center font-medium">
                                                +{daySchedules.length - 2} lainnya
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 1 Col: Day Detail Panel */}
                <div className="space-y-4">
                    <Card className="border-slate-200 shadow-xs">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-red-600" />
                                    <span>Agenda Latihan</span>
                                </CardTitle>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                                    {formatDate(selectedDate, { withDay: true })}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {selectedDateSchedules.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-medium">Tidak ada jadwal sesi pada tanggal ini.</p>
                                    {canManageSchedules && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setData('date', selectedDate);
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="mt-3"
                                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                                        >
                                            Buat Jadwal Sesi
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                selectedDateSchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {schedule.title}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Dojo: {schedule.dojo?.name}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    schedule.program_type?.color === 'rose'
                                                        ? 'danger'
                                                        : schedule.program_type?.color === 'amber'
                                                        ? 'warning'
                                                        : 'secondary'
                                                }
                                                size="sm"
                                            >
                                                {schedule.program_type?.label || 'Rutin'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>
                                                    {schedule.start_time} - {schedule.end_time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{schedule.location_name || 'Tatami Dojo'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>Radius: {schedule.radius_meters || 150}m</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span className="font-semibold text-emerald-700">
                                                    {schedule.attendances_count || 0} Kenshi Hadir
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Link
                                                href={`/attendance/check-in?schedule_id=${schedule.id}`}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs"
                                                    leftIcon={<Camera className="w-3.5 h-3.5" />}
                                                >
                                                    Presensi Tatami
                                                </Button>
                                            </Link>
                                            <ActionMenuDropdown
                                                title={`Aksi Jadwal ${schedule.title}`}
                                                items={[
                                                    {
                                                        label: 'Lihat Daftar Hadir & Presensi',
                                                        href: `/schedules/${schedule.id}`,
                                                        icon: Users,
                                                    },
                                                    {
                                                        label: 'Check-In Presensi (Kamera & GPS)',
                                                        href: `/attendance/check-in?schedule_id=${schedule.id}`,
                                                        icon: Camera,
                                                    },
                                                    {
                                                        label: 'Hapus Sesi Jadwal',
                                                        onClick: () => handleDeleteSchedule(schedule),
                                                        icon: Trash2,
                                                        variant: 'danger',
                                                        show: canManageSchedules,
                                                    },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Geotag & Info Note */}
                    <Card className="border-slate-200 bg-slate-900 text-slate-300 p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs space-y-1">
                                <p className="font-bold text-white">Sistem Geofence & Geotag Perkemi</p>
                                <p className="text-slate-400 leading-relaxed">
                                    Setiap sesi latihan memiliki titik koordinat GPS. Kenshi yang melakukan absensi mandiri akan diverifikasi jaraknya secara otomatis menggunakan rumus Haversine.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal Tambah Multi-Jadwal */}
            {canManageSchedules && isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Tambah Jadwal Sesi Latihan
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Buat jadwal tunggal, multi-tanggal, atau berulang secara otomatis.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreateSchedule} className="space-y-4 mt-4">
                            {/* Schedule Mode Selector Tabs */}
                            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setScheduleMode('single')}
                                    className={`py-2 rounded-md transition-all ${
                                        scheduleMode === 'single'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Satu Tanggal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScheduleMode('multi')}
                                    className={`py-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                                        scheduleMode === 'multi'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Pilih Banyak</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScheduleMode('recurring')}
                                    className={`py-2 rounded-md transition-all flex items-center justify-center gap-1 ${
                                        scheduleMode === 'recurring'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Repeat className="w-3.5 h-3.5" />
                                    <span>Rutin Berulang</span>
                                </button>
                            </div>

                            {/* Dojo Selection */}
                            <SelectSearch
                                label="Dojo Cabang"
                                required
                                value={data.dojo_id}
                                onChange={(val) => setData('dojo_id', val)}
                                error={errors.dojo_id}
                                options={dojos.map((d) => ({
                                    value: d.id,
                                    label: d.name,
                                    sublabel: d.pengprov,
                                }))}
                                placeholder="Cari cabang dojo perkemi..."
                                searchPlaceholder="Ketik nama dojo atau provinsi..."
                            />

                            {/* Title & Program Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Judul Sesi Latihan"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    error={errors.title}
                                    placeholder="e.g. Latihan Rutin Embu & Randori"
                                />

                                <SelectSearch
                                    label="Tipe Program"
                                    required
                                    value={data.program_type}
                                    onChange={(val) => setData('program_type', val)}
                                    error={errors.program_type}
                                    options={program_types}
                                />
                            </div>

                            {/* Mode Specific Inputs */}
                            {scheduleMode === 'single' && (
                                <Input
                                    label="Tanggal Latihan"
                                    type="date"
                                    required
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    error={errors.date}
                                />
                            )}

                            {scheduleMode === 'multi' && (
                                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className="text-xs font-semibold text-slate-700 block">
                                        Pilih Beberapa Tanggal Sesi
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={newMultiDateInput}
                                            onChange={(e) => setNewMultiDateInput(e.target.value)}
                                            className="text-xs rounded-lg border-slate-200 bg-white"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={addMultiDate}
                                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                                        >
                                            Tambah Tanggal
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {multiDates.map((d) => (
                                            <span
                                                key={d}
                                                className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-800"
                                            >
                                                <span>{d}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMultiDate(d)}
                                                    className="text-slate-400 hover:text-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Total {multiDates.length} sesi latihan akan dibuat secara bersamaan.
                                    </p>
                                </div>
                            )}

                            {scheduleMode === 'recurring' && (
                                <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className="text-xs font-semibold text-slate-700 block">
                                        Pilih Hari Latihan Rutin Tiap Minggu
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {fullDayNames.map((dayName, idx) => {
                                            const isChecked = data.days_of_week.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleDayOfWeek(idx)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                                        isChecked
                                                            ? 'bg-red-600 text-white border-red-600'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {dayName}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Input
                                            label="Periode Mulai"
                                            type="date"
                                            required
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                        <Input
                                            label="Periode Selesai"
                                            type="date"
                                            required
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Exact Time Slot */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Jam Mulai"
                                    type="time"
                                    required
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    error={errors.start_time}
                                />
                                <Input
                                    label="Jam Selesai"
                                    type="time"
                                    required
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    error={errors.end_time}
                                />
                            </div>

                            {/* Location & GPS Geotag */}
                            <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Compass className="w-4 h-4 text-red-600" />
                                        <span>Koordinat Lokasi Tatami (Geotag)</span>
                                    </span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={detectCurrentLocation}
                                        loading={gpsLoading}
                                        leftIcon={<MapPin className="w-3.5 h-3.5 text-red-600" />}
                                    >
                                        Ambil GPS Saya
                                    </Button>
                                </div>

                                <Input
                                    label="Nama Tempat / Aula"
                                    value={data.location_name}
                                    onChange={(e) => setData('location_name', e.target.value)}
                                    placeholder="e.g. Hall C Gelora Bung Karno Senayan"
                                />

                                <div className="grid grid-cols-3 gap-3">
                                    <Input
                                        label="Latitude"
                                        type="number"
                                        step="any"
                                        value={String(data.latitude ?? '')}
                                        onChange={(e) => setData('latitude', parseFloat(e.target.value))}
                                        placeholder="-6.2185700"
                                    />
                                    <Input
                                        label="Longitude"
                                        type="number"
                                        step="any"
                                        value={String(data.longitude ?? '')}
                                        onChange={(e) => setData('longitude', parseFloat(e.target.value))}
                                        placeholder="106.8026100"
                                    />
                                    <Input
                                        label="Radius (Meter)"
                                        type="number"
                                        value={String(data.radius_meters)}
                                        onChange={(e) => setData('radius_meters', parseInt(e.target.value) || 150)}
                                    />
                                </div>
                            </div>

                            {/* Instructor & Notes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Sensei / Instruktur"
                                    value={data.instructor_name}
                                    onChange={(e) => setData('instructor_name', e.target.value)}
                                    placeholder="e.g. Sensei Budi (V Dan)"
                                />
                                <Input
                                    label="Catatan Tambahan"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="e.g. Wajib membawa Dogi lengkap & Pelindung"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Simpan Jadwal Latihan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
