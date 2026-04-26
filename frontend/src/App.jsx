import React, { useState } from 'react';
import IntroScreen from './components/IntroScreen';
import ChusmeatorMap from './components/Map/MapContainer';
import CookieBanner from './components/Legal/CookieBanner';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import LegalNotice from './components/Legal/LegalNotice';
import LegalFooter from './components/Legal/LegalFooter';

import { api } from './api/apiService';

function App() {
  const [showMap, setShowMap] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(
    localStorage.getItem('chusmeator_cookie_consent') === 'accepted'
  );
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  const handleAcceptCookies = async () => {
    setCookiesAccepted(true);
    try {
        await api.initSession();
    } catch (error) {
        console.error('Failed to initialize session:', error);
    }
  };

  return (
    <div className="App">
      <IntroScreen onComplete={() => setShowMap(true)} />

      {showMap && <ChusmeatorMap cookiesAccepted={cookiesAccepted} />}

      {/* Cookie consent banner — shown after intro */}
      {showMap && (
        <CookieBanner
          onAccept={handleAcceptCookies}
          onShowPrivacy={() => setShowPrivacy(true)}
        />
      )}

      {/* Persistent legal footer on the map */}
      {showMap && (
        <LegalFooter
          onShowPrivacy={() => setShowPrivacy(true)}
          onShowLegal={() => setShowLegal(true)}
        />
      )}

      {/* Legal page overlays */}
      {showPrivacy && (
        <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
      )}
      {showLegal && (
        <LegalNotice onClose={() => setShowLegal(false)} />
      )}
    </div>
  );
}

export default App;
