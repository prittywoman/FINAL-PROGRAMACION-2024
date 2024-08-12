import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Playlists.css';
import { useAuth } from '../contexts/AuthContext';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newSongOrder, setNewSongOrder] = useState(1);
  const [newSongId, setNewSongId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { state } = useAuth();
  const token = state.token;

  const fetchPlaylists = async (page, pageSize) => {
    setLoading(true);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      setError('Invalid page or page size');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://sandbox.academiadevelopers.com/harmonyhub/playlists/', {
        headers: {
          'Authorization': `Token ${token}`
        },
        params: {
          page: page,
          page_size: pageSize
        }
      });

      setPlaylists(response.data.results);
      const totalItems = response.data.count;
      const totalPages = Math.ceil(totalItems / pageSize);
      setTotalPages(totalPages);

    } catch (error) {
      console.error("Error fetching playlists:", error);
      setError('Failed to fetch playlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists(currentPage, pageSize);
  }, [currentPage, pageSize, token]);

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
  };
  
  const handleCreatePlaylist = async () => {
    try {
      await axios.post('https://sandbox.academiadevelopers.com/harmonyhub/playlists/', 
        { name: newPlaylistName },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setSuccess('Playlist created successfully');
      setNewPlaylistName('');
      fetchPlaylists(currentPage, pageSize);
    } catch (err) {
      console.error(err);
      setError('Error creating playlist');
    }
  };

  const handleAddSong = async () => {
    if (selectedPlaylist) {
      try {
        await axios.post('https://sandbox.academiadevelopers.com/harmonyhub/playlists-entries/', {
          order: newSongOrder,
          song: newSongId,
          playlist: selectedPlaylist.id     
        }, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setSuccess('Song added successfully');
        setNewSongOrder(1);
        setNewSongId('');


        
        const updatedPlaylist = { ...selectedPlaylist };
        updatedPlaylist.songs.push({
          id: newSongId,
          order: newSongOrder
        });
        setSelectedPlaylist(updatedPlaylist);
      } catch (err) {
        setError('Error adding song to playlist');
      }
    } else {
      setError('No playlist selected');
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
    <div className="playlists-container">
      <h2>Manage Playlists</h2>

      <div className="input-container">
        <input
          type="text"
          placeholder="New Playlist Name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
        />
        <button onClick={handleCreatePlaylist}>Create Playlist</button>
      </div>

      {selectedPlaylist && (
        <>
          <div className="input-container">
            <input
              type="number"
              placeholder="Song Order"
              value={newSongOrder}
              onChange={(e) => setNewSongOrder(Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="Song ID"
              value={newSongId}
              onChange={(e) => setNewSongId(e.target.value)}
            />
            <button onClick={handleAddSong}>Add Song</button>
          </div>

          <div className="playlist-details-container">
            <h3 className="playlist-details-title">Playlist Details</h3>
            <p><strong>Name:</strong> {selectedPlaylist.name}</p>
            <ul>
              {selectedPlaylist.songs && selectedPlaylist.songs.map((song) => (
                <li key={song.id} className="song-item">
                  <span className="song-title">{song.title}</span>
                  {song.url ? (
                  <audio controls>
                    <source src={song.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  ) : (
                    <p>No audio URL available</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <ul className="playlists-list">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="playlist-item" onClick={() => handlePlaylistClick(playlist)}>
            <div className="playlist-name">{playlist.name}</div>
            {playlist.songs && playlist.songs.map((song) => (
              <div key={song.id} className="playlist-song">
                <span className="song-title">{song.title}</span>
                {song.url ? (
                  <audio controls>
                    <source src={song.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p>No audio URL available</p>
                )}
              </div>
            ))}
          </li>
        ))}
      </ul>

      <div className="pagination-controls">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Playlists;

