import React from 'react';

const LegalPage = ({ title, children, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100dvh',
            backgroundColor: '#0f172a',
            zIndex: 10000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
            }}>
                <h1 style={{
                    margin: 0,
                    fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    {title}
                </h1>
                <button
                    onClick={onClose}
                    aria-label="Cerrar"
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontSize: '1.1rem',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={e => {
                        e.target.style.background = 'rgba(255,255,255,0.15)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.25)';
                    }}
                    onMouseLeave={e => {
                        e.target.style.background = 'rgba(255,255,255,0.08)';
                        e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                    }}
                >
                    ✕ Cerrar
                </button>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                paddingBottom: '4rem',
            }}>
                <div style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    color: '#cbd5e1',
                    fontSize: 'clamp(0.88rem, 3.5vw, 0.95rem)',
                    lineHeight: 1.7,
                }}>
                    {children}
                </div>
            </div>

            <style>{`
                .legal-page h2 {
                    color: #e2e8f0;
                    font-size: clamp(1rem, 3.5vw, 1.15rem);
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .legal-page h3 {
                    color: #e2e8f0;
                    font-size: clamp(0.92rem, 3vw, 1rem);
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .legal-page p {
                    margin: 0.5rem 0;
                }
                .legal-page ul {
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .legal-page li {
                    margin: 0.3rem 0;
                }
                .legal-page a {
                    color: #60a5fa;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(96, 165, 250, 0.3);
                    transition: all 0.2s;
                }
                .legal-page a:hover {
                    color: #93bbfd;
                    border-bottom-color: rgba(96, 165, 250, 0.6);
                }
                .legal-page strong {
                    color: #e2e8f0;
                }
            `}</style>
        </div>
    );
};

export default LegalPage;
