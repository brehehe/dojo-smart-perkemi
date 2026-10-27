import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Compass,
    ExternalLink,
    LocateFixed,
    MapPin,
    Navigation,
    Shield,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';

interface Props {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    dojoName: string;
    address?: string;
    height?: string;
}

export function DojoMapViewer({
    latitude,
    longitude,
    radiusMeters = 150,
    dojoName,
    address,
    height = '360px',
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
        distance: number;
        isInside: boolean;
    } | null>(null);
    const [isLocating, setIsLocating] = useState<boolean>(false);
    const [geoError, setGeoError] = useState<string | null>(null);

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

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [latitude, longitude],
                zoom: 16,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // Dojo Pin
            const dojoIcon = L.divIcon({
                className: 'custom-dojo-pin',
                html: `
                    <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
                        <div style="background:#DC2626;color:white;border-radius:9999px;padding:8px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.35);border:2.5px solid white;display:flex;align-items:center;justify-content:center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                        </div>
                        <div style="background:#0F172A;color:#F8FAFC;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;margin-top:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:1px solid #334155;">
                            ${dojoName}
                        </div>
                    </div>
                `,
                iconSize: [0, 0],
            });

            const marker = L.marker([latitude, longitude], { icon: dojoIcon }).addTo(map);
            marker.bindPopup(`
                <div style="font-family:sans-serif;padding:4px;min-width:180px;">
                    <div style="font-weight:700;color:#0F172A;font-size:14px;margin-bottom:2px;">${dojoName}</div>
                    ${address ? `<div style="font-size:12px;color:#64748B;margin-bottom:6px;">${address}</div>` : ''}
                    <div style="font-size:11px;color:#059669;font-weight:600;display:flex;align-items:center;gap:4px;">
                        <span>Radius Absensi: ${radiusMeters} meter</span>
                    </div>
                </div>
            `);

            // Radius Circle
            L.circle([latitude, longitude], {
                radius: radiusMeters,
                color: '#2563EB',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '6, 6',
            }).addTo(map);

            mapInstanceRef.current = map;
        } else {
            mapInstanceRef.current.setView([latitude, longitude], 16);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, radiusMeters, dojoName, address]);

    // Check user distance using browser geolocation
    const checkUserRadius = () => {
        if (!navigator.geolocation) {
            setGeoError('Perangkat Anda tidak mendukung geolokasi GPS.');
            return;
        }

        setIsLocating(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;
                const dist = calculateDistance(latitude, longitude, userLat, userLng);
                const inside = dist <= radiusMeters;

                setUserLocation({
                    lat: userLat,
                    lng: userLng,
                    distance: dist,
                    isInside: inside,
                });
                setIsLocating(false);

                if (mapInstanceRef.current) {
                    if (userMarkerRef.current) {
                        userMarkerRef.current.remove();
                    }

                    const userIcon = L.divIcon({
                        className: 'user-live-pin',
                        html: `
                            <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%, -100%);">
                                <div style="background:${inside ? '#10B981' : '#F59E0B'};color:white;border-radius:9999px;padding:7px;box-shadow:0 8px 12px -2px rgba(0,0,0,0.3);border:2px solid white;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </div>
                                <div style="background:#1E293B;color:#F8FAFC;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:3px;white-space:nowrap;">
                                    Posisi Anda (${dist}m)
                                </div>
                            </div>
                        `,
                        iconSize: [0, 0],
                    });

                    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon }).addTo(mapInstanceRef.current);
                    userMarkerRef.current.bindPopup(`
                        <div style="font-family:sans-serif;padding:4px;">
                            <div style="font-weight:700;font-size:13px;color:#0F172A;">Posisi Anda Saat Ini</div>
                            <div style="font-size:12px;color:${inside ? '#059669' : '#D97706'};font-weight:600;margin-top:2px;">
                                Jarak: ${dist} meter (${inside ? 'Dalam Radius Absensi' : 'Di Luar Radius'})
                            </div>
                        </div>
                    `).openPopup();

                    // Fit bounds to show both Dojo and User
                    const bounds = L.latLngBounds([
                        [latitude, longitude],
                        [userLat, userLng],
                    ]);
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
                }
            },
            (err) => {
                setIsLocating(false);
                setGeoError(`Gagal mendapatkan lokasi GPS: ${err.message}`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{dojoName}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                <Shield className="h-3 w-3" />
                                Radius {radiusMeters}m
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={checkUserRadius}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <LocateFixed className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                        {isLocating ? 'Mendeteksi GPS...' : 'Cek Jarak Saya'}
                    </button>
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Buka di Google Maps
                    </a>
                </div>
            </div>

            {/* User distance alert banner if active */}
            {userLocation && (
                <div
                    className={`flex items-center justify-between border-b px-4 py-2.5 text-xs font-medium ${
                        userLocation.isInside
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {userLocation.isInside ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        )}
                        <span>
                            {userLocation.isInside
                                ? `Anda berada di dalam zona absensi dojo! Jarak GPS Anda: ${userLocation.distance} meter (Maks: ${radiusMeters} meter).`
                                : `Anda berada di luar radius presensi dojo. Jarak Anda: ${userLocation.distance} meter (Batas: ${radiusMeters} meter).`}
                        </span>
                    </div>
                    <span className="font-bold">
                        {userLocation.isInside ? 'Status: VALID' : 'Status: DI LUAR JANGKAUAN'}
                    </span>
                </div>
            )}

            {geoError && (
                <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {geoError}
                </div>
            )}

            {/* Leaflet container */}
            <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 1 }} />
        </div>
    );
}
