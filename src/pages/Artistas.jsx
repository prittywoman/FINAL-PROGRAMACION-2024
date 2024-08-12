import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/artistas.css'; 

const Artistas = () => {
  const [artistas, setArtistas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editingArtista, setEditingArtista] = useState(null);
  const [editedArtistaName, setEditedArtistaName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchedArtista, setSearchedArtista] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSongs, setShowSongs] = useState(false); 

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const token = localStorage.getItem('authToken');

  
  const fetchArtistas = async (page, pageSize) => {
    setLoading(true);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      setError('Número de página o tamaño de página inválido');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://sandbox.academiadevelopers.com/harmonyhub/artists/', {
        headers: {
          'Authorization': `Token ${token}`
        },
        params: {
          page: page,
          page_size: pageSize
        }
      });

      setArtistas(response.data.results);
      const totalItems = response.data.count;
      const totalPages = Math.ceil(totalItems / pageSize);
      setTotalPages(totalPages);

    } catch (error) {
      console.error("Error fetching artists:", error);
      setError('Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistas(currentPage, pageSize);
  }, [currentPage, pageSize, token]);

  
const handleSearchById = async () => {
  setSearchError('');
  setArtistSongs([]);
  setShowSongs(false);

  try {
    
    const artistaResponse = await axios.get(`https://sandbox.academiadevelopers.com/harmonyhub/artists/${searchId}/`);
    setSearchedArtista(artistaResponse.data);

    
    const cancionesResponse = await axios.get(`https://sandbox.academiadevelopers.com/harmonyhub/songs/?artists=${searchId}`); // Ajusta el endpoint según la API
    setArtistSongs(cancionesResponse.data.results); // Ajusta según la estructura de la respuesta de la API

    setShowSongs(true); 

  } catch (error) {
    console.error('Error fetching artist or songs:', error);
    setSearchError('Error al buscar el artista o sus canciones');
  }
};


  
  const handleCreate = async () => {
    if (!token) {
      setError('No token found');
      return;
    }

    if (!nombre) {
      setError('Name is required');
      return;
    }

    try {
      const response = await fetch('https://sandbox.academiadevelopers.com/harmonyhub/artists/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nombre.trim()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error creating artist: ${response.statusText}`);
      }

      const newArtistaData = await response.json();
      console.log('Created artist:', newArtistaData);
      setArtistas(prevArtistas => [...prevArtistas, newArtistaData]);
      setNombre('');
      setSuccessMessage('Artista creado exitosamente');
    } catch (err) {
      setError(`Failed to create artist: ${err.message}`);
    }
  };

  
  const handleEdit = (artista) => {
    setEditingArtista(artista);
    setEditedArtistaName(artista.name);
  };

  const handleUpdate = async () => {
    if (!token) {
      setError('No token found');
      return;
    }

    if (!editedArtistaName) {
      setError('Name is required for update');
      return;
    }

    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/artists/${editingArtista.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedArtistaName.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error updating artist: ${errorText}`);
      }

      const updatedArtista = await response.json();
      console.log('Updated artist:', updatedArtista);
      setArtistas(artistas.map(artista => (artista.id === updatedArtista.id ? updatedArtista : artista)));
      setEditingArtista(null);
      setEditedArtistaName('');
      setSuccessMessage('Artista actualizado exitosamente');
    } catch (err) {
      console.error('Error details:', err);
      setError(`Failed to update artist: ${err.message}`);
    }
  };

  
  const handleDelete = async (id) => {
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/artists/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error deleting artist: ${response.statusText}`);
      }

      setArtistas(prevArtistas => prevArtistas.filter(artista => artista.id !== id));
    } catch (err) {
      setError(`Failed to delete artist: ${err.message}`);
    }
  };

  return (
    <div>
      <h1>Artistas</h1>
      {loading && <p>Cargando artistas...</p>}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      {searchError && <p className="error">{searchError}</p>}

      <div>
        <h2>Crear Artista</h2>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del artista"
        />
        <button onClick={handleCreate}>Crear</button>
      </div>

      <div>
      <h2>Buscar Artista por ID</h2>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="ID del artista"
        />
        <button onClick={handleSearchById}>Buscar</button>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {searchedArtista && (
        <div className="artista-details-container">
          <h2>Detalles del Artista</h2>
          <p>Nombre: {searchedArtista.name}</p>
          <button onClick={() => setShowSongs(!showSongs)}>
            {showSongs ? 'Ocultar Canciones' : 'Ver Canciones'}
          </button>
          {showSongs && artistSongs.length > 0 ? (
            <div className="artist-songs-container">
              <h3>Canciones del Artista</h3>
              <ul>
                {artistSongs.map(song => (
                  <li key={song.id}>{song.title}</li>
                ))}
              </ul>
            </div>
          ) : showSongs ? (
            <div className="artist-songs-container">
              <h3>No se encontraron canciones para este artista.</h3>
            </div>
          ) : null}
      </div>
     
     
      )}

      <div>
        <h2>Lista de Artistas</h2>
        <ul>
          {artistas.map(artista => (
            <li key={artista.id}>
              {artista.name}
              <button onClick={() => handleEdit(artista)}>Editar</button>
              <button onClick={() => handleDelete(artista.id)}>Eliminar</button>
            </li>
          ))}
        </ul>

        <div>
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>Página Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Página Siguiente</button>
        </div>
      </div>

      {editingArtista && (
        <div>
          <h2>Editar Artista</h2>
          <input
            type="text"
            value={editedArtistaName}
            onChange={(e) => setEditedArtistaName(e.target.value)}
          />
          <button onClick={handleUpdate}>Actualizar</button>
          <button onClick={() => setEditingArtista(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Artistas;
