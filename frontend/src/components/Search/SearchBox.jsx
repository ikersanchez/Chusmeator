import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { api } from '../../api/apiService';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBox = () => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedQuery.length > 2) {
                setIsSearching(true);
                try {
                    const results = await api.searchAddress(debouncedQuery);
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
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    const handleSelect = (result) => {
        const { lat, lon, display_name } = result;
        map.flyTo([lat, lon], 16);
        setQuery(display_name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        if (suggestions.length > 0) {
            handleSelect(suggestions[0]);
        } else {
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
        <div className="search-box-container" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: 'auto',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxWidth: 'calc(100vw - 80px)'
        }}>
            <div className="search-input-wrapper" style={{
                background: 'white',
                padding: '8px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                gap: '8px',
                width: '100%'
            }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search..."
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            flex: 1,
                            minWidth: '0'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        style={{
                            padding: '8px 12px',
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </form>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions" style={{
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
                                e.preventDefault();
                                handleSelect(result);
                            }}
                            className="suggestion-item"
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

export default SearchBox;
