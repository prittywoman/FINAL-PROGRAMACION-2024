import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import axios from 'axios';
import '../styles/generos.css'; 

const Generos = () => {
  const [generos, setGeneros] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editingGenero, setEditingGenero] = useState(null);
  const [editedGeneroName, setEditedGeneroName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchedGenero, setSearchedGenero] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 

  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Número de géneros por página
  
  const { state: { token }, actions } = useAuth();

  
  const fetchGeneros = async (page, pageSize) => {
    setLoading(true);

    // Verificar que page y pageSize sean números válidos
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      setError('Invalid page or page size');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://sandbox.academiadevelopers.com/harmonyhub/genres/', {
        headers: {
          'Authorization': `Token ${token}`
        },
        params: {
          page: page,
          page_size: pageSize
        }
      });

      setGeneros(response.data.results); // Establece la lista de géneros

      
      const totalItems = response.data.count;
      const totalPages = Math.ceil(totalItems / pageSize);
      setTotalPages(totalPages);

    } catch (error) {
      console.error("Error fetching genres:", error);
      setError('Failed to fetch genres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneros(currentPage, pageSize);
  }, [currentPage, pageSize, token]);

   
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
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/genres/${searchId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching genre: ${errorText}`);
      }

      const genero = await response.json();
      setSearchedGenero(genero);
      setSearchError('');
    } catch (err) {
      setSearchedGenero(null);
      setSearchError(`Failed to fetch genre: ${err.message}`);
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
      const response = await fetch('https://sandbox.academiadevelopers.com/harmonyhub/genres/', {
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
        throw new Error(`Error creating genre: ${response.statusText}`);
      }

      const newGeneroData = await response.json();
      console.log('Created genre:', newGeneroData);
      setGeneros(prevGeneros => [...prevGeneros, newGeneroData]);
      setNombre('');
    } catch (err) {
      setError(`Failed to create genre: ${err.message}`);
    }
  };

  
  const handleEdit = (genero) => {
    setEditingGenero(genero);
    setEditedGeneroName(genero.name);
  };

  const handleUpdate = async () => {
    if (!token) {
      setError('No token found');
      return;
    }

    if (!editedGeneroName) {
      setError('Name is required for update');
      return;
    }

    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/genres/${editingGenero.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedGeneroName.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error updating genre: ${errorText}`);
      }

      const updatedGenero = await response.json();
      console.log('Updated genre:', updatedGenero);
      setGeneros(generos.map(genero => (genero.id === updatedGenero.id ? updatedGenero : genero)));
      setEditingGenero(null);
      setEditedGeneroName('');
    } catch (err) {
      console.error('Error details:', err);
      setError(`Failed to update genre: ${err.message}`);
    }
  };

  
  const handleDelete = async (id) => {
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const response = await fetch(`https://sandbox.academiadevelopers.com/harmonyhub/genres/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error deleting genre');
      setGeneros(generos.filter(genero => genero.id !== id));
      setSuccessMessage('Género eliminado exitosamente.'); // Mensaje de éxito
    } catch (err) {
      setError(`Failed to delete genre: ${err.message}`);
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
    <div className="generos-container">
      <h2>Ingresar nuevo género</h2>

      
      <div className="input-container">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del género"
        />
        <button className="create-genero-button" onClick={handleCreate}>Crear Género</button>
      </div>

      
      {editingGenero && (
        <div>
          <h3>Editar género</h3>
          <input
            type="text"
            value={editedGeneroName}
            onChange={(e) => setEditedGeneroName(e.target.value)}
            placeholder="Nombre"
          />
          <button className="save-changes-button" onClick={handleUpdate}>Guardar cambios</button>
        </div>
      )}

      
      <div>
        <h3>Buscar género por ID</h3>
        <div className="search-container">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="ID del género"
          />
          <button className="search-button" onClick={handleSearchById}>Buscar</button>
        </div>
        {searchError && <p className="error-message">{searchError}</p>}
        {searchedGenero && (
          <div className="genero-details-container">
            <h4 className="genero-details-title">Detalles del Género</h4>
            <p><strong>Nombre:</strong> {searchedGenero.name}</p>
            <button onClick={() => handleEdit(searchedGenero)}>Editar</button>
          </div>
        )}
      </div>

      
      <h3>Lista de géneros</h3>
      <ul>
        {generos.length > 0 ? (
          generos.map(genero => (
            <li key={genero.id} className="genero-item">
              <span className="genero-name">{genero.name}</span>
              <div className="genero-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(genero)}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(genero.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))
        ) : (
          <li>No hay géneros disponibles</li>
        )}
      </ul>

      
      {successMessage && <p className="success-message">{successMessage}</p>}

      
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

export default Generos;
