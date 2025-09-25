import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetail'
import Recommendations from './pages/Recommendations'
import Chat from './pages/Chat'
import Watchlist from './pages/Watchlist'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import SearchPage from './pages/SearchPage'
import Chatbot from './components/Chatbot'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        {/*Navbar */}
        <Navbar />

        {/*Page contet changes*/}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/movie/:id' element={<MovieDetails />} />
          <Route path='/tv/:id' element={<MovieDetails />} />
          <Route path='/:media_type/:id' element={<MovieDetails />} />
          <Route path='/recommendations' element={<Recommendations />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/watchlist' element={<Watchlist />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/search' element={<SearchPage />}></Route>
        </Routes>

        {/* Floating Chatbot */}
        <Chatbot 
          isOpen={isChatbotOpen} 
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)} 
        />
      </Router>
    </AuthProvider>
  )
}

export default App
