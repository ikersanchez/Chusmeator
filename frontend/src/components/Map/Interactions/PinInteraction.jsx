import React, { useState, useEffect } from 'react';
import { Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../../api/apiService';

// Create a custom SVG icon for pins with dynamic colors
const createColoredIcon = (color) => {
    // Map our semantic colors to hex values for the SVG
    const colorMap = {
        blue: '#3b82f6',
        green: '#22c55e',
        red: '#ef4444'
    };
    const fill = colorMap[color] || colorMap.blue;

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="25" height="41">
            <path fill="${fill}" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
        </svg>
    `;

    return L.divIcon({
        className: 'custom-pin-icon',
        html: svg,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
        tooltipAnchor: [12, -28]
    });
};

const VOTE_THRESHOLD_PERMANENT_LABEL = 5;

const PinInteraction = ({ mode }) => {
    const [newPin, setNewPin] = useState(null);
    const [pins, setPins] = useState([]);
    const [formData, setFormData] = useState('');
    const [selectedColor, setSelectedColor] = useState('blue');
    const [currentUserId, setCurrentUserId] = useState('');

    // Comments state
    const [commentsVisibleForPin, setCommentsVisibleForPin] = useState(null);
    const [pinComments, setPinComments] = useState({});
    const [newCommentText, setNewCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

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
            color: selectedColor,
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

    const handleToggleComments = async (pinId) => {
        if (commentsVisibleForPin === pinId) {
            // Close comments
            setCommentsVisibleForPin(null);
            return;
        }

        // Open comments and fetch
        setCommentsVisibleForPin(pinId);
        setNewCommentText('');

        if (!pinComments[pinId]) {
            setLoadingComments(true);
            try {
                const comments = await api.getPinComments(pinId);
                setPinComments(prev => ({ ...prev, [pinId]: comments }));
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoadingComments(false);
            }
        }
    };

    const handleAddComment = async (e, pinId) => {
        e.preventDefault();
        if (!newCommentText.trim() || newCommentText.length > 100) return;

        try {
            const addedComment = await api.addPinComment(pinId, newCommentText);
            setPinComments(prev => ({
                ...prev,
                [pinId]: [addedComment, ...(prev[pinId] || [])]
            }));
            setNewCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };


    return (
        <>
            {/* Existing saved pins */}
            {pins.map((pin) => {
                const isOwner = pin.userId === currentUserId;
                const showPermanentLabel = pin.votes >= VOTE_THRESHOLD_PERMANENT_LABEL;

                return (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        icon={createColoredIcon(pin.color)}
                    >
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

                                {/* Vote button and Comments button */}
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        onClick={() => handleVote(pin)}
                                        className={`action-btn vote-btn ${pin.userVoted ? 'voted' : ''}`}
                                    >
                                        👍 {pin.votes}
                                    </button>
                                    <button
                                        onClick={() => handleToggleComments(pin.id)}
                                        className="action-btn comment-btn"
                                    >
                                        💬 Comments
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

                                {/* Comments Section */}
                                {commentsVisibleForPin === pin.id && (
                                    <div className="comments-section" style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Comments</h4>

                                        <div className="comments-list" style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                                            {loadingComments ? (
                                                <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>Loading...</div>
                                            ) : pinComments[pin.id]?.length > 0 ? (
                                                pinComments[pin.id].map(comment => (
                                                    <div key={comment.id} style={{
                                                        background: '#f9fafb',
                                                        padding: '6px 8px',
                                                        borderRadius: '6px',
                                                        marginBottom: '6px',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <div style={{ wordBreak: 'break-word' }}>{comment.text}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px', textAlign: 'right' }}>
                                                            {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', margin: '10px 0' }}>No comments yet.</div>
                                            )}
                                        </div>

                                        <form onSubmit={(e) => handleAddComment(e, pin.id)} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <input
                                                type="text"
                                                value={newCommentText}
                                                onChange={(e) => setNewCommentText(e.target.value)}
                                                placeholder="Write a comment..."
                                                maxLength={100}
                                                style={{
                                                    padding: '6px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', color: newCommentText.length >= 100 ? '#ef4444' : '#9ca3af' }}>
                                                    {newCommentText.length}/100
                                                </span>
                                                <button
                                                    type="submit"
                                                    disabled={!newCommentText.trim() || newCommentText.length > 100}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: 'var(--accent)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: !newCommentText.trim() || newCommentText.length > 100 ? 'not-allowed' : 'pointer',
                                                        fontSize: '0.8rem',
                                                        opacity: !newCommentText.trim() || newCommentText.length > 100 ? 0.5 : 1
                                                    }}
                                                >
                                                    Post
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Temporary pin being created */}
            {newPin && (
                <Marker position={[newPin.lat, newPin.lng]} icon={createColoredIcon(selectedColor)}>
                    <Popup autoPan={true} closeButton={false} autoClose={false}>
                        <div className="pin-form" style={{ minWidth: '200px' }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Add Info</h3>
                            <form onSubmit={handleSave}>
                                <textarea
                                    value={formData}
                                    onChange={(e) => setFormData(e.target.value)}
                                    placeholder="e.g. 'Best Coffee', 'Pickpockets here', 'Hidden Gem'"
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        marginBottom: '4px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        resize: 'vertical',
                                        minHeight: '60px'
                                    }}
                                />

                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 'bold' }}>Color</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['blue', 'green', 'red'].map(color => (
                                            <div
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: `var(--area-${color})`,
                                                    border: selectedColor === color ? '3px solid var(--text)' : '1px solid #ccc',
                                                    cursor: 'pointer',
                                                    opacity: selectedColor === color ? 1 : 0.6
                                                }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px', textAlign: 'right' }}>
                                    Get <strong>5 votes</strong> to make it permanent! 🚀
                                </div>
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
