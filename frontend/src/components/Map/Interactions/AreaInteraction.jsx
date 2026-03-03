import React, { useState, useEffect } from 'react';
import { FeatureGroup, Polygon, Tooltip, Popup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { api } from '../../../api/apiService';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import * as turf from '@turf/turf';

const AreaInteraction = ({ mode }) => {
    const [areas, setAreas] = useState([]);
    const [currentLayer, setCurrentLayer] = useState(null);
    const [color, setColor] = useState('blue');
    const [text, setText] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [error, setError] = useState(null);
    const MAX_AREA_SIZE_DEG = 0.02;

    const [currentUserId, setCurrentUserId] = useState('');
    const map = useMap();
    const editControlRef = React.useRef(null);

    // Load existing areas and user ID on mount
    useEffect(() => {
        const loadData = async () => {
            const data = await api.getMapData();
            setAreas(data.areas || []);
            const userId = await api.getUserId();
            setCurrentUserId(userId);
        };
        loadData();
    }, []);

    // Auto-activate polygon drawing when switching to AREA mode
    useEffect(() => {
        if (mode === 'AREA' && !isDrawing) {
            // Small delay to ensure EditControl is mounted
            const timer = setTimeout(() => {
                // Programmatically trigger polygon drawing
                const container = map._container;
                const drawPolygonBtn = container.querySelector('.leaflet-draw-draw-polygon');
                if (drawPolygonBtn) {
                    drawPolygonBtn.click();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [mode, isDrawing, map]);

    const handleCreated = (e) => {
        const layer = e.layer;

        // Immediate size check on creation
        const bounds = layer.getBounds();
        const latDelta = Math.abs(bounds.getNorthEast().lat - bounds.getSouthWest().lat);
        const lngDelta = Math.abs(bounds.getNorthEast().lng - bounds.getSouthWest().lng);

        if (Math.max(latDelta, lngDelta) > MAX_AREA_SIZE_DEG) {
            setError("This area is a bit big! We try to keep things neighborhood-sized for a better experience.");
        } else {
            // Overlap check
            const isOverlapping = checkOverlap(layer);
            if (isOverlapping) {
                setError("Whoops! This area overlaps with an existing one. Try drawing in a clear spot!");
            } else {
                setError(null);
            }
        }

        setCurrentLayer(layer);
        setIsDrawing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        if (!currentLayer || !text) return;

        // Calculate bounds for font size and validation
        const bounds = currentLayer.getBounds();
        const northEast = bounds.getNorthEast();
        const southWest = bounds.getSouthWest();
        const latDiff = Math.abs(northEast.lat - southWest.lat);
        const lngDiff = Math.abs(northEast.lng - southWest.lng);

        // Client-side size validation
        if (Math.max(latDiff, lngDiff) > MAX_AREA_SIZE_DEG) {
            setError("Whoops, that's a huge area! Let's keep it local—try drawing a smaller neighborhood instead.");
            return;
        }

        // Rough heuristic for font size based on lat diff
        const fontSize = Math.round(Math.max(14, Math.min(48, latDiff * 2000))) + 'px';

        const latlngs = currentLayer.getLatLngs();

        const newArea = {
            latlngs,
            color,
            text,
            fontSize,
        };

        try {
            const savedArea = await api.saveArea(newArea);
            setAreas([...areas, savedArea]);

            // Cleanup temporary layer and state
            currentLayer.remove();
            setCurrentLayer(null);
            setIsDrawing(false);
            setText('');
            setError(null);
        } catch (err) {
            console.error('Save area error:', err);
            setError(err.message || 'Failed to save area. It might be too large or you reached your daily limit.');
        }
    };

    const handleCancel = () => {
        if (currentLayer) {
            currentLayer.remove();
        }
        setCurrentLayer(null);
        setIsDrawing(false);
        setText('');
    };

    const handleDelete = async (areaId) => {
        try {
            await api.deleteArea(areaId);
            setAreas(areas.filter(a => a.id !== areaId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleVote = async (area) => {
        try {
            if (area.userVoted) {
                await api.unvote('area', area.id);
                setAreas(areas.map(a =>
                    a.id === area.id ? { ...a, votes: a.votes - 1, userVoted: false } : a
                ));
            } else {
                await api.vote('area', area.id);
                setAreas(areas.map(a =>
                    a.id === area.id ? { ...a, votes: a.votes + 1, userVoted: true } : a
                ));
            }
        } catch (error) {
            console.error('Vote error:', error);
        }
    };

    const checkOverlap = (layer) => {
        try {
            const newCoords = layer.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
            // Close the polygon
            newCoords.push(newCoords[0]);
            const newPoly = turf.polygon([newCoords]);

            return areas.some(area => {
                try {
                    // Extract coordinates from existing area
                    let areaCoords;
                    if (Array.isArray(area.latlngs[0])) {
                        areaCoords = area.latlngs[0].map(ll => [ll.lng, ll.lat]);
                    } else {
                        areaCoords = area.latlngs.map(ll => [ll.lng, ll.lat]);
                    }

                    if (areaCoords.length < 3) return false;

                    // Close the polygon
                    areaCoords.push(areaCoords[0]);
                    const existingPoly = turf.polygon([areaCoords]);

                    // booleanIntersects is true if they touch. 
                    // To be more user friendly, we might want to check if they actually overlap (intersect area > 0)
                    // but for simplicity and robustness, booleanIntersects is a good start.
                    // Actually, let's use intersect and check if it returns a polygon
                    const intersection = turf.intersect(turf.featureCollection([newPoly, existingPoly]));
                    return intersection !== null;
                } catch (e) {
                    console.error("Error checking overlap with area", area.id, e);
                    return false;
                }
            });
        } catch (e) {
            console.error("Error in checkOverlap", e);
            return false;
        }
    };

    const getVoteFontSize = (area) => {
        // Parse base font size and boost proportionally to votes
        // displayFontSize = baseFontSize * (1 + min(votes, 50) * 0.02)
        const basePx = parseFloat(area.fontSize) || 14;
        const boost = 1 + Math.min(area.votes || 0, 50) * 0.02;
        return basePx * boost + 'px';
    };

    const ColorButton = ({ c, label }) => (
        <button
            type="button"
            onClick={() => setColor(c)}
            style={{
                backgroundColor: c === 'blue' ? 'rgba(59, 130, 246, 0.6)' : c === 'green' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                border: color === c ? '2px solid black' : '1px solid #ccc',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                cursor: 'pointer',
                margin: '0 5px'
            }}
            title={label}
        />
    );

    // Only enable drawing when in AREA mode
    const drawOptions = mode === 'AREA' ? {
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        polygon: {
            allowIntersection: false,
            drawError: {
                color: '#e1e100',
                message: '<strong>Oh snap!</strong> you can\'t draw that!'
            },
            shapeOptions: {
                color: '#3b82f6'
            }
        }
    } : {
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        polygon: false
    };

    return (
        <FeatureGroup>
            <EditControl
                position="topleft"
                onCreated={handleCreated}
                draw={drawOptions}
                edit={{
                    edit: false,
                    remove: false
                }}
            />

            {/* Render saved areas */}
            {areas.map((area) => {
                const isOwner = area.userId === currentUserId;
                const colorHex = area.color === 'blue' ? '#3b82f6' : area.color === 'green' ? '#22c55e' : '#ef4444';

                return (
                    <Polygon
                        key={area.id}
                        positions={area.latlngs}
                        pathOptions={{
                            color: colorHex,
                            fillOpacity: 0.4
                        }}
                    >
                        {/* Modern text label without box — font scaled by votes */}
                        <Tooltip
                            permanent
                            direction="center"
                            className="modern-tooltip"
                            offset={[0, 0]}
                        >
                            <div
                                className="map-label-style"
                                style={{
                                    fontSize: getVoteFontSize(area),
                                }}
                            >
                                {area.text}
                            </div>
                        </Tooltip>

                        {/* Popup with vote button + delete (for all users) */}
                        <Popup>
                            <div>
                                <p><strong>{area.text}</strong></p>
                                <small>{new Date(area.createdAt).toLocaleDateString()}</small>

                                {/* Vote button */}
                                <div style={{ marginTop: '8px' }}>
                                    <button
                                        onClick={() => handleVote(area)}
                                        className={`vote-btn ${area.userVoted ? 'voted' : ''}`}
                                    >
                                        👍 {area.votes}
                                    </button>
                                </div>

                                {isOwner && (
                                    <div style={{ marginTop: '8px' }}>
                                        <button
                                            onClick={() => handleDelete(area.id)}
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
                    </Polygon>
                );
            })}

            {/* Configuration Modal/Popup for new area */}
            {isDrawing && currentLayer && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    minWidth: '300px'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Configure Area</h3>

                    {error && (
                        <div style={{
                            padding: '10px',
                            marginBottom: '16px',
                            background: error.includes('Warning') ? '#fff7ed' : '#fef2f2',
                            color: error.includes('Warning') ? '#c2410c' : '#b91c1c',
                            border: error.includes('Warning') ? '1px solid #fdba74' : '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                        }}>
                            {error.includes('Warning') ? '⚠️ ' : '🚫 '} {error}
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Choose Color:
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                                <ColorButton c="blue" label="Blue" />
                                <ColorButton c="green" label="Green" />
                                <ColorButton c="red" label="Red" />
                            </div>
                            <small style={{ fontSize: '0.75rem', color: '#666' }}>
                                (Blue: Neutral, Green: Safe, Red: Busy/Danger)
                            </small>
                        </div>

                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                            Area Label:
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="e.g. 'Hipster Main St', 'Tourist Trap', 'Quiet Zone'"
                            maxLength={100}
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginBottom: '4px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '0.95rem'
                            }}
                            autoFocus
                        />
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '16px', textAlign: 'right' }}>
                            More votes = <strong>BIGGER</strong> text! 📈
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: '#e5e7eb',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!!error && !error.includes('Warning')}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: (!!error && !error.includes('Warning')) ? '#ccc' : 'var(--accent)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: (!!error && !error.includes('Warning')) ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Save Area
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </FeatureGroup>
    );
};

export default AreaInteraction;
