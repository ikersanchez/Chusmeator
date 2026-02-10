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
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        setIsSearching(true);
        try {
            const locations = await api.searchAddress(query);
            if (locations.length > 0) {
                const { lat, lon } = locations[0];
                map.flyTo([lat, lon], 16);
                setQuery('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '10px',
            left: '50px',
            zIndex: 1000,
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            gap: '8px'
        }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for an address..."
                style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '200px'
                }}
            />
            <button
                onClick={handleSearch}
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
        </div>
    );
};

const ChusmeatorMap = () => {
    const center = [40.4168, -3.7038]; // Madrid default
    const [interactionMode, setInteractionMode] = useState('VIEW');

    return (
        <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100%' }}>
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
