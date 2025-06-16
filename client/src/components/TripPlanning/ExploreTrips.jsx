import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicTrips } from '../../services/tripService';
import LoadingSpinner from '../Common/LoadingSpinner';
import Card from '../Common/Card';
import Badge from '../Common/Badge';
import { MapPinIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/20/solid'; // Using solid icons

const ExploreTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Add pagination state if needed later
    // const [page, setPage] = useState(1);
    // const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const loadTrips = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedTrips = await getPublicTrips(); // Use the new service function
                setTrips(fetchedTrips);
                // Set pagination state based on response if implementing pagination
                // setHasMore(fetchedTrips.length > 0); // Simple check, needs refinement
            } catch (err) {
                setError(err.message || 'Failed to load trips. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadTrips();
    }, []); // Add page to dependency array if implementing pagination

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 px-4">
                <p className="text-red-600 bg-red-100 p-4 rounded-lg">Error: {error}</p>
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="text-center py-10 px-4">
                <p className="text-gray-500">No public trips found.</p>
                <p className="text-sm text-gray-400 mt-2">Check back later or create your own public trip!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {trips.map((trip) => (
                <Link to={`/trips/${trip._id || trip.rideId}`} key={trip._id || trip.rideId}>
                    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                        {/* Image */}                        
                        <div className="aspect-video overflow-hidden">
                             <img
                                src={trip.images?.[0] || '/placeholder-image.webp'} // Use first image or placeholder
                                alt={trip.title}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.webp'; }} // Handle image loading errors
                            />
                         </div>

                        {/* Content */}                        
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold text-[var(--color-txt-primary)] mb-2 truncate" title={trip.title}>{trip.title}</h3>
                            <p className="text-sm text-[var(--color-txt-secondary)] mb-3 line-clamp-2">
                                {trip.description}
                            </p>

                            <div className="mt-auto space-y-2 text-sm text-[var(--color-txt-tertiary)]">
                                <div className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1.5 text-[var(--color-primary)]" />
                                    <span>{trip.location || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center">
                                    <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-[var(--color-primary)]" />
                                    <span>{trip.durationDays ? `${trip.durationDays} Day${trip.durationDays !== 1 ? 's' : ''}` : 'Duration not set'}</span>
                                </div>
                                {trip.tags && trip.tags.length > 0 && (
                                    <div className="flex items-center flex-wrap gap-1 pt-1">
                                        <TagIcon className="h-4 w-4 mr-1 text-[var(--color-primary)] flex-shrink-0" />
                                        {trip.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="neutral" size="small">{tag}</Badge>
                                        ))}
                                        {trip.tags.length > 3 && (
                                            <Badge variant="neutral" size="small">+{trip.tags.length - 3} more</Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
             {/* Add pagination controls here if needed */}
        </div>
    );
};

export default ExploreTrips; 