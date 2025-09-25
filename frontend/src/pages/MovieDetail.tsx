import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { TMDBItem, TMDBVideo } from "../types/tmdb";
import TrailerModal from "../components/TrailerModal";
import { useAuth } from "../contexts/AuthContext";

function MovieDetails() {
  const { id, media_type } = useParams<{ id: string; media_type: "movie" | "tv" }>();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [movie, setMovie] = useState<TMDBItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState<TMDBVideo | null>(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [isVideoBackground, setIsVideoBackground] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
        
        console.log("Movie Detail Debug:", { id, media_type, apiKey: !!apiKey });
        
        if (!apiKey) {
          console.error("No TMDB API key found. Please set VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file");
          setLoading(false);
          return;
        }

        if (!id) {
          console.error("No movie ID provided");
          setLoading(false);
          return;
        }

        // Default to movie if media_type is not provided
        const type = media_type || 'movie';
        
        const url = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
          ? `https://api.themoviedb.org/3/${type}/${id}?append_to_response=credits,videos`
          : `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=credits,videos`;

        const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
          ? {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
              accept: "application/json",
            }
          : {
              accept: "application/json",
            };

        console.log("Fetching movie details for:", { id, type, url });
        const res = await fetch(url, { headers });
        console.log("Movie detail response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Movie detail data:", data);
        
        if (data.id) {
          setMovie(data);
          
          // Set up background images
          const bgImages = [];
          if (data.backdrop_path) {
            bgImages.push(`https://image.tmdb.org/t/p/original${data.backdrop_path}`);
          }
          if (data.poster_path) {
            bgImages.push(`https://image.tmdb.org/t/p/original${data.poster_path}`);
          }
          setBackgroundImages(bgImages);
          setBackgroundLoading(false);
          
          // Find the best trailer from videos
          if (data.videos && data.videos.results) {
            const trailers = data.videos.results.filter(
              (video: TMDBVideo) => 
                video.type === 'Trailer' && 
                video.site === 'YouTube' && 
                video.official
            );
            
            if (trailers.length > 0) {
              // Prefer official trailers, then any trailer
              setTrailer(trailers[0]);
            } else {
              // Fallback to any YouTube video
              const youtubeVideos = data.videos.results.filter(
                (video: TMDBVideo) => video.site === 'YouTube'
              );
              if (youtubeVideos.length > 0) {
                setTrailer(youtubeVideos[0]);
              }
            }
          }
        } else {
          console.error("Invalid movie data received:", data);
          // Try to fetch as movie if it failed as TV show
          if (type === 'tv') {
            console.log("Retrying as movie...");
            const movieUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
              ? `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits`
              : `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`;
            
            const movieRes = await fetch(movieUrl, { headers });
            if (movieRes.ok) {
              const movieData = await movieRes.json();
              if (movieData.id) {
                setMovie(movieData);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMovie();
  }, [id, media_type]);

  const toggleWatchlist = async () => {
    if (!movie || watchlistLoading || !isAuthenticated || !token) {
      if (!isAuthenticated) {
        navigate('/auth');
      }
      return;
    }
    
    setWatchlistLoading(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: isInWatchlist ? 'DELETE' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          movie_id: movie.id,
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsInWatchlist(!isInWatchlist);
        console.log(data.message || (isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist'));
      } else {
        const errorData = await res.json();
        console.error('Watchlist operation failed:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const fetchAdditionalImages = useCallback(async () => {
    if (!id || !movie) return;
    
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
      const type = media_type || 'movie';
      
      const imagesUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
        ? `https://api.themoviedb.org/3/${type}/${id}/images`
        : `https://api.themoviedb.org/3/${type}/${id}/images?api_key=${apiKey}`;

      const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
        ? {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
            accept: "application/json",
          }
        : {
            accept: "application/json",
          };

      const res = await fetch(imagesUrl, { headers });
      const data = await res.json();
      
      if (data.backdrops && data.backdrops.length > 0) {
        const additionalImages = data.backdrops
          .slice(0, 5) // Get top 5 backdrop images
          .map((backdrop: { file_path: string }) => `https://image.tmdb.org/t/p/original${backdrop.file_path}`);
        
        setBackgroundImages(prev => [...prev, ...additionalImages]);
      }
    } catch (error) {
      console.error("Error fetching additional images:", error);
    }
  }, [id, movie, media_type]);

  // Background transition effect
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 5000); // Change background every 5 seconds

      return () => clearInterval(interval);
    }
  }, [backgroundImages]);

  // Fetch additional images when movie loads
  useEffect(() => {
    if (movie) {
      fetchAdditionalImages();
    }
  }, [movie, fetchAdditionalImages]);

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-lg text-gray-300">Loading movie details...</p>
        </div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-4 text-red-400">Movie not found</h2>
          <p className="text-gray-300 mb-6">The movie you're looking for doesn't exist or there was an error loading it.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-300"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const title = movie.title || movie.name;
  const year =
    movie.release_date?.split("-")[0] ||
    movie.first_air_date?.split("-")[0] ||
    "N/A";

  const handleTrailerClick = () => {
    if (trailer) {
      setIsTrailerModalOpen(true);
    } else {
      // If no trailer found, try to fetch videos separately
      fetchVideos();
    }
  };

  const fetchVideos = async () => {
    if (!id || !movie) return;
    
    setLoadingTrailer(true);
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
      const type = media_type || 'movie';
      
      const videoUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
        ? `https://api.themoviedb.org/3/${type}/${id}/videos`
        : `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey}`;

            const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
              ? {
                  Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
                  accept: "application/json",
                }
              : {
                  accept: "application/json",
                };

      const res = await fetch(videoUrl, { headers });
      const data = await res.json();
      
      if (data.results) {
        const trailers = data.results.filter(
          (video: TMDBVideo) => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' && 
            video.official
        );
        
        if (trailers.length > 0) {
          setTrailer(trailers[0]);
          setIsTrailerModalOpen(true);
        } else {
          const youtubeVideos = data.results.filter(
            (video: TMDBVideo) => video.site === 'YouTube'
          );
          if (youtubeVideos.length > 0) {
            setTrailer(youtubeVideos[0]);
            setIsTrailerModalOpen(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoadingTrailer(false);
    }
  };

  return (
    <div className="relative w-screen min-h-screen bg-black text-white overflow-x-hidden">
      {/* Dynamic Background Images */}
      {backgroundImages.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}
        </div>
      )}
      
      {/* Background Loading State */}
      {backgroundLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300">Loading background...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Background (if trailer is available) */}
      {trailer && isVideoBackground && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&loop=1&playlist=${trailer.key}&controls=0&showinfo=0&rel=0&modestbranding=1`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50"></div>
      
      {/* Animated Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Subtle Moving Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 animate-pulse"></div>

      <div className="relative pt-24 px-4 w-full">
        {/* Background Indicator */}
        {backgroundImages.length > 1 && !isVideoBackground && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBgIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBgIndex 
                    ? 'bg-purple-500 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mb-8 group flex items-center gap-2 bg-purple-600/80 backdrop-blur-sm px-6 py-3 rounded-2xl hover:bg-purple-700/80 transition-all duration-300 transform hover:scale-105"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span className="font-semibold">Back</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative group">
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "/placeholder.jpg"
            }
            alt={title}
                className="w-80 rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-8">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-bold text-lg">{movie.vote_average?.toFixed(1) || "N/A"}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-gray-400">📅</span>
                  <span>{year}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-gray-400">⏱️</span>
                  <span>{movie.runtime || movie.episode_run_time?.[0] || "N/A"} min</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm rounded-full text-sm font-semibold"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-purple-300">Overview</h2>
              <p className="text-lg text-gray-300 leading-relaxed max-w-4xl">
                {movie.overview}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleTrailerClick}
                disabled={loadingTrailer}
                className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:hover:scale-100"
              >
                {loadingTrailer ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>{trailer ? 'Watch Trailer' : 'Find Trailer'}</span>
                  </>
                )}
              </button>

              {/* Background Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsVideoBackground(false)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    !isVideoBackground 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </button>
                
                {trailer && (
                  <button
                    onClick={() => setIsVideoBackground(true)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      isVideoBackground 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <button 
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className={`group flex items-center gap-3 backdrop-blur-sm px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border ${
                  isInWatchlist 
                    ? 'bg-green-600/50 hover:bg-green-700/50 border-green-500/50' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-600/50'
                } ${watchlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {watchlistLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill={isInWatchlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                <span>
                  {!isAuthenticated 
                    ? 'Login to Add to Watchlist' 
                    : isInWatchlist 
                      ? 'In Watchlist' 
                      : 'Add to Watchlist'
                  }
                </span>
              </button>
              
              <button 
                onClick={async () => {
                  try {
                    const url = window.location.href;
                    const text = movie ? `${movie.title || movie.name} – ${url}` : url;
                    if (navigator.share) {
                      await navigator.share({ title: movie?.title || movie?.name || 'Movie', text, url });
                    } else if (navigator.clipboard) {
                      await navigator.clipboard.writeText(url);
                      alert('Link copied to clipboard');
                    } else {
                      window.prompt('Copy this link', url);
                    }
                  } catch (e) {
                    console.error('Share failed', e);
                  }
                }}
                className="group flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border border-gray-600/50">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        video={trailer}
        movieTitle={title || "Movie"}
      />
    </div>
  );
}

export default MovieDetails;



