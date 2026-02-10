import React from 'react';
import './Toolbar.css';

const Toolbar = ({ mode, onModeChange }) => {
    const modes = [
        { id: 'VIEW', label: '👁️ View', icon: '👁️', description: 'Navigate the map' },
        { id: 'PIN', label: '📍 Add Pin', icon: '📍', description: 'Click to add a pin' },
        { id: 'AREA', label: '🗺️ Draw Area', icon: '🗺️', description: 'Draw an area on the map' },
        { id: 'PIXEL', label: '🎨 Pixel Mode', icon: '🎨', description: 'Color grid squares' },
    ];

    return (
        <div className="toolbar">
            <div className="toolbar-title">Mode</div>
            <div className="toolbar-buttons">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        className={`toolbar-btn ${mode === m.id ? 'active' : ''}`}
                        onClick={() => onModeChange(m.id)}
                        title={m.description}
                    >
                        <span className="toolbar-icon">{m.icon}</span>
                        <span className="toolbar-label">{m.label.replace(/[^a-zA-Z\s]/g, '')}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Toolbar;
