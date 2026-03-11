import React, { useEffect, useState } from 'react';

const IntroScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out'
        }}>
            <div style={{
                fontSize: '5rem',
                marginBottom: '1.5rem',
                animation: 'float 3s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }}>
                🔍
            </div>
            <h1 style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                fontFamily: 'Inter, sans-serif'
            }}>
                Chusmeator
            </h1>
            <p style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.9)',
                marginTop: '0.5rem',
                fontWeight: '300'
            }}>
                Discover and share information on the map
            </p>
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                fontSize: '1rem',
                color: 'white',
                background: 'rgba(255, 60, 60, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 60, 60, 0.4)',
                textAlign: 'center',
                maxWidth: '80%'
            }}>
                ⚠️ Toxic comments, sensitive information, and personal data are strictly prohibited.
            </div>
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
        </div>
    );
};

export default IntroScreen;
