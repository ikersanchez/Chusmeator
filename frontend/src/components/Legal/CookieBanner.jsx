import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'chusmeator_cookie_consent';

const CookieBanner = ({ onAccept, onShowPrivacy }) => {
    const [visible, setVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            setVisible(true);
            // Delay animation for smooth entrance
            setTimeout(() => setAnimateIn(true), 100);
        } else if (consent === 'accepted') {
            // Already consented
            onAccept?.();
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setAnimateIn(false);
        setTimeout(() => {
            setVisible(false);
            onAccept?.();
        }, 300);
    };

    const handleReject = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
        setAnimateIn(false);
        setTimeout(() => {
            setVisible(false);
        }, 300);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9998,
            display: 'flex',
            justifyContent: 'center',
            padding: '1rem',
            pointerEvents: 'none',
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            <div style={{
                pointerEvents: 'all',
                maxWidth: '640px',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
                padding: 'clamp(1rem, 4vw, 1.5rem)',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
                {/* Icon + Title */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                }}>
                    <span style={{ fontSize: '1.3rem' }}>🍪</span>
                    <span style={{
                        color: '#e2e8f0',
                        fontSize: 'clamp(0.95rem, 3.5vw, 1.05rem)',
                        fontWeight: 700,
                    }}>
                        Uso de Cookies
                    </span>
                </div>

                {/* Description */}
                <p style={{
                    color: '#94a3b8',
                    fontSize: 'clamp(0.8rem, 3vw, 0.88rem)',
                    lineHeight: 1.6,
                    margin: '0 0 1rem 0',
                }}>
                    Chusmeator utiliza una <strong style={{color: '#cbd5e1'}}>cookie de sesión técnica</strong> para
                    identificar tu actividad en la plataforma. No recopilamos datos personales directos.
                    Si rechazas las cookies, podrás navegar el mapa pero no crear contenido.{' '}
                    <button
                        onClick={onShowPrivacy}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#60a5fa',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: 'inherit',
                            fontFamily: 'inherit',
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                        }}
                    >
                        Más información
                    </button>
                </p>

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                }}>
                    <button
                        onClick={handleAccept}
                        style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.7rem 1.25rem',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: 'clamp(0.85rem, 3vw, 0.92rem)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                        }}
                        onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                        }}
                    >
                        Aceptar cookies
                    </button>
                    <button
                        onClick={handleReject}
                        style={{
                            flex: 1,
                            minWidth: '120px',
                            padding: '0.7rem 1.25rem',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#94a3b8',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            fontSize: 'clamp(0.85rem, 3vw, 0.92rem)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.target.style.background = 'rgba(255,255,255,0.1)';
                            e.target.style.color = '#cbd5e1';
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'rgba(255,255,255,0.06)';
                            e.target.style.color = '#94a3b8';
                        }}
                    >
                        Rechazar
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Check if the user has accepted cookies.
 * @returns {boolean}
 */
export const hasCookieConsent = () => {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
};

export default CookieBanner;
