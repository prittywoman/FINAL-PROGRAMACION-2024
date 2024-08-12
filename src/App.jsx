import { useState } from 'react';
import Navbar from './components/navbar';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Inicio from './pages/Inicio';
import './App.css';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Songs from './pages/Songs';
import NotFound from './pages/NotFound';
import Generos from './pages/Generos';
import Artistas from './pages/Artistas';
import Albumes from './pages/Albumes';
import Playlists from './pages/Playlists';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" />} /> 
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/artistas" element={<Artistas />} />
          <Route path="/generos" element={<Generos />} />
          <Route path="/albumes" element={<Albumes />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="*" element={<NotFound />} /> 
        </Routes>

        
        <h1>PROYECTO FINAL DE PROGRAMACION</h1>
        
        <p className="read-the-docs">
          Propiedad de Sandra Caliva
        </p>
      </main>
    </div>
  );
}

export default App;
