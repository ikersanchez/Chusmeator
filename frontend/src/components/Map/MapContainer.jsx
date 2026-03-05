import React, { useState } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Components
import SearchBox from '../Search/SearchBox';
import Toolbar from './Controls/Toolbar';

// Interactions
import PinInteraction from './Interactions/PinInteraction';
import AreaInteraction from './Interactions/AreaInteraction';


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


const ChusmeatorMap = () => {
    const center = [40.4168, -3.7038]; // Madrid default
    const [interactionMode, setInteractionMode] = useState('VIEW');

    return (
        <MapContainer
            center={center}
            zoom={13}
            zoomControl={false}
            style={{ height: '100dvh', width: '100%' }}
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

        </MapContainer>
    );
};

export default ChusmeatorMap;
