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
                fontSize: 'clamp(3rem, 15vw, 5rem)',
                marginBottom: '1rem',
                animation: 'float 3s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }}>
                🔍
            </div>
            <h1 style={{
                fontSize: 'clamp(1.5rem, 8vw, 3rem)',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                fontFamily: 'Inter, sans-serif',
                margin: '0',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                Chusmeator
            </h1>
            <p style={{
                fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                color: 'rgba(255,255,255,0.9)',
                marginTop: '0.5rem',
                fontWeight: '300',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                Discover and share information on the map
            </p>
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
