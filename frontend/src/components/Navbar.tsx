import React, { useState } from 'react'
import { Link, useMatch, useNavigate, useResolvedPath } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'
import Logo from './Logo'
import { useAuth } from '../contexts/AuthContext'
  

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [showUserMenu, setShowUserMenu] = useState(false)

    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()


    const handleSearch = async (event: React.FormEvent) =>{
        event.preventDefault()
        if (!query.trim()) return
        navigate(`/search?q=${encodeURIComponent(query)}`)
        

    }

    return (
        <>
        <nav className="w-full bg-black/80 backdrop-blur-md text-white fixed top-0 left-0 z-50 border-b border-purple-500/20">
            <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                {/* Logo / site name */}
                <Link to="/" className="group">
                    <Logo size="md" showText={true} />
                </Link>

                {/* Search bar (desktop only) */}
                <form 
                    onSubmit={handleSearch} 
                    className="hidden md:flex items-center bg-gray-800/50 backdrop-blur-sm rounded-2xl px-4 py-2 mx-6 w-80 border border-gray-700/50 focus-within:border-purple-500/50 transition-colors duration-300"
                >
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text"
                        placeholder='Search movies, TV shows...'
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className='bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm'
                    />
                    <button 
                        type="submit" 
                        className='ml-2 p-1 text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-200'
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 7l5 5-5 5-1.4-1.4L15.2 12l-3.6-3.6L13 7z"/>
                        </svg>
                    </button>
                </form>

                {/* Desktop links */}
                <ul className="hidden md:flex gap-8">
                    <CustomLink to="/">Home</CustomLink>
                    <CustomLink to="/recommendations">Recommendations</CustomLink>
                    <CustomLink to="/chat">AI Chat</CustomLink>
                </ul>

                {/* User Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <button 
                                onClick={() => navigate('/watchlist')}
                                className="p-2 text-gray-400 hover:text-purple-400 hover:scale-110 transition-all duration-200"
                                title="My Watchlist"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            
                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-2 text-gray-400 hover:text-purple-400 hover:scale-110 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm">{user?.username}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                                        <button
                                            onClick={() => {
                                                navigate('/profile')
                                                setShowUserMenu(false)
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout()
                                                setShowUserMenu(false)
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/auth')}
                                className="px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/auth')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                {/* Hamburger menu (mobile only) */}
                <button
                    className="md:hidden flex flex-col gap-1.5 focus:outline-none p-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 bg-black/90 backdrop-blur-md border-t border-purple-500/20">
                    <ul className="flex flex-col gap-4 py-4">
                        <CustomLink to="/">Home</CustomLink>
                        <CustomLink to="/recommendations">Recommendations</CustomLink>
                        <CustomLink to="/chat">AI Chat</CustomLink>

                        {/* Search (mobile) */}
                        <form 
                            onSubmit={handleSearch}
                            className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-2xl px-4 py-3 mt-4 border border-gray-700/50"
                        >
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input 
                                type="text"
                                placeholder='Search movies, TV shows...'
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                className="bg-transparent outline-none text-white w-full placeholder-gray-400 text-sm" 
                            />
                            
                            <button 
                                type="submit"
                                className='ml-2 p-1 text-purple-400 hover:text-purple-300 hover:scale-110 transition-all duration-200'
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 7l5 5-5 5-1.4-1.4L15.2 12l-3.6-3.6L13 7z"/>
                                </svg>
                            </button>
                        </form>
                    </ul>
                </div>
            </div>
        </nav>
        </>
    )
}

interface CustomLinkProps extends LinkProps {
    children: ReactNode
}

function CustomLink({ children, to, ...props }: CustomLinkProps) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })

    return (
        <li>
            <Link
                to={to}
                {...props}
                className={`relative h-full flex items-center px-4 py-2 rounded-xl transition-all duration-300 group
                    hover:bg-purple-500/20 hover:text-purple-300 hover:scale-105
                    ${isActive ? "bg-purple-500/30 text-purple-300" : "text-gray-300"}`}
            >
                <span className="relative z-10">{children}</span>
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
        </li>
    )
}

export default Navbar
