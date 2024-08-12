import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/albumes.css'; 

const Albumes = () => {
  const [albumes, setAlbumes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [anio, setAnio] = useState('');
  const [artista, setArtista] = useState('');
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editedAlbumName, setEditedAlbumName] = useState('');
  const [editedAlbumYear, setEditedAlbumYear] = useState('');
  const [editedAlbumArtist, setEditedAlbumArtist] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchedAlbum, setSearchedAlbum] = useState(null);
  const [searchError, setSearchError] = useState('');

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); 

  
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);

  const token = localStorage.getItem('authToken');  

  const fetchAlbumes = async (page, pageSize) => {
    setLoading(true);

    
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      setError('Número de página o tamaño de página inválido');
      setLoading(false);
      return;
    }

    
    if (!token) {
      setError('Token no encontrado');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://sandbox.academiadevelopers.com/harmonyhub/albums/', {
        headers: {
          'Authorization': `Token ${token}`
        },
        params: {
          page: page,
          page_size: pageSize
        }
      });

      
      if (response.status === 200) {
        console.log('Response data:', response.data); 
        setAlbumes(response.data.results); 

        
        const totalItems = response.data.count;
        const totalPages = Math.ceil(totalItems / pageSize);
        setTotalPages(totalPages);
      } else {
        setError('Error al obtener los álbumes');
      }

    } catch (error) {
      console.error("Error fetching albums:", error);

      if (error.response && error.response.status === 401) {
        setError('No autorizado. Verifica tu token.');
      } else {
        setError('Error al obtener los álbumes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumes(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const fetchAlbumSongs = async (albumId) => {
    if (!token) {
      setError('Token no encontrado');
      return;
    }
  
    try {
      const response = await axios.get(`https://sandbox.academiadevelopers.com/harmonyhub/albums/${albumId}/songs/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
  
      if (response.status === 200) {
        setAlbumSongs(response.data.results);
      } else {
        setError('Error al obtener las canciones del álbum');
      }
    } catch (error) {
      console.error("Error fetching album songs:", error);
      setError('Error al obtener las canciones del álbum');
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
      
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/albums/${searchId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching album: ${errorText}`);
      }
  
      const album = await response.json();
      setSearchedAlbum(album);
      setSearchError('');
  
      
      fetchAlbumSongs(album.id);
    } catch (err) {
      setSearchedAlbum(null);
      setSearchError(`Failed to fetch album: ${err.message}`);
    }
  };
  
  const handleCreate = async () => {
    if (!token) {
      setError('No token found');
      return;
    }
  
    if (!nombre || !artista) {
      setError('El nombre y el artista son requeridos');
      return;
    }
  
    try {
      const response = await fetch('https://sandbox.academiadevelopers.com/harmonyhub/albums/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: nombre.trim(),
          year: anio ? parseInt(anio, 10) : null,
          artist: parseInt(artista, 10)
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error creating album: ${response.statusText}`);
      }
  
      const newAlbumData = await response.json();
      console.log('Created album:', newAlbumData);
      setAlbumes(prevAlbumes => [...prevAlbumes, newAlbumData]);
      setNombre('');
      setAnio('');
      setArtista('');
    } catch (err) {
      setError(`Failed to create album: ${err.message}`);
    }
  };

  const handleUpdateAlbum = async (albumId) => {
    if (!token) {
      setError('Token no encontrado');
      return;
    }
  
    if (!editedAlbumName || !editedAlbumYear || !editedAlbumArtist) {
      setError('Título, año, y artista son requeridos');
      return;
    }
  
    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/albums/${albumId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedAlbumName.trim(), // Aplicar trim para limpiar el string
          year: editedAlbumYear,          // Es un número, no necesita trim
          artist: editedAlbumArtist,      // Es un número, no necesita trim
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error updating album: ${response.statusText}`);
      }
  
      const updatedAlbumData = await response.json();
      console.log('Updated album:', updatedAlbumData);
      // Actualiza la lista de álbumes o realiza cualquier otra acción necesaria
  
    } catch (err) {
      setError(`Failed to update album: ${err.message}`);
    }
  };
  
  const handleDelete = async (id) => {
    if (!token) {
      setError('Token no encontrado');
      return;
    }
  
    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/albums/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error deleting album: ${response.statusText}`);
      }
  
      setAlbumes(prevAlbumes => prevAlbumes.filter(album => album.id !== id));
    } catch (err) {
      setError(`Failed to delete album: ${err.message}`);
    }
  };

  return (
    <div>
      <h1>Álbumes</h1>
      {loading && <p>Cargando álbumes...</p>}
      {error && <p>{error}</p>}
      {searchError && <p>{searchError}</p>}
      
      <div>
        <h2>Crear Álbum</h2>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del álbum"
        />
        <input
          type="text"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          placeholder="Año de lanzamiento"
        />
        <input
          type="text"
          value={artista}
          onChange={(e) => setArtista(e.target.value)}
          placeholder="ID del artista"
        />
        <button onClick={handleCreate}>Crear Álbum</button>
      </div>
      
      <div>
        <h2>Buscar Álbum por ID</h2>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="ID del álbum"
        />
        <button onClick={handleSearchById}>Buscar</button>
        {searchedAlbum && (
          <div>
            <h3>Álbum Encontrado</h3>
            <p>Nombre: {searchedAlbum.title}</p>
            <p>Año: {searchedAlbum.year}</p>
            <p>Artista: {searchedAlbum.artist}</p>
            <h4>Canciones</h4>
            <ul>
              {albumSongs.map(song => (
                <li key={song.id}>{song.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div>
        <h2>Lista de Álbumes</h2>
        <ul>
          {albumes.map(album => (
            <li key={album.id}>
              {album.title} - {album.year}
              <button onClick={() => handleUpdateAlbum(album.id)}>Actualizar</button>
              <button onClick={() => handleDelete(album.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <button
          onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Página Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Página Siguiente
        </button>
      </div>
    </div>
  );
};

export default Albumes;
