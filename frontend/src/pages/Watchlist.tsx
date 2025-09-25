import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type TMDBId = number;
interface WatchlistItemUI {
  id: number;
  title: string;
  year?: string;
  poster?: string;
  overview?: string;
  media_type?: string;
}

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItemUI[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlist = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/watchlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const ids: TMDBId[] = data.items || [];
        // fetch details from TMDB for each id
        const apiKey = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
        const headers: Record<string, string> = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN 
          ? { Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`, accept: 'application/json' }
          : { accept: 'application/json' };
        const fetchOne = async (id:number): Promise<WatchlistItemUI|null> => {
          try {
            // Try movie first then tv
            const movieUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN ? 
              `https://api.themoviedb.org/3/movie/${id}` :
              `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;
            let res = await fetch(movieUrl, { headers });
            if (res.ok) {
              const m = await res.json();
              return { id: m.id, title: m.title, year: m.release_date, poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined, overview: m.overview, media_type: 'movie' };
            }
            const tvUrl = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN ? 
              `https://api.themoviedb.org/3/tv/${id}` :
              `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`;
            res = await fetch(tvUrl, { headers });
            if (res.ok) {
              const t = await res.json();
              return { id: t.id, title: t.name, year: t.first_air_date, poster: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : undefined, overview: t.overview, media_type: 'tv' };
            }
          } catch (e) {
            console.error('TMDB fetch error', e);
          }
          return null;
        };
        const detailed = (await Promise.all(ids.map(fetchOne))).filter(Boolean) as WatchlistItemUI[];
        setWatchlist(detailed);
      } else {
        console.error('Failed to fetch watchlist:', response.status);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
    };

    if (isAuthenticated) {
      fetchWatchlist();
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate, token]);

  const removeFromWatchlist = async (movieId: number) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: movieId })
      });
      
      if (response.ok) {
        setWatchlist(watchlist.filter(item => item.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">Movies and shows you want to watch</p>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📽️</div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">Your watchlist is empty</h2>
            <p className="text-gray-500 mb-6">Start adding movies and shows you want to watch!</p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              Browse Movies
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchlist.map((item) => (
              <div key={item.id} className="group relative bg-gray-900/50 rounded-lg overflow-hidden hover:bg-gray-800/50 transition-all duration-300 shadow-lg shadow-gray-900/20">
                <div className="aspect-[2/3] bg-gray-800 relative">
                  {item.poster ? (
                    <img 
                      src={item.poster} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWatchlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Remove from watchlist"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{item.year}</p>
                  {item.overview && (
                    <p className="text-gray-500 text-xs line-clamp-3">{item.overview}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
