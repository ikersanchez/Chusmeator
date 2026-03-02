const API_BASE_URL = import.meta.env?.VITE_API_URL || '/api';

// Helper for API calls with session cookies
const apiFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (import.meta.env?.DEV) {
        console.log(`API [${options.method || 'GET'}] ${endpoint}`, options.body ? JSON.parse(options.body) : '');
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const msg = errorData.error || errorData.detail || `API error: ${response.status}`;
            console.error(`API Error: ${msg}`, errorData);
            // In a real app, we would push this to a notification state/context
            // For now, we'll just throw and let the component handle it or log it
            throw new Error(msg);
        }

        if (response.status === 204) return null;
        const data = await response.json();

        if (import.meta.env?.DEV) {
            console.log(`API Success [${endpoint}]`, data);
        }
        return data;
    } catch (error) {
        console.error(`Fetch error [${endpoint}]:`, error);
        throw error;
    }
};

export const api = {
    // Get current user ID
    getUserId: async () => {
        const data = await apiFetch('/user');
        return data.userId;
    },

    // Get all map data (pins, areas)
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


    // Search address through our backend proxy
    searchAddress: async (query) => {
        const results = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
        return results;
    },

    // Vote on a pin or area
    vote: async (targetType, targetId) => {
        return apiFetch('/votes', {
            method: 'POST',
            body: JSON.stringify({ targetType, targetId }),
        });
    },

    // Remove vote from a pin or area
    unvote: async (targetType, targetId) => {
        return apiFetch(`/votes/${targetType}/${targetId}`, {
            method: 'DELETE',
        });
    },

    // Get comments for a pin
    getPinComments: async (pinId) => {
        return apiFetch(`/pins/${pinId}/comments`);
    },

    // Add a comment to a pin
    addPinComment: async (pinId, text) => {
        return apiFetch(`/pins/${pinId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    },
};
