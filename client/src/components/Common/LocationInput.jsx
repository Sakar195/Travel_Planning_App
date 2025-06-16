import React, { useState, useEffect, useRef, useCallback } from 'react';
import Openrouteservice from 'openrouteservice-js';
import { MapPinIcon } from '@heroicons/react/24/outline';

// Initialize OpenRouteService Geocode - Ensure API key is in .env
const orsGeocode = new Openrouteservice.Geocode({
    api_key: import.meta.env.VITE_ORS_API_KEY,
});

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * LocationInput Component with Autocomplete
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input element ID
 * @param {string} props.name - Input element name
 * @param {string} props.label - Label for the input field
 * @param {string} props.placeholder - Placeholder text
 * @param {Function} props.onLocationSelect - Callback function when a location is selected. Passes an object { name: string, coordinates: [lng, lat] } or null if invalid.
 * @param {string} [props.initialValue=''] - Initial value for the input
 * @param {boolean} [props.required=false] - Whether the input is required
 * @returns {JSX.Element} LocationInput component
 */
const LocationInput = ({ 
    id, 
    name, 
    label, 
    placeholder, 
    onLocationSelect, 
    initialValue = '',
    required = false
}) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef(null); // Ref for handling outside clicks

    // Debounced fetch function
    const debouncedFetchSuggestions = useCallback(debounce(async (searchText) => {
        if (!searchText || searchText.length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }
        
        console.log(`[LocationInput ${id}] Fetching suggestions for:`, searchText);
        setIsLoading(true);
        setError(null);

        try {
            const response = await orsGeocode.geocode({ 
                text: searchText,
                boundary_country: ['NP'],
                layers: [
                    'address', 
                    'street',
                    'venue',
                    'neighbourhood',
                    'locality',
                ],
                size: 7
            });
            
            console.log(`[LocationInput ${id}] ORS Response:`, response);

            if (response.features && response.features.length > 0) {
                setSuggestions(response.features.map(feature => ({
                    name: feature.properties.label, // Use the formatted label
                    coordinates: feature.geometry.coordinates // [lng, lat]
                })));
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error(`[LocationInput ${id}] Error fetching ORS suggestions:`, err);
            setError('Failed to fetch suggestions. Check API key or network.');
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, 500), [id]);

    // Effect to fetch suggestions when query changes
    useEffect(() => {
        // Don't fetch if the query matches the currently selected location name
        if (query !== (selectedLocation?.name || '')) {
            debouncedFetchSuggestions(query);
        } else {
            setSuggestions([]); // Clear suggestions if query matches selected name
        }
    }, [query, selectedLocation, debouncedFetchSuggestions]);

    // Handle clicks outside the component to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsFocused(false);
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setSelectedLocation(null); // Clear selected location if user types again
        setError(null); // Clear error on new input
        // We don't call onLocationSelect(null) here, wait for selection or blur
    };

    const handleSuggestionClick = (suggestion) => {
        console.log(`[LocationInput ${id}] Suggestion selected:`, suggestion);
        setQuery(suggestion.name); // Update input field
        setSelectedLocation(suggestion); // Store selected data
        setSuggestions([]); // Hide suggestions
        setIsFocused(false);
        setError(null);
        onLocationSelect(suggestion); // Notify parent component
    };

    const handleBlur = () => {
        // Short delay to allow suggestion click to register first
        setTimeout(() => {
            if (!isFocused && !selectedLocation && query.length > 0) {
                // If user didn't select a suggestion and input is not empty, 
                // consider it potentially invalid or trigger a final validation.
                // For now, we assume invalid if no suggestion was clicked.
                console.warn(`[LocationInput ${id}] Input blurred without suggestion selection.`);
                //setError('Please select a valid location from the suggestions.'); 
                // onLocationSelect(null); // Notify parent of invalid state
            }
        }, 150); 
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <label htmlFor={id} className="block text-sm font-medium text-[var(--color-txt-secondary)] mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-[var(--color-txt-tertiary)]" />
                </div>
                <input
                    type="text"
                    id={id}
                    name={name}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200 placeholder:text-[var(--color-txt-tertiary)] ${
                        error ? 'border-red-500 ring-red-500' : 'border-[var(--color-border)]'
                    }`}
                    required={required}
                    autoComplete="off" // Prevent browser autocomplete
                />
                 {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="animate-spin h-4 w-4 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */} 
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-bg-light-hover)] cursor-pointer"
                            onMouseDown={(e) => { 
                                // Use onMouseDown to prevent blur before click registers
                                e.preventDefault(); 
                                handleSuggestionClick(suggestion);
                            }}
                        >
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}

            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
};

export default LocationInput; 