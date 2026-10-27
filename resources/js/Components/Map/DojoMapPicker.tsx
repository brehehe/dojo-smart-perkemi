import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Compass,
    ExternalLink,
    LocateFixed,
    MapPin,
    Navigation,
    RefreshCw,
    Search,
    Shield,
} from 'lucide-react';

interface Props {
    latitude: number | null;
    longitude: number | null;
    radiusMeters: number;
    dojoName?: string;
    address?: string;
    onChange: (coords: { latitude: number; longitude: number; radiusMeters: number }) => void;
}

export function DojoMapPicker({
    latitude,
    longitude,
    radiusMeters = 150,
    dojoName = 'Titik Dojo',
    address = '',
    onChange,
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const testMarkerRef = useRef<L.Marker | null>(null);

    // Default to Surabaya coordinates if not set
    const defaultLat = latitude ?? -7.3183485;
    const defaultLng = longitude ?? 112.7177549;

    const [currentLat, setCurrentLat] = useState<number>(defaultLat);
    const [currentLng, setCurrentLng] = useState<number>(defaultLng);
    const [currentRadius, setCurrentRadius] = useState<number>(radiusMeters || 150);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isGettingGps, setIsGettingGps] = useState<boolean>(false);

    // Radius Testing Tool State
    const [testMode, setTestMode] = useState<boolean>(false);
    const [testPoint, setTestPoint] = useState<{
        lat: number;
        lng: number;
        distance: number;
        isInside: boolean;
    } | null>(null);

    // Distance calculation (Haversine in meters)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

    // Custom SVG Pin Icons
    const createDojoIcon = (label: string) => {
        return L.divIcon({
            className: 'custom-dojo-pin',
            html: `
                <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);cursor:grab;">
                    <div style="background:#DC2626;color:white;border-radius:9999px;padding:7px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.35);border:2.5px solid white;display:flex;align-items:center;justify-content:center;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div style="background:#0F172A;color:#F8FAFC;font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px;margin-top:3px;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,0.25);border:1px solid #334155;">
                        ${label}
                    </div>
                </div>
            `,
            iconSize: [0, 0],
        });
    };

    const createTestIcon = (distance: number, isInside: boolean) => {
        const bg = isInside ? '#059669' : '#D97706';
        const label = isInside ? `✓ ${distance}m (Dalam Radius)` : `⚠️ ${distance}m (Luar Radius)`;
        return L.divIcon({
            className: 'custom-test-pin',
            html: `
                <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
                    <div style="background:${bg};color:white;border-radius:9999px;padding:6px;box-shadow:0 8px 12px -2px rgba(0,0,0,0.3);border:2px solid white;display:flex;align-items:center;justify-content:center;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="m9 12 2 2 4-4"/>
                        </svg>
                    </div>
                    <div style="background:${bg};color:white;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);">
                        ${label}
                    </div>
                </div>
            `,
            iconSize: [0, 0],
        });
    };

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [currentLat, currentLng],
                zoom: 16,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);

            // Add Dojo Marker
            const marker = L.marker([currentLat, currentLng], {
                draggable: true,
                icon: createDojoIcon(dojoName || 'Titik Dojo'),
            }).addTo(map);

            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                const newLat = Number(pos.lat.toFixed(7));
                const newLng = Number(pos.lng.toFixed(7));
                setCurrentLat(newLat);
                setCurrentLng(newLng);
                onChange({ latitude: newLat, longitude: newLng, radiusMeters: currentRadius });
            });

            // Add Radius Circle
            const circle = L.circle([currentLat, currentLng], {
                radius: currentRadius,
                color: '#DC2626',
                fillColor: '#EF4444',
                fillOpacity: 0.18,
                weight: 2,
                dashArray: '4, 6',
            }).addTo(map);

            // Click listener on Map
            map.on('click', (e: L.LeafletMouseEvent) => {
                const clickLat = Number(e.latlng.lat.toFixed(7));
                const clickLng = Number(e.latlng.lng.toFixed(7));

                // If in test mode, evaluate test location
                if (testMode) {
                    const dist = calculateDistance(currentLat, currentLng, clickLat, clickLng);
                    const inside = dist <= currentRadius;

                    setTestPoint({
                        lat: clickLat,
                        lng: clickLng,
                        distance: dist,
                        isInside: inside,
                    });

                    if (testMarkerRef.current) {
                        testMarkerRef.current.setLatLng([clickLat, clickLng]);
                        testMarkerRef.current.setIcon(createTestIcon(dist, inside));
                    } else {
                        testMarkerRef.current = L.marker([clickLat, clickLng], {
                            icon: createTestIcon(dist, inside),
                        }).addTo(map);
                    }
                } else {
                    // Normal mode: update dojo center pin
                    setCurrentLat(clickLat);
                    setCurrentLng(clickLng);
                    marker.setLatLng([clickLat, clickLng]);
                    circle.setLatLng([clickLat, clickLng]);
                    onChange({ latitude: clickLat, longitude: clickLng, radiusMeters: currentRadius });
                }
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;
            circleRef.current = circle;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update circle radius & marker position whenever props or state change
    useEffect(() => {
        if (circleRef.current) {
            circleRef.current.setRadius(currentRadius);
            circleRef.current.setLatLng([currentLat, currentLng]);
        }
        if (markerRef.current) {
            markerRef.current.setLatLng([currentLat, currentLng]);
            markerRef.current.setIcon(createDojoIcon(dojoName || 'Titik Dojo'));
        }
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([currentLat, currentLng], mapInstanceRef.current.getZoom());
        }
    }, [currentLat, currentLng, currentRadius, dojoName]);

    // Handle Radius Change
    const handleRadiusChange = (newRadius: number) => {
        setCurrentRadius(newRadius);
        onChange({ latitude: currentLat, longitude: currentLng, radiusMeters: newRadius });

        // Update test point if exists
        if (testPoint) {
            const inside = testPoint.distance <= newRadius;
            setTestPoint({ ...testPoint, isInside: inside });
            if (testMarkerRef.current) {
                testMarkerRef.current.setIcon(createTestIcon(testPoint.distance, inside));
            }
        }
    };

    // Geocode Search using OpenStreetMap Nominatim
    const handleSearchAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const query = encodeURIComponent(`${searchQuery}, Indonesia`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await res.json();

            if (data && data.length > 0) {
                const lat = Number(parseFloat(data[0].lat).toFixed(7));
                const lng = Number(parseFloat(data[0].lon).toFixed(7));

                setCurrentLat(lat);
                setCurrentLng(lng);
                onChange({ latitude: lat, longitude: lng, radiusMeters: currentRadius });

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 16);
                }
            } else {
                alert('Alamat tidak ditemukan. Silakan masukkan kata kunci yang lebih spesifik atau klik langsung pada peta.');
            }
        } catch (err) {
            console.error('Nominatim error:', err);
            alert('Layanan pencarian alamat sedang sibuk. Silakan tentukan titik dengan klik langsung pada peta.');
        } finally {
            setIsSearching(false);
        }
    };

    // Get Current Device GPS
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser tidak mendukung GPS Geolocation.');
            return;
        }

        setIsGettingGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(7));
                const lng = Number(pos.coords.longitude.toFixed(7));

                setCurrentLat(lat);
                setCurrentLng(lng);
                onChange({ latitude: lat, longitude: lng, radiusMeters: currentRadius });

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([lat, lng], 17);
                }
                setIsGettingGps(false);
            },
            (err) => {
                console.warn('GPS error:', err);
                alert('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi telah aktif.');
                setIsGettingGps(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Reset Test Marker
    const handleResetTest = () => {
        if (testMarkerRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(testMarkerRef.current);
            testMarkerRef.current = null;
        }
        setTestPoint(null);
    };

    const googleMapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

    return (
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Header & Mode Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            Titik Koordinat & Radius Geofence Absensi
                        </h4>
                        <p className="text-[11px] text-slate-500">
                            Geser pin atau klik pada peta untuk menentukan titik resmi tatami dojo.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setTestMode(!testMode);
                            if (testMode) handleResetTest();
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                            testMode
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                    >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{testMode ? 'Mode Uji: Aktif (Klik Peta)' : 'Uji Radius Absensi'}</span>
                    </button>

                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 flex items-center gap-1 transition-colors"
                        title="Buka di Google Maps"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Google Maps</span>
                    </a>
                </div>
            </div>

            {/* Address Search & Quick Tools */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <form onSubmit={handleSearchAddress} className="flex-1 w-full flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari lokasi gedung/jalan (e.g. Sawahan Surabaya, Senayan Jakarta)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 focus:border-red-500 focus:ring-red-500 bg-slate-50/50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shrink-0 disabled:opacity-60 transition-colors"
                    >
                        {isSearching ? 'Mencari...' : 'Cari'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isGettingGps}
                    className="w-full sm:w-auto px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                >
                    <LocateFixed className="w-3.5 h-3.5 text-red-600" />
                    <span>{isGettingGps ? 'Mendeteksi...' : 'GPS Saat Ini'}</span>
                </button>
            </div>

            {/* Test Mode Instructions Banner if Active */}
            {testMode && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-amber-600" />
                            Mode Uji Simulasi Radius Aktif
                        </span>
                        {testPoint && (
                            <button
                                type="button"
                                onClick={handleResetTest}
                                className="text-[11px] text-amber-800 underline font-semibold hover:text-amber-900"
                            >
                                Hapus Titik Uji
                            </button>
                        )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                        Klik di mana saja pada peta untuk menyimulasikan posisi kenshi. Sistem akan langsung menguji apakah kenshi berada <strong>di dalam</strong> atau <strong>di luar</strong> radius absensi {currentRadius} meter.
                    </p>
                    {testPoint && (
                        <div className="pt-1.5 border-t border-amber-200 flex items-center justify-between text-xs">
                            <span>
                                Jarak Simulasi: <strong>{testPoint.distance} Meter</strong>
                            </span>
                            <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    testPoint.isInside
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                            >
                                {testPoint.isInside ? '✓ Sah (Di Dalam Radius)' : '⚠️ Ditolak (Di Luar Radius)'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Interactive Leaflet Map Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 h-72 sm:h-80 w-full z-0">
                <div ref={mapContainerRef} className="w-full h-full" />
                <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-md shadow-sm border border-slate-700">
                    Lat: {currentLat} • Lng: {currentLng}
                </div>
            </div>

            {/* Radius Configuration & Sliders */}
            <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Radius Toleransi Absensi (Geofence):</span>
                    <span className="text-red-700 font-bold font-mono text-sm">
                        {currentRadius} Meter
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="20"
                        max="1000"
                        step="10"
                        value={currentRadius}
                        onChange={(e) => handleRadiusChange(Number(e.target.value))}
                        className="w-full accent-red-600 cursor-pointer"
                    />
                </div>

                {/* Preset Radius Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 font-medium mr-1">Preset Cepat:</span>
                    {[50, 100, 150, 200, 300, 500].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => handleRadiusChange(r)}
                            className={`text-[11px] px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                                currentRadius === r
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {r}m
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Latitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={currentLat}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCurrentLat(val);
                            onChange({ latitude: val, longitude: currentLng, radiusMeters: currentRadius });
                        }}
                        className="w-full text-xs font-mono rounded-lg border-slate-300 py-1.5 px-2.5 focus:border-red-500 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Longitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={currentLng}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCurrentLng(val);
                            onChange({ latitude: currentLat, longitude: val, radiusMeters: currentRadius });
                        }}
                        className="w-full text-xs font-mono rounded-lg border-slate-300 py-1.5 px-2.5 focus:border-red-500 focus:ring-red-500"
                    />
                </div>
            </div>
        </div>
    );
}
