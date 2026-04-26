import React from 'react';

const LegalFooter = ({ onShowPrivacy, onShowLegal }) => {
    const linkStyle = {
        color: 'rgba(100, 116, 139, 0.7)',
        fontSize: '0.7rem',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
        background: 'none',
        border: 'none',
        fontFamily: 'inherit',
        padding: 0,
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '3px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(0,0,0,0.06)',
        }}>
            <button
                onClick={onShowPrivacy}
                style={linkStyle}
                onMouseEnter={e => e.target.style.color = '#3b82f6'}
                onMouseLeave={e => e.target.style.color = 'rgba(100, 116, 139, 0.7)'}
            >
                Privacidad
            </button>
            <span style={{ color: 'rgba(100,116,139,0.4)', fontSize: '0.65rem' }}>|</span>
            <button
                onClick={onShowLegal}
                style={linkStyle}
                onMouseEnter={e => e.target.style.color = '#3b82f6'}
                onMouseLeave={e => e.target.style.color = 'rgba(100, 116, 139, 0.7)'}
            >
                Aviso Legal
            </button>
        </div>
    );
};

export default LegalFooter;
