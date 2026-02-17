import React, { useState, useEffect } from 'react';
import { Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import { api } from '../../../api/apiService';

const VOTE_THRESHOLD_PERMANENT_LABEL = 5;

const PinInteraction = ({ mode }) => {
    const [newPin, setNewPin] = useState(null);
    const [pins, setPins] = useState([]);
    const [formData, setFormData] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    // Load existing pins and user ID on mount
    useEffect(() => {
        const loadData = async () => {
            const data = await api.getMapData();
            setPins(data.pins || []);
            setCurrentUserId(api.getUserId());
        };
        loadData();
    }, []);

    // Handle map clicks to drop a temporary pin (only in PIN mode)
    useMapEvents({
        click(e) {
            if (mode !== 'PIN') return; // Only allow pin drops in PIN mode

            setNewPin({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
            setFormData(''); // Reset form
        },
    });

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newPin || !formData.trim()) return;

        const savedPin = await api.savePin({
            lat: newPin.lat,
            lng: newPin.lng,
            text: formData,
        });

        setPins([...pins, savedPin]);
        setNewPin(null); // Clear temp pin
    };

    const handleCancel = () => {
        setNewPin(null);
    };

    const handleDelete = async (pinId) => {
        try {
            await api.deletePin(pinId);
            setPins(pins.filter(p => p.id !== pinId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleVote = async (pin) => {
        try {
            if (pin.userVoted) {
                await api.unvote('pin', pin.id);
                setPins(pins.map(p =>
                    p.id === pin.id ? { ...p, votes: p.votes - 1, userVoted: false } : p
                ));
            } else {
                await api.vote('pin', pin.id);
                setPins(pins.map(p =>
                    p.id === pin.id ? { ...p, votes: p.votes + 1, userVoted: true } : p
                ));
            }
        } catch (error) {
            console.error('Vote error:', error);
        }
    };

    return (
        <>
            {/* Existing saved pins */}
            {pins.map((pin) => {
                const isOwner = pin.userId === currentUserId;
                const showPermanentLabel = pin.votes >= VOTE_THRESHOLD_PERMANENT_LABEL;

                return (
                    <Marker key={pin.id} position={[pin.lat, pin.lng]}>
                        {/* Show permanent tooltip for highly-voted pins */}
                        {showPermanentLabel && (
                            <Tooltip
                                permanent
                                direction="top"
                                offset={[0, -40]}
                                className="modern-tooltip"
                            >
                                <div
                                    className="hoodmaps-label"
                                    style={{ fontSize: '12px' }}
                                >
                                    {pin.text}
                                </div>
                            </Tooltip>
                        )}

                        <Popup className="premium-popup">
                            <div className="popup-content">
                                <strong>Info:</strong> {pin.text} <br />
                                <small style={{ color: '#666' }}>
                                    {new Date(pin.createdAt).toLocaleDateString()}
                                </small>

                                {/* Vote button */}
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        onClick={() => handleVote(pin)}
                                        className={`vote-btn ${pin.userVoted ? 'voted' : ''}`}
                                    >
                                        👍 {pin.votes}
                                    </button>
                                </div>

                                {isOwner && (
                                    <div style={{ marginTop: '8px' }}>
                                        <button
                                            onClick={() => handleDelete(pin.id)}
                                            style={{
                                                padding: '4px 8px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Temporary pin being created */}
            {newPin && (
                <Marker position={[newPin.lat, newPin.lng]}>
                    <Popup autoPan={true} closeButton={false} autoClose={false}>
                        <div className="pin-form" style={{ minWidth: '200px' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Add Info</h3>
                            <form onSubmit={handleSave}>
                                <textarea
                                    value={formData}
                                    onChange={(e) => setFormData(e.target.value)}
                                    placeholder="Enter details here..."
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        marginBottom: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        resize: 'vertical',
                                        minHeight: '60px'
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        style={{
                                            padding: '4px 8px',
                                            background: '#e5e7eb',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '4px 12px',
                                            background: 'var(--accent)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Popup>
                </Marker>
            )}
        </>
    );
};

export default PinInteraction;
