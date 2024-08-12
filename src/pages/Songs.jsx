import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Songs.css';
import { useAuth } from '../contexts/AuthContext';

const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [album, setAlbum] = useState('');
  const [artistId, setArtistId] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [editedSongName, setEditedSongName] = useState('');
  const [editedSongYear, setEditedSongYear] = useState('');
  const [editedSongAlbum, setEditedSongAlbum] = useState('');
  const [editedArtistId, setEditedArtistId] = useState('');
  const [audioFileForEdit, setAudioFileForEdit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchedSong, setSearchedSong] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { state: { token }, actions } = useAuth();

  useEffect(() => {
    fetchSongs(currentPage, pageSize);
  }, [currentPage, pageSize, token]);

  const fetchSongs = async (page, pageSize) => {
    setLoading(true);
    try {
      const response = await axios.get('https://sandbox.academiadevelopers.com/harmonyhub/songs/', {
        headers: { 'Authorization': `Token ${token}` },
        params: { page, page_size: pageSize }
      });
      setSongs(response.data.results);
      const totalItems = response.data.count;
      setTotalPages(Math.ceil(totalItems / pageSize));
    } catch (error) {
      setError('Failed to fetch songs');
    } finally {
      setLoading(false);
    }
  };

   
  const handleSearchById = async () => {
    
    
    if (!token) {
      setSearchError('No token found');
      return;
    }
  
    if (!searchId) {
      setSearchError('ID is required for search');
      return;
    }
  
    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/songs/${searchId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching song: ${errorText}`);
      }
  
      const song = await response.json();
      setSearchedSong(song);
      setSearchError('');
    } catch (err) {
      setSearchedSong(null);
      setSearchError(`Failed to fetch song: ${err.message}`);
    }
  };

  const handleCreate = async () => {
    if (!token || !title) {
      setError('Title is required');
      return;
    }
  
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('year', year ? parseInt(year, 10) : '');
    formData.append('album', album ? parseInt(album, 10) : '');
    formData.append('artist', artistId);
  
    if (audioFile) {
      formData.append('song_file', audioFile);
    }
  
    try {
      const response = await fetch('https://sandbox.academiadevelopers.com/harmonyhub/songs/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error creating song: ${errorText}`);
      }
  
      const data = await response.json();
      setSongs(prevSongs => [...prevSongs, data]);
      setTitle('');
      setYear('');
      setAlbum('');
      setArtistId('');
      setAudioFile(null);
    } catch (err) {
      setError(`Failed to create song: ${err.message}`);
    }
  };
  
  
  const handleEdit = (song) => {
    setEditingSong(song);
    setEditedSongName(song.title);
    setEditedSongYear(song.year);
    setEditedSongAlbum(song.album);
    setEditedArtistId(song.artist ? song.artist.toString() : ''); // Adjust according to your data structure
    setAudioFileForEdit(null); // Or assign current file if you have one
  };

  const handleUpdate = async () => {
    if (!token || !editedSongName) {
      setError('Title is required for update');
      return;
    }
    const formData = new FormData();
    formData.append('title', editedSongName.trim());
    formData.append('year', editedSongYear ? parseInt(editedSongYear, 10) : null);
    formData.append('album', editedSongAlbum ? parseInt(editedSongAlbum, 10) : null);
    formData.append('artist', editedArtistId); // Use the selected artist ID
    if (audioFileForEdit) {
      formData.append('song_file', audioFileForEdit);
    }
    try {
      const response = await axios.patch(`https://sandbox.academiadevelopers.com/harmonyhub/songs/${editingSong.id}/`, formData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status !== 200) {
        throw new Error(`Error updating song: ${response.statusText}`);
      }
      setSongs(songs.map(song => (song.id === response.data.id ? response.data : song)));
      setEditingSong(null);
      setEditedSongName('');
      setEditedSongYear('');
      setEditedSongAlbum('');
      setEditedArtistId('');
      setAudioFileForEdit(null);
    } catch (err) {
      setError(`Failed to update song: ${err.message}`);
    }
  };

  
  const handleDelete = async (id) => {
  
    if (!token) {
      setError('No token found');
      return;
    }
  
    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/songs/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Error deleting song');
      setSongs(songs.filter(song => song.id !== id));
    } catch (err) {
      setError(`Failed to delete song: ${err.message}`);
    }
  };
  

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : 1));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="songs-container">
      <h2>Ingresar nueva canción</h2>
      <div className="input-container">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la canción"
          className="title-placeholder"
        />
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Año de lanzamiento"
          className="year-placeholder"
        />
        <input
          type="number"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          placeholder="Álbum"
          className="album-placeholder"
        />
        <input
          type="text"
          value={artistId}
          onChange={(e) => setArtistId(e.target.value)}
          placeholder="ID del artista"
          className="artist-id-placeholder"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
        />
        <button onClick={handleCreate}>Crear Canción</button>
      </div>
      <div className="input-container">
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Buscar por ID"
        />
        <button onClick={handleSearchById}>Buscar</button>
        {searchError && <p className="error-message">{searchError}</p>}
        {searchedSong && (
          <div className="song-details">
            <h3>Detalles de la canción</h3>
            <p>Título: {searchedSong.title}</p>
            <p>Año: {searchedSong.year}</p>
            <p>Álbum: {searchedSong.album}</p>
            <p>Artista: {searchedSong.artist}</p>
            <button onClick={() => handleEdit(searchedSong)}>Editar</button>
            <button onClick={() => handleDelete(searchedSong.id)}>Eliminar</button>
          </div>
        )}
      </div>
      <div className="song-list">
        <h2>Lista de Canciones</h2>
        {songs.length === 0 ? (
          <p>No hay canciones</p>
        ) : (
          <ul>
            {songs.map(song => (
              <li key={song.id}>
                {song.title} - {song.year} - {song.album}
                <button onClick={() => handleEdit(song)}>Editar</button>
                <button onClick={() => handleDelete(song.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {editingSong && (
        <div className="edit-form">
          <h2>Editar Canción</h2>
          <input
            type="text"
            value={editedSongName}
            onChange={(e) => setEditedSongName(e.target.value)}
            placeholder="Título de la canción"
            className="title-placeholder"
          />
          <input
            type="number"
            value={editedSongYear}
            onChange={(e) => setEditedSongYear(e.target.value)}
            placeholder="Año de lanzamiento"
            className="year-placeholder"
          />
          <input
            type="number"
            value={editedSongAlbum}
            onChange={(e) => setEditedSongAlbum(e.target.value)}
            placeholder="Álbum"
            className="album-placeholder"
          />
          <input
            type="text"
            value={editedArtistId}
            onChange={(e) => setEditedArtistId(e.target.value)}
            placeholder="ID del artista"
            className="artist-id-placeholder"
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFileForEdit(e.target.files[0])}
          />
          <button onClick={handleUpdate}>Actualizar Canción</button>
        </div>
      )}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</button>
      </div>
    </div>
  );
};

export default Songs;

