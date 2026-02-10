const API_BASE_URL = '/api';
const USER_ID_KEY = 'chusmeator_user_id';

// Helper to get or generate user ID
const getUserId = () => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
        // Generate a simple random ID
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
};

// Helper for API calls with X-User-Id header
const apiFetch = async (endpoint, options = {}) => {
    const userId = getUserId();
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        ...(options.headers || {}),
    };

    console.log(`API [${options.method || 'GET'}] ${endpoint}`, options.body ? JSON.parse(options.body) : '');

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.error || `API error: ${response.status}`;
            console.error(`API Error: ${msg}`, errorData);
            alert(msg);
            throw new Error(msg);
        }

        if (response.status === 204) return null;
        const data = await response.json();
        console.log(`API Success [${endpoint}]`, data);
        return data;
    } catch (error) {
        console.error(`Fetch error [${endpoint}]:`, error);
        if (!error.message.includes('API error')) {
            alert(`Connection error: ${error.message}`);
        }
        throw error;
    }
};

export const api = {
    // Get current user ID
    getUserId: () => {
        return getUserId();
    },

    // Get all map data (pins, areas, pixels)
    getMapData: async () => {
        return apiFetch('/map-data');
    },

    // Save a new pin
    savePin: async (pin) => {
        return apiFetch('/pins', {
            method: 'POST',
            body: JSON.stringify(pin),
        });
    },

    // Delete a pin
    deletePin: async (pinId) => {
        return apiFetch(`/pins/${pinId}`, {
            method: 'DELETE',
        });
    },

    // Save a new area
    saveArea: async (area) => {
        return apiFetch('/areas', {
            method: 'POST',
            body: JSON.stringify(area),
        });
    },

    // Delete an area
    deleteArea: async (areaId) => {
        return apiFetch(`/areas/${areaId}`, {
            method: 'DELETE',
        });
    },

    // Get all pixels
    getPixels: async () => {
        return apiFetch('/pixels');
    },

    // Save a new pixel
    savePixel: async (pixel) => {
        return apiFetch('/pixels', {
            method: 'POST',
            body: JSON.stringify(pixel),
        });
    },

    // Update an existing pixel
    updatePixel: async (pixelId, updates) => {
        return apiFetch(`/pixels/${pixelId}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },

    // Delete a pixel
    deletePixel: async (pixelId) => {
        return apiFetch(`/pixels/${pixelId}`, {
            method: 'DELETE',
        });
    },

    // Search address through our backend proxy
    searchAddress: async (query) => {
        const results = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
        return results;
    },
};
