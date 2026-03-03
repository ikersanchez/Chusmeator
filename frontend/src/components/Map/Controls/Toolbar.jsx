import React from 'react';
import './Toolbar.css';
import HelpModal from './HelpModal';

const Toolbar = ({ mode, onModeChange }) => {
    const [showHelp, setShowHelp] = React.useState(false);

    const modes = [
        { id: 'VIEW', label: '👁️ View', icon: '👁️', description: 'Navigate the map' },
        { id: 'PIN', label: '📍 Add Pin', icon: '📍', description: 'Click to add a pin' },
        { id: 'AREA', label: '🗺️ Draw Area', icon: '🗺️', description: 'Draw an area on the map' },

    ];

    return (
        <>
            <div className="toolbar">
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
                    {/* Help Button incorporated into the row */}
                    <button
                        className="toolbar-btn help-btn"
                        onClick={() => setShowHelp(true)}
                        title="Help & Info"
                    >
                        <span className="toolbar-icon">❓</span>
                        <span className="toolbar-label">Help</span>
                    </button>
                </div>
            </div>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
};

export default Toolbar;
