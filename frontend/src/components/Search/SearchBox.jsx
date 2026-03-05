import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { api } from '../../api/apiService';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchBox.css';

const SearchBox = () => {
    const map = useMap();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [error, setError] = useState(null);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedQuery.length > 2) {
                setIsSearching(true);
                setError(null);
                try {
                    const results = await api.searchAddress(debouncedQuery);
                    setSuggestions(results);
                    setShowSuggestions(true);
                } catch (err) {
                    console.error("Search error:", err);
                    setError(err.message || "Search unavailable. Please try again later.");
                    setShowSuggestions(true);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
                setError(null);
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
        setError(null);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        if (suggestions.length > 0) {
            handleSelect(suggestions[0]);
        } else {
            setIsSearching(true);
            setError(null);
            try {
                const locations = await api.searchAddress(query);
                if (locations.length > 0) {
                    handleSelect(locations[0]);
                } else {
                    setError("No results found.");
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error(err);
                setError(err.message || "Search unavailable. Please try again later.");
                setShowSuggestions(true);
            } finally {
                setIsSearching(false);
            }
        }
    };

    return (
        <div className="search-box-container">
            <div className="search-input-wrapper">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (suggestions.length > 0 || error) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Search..."
                        className="search-input"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="search-btn"
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </form>
            </div>

            {showSuggestions && (
                <div className="search-suggestions">
                    {error ? (
                        <div className="suggestion-item error-msg" style={{ color: 'red', fontStyle: 'italic' }}>
                            {error}
                        </div>
                    ) : (
                        suggestions.map((result, index) => (
                            <div
                                key={index}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(result);
                                }}
                                className="suggestion-item"
                            >
                                {result.display_name}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBox;
