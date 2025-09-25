

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import MovieSection from "../components/MovieSection";
import FeaturedMovieGrid from "../components/FeaturedMovieGrid";
import Logo from "../components/Logo";
// import type { TMDBItem } from "../types/tmdb"

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  vote_average?: number;
  media_type?: "movie" | "tv";
}


const Home: React.FC = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [showImageBackground, setShowImageBackground] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const fetchFromTMDB = async (endpoint: string, setter: React.Dispatch<React.SetStateAction<Movie[]>>) => {
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
      
      console.log("API Key present:", !!apiKey);
      console.log("Fetching endpoint:", endpoint);
      
      if (!apiKey) {
        console.error("No TMDB API key found. Please set VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file");
        return;
      }

      const url = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
        ? `https://api.themoviedb.org/3/${endpoint}`
        : `https://api.themoviedb.org/3/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}`;

      const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
        ? {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
          accept: "application/json",
          }
        : {
            accept: "application/json",
          };

      console.log("Fetching URL:", url);
      const res = await fetch(url, { headers });
      console.log("Response status:", res.status);
      
      const data = await res.json();
      console.log("Response data:", data);
      
      if (data.results) {
        setter(data.results);
        console.log(`Successfully loaded ${data.results.length} items for ${endpoint}`);
      } else {
        console.error("No results in response:", data);
        setter([]);
      }
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  useEffect(() => {
    // Add a small delay to show loading state
    const timer = setTimeout(async () => {
      await Promise.all([
        fetchFromTMDB("trending/all/week?language=en-US", setTrending),
        fetchFromTMDB("movie/top_rated?language=en-US&page=1", setTopRated),
        fetchFromTMDB("discover/movie?primary_release_date.gte=2025-04-01&primary_release_date.lte=2025-09-01", setNewReleases),
        fetchFromTMDB("movie/upcoming?language=en-US&page=1", setComingSoon),
        fetchFromTMDB("tv/popular?language=en-US&page=1", setRecommended)
      ]);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

const fetchHeroImage = async () => {
  try {
    const apiKey =
      import.meta.env.VITE_TMDB_API_KEY ||
      import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;

    if (!apiKey) {
      setImageError(true);
      return;
    }

    const movieUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN
      ? `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

    const headers: Record<string, string> = import.meta.env
      .VITE_TMDB_READ_ACCESS_TOKEN
      ? {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
          accept: "application/json",
        }
      : { accept: "application/json" };

    const movieRes = await fetch(movieUrl, { headers });
    const movieData = await movieRes.json();

    if (movieData.results && movieData.results.length > 0) {
      const featuredMovie = movieData.results[0];
      const imageUrl = `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`;
      setHeroImage(imageUrl);
    } else {
      setImageError(true);
    }
  } catch (error) {
    console.error("Error fetching hero image:", error);
    setImageError(true);
  } finally {
    setImageLoading(false);
  }
};

useEffect(() => {
  fetchHeroImage();
}, []);


  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Hero Section - Full Width */}
      <div className="relative w-full overflow-hidden h-[75vh]">
        {/* Image Background */}
        {heroImage && !imageError && showImageBackground && (
          <div className="absolute inset-0 bg-cover bg-center"
            style={{backgroundImage: `url(${heroImage})`}}>
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
        )}

        {/* Image Loading State */}
        {imageLoading && showImageBackground && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              </div>
              <p className="text-lg text-gray-300">Loading background image...</p>
            </div>
          </div>
        )}

        {/* Image Error Fallback */}
        {imageError && showImageBackground && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              
            </div>
          </div>
        )}
        
        {/* Background Image Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        {/* Image Controls */}
        {heroImage && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setShowImageBackground(!showImageBackground)}
              className="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors duration-300 flex items-center gap-2"
            >
              {showImageBackground ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  Image
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Gradient
                </>
              )}
            </button>
          </div>
        )}

        <div className="relative w-full px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center w-full">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <Logo size="xl" showText={false} className="justify-center" />
          </motion.div>

        <motion.h1
            className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
        >
            MovieMate
        </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-4 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Your Ultimate Movie Discovery Platform
          </motion.p>

        <motion.div
            className="text-lg text-gray-400 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
        >
          <Typewriter
            options={{
              strings: [
                  "Discover your next favorite movie 🎭",
                  "Get AI-powered recommendations 🤖",
                  "Explore trending series and films 📺",
                  "Find hidden gems and classics 💎",
              ],
              autoStart: true,
              loop: true,
                delay: 50,
                deleteSpeed: 30,
            }}
          />
        </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <button
              onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25"
            >
              <span className="flex items-center gap-2 text-lg font-semibold">
                Explore Movies
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </button>
            <button
              onClick={() => navigate("/recommendations")}
              className="group px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-pink-500/25"
            >
              <span className="flex items-center gap-2 text-lg font-semibold">
                ⭐ Get Recommendations
                <motion.span
                  className="inline-block"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </span>
            </button>
            
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">10M+</div>
              <div className="text-gray-400">Movies & Shows</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">50M+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">99.9%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="w-full py-20 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="mt-4 text-lg text-gray-300">Loading amazing content...</p>
        </div>
      )}

      {/* Main Content - Full Width */}
      <div className="w-full">
        {/* Top 10 on IMDb This Week */}
        <div className="w-full py-16 bg-gradient-to-r from-gray-900/50 to-purple-900/30">
          <div className="w-full px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                🏆 Top 10 on MovieMate This Week
              </h2>
              <button 
                className="text-purple-300 hover:text-purple-200 transition-colors duration-300"
                onClick={() => navigate('/search?q=trending')}
                title="View all trending"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {trending.slice(0, 10).map((movie, index) => {
                const displayTitle = movie.title || movie.name;
                const posterUrl = movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/placeholder.jpg";
                const rating = movie.vote_average || 0;

                return (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group cursor-pointer"
                    onClick={() => navigate(`/${movie.media_type || "movie"}/${movie.id}`)}
                  >
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-black font-bold text-sm z-10">
                        {index + 1}
                      </div>
                      <img
                        src={posterUrl}
                        alt={displayTitle || "Untitled"}
                        className="w-full h-64 object-cover rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-bold text-sm line-clamp-2">{displayTitle}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400 text-xs">⭐</span>
                          <span className="text-xs">{rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Featured Today */}
        <div className="w-full py-16">
          <div className="w-full px-4">
            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ✨ Featured Today
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div 
                  className="relative group cursor-pointer rounded-2xl overflow-hidden"
                  onClick={() => navigate(`/${trending[0]?.media_type || "movie"}/${trending[0]?.id}`)}
                >
                  <img
                    src={trending[0]?.poster_path ? `https://image.tmdb.org/t/p/original${trending[0]?.poster_path}` : "/placeholder.jpg"}
                    alt={trending[0]?.title || "Featured Movie"}
                    className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-3xl font-bold mb-2">{trending[0]?.title || "Featured Movie"}</h3>
                    <p className="text-gray-300 mb-4">{trending[0]?.overview?.substring(0, 150)}...</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold">{trending[0]?.vote_average?.toFixed(1)}</span>
                      </div>
                      <button 
                        className="px-6 py-2 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition-colors duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/${trending[0]?.media_type || "movie"}/${trending[0]?.id}`);
                        }}
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {trending.slice(1, 4).map((movie) => {
                  const displayTitle = movie.title || movie.name;
                  const posterUrl = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/placeholder.jpg";

                  return (
                    <div key={movie.id} className="flex gap-4 group cursor-pointer" onClick={() => navigate(`/${movie.media_type || "movie"}/${movie.id}`)}>
                      <img
                        src={posterUrl}
                        alt={displayTitle || "Untitled"}
                        className="w-20 h-28 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">{displayTitle}</h4>
                        <p className="text-gray-400 text-xs mt-1">{movie.release_date?.split("-")[0] || movie.first_air_date?.split("-")[0]}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow-400 text-xs">⭐</span>
                          <span className="text-xs">{movie.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular Celebrities */}
        <div className="w-full py-16 bg-gradient-to-r from-gray-900/50 to-purple-900/30">
          <div className="w-full px-4">
            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              🌟 Most Popular Celebrities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }, (_, i) => (
                <div 
                  key={i} 
                  className="text-center group cursor-pointer"
                  onClick={() => navigate(`/person/${i + 1}`)}
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-purple-300 transition-colors duration-300">Celebrity {i + 1}</h3>
                  <p className="text-gray-400 text-xs">Actor/Actress</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Up Next */}
        <div className="w-full py-16">
          <div className="w-full px-4">
            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ⏭️ Up Next
            </h2>
            <MovieSection title="" movies={comingSoon} />
          </div>
        </div>

        {/* Fan Favorites */}
        <div className="w-full py-16 bg-gradient-to-r from-gray-900/50 to-purple-900/30">
          <div className="w-full px-4">
            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              ❤️ Fan Favorites
            </h2>
            <MovieSection title="" movies={topRated} />
          </div>
        </div>

        {/* Popular Movies */}
        <FeaturedMovieGrid 
          title="🎯 Popular Movies" 
          movies={trending} 
          maxItems={10} 
        />

        {/* New Releases */}
        <div className="w-full bg-gradient-to-r from-gray-900/50 to-purple-900/30">
          <FeaturedMovieGrid 
            title="🆕 New Releases" 
            movies={newReleases} 
            maxItems={8} 
          />
        </div>

        {/* Coming Soon */}
        <FeaturedMovieGrid 
          title="🎥 Coming Soon" 
          movies={comingSoon} 
          maxItems={8} 
        />

        {/* Additional Movie Sections */}
        <div className="w-full">
          <MovieSection title="🔥 Trending Now" movies={trending} />
          <MovieSection title="⭐ Top Rated" movies={topRated} />
          <MovieSection title="📺 Recommended TV Shows" movies={recommended} />
        </div>
      </div>
    </div>
  );
};

export default Home;
