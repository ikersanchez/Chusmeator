import React from 'react';
import './Toolbar.css';
import HelpModal from './HelpModal';

const Toolbar = ({ mode, onModeChange }) => {
    const [showHelp, setShowHelp] = React.useState(false);

    const modes = [
        { id: 'VIEW', label: 'View', icon: '👁️', description: 'Navigate the map' },
        { id: 'PIN', label: 'Pin', icon: '📍', description: 'Click to add a pin' },
        { id: 'AREA', label: 'Area', icon: '🗺️', description: 'Draw an area on the map' },
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
                            <span className="toolbar-label">{m.label}</span>
                        </button>
                    ))}
                </div>
                <button
                    className="toolbar-help-btn"
                    onClick={() => setShowHelp(true)}
                    title="Help & Info"
                >
                    ?
                </button>
            </div>
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
};

export default Toolbar;
