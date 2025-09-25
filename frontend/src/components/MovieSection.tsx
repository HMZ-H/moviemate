import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import type { TMDBItem, TMDBVideo } from "../types/tmdb"; 
import TrailerModal from "./TrailerModal";

import "swiper/swiper-bundle.css";

interface MovieSectionProps {
  title: string;
  movies: TMDBItem[];
}

const MovieSection: React.FC<MovieSectionProps> = ({ title, movies }) => {
  const navigate = useNavigate();
  const [selectedTrailer, setSelectedTrailer] = useState<TMDBVideo | null>(null);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState<number | null>(null);

  const fetchTrailer = async (movie: TMDBItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setLoadingTrailer(movie.id);
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
      const type = movie.media_type || 'movie';
      
      const videoUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
        ? `https://api.themoviedb.org/3/${type}/${movie.id}/videos`
        : `https://api.themoviedb.org/3/${type}/${movie.id}/videos?api_key=${apiKey}`;

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
          setSelectedTrailer(trailers[0]);
          setIsTrailerModalOpen(true);
        } else {
          const youtubeVideos = data.results.filter(
            (video: TMDBVideo) => video.site === 'YouTube'
          );
          if (youtubeVideos.length > 0) {
            setSelectedTrailer(youtubeVideos[0]);
            setIsTrailerModalOpen(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    } finally {
      setLoadingTrailer(null);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 py-16 relative w-full">
      {/* Section Header - Only show if title exists */}
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="hidden md:flex items-center gap-2 text-gray-400">
            <span className="text-sm">Swipe to explore</span>
            <span className="text-lg">→</span>
          </div>
        </div>
      )}

      <Swiper
        spaceBetween={20}
        slidesPerView={5}
        navigation
        modules={[Navigation]}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 3, spaceBetween: 15 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
        }}
        className="movie-swiper"
      >
        {movies.map((movie) => {
          const displayTitle = movie.title || movie.name;
          const year =
            movie.release_date?.split("-")[0] ||
            movie.first_air_date?.split("-")[0] ||
            "N/A";
          const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/placeholder.jpg";
          const rating = movie.vote_average || 0;

          return (
            <SwiperSlide
              key={movie.id}
              onClick={() =>
                navigate(`/${movie.media_type || "movie"}/${movie.id}`)
              }
              className="cursor-pointer group"
            >
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 transform hover:shadow-2xl hover:shadow-purple-500/20 group-hover:shadow-purple-500/30">
                {/* Poster Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={posterUrl}
                    alt={displayTitle || "Untitled"}
                    className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-white text-sm font-semibold">{rating.toFixed(1)}</span>
                  </div>

                  {/* Media Type Badge */}
                  <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-xs font-semibold uppercase">
                      {movie.media_type || "movie"}
                    </span>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => fetchTrailer(movie, e)}
                      disabled={loadingTrailer === movie.id}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingTrailer === movie.id ? (
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                    {displayTitle}
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
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        video={selectedTrailer}
        movieTitle={selectedTrailer ? (movies.find(m => m.id === loadingTrailer)?.title || movies.find(m => m.id === loadingTrailer)?.name || "Movie") : "Movie"}
      />
    </div>
  );
};

export default MovieSection;
