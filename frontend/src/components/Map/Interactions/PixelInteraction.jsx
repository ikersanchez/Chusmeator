import React, { useState, useEffect } from 'react';
import { Rectangle, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { api } from '../../../api/apiService';

const PixelInteraction = ({ mode }) => {
    const [pixels, setPixels] = useState([]);
    const [visibleGrid, setVisibleGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    const GRID_SIZE = 0.01; // ~1km at equator
    const map = useMap();

    // Load existing pixels and user ID on mount
    useEffect(() => {
        const loadData = async () => {
            const data = await api.getPixels();
            setPixels(data || []);
            setCurrentUserId(api.getUserId());
        };
        loadData();
    }, []);

    // Calculate visible grid cells based on map bounds
    const updateVisibleGrid = () => {
        if (mode !== 'PIXEL') {
            setVisibleGrid([]);
            return;
        }

        const bounds = map.getBounds();
        const north = bounds.getNorth();
        const south = bounds.getSouth();
        const east = bounds.getEast();
        const west = bounds.getWest();

        const cells = [];
        const minLat = Math.floor(south / GRID_SIZE) * GRID_SIZE;
        const maxLat = Math.ceil(north / GRID_SIZE) * GRID_SIZE;
        const minLng = Math.floor(west / GRID_SIZE) * GRID_SIZE;
        const maxLng = Math.ceil(east / GRID_SIZE) * GRID_SIZE;

        // Limit grid density to prevent performance issues
        const maxCells = 500;
        const latSteps = Math.ceil((maxLat - minLat) / GRID_SIZE);
        const lngSteps = Math.ceil((maxLng - minLng) / GRID_SIZE);

        if (latSteps * lngSteps > maxCells) {
            // Grid too dense, don't render
            return;
        }

        for (let lat = minLat; lat < maxLat; lat += GRID_SIZE) {
            for (let lng = minLng; lng < maxLng; lng += GRID_SIZE) {
                cells.push({ lat, lng });
            }
        }

        setVisibleGrid(cells);
    };

    // Update grid when map moves or zooms
    const mapEvents = useMapEvents({
        moveend: updateVisibleGrid,
        zoomend: updateVisibleGrid,
    });

    // Update grid when mode changes
    useEffect(() => {
        updateVisibleGrid();
    }, [mode]);

    const handleCellClick = (lat, lng) => {
        if (mode !== 'PIXEL') return;

        // Check if cell already has a pixel
        const existingPixel = pixels.find(
            p => Math.abs(p.lat - lat) < GRID_SIZE / 2 && Math.abs(p.lng - lng) < GRID_SIZE / 2
        );

        if (existingPixel) {
            // Allow recoloring of own pixels
            if (existingPixel.userId === currentUserId) {
                setSelectedCell({ lat, lng, existingPixelId: existingPixel.id });
                setTextInput(existingPixel.text || ''); // Pre-fill with existing text
                setShowColorPicker(true);
            }
        } else {
            setSelectedCell({ lat, lng });
            setTextInput(''); // Clear text for new pixel
            setShowColorPicker(true);
        }
    };

    const handleColorSelect = async (color) => {
        if (!selectedCell) return;

        const pixelData = {
            lat: selectedCell.lat,
            lng: selectedCell.lng,
            color,
            text: textInput.trim() || 'Untitled', // Include text, default to 'Untitled'
        };

        if (selectedCell.existingPixelId) {
            // Update existing pixel
            const updatedPixel = await api.updatePixel(selectedCell.existingPixelId, pixelData);
            setPixels(pixels.map(p => p.id === updatedPixel.id ? updatedPixel : p));
        } else {
            // Create new pixel
            const newPixel = await api.savePixel(pixelData);
            setPixels([...pixels, newPixel]);
        }

        setShowColorPicker(false);
        setSelectedCell(null);
        setTextInput(''); // Clear text input
    };

    const handleDelete = async (pixelId) => {
        try {
            await api.deletePixel(pixelId);
            setPixels(pixels.filter(p => p.id !== pixelId));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCancel = () => {
        setShowColorPicker(false);
        setSelectedCell(null);
        setTextInput(''); // Clear text input
    };

    const getColorHex = (color) => {
        switch (color) {
            case 'red': return '#ef4444';
            case 'green': return '#22c55e';
            case 'blue': return '#3b82f6';
            default: return '#3b82f6';
        }
    };

    // Only render when in PIXEL mode
    if (mode !== 'PIXEL') return null;

    return (
        <>
            {/* Grid overlay */}
            {visibleGrid.map((cell, idx) => {
                const bounds = [
                    [cell.lat, cell.lng],
                    [cell.lat + GRID_SIZE, cell.lng + GRID_SIZE]
                ];

                return (
                    <Rectangle
                        key={`grid-${idx}`}
                        bounds={bounds}
                        pathOptions={{
                            color: '#aaa',
                            weight: 1,
                            fillOpacity: 0,
                        }}
                        eventHandlers={{
                            click: () => handleCellClick(cell.lat, cell.lng)
                        }}
                    />
                );
            })}

            {/* Colored pixels */}
            {pixels.map((pixel) => {
                const bounds = [
                    [pixel.lat, pixel.lng],
                    [pixel.lat + GRID_SIZE, pixel.lng + GRID_SIZE]
                ];
                const isOwner = pixel.userId === currentUserId;
                const colorHex = getColorHex(pixel.color);

                return (
                    <Rectangle
                        key={pixel.id}
                        bounds={bounds}
                        pathOptions={{
                            color: colorHex,
                            weight: 2,
                            fillColor: colorHex,
                            fillOpacity: 0.6,
                        }}
                        eventHandlers={{
                            click: () => handleCellClick(pixel.lat, pixel.lng)
                        }}
                    >
                        {/* Display text label on all pixels */}
                        {pixel.text && (
                            <Tooltip
                                permanent
                                direction="center"
                                className="modern-tooltip"
                            >
                                <div
                                    className="hoodmaps-label"
                                    style={{
                                        fontSize: '11px',
                                        maxWidth: '60px',
                                    }}
                                >
                                    {pixel.text}
                                </div>
                            </Tooltip>
                        )}
                        {isOwner && (
                            <Popup>
                                <div>
                                    <p><strong>Your Pixel</strong></p>
                                    {pixel.text && (
                                        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                                            "{pixel.text}"
                                        </p>
                                    )}
                                    <p style={{
                                        color: colorHex,
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize',
                                        margin: '4px 0'
                                    }}>
                                        {pixel.color}
                                    </p>
                                    <small>{new Date(pixel.createdAt).toLocaleDateString()}</small>
                                    <div style={{ marginTop: '8px' }}>
                                        <button
                                            onClick={() => handleDelete(pixel.id)}
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
                                </div>
                            </Popup>
                        )}
                    </Rectangle>
                );
            })}

            {/* Color Picker Modal */}
            {showColorPicker && (
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
                    minWidth: '280px'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
                        {selectedCell?.existingPixelId ? 'Edit Pixel' : 'Create Pixel'}
                    </h3>

                    {/* Text Input Field */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            color: '#374151'
                        }}>
                            Label:
                        </label>
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="e.g., Tourist Trap, Best View, etc."
                            maxLength={50}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                    </div>

                    {/* Color Selection */}
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        fontSize: '0.9rem',
                        color: '#374151'
                    }}>
                        Color:
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        marginBottom: '16px'
                    }}>
                        {['red', 'green', 'blue'].map(color => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '8px',
                                    border: '2px solid #ddd',
                                    backgroundColor: getColorHex(color),
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    textTransform: 'capitalize'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                {color}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCancel}
                        style={{
                            width: '100%',
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
                </div>
            )}
        </>
    );
};

export default PixelInteraction;
