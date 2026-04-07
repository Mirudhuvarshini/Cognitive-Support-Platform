import React, { useState, useEffect } from 'react';
import { AlertOctagon, X, Phone, MapPin, MessageCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EMERGENCY_NUMBERS = {
    US: '911', UK: '999', EU: '112', IN: '112', AU: '000'
};

export default function SOSButton() {
    const { authFetch, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [location, setLocation] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState('I need help right now.');
    const [countdownInterval, setCountdownInterval] = useState(null);

    const presetMessages = [
        'I need help right now.',
        'I\'m having a meltdown and need support.',
        'I feel overwhelmed. Please come to my location.',
        'I\'m in a crisis and need someone to talk to.',
    ];

    useEffect(() => {
        if (isOpen && user) {
            loadContacts();
            getLocation();
        }
    }, [isOpen]);

    const loadContacts = async () => {
        try {
            const res = await authFetch('/emergency-contacts');
            if (res.ok) setContacts(await res.json());
        } catch { /* offline */ }
    };

    const getLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation(null)
            );
        }
    };

    const handleSOSClick = () => setIsOpen(true);

    const startCountdown = () => {
        setCountdown(5);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    triggerAlert();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        setCountdownInterval(interval);
    };

    const cancelCountdown = () => {
        if (countdownInterval) clearInterval(countdownInterval);
        setCountdown(null);
    };

    const triggerAlert = () => {
        const locationLink = location
            ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
            : 'Location unavailable';

        const alertMsg = `🆘 SOS ALERT from ${user?.name || 'User'}!\n\nMessage: ${selectedMessage}\nLocation: ${locationLink}\n\nThis is an automated alert from Neural Compass.`;

        contacts.forEach(contact => {
            if (contact.notify_on_sos && contact.phone) {
                window.open(`sms:${contact.phone}?body=${encodeURIComponent(alertMsg)}`, '_blank');
            }
        });

        alert('Emergency contacts have been notified with your location!');
        setIsOpen(false);
        setCountdown(null);
    };

    return (
        <>
            <button className="sos-fab" onClick={handleSOSClick} title="Emergency SOS" aria-label="Emergency SOS">
                <AlertOctagon size={28} />
            </button>

            {isOpen && (
                <div className="sos-modal-overlay">
                    <div className="sos-modal glass-card animate-fade-in">
                        <button className="close-btn" onClick={() => { setIsOpen(false); cancelCountdown(); }}><X /></button>
                        <div className="sos-header text-center">
                            <AlertOctagon size={48} color="#dc2626" className="mx-auto mb-4" />
                            <h2 style={{ color: '#dc2626' }}>Emergency SOS</h2>
                            <p>Do you need immediate assistance?</p>
                        </div>

                        <div className="mt-4">
                            <label style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Quick message to contacts:</label>
                            <div className="flex flex-col gap-2">
                                {presetMessages.map((msg, i) => (
                                    <button key={i} className={`pill-btn ${selectedMessage === msg ? 'selected' : ''}`} onClick={() => setSelectedMessage(msg)} style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                                        {msg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {location && (
                            <div className="flex align-center gap-2 mt-4" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                <MapPin size={14} /> Location will be shared: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </div>
                        )}

                        {contacts.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm text-secondary mb-2">Contacts to notify ({contacts.filter(c => c.notify_on_sos).length}):</p>
                                <div className="flex flex-wrap gap-2">
                                    {contacts.filter(c => c.notify_on_sos).map(c => (
                                        <span key={c.id} className="badge priority-low" style={{ padding: '4px 10px' }}>{c.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="sos-actions mt-6">
                            <button className="btn-primary full-width mb-4" onClick={countdown !== null ? cancelCountdown : startCountdown} style={{ background: countdown !== null ? '#f59e0b' : '#dc2626' }}>
                                {countdown !== null ? `Cancel (${countdown}s)` : 'Alert Contacts & Share Location'}
                            </button>
                            <div className="flex gap-4">
                                <a href={`tel:${EMERGENCY_NUMBERS.US}`} className="btn-secondary flex-1 flex justify-center align-center gap-2"><Phone size={18} /> Call Emergency</a>
                                <button className="btn-secondary flex-1 flex justify-center align-center gap-2" onClick={() => { setIsOpen(false); cancelCountdown(); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
