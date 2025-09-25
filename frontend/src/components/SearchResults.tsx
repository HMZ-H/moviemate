import React from "react";
import { Link } from "react-router-dom";

// 🎬 TMDb Movie/TV interface
export interface TMDBItem {
  id: number;
  title?: string;       
  name?: string;         
  release_date?: string;
  first_air_date?: string; 
  media_type?: string;   
  poster_path: string | null;
  vote_average?: number;
}

interface SearchResultsProps {
  results: TMDBItem[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {results.map((item) => {
        const title = item.title || item.name;
        const year =
          item.release_date?.split("-")[0] ||
          item.first_air_date?.split("-")[0] ||
          "N/A";
        const rating = item.vote_average || 0;

        return (
          <Link
            key={item.id}
            to={`/${item.media_type || "movie"}/${item.id}`}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 transform hover:shadow-2xl hover:shadow-purple-500/20"
          >
            {/* Poster Image */}
            <div className="relative overflow-hidden">
              <img
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : "/placeholder.jpg"
                }
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

              {/* Media Type Badge */}
              <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-xs font-semibold uppercase">
                  {item.media_type || "movie"}
                </span>
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
          </Link>
        );
      })}
    </div>
  );
};

export default SearchResults;
