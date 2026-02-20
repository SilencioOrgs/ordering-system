"use client";

import { useState, useCallback } from "react";
import Map, { GeolocateControl, NavigationControl, ViewStateChangeEvent } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ArrowLeft } from "lucide-react";

interface LocationPickerProps {
    onLocationSelect: (address: string, lat: number, lng: number) => void;
    initialAddress?: string;
    initialLat?: number;
    initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

    // Center of Metro Manila as default fallback
    const [viewState, setViewState] = useState({
        longitude: initialLng || 121.0223,
        latitude: initialLat || 14.5547,
        zoom: 14
    });

    const [marker, setMarker] = useState({
        longitude: initialLng || 121.0223,
        latitude: initialLat || 14.5547,
    });

    const [isMoving, setIsMoving] = useState(false);
    const [step, setStep] = useState<"map" | "form">("map");

    // Form states
    const [street, setStreet] = useState("");
    const [subdivision, setSubdivision] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city, setCity] = useState("");

    const onMove = useCallback((evt: ViewStateChangeEvent) => {
        setViewState(evt.viewState);
        setMarker({
            longitude: evt.viewState.longitude,
            latitude: evt.viewState.latitude,
        });
    }, []);

    const handlePinConfirmed = () => {
        setStep("form");
    };

    const confirmFinalLocation = () => {
        const parts = [street, subdivision, barangay, city].filter(Boolean);
        const addressString = parts.length > 0 ? parts.join(", ") : `Pinned Location (${marker.latitude.toFixed(4)}, ${marker.longitude.toFixed(4)})`;

        onLocationSelect(addressString, marker.latitude, marker.longitude);
    };

    if (!mapboxToken) {
        return (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center p-6 text-center">
                <div>
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-slate-900 font-bold mb-2">Mapbox API Key Required</h3>
                    <p className="text-slate-500 text-sm max-w-xs">
                        Please paste your public token into <code>.env.local</code> as <code>NEXT_PUBLIC_MAPBOX_API_KEY</code>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-slate-50 flex flex-col">
            {step === "map" ? (
                <>
                    <Map
                        {...viewState}
                        onMove={onMove}
                        onMoveStart={() => setIsMoving(true)}
                        onMoveEnd={() => setIsMoving(false)}
                        mapboxAccessToken={mapboxToken}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        style={{ width: '100%', height: '100%' }}
                    >
                        <GeolocateControl position="top-right" trackUserLocation={false} showUserHeading={true} />
                        <NavigationControl position="bottom-right" />
                    </Map>

                    {/* Center Fixed Marker UI (acts as the dropping pin) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 transition-transform duration-200" style={{ transform: `translate(-50%, ${isMoving ? '-120%' : '-100%'})` }}>
                        <div className="relative flex flex-col items-center">
                            {!isMoving && (
                                <div className="absolute bottom-full mb-1 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap">
                                    Pin Delivery Location
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            )}
                            <MapPin className={`w-12 h-12 ${isMoving ? 'text-emerald-500' : 'text-emerald-700'} drop-shadow-xl`} strokeWidth={2.5} fill="white" />
                        </div>
                    </div>

                    {/* Target Reticle Shadow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-black/15 rounded-full blur-[2px] pointer-events-none transition-opacity duration-200" style={{ opacity: isMoving ? 0.3 : 0.8 }} />

                    <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-slate-100 text-center mx-auto w-full md:w-auto">
                            <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">Coordinates</p>
                            <p className="text-sm font-semibold text-slate-800 font-mono tracking-tight">{marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}</p>
                        </div>
                        <button
                            onClick={handlePinConfirmed}
                            className="w-full bg-emerald-700 text-white font-bold rounded-2xl py-4 shadow-xl hover:bg-emerald-800 transition-colors shadow-emerald-900/20 active:scale-[0.98]"
                        >
                            Confirm Address Area
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                        <button
                            onClick={() => setStep("map")}
                            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h3 className="font-bold text-slate-900 text-lg">Address Details</h3>
                    </div>

                    <div className="p-5 flex flex-col gap-4 flex-1">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Street Name *</label>
                            <input
                                type="text"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="e.g. Rizal Avenue"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-500 transition-all font-medium text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Subdivision / Block / Lot</label>
                            <input
                                type="text"
                                value={subdivision}
                                onChange={(e) => setSubdivision(e.target.value)}
                                placeholder="e.g. Block 1 Lot 1, Phase 2"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-500 transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Barangay *</label>
                                <input
                                    type="text"
                                    value={barangay}
                                    onChange={(e) => setBarangay(e.target.value)}
                                    placeholder="e.g. San Jose"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-500 transition-all font-medium text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">City/Nav *</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="e.g. Santa Cruz"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-500 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                        <button
                            onClick={confirmFinalLocation}
                            disabled={!street || !barangay || !city}
                            className="w-full bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl py-4 shadow-lg hover:bg-emerald-800 transition-colors shadow-emerald-900/20 active:scale-[0.98]"
                        >
                            Save Location
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
