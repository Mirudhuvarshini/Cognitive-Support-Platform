import React, { useState, useEffect } from 'react';
import { MapPin, Coffee, Activity, Star, Users, Pill, TreePine, Navigation, Search, Locate } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CATEGORY_CONFIG = {
    all: { label: 'All Places', icon: <MapPin size={16} />, color: '#6C5CE7' },
    restaurant: { label: 'Restaurants', icon: <Coffee size={16} />, color: '#f59e0b' },
    hospital: { label: 'Hospitals', icon: <Activity size={16} />, color: '#ef4444' },
    pharmacy: { label: 'Pharmacies', icon: <Pill size={16} />, color: '#22c55e' },
    park: { label: 'Quiet Spaces', icon: <TreePine size={16} />, color: '#14b8a6' },
};

const DEFAULT_PLACES = [
    { id: 1, name: 'Quiet Beans Cafe', type: 'restaurant', lat: 0, lng: 0, rating: 4.8, distance: '0.8 mi', noiseLevel: 'Low', sensoryFriendly: true },
    { id: 2, name: 'City Central Park', type: 'park', lat: 0, lng: 0, rating: 4.9, distance: '1.2 mi', noiseLevel: 'Low', sensoryFriendly: true },
    { id: 3, name: 'Mindful Therapy Clinic', type: 'hospital', lat: 0, lng: 0, rating: 5.0, distance: '2.5 mi', noiseLevel: 'Very Low', sensoryFriendly: true },
    { id: 4, name: 'Green Leaf Pharmacy', type: 'pharmacy', lat: 0, lng: 0, rating: 4.5, distance: '1.0 mi', noiseLevel: 'Moderate', sensoryFriendly: false },
    { id: 5, name: 'Sunrise Park', type: 'park', lat: 0, lng: 0, rating: 4.7, distance: '0.5 mi', noiseLevel: 'Low', sensoryFriendly: true },
    { id: 6, name: 'Care First Hospital', type: 'hospital', lat: 0, lng: 0, rating: 4.3, distance: '3.0 mi', noiseLevel: 'Moderate', sensoryFriendly: false },
];

function createIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

function LocationMarker({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 14);
    }, [position]);
    if (!position) return null;
    return (
        <Marker position={position} icon={L.divIcon({
            className: 'user-marker',
            html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>',
            iconSize: [16, 16], iconAnchor: [8, 8]
        })}>
            <Popup>You are here</Popup>
        </Marker>
    );
}

export default function SafePlaces() {
    const [filter, setFilter] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [places, setPlaces] = useState(DEFAULT_PLACES);
    const [searchQuery, setSearchQuery] = useState('');
    const [radius, setRadius] = useState(5);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const defaultCenter = [20.5937, 78.9629];

    useEffect(() => { detectLocation(); }, []);

    const detectLocation = () => {
        setLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = [pos.coords.latitude, pos.coords.longitude];
                    setUserLocation(loc);
                    const updatedPlaces = DEFAULT_PLACES.map((p, i) => ({
                        ...p,
                        lat: loc[0] + (Math.random() - 0.5) * 0.03,
                        lng: loc[1] + (Math.random() - 0.5) * 0.03,
                    }));
                    setPlaces(updatedPlaces);
                    setLoadingLocation(false);
                },
                () => {
                    setUserLocation(defaultCenter);
                    setLoadingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setUserLocation(defaultCenter);
            setLoadingLocation(false);
        }
    };

    const filteredPlaces = places.filter(p => {
        if (filter !== 'all' && p.type !== filter) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const openDirections = (place) => {
        const url = userLocation
            ? `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${place.lat},${place.lng}`
            : `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container app-page animate-fade-in">
            <div className="page-header text-center mb-6">
                <MapPin color="var(--color-primary)" size={48} className="mx-auto mb-4" />
                <h2>Safe Places Finder</h2>
                <p>Discover neurodivergent-friendly restaurants, hospitals, pharmacies, and quiet spaces near you.</p>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="flex gap-4 mb-4 align-center" style={{ flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                        <input type="text" placeholder="Search places..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '50px', border: '1px solid var(--glass-border)' }} />
                    </div>
                    <button className="btn-secondary" onClick={detectLocation} style={{ padding: '10px 16px' }}>
                        <Locate size={16} /> {loadingLocation ? 'Locating...' : 'My Location'}
                    </button>
                </div>

                <div className="filters flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                        <button key={key} className={`pill-btn ${filter === key ? 'selected' : ''}`} onClick={() => setFilter(key)}>
                            {cfg.icon} {cfg.label}
                        </button>
                    ))}
                </div>

                <div className="flex justify-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                    <a href="https://www.google.com/maps/search/quiet+restaurants+near+me" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#f59e0b', fontSize: '0.85rem' }}>
                        <Coffee size={16} /> Nearby Restaurants
                    </a>
                    <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#ef4444', fontSize: '0.85rem' }}>
                        <Activity size={16} /> Nearby Hospitals
                    </a>
                    <a href="https://www.google.com/maps/search/pharmacy+near+me" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#22c55e', fontSize: '0.85rem' }}>
                        <Pill size={16} /> Nearby Pharmacies
                    </a>
                </div>

                <div className="glass-card mb-6" style={{ borderRadius: '16px', overflow: 'hidden', height: '350px' }}>
                    {userLocation && (
                        <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                            <LocationMarker position={userLocation} />
                            {filteredPlaces.map(place => (
                                <Marker key={place.id} position={[place.lat, place.lng]} icon={createIcon(CATEGORY_CONFIG[place.type]?.color || '#6C5CE7')}>
                                    <Popup>
                                        <strong>{place.name}</strong><br />
                                        {place.type} &bull; {place.noiseLevel} noise<br />
                                        <a href="#" onClick={(e) => { e.preventDefault(); openDirections(place); }}>Get Directions</a>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                    {!userLocation && (
                        <div className="flex align-center justify-center" style={{ height: '100%' }}>
                            <p>Loading map...</p>
                        </div>
                    )}
                </div>

                <div className="places-list flex flex-col gap-4">
                    {filteredPlaces.map(place => (
                        <div key={place.id} className="place-card glass-card flex justify-space-between align-center" style={{ padding: '1.25rem' }}>
                            <div>
                                <div className="flex align-center gap-2 mb-2">
                                    <span style={{ color: CATEGORY_CONFIG[place.type]?.color }}>{CATEGORY_CONFIG[place.type]?.icon}</span>
                                    <h3 style={{ margin: 0 }}>{place.name}</h3>
                                    {place.sensoryFriendly && <span className="badge priority-low" style={{ fontSize: '0.65rem' }}>Sensory-Friendly</span>}
                                </div>
                                <div className="flex gap-4 text-sm text-secondary mb-2">
                                    <span className="flex align-center gap-1"><Star size={14} color="#f59e0b" /> {place.rating}</span>
                                    <span>{place.distance}</span>
                                    <span>Noise: {place.noiseLevel}</span>
                                </div>
                            </div>
                            <button className="btn-secondary flex align-center gap-1" onClick={() => openDirections(place)}>
                                <Navigation size={14} /> Directions
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
