import React from 'react';
import './Toolbar.css';
import HelpModal from './HelpModal';

const Toolbar = ({ mode, onModeChange }) => {
    const [showHelp, setShowHelp] = React.useState(false);

    const modes = [
        { id: 'VIEW', label: '👁️ View', icon: '👁️', description: 'Navigate the map' },
        { id: 'PIN', label: '📍 Add Pin', icon: '📍', description: 'Click to add a pin' },
        { id: 'AREA', label: '🗺️ Draw Area', icon: '🗺️', description: 'Draw an area on the map' },
        { id: 'PIXEL', label: '🎨 Pixel Mode', icon: '🎨', description: 'Color grid squares' },
    ];

    return (
        <>
            <div className="toolbar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="toolbar-title" style={{ margin: 0 }}>Mode</div>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            padding: '4px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                        }}
                        title="Help & Info"
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        ?
                    </button>
                </div>
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
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        </>
    );
};

export default Toolbar;
