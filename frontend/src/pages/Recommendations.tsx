import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { TMDBItem } from '../types/tmdb'

const Recommendations = () => {
    const navigate = useNavigate()
    const [recommendations, setRecommendations] = useState<TMDBItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGenre, setSelectedGenre] = useState('all')
    const [selectedYear, setSelectedYear] = useState('all')

    const genres = [
        { id: 'all', name: 'All Genres' },
        { id: '28', name: 'Action' },
        { id: '12', name: 'Adventure' },
        { id: '16', name: 'Animation' },
        { id: '35', name: 'Comedy' },
        { id: '80', name: 'Crime' },
        { id: '18', name: 'Drama' },
        { id: '14', name: 'Fantasy' },
        { id: '27', name: 'Horror' },
        { id: '10749', name: 'Romance' },
        { id: '878', name: 'Science Fiction' },
        { id: '53', name: 'Thriller' },
    ]

    const years = [
        'all', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'
    ]

    const fetchRecommendations = useCallback(async () => {
        setLoading(true)
        try {
            const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
            
            if (!apiKey) {
                console.error("No TMDB API key found. Please set VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file");
                setLoading(false);
                return;
            }

            let endpoint = 'discover/movie?sort_by=popularity.desc&include_adult=false&language=en-US&page=1'
            
            if (selectedGenre !== 'all') {
                endpoint += `&with_genres=${selectedGenre}`
            }
            
            if (selectedYear !== 'all') {
                endpoint += `&primary_release_year=${selectedYear}`
            }

            const url = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
                ? `https://api.themoviedb.org/3/${endpoint}`
                : `https://api.themoviedb.org/3/${endpoint}&api_key=${apiKey}`;

            const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
                ? {
                    Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
                    accept: "application/json",
                }
                : {
                    accept: "application/json",
                };

            const res = await fetch(url, { headers })
            const data = await res.json()
            setRecommendations(data.results || [])
        } catch (error) {
            console.error("Error fetching recommendations:", error)
        } finally {
            setLoading(false)
        }
    }, [selectedGenre, selectedYear])

    useEffect(() => {
        fetchRecommendations()
    }, [fetchRecommendations])

    return (
        <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
            <div className="pt-24 px-4 w-full">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        AI Recommendations
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Discover your next favorite movie or TV show with our intelligent recommendation engine
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-purple-500/20"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Genre Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-3 text-purple-300">Genre</label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors duration-300"
                            >
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold mb-3 text-purple-300">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors duration-300"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year === 'all' ? 'All Years' : year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <div className="flex items-end">
                            <button
                                onClick={fetchRecommendations}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:scale-105 transition-transform duration-300 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <p className="mt-4 text-lg text-gray-300">Finding perfect recommendations for you...</p>
                    </div>
                )}

                {/* Recommendations Grid */}
                {!loading && (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {recommendations.map((movie, index) => {
                            const title = movie.title || movie.name
                            const year = movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0] || "N/A"
                            const posterUrl = movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : "/placeholder.jpg"
                            const rating = movie.vote_average || 0

    return (
                                <motion.div
                                    key={movie.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    onClick={() => navigate(`/${movie.media_type || "movie"}/${movie.id}`)}
                                    className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 transform hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
                                >
                                    {/* Poster Image */}
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={posterUrl}
                                            alt={title || "Untitled"}
                                            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Rating Badge */}
                                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                            <span className="text-yellow-400 text-sm">⭐</span>
                                            <span className="text-white text-sm font-semibold">{rating.toFixed(1)}</span>
                                        </div>

                                        {/* Recommendation Badge */}
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-sm rounded-full px-3 py-1">
                                            <span className="text-white text-xs font-semibold">RECOMMENDED</span>
                                        </div>

                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                                            {title}
                                        </h3>
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>{year}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">⭐</span>
                                                <span>{rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Effect Border */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-colors duration-300"></div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && recommendations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300">No Recommendations Found</h2>
                        <p className="text-gray-400 text-center max-w-md mb-8">
                            Try adjusting your filters to discover more amazing content.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedGenre('all')
                                setSelectedYear('all')
                            }}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold hover:scale-105 transition-transform duration-300"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Recommendations;