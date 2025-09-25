import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SearchResults from "../components/SearchResults";

interface Movie {
  id: number;
  title?: string;
  name?: string; // for series
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  media_type: string;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchMovies() {
      if (!query) return;
      setLoading(true);
      console.log("Searching for:", query);
      console.log("API Key:", import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN ? "Present" : "Missing");
      
      try {
        // Use API key instead of Bearer token if read access token is not available
        const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
        
        if (!apiKey) {
          console.error("No TMDB API key found. Please set VITE_TMDB_API_KEY or VITE_TMDB_READ_ACCESS_TOKEN in your .env file");
          setResults([]);
          return;
        }

        const url = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
          ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
          : `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

        const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
          ? {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
              accept: "application/json",
            }
          : {
              accept: "application/json",
            };

        const res = await fetch(url, { headers });
        
        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Search results:", data);
        
        if (data.results) {
          setResults(data.results);
        } else {
          console.error("No results in response:", data);
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [query]);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      <div className="pt-24 px-4 w-full">
        {/* Search Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Search Results
          </h1>
          {query && (
            <p className="text-xl text-gray-300">
              Results for: <span className="text-purple-300 font-semibold">"{query}"</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <p className="mt-4 text-lg text-gray-300">Searching for amazing content...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-300">No results found</h2>
            <p className="text-gray-400 text-center max-w-md">
              We couldn't find any movies or TV shows matching "{query}". 
              Try searching with different keywords or check your spelling.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-300">
                Found <span className="text-purple-400 font-semibold">{results.length}</span> results
              </p>
              <div className="flex items-center gap-4">
                <select className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl px-4 py-2 text-sm">
                  <option>Sort by Relevance</option>
                  <option>Sort by Rating</option>
                  <option>Sort by Year</option>
                  <option>Sort by Title</option>
                </select>
                <button className="p-2 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl hover:bg-gray-700/50 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </button>
              </div>
            </div>
            <SearchResults results={results} />
          </div>
        )}

        {/* Empty State - No Query */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Start Your Search</h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
              Search for your favorite movies, TV shows, actors, or directors to discover amazing content.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold hover:scale-105 transition-transform duration-300"
            >
              Explore Trending
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
