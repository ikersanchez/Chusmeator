import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../../api/apiService';

// Controls
import Toolbar from './Controls/Toolbar';

// Interactions
import PinInteraction from './Interactions/PinInteraction';
import AreaInteraction from './Interactions/AreaInteraction';
import PixelInteraction from './Interactions/PixelInteraction';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Search Component
const SearchBox = () => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounce function
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                setIsSearching(true);
                try {
                    const results = await api.searchAddress(query);
                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (err) {
                    console.error("Search error:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result) => {
        const { lat, lon, display_name } = result;
        map.flyTo([lat, lon], 16);
        setQuery(display_name); // Optional: keep technical name or clear? Keeping name is better UX
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        // Immediate search (if user presses Enter)
        if (suggestions.length > 0) {
            handleSelect(suggestions[0]);
        } else {
            // Fallback if no suggestions yet
            setIsSearching(true);
            try {
                const locations = await api.searchAddress(query);
                if (locations.length > 0) {
                    handleSelect(locations[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearching(false);
            }
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '50px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
            <div style={{
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                gap: '8px'
            }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        // Delay blurring to allow click on suggestion
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search for an address..."
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            width: '250px'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </form>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    width: '100%',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 2000
                }}>
                    {suggestions.map((result, index) => (
                        <div
                            key={index}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur so click registers consistently
                                handleSelect(result);
                            }}
                            style={{
                                padding: '10px',
                                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: 'var(--text)',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                            {result.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ChusmeatorMap = () => {
    const center = [40.4168, -3.7038]; // Madrid default
    const [interactionMode, setInteractionMode] = useState('VIEW');

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100vh', width: '100%' }}
            className={`map-mode-${interactionMode.toLowerCase()}`}
        >
            <LayersControl position="topleft">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite (Esri)">
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            <SearchBox />
            <Toolbar mode={interactionMode} onModeChange={setInteractionMode} />

            <PinInteraction mode={interactionMode} />
            <AreaInteraction mode={interactionMode} />
            <PixelInteraction mode={interactionMode} />
        </MapContainer>
    );
};

export default ChusmeatorMap;
