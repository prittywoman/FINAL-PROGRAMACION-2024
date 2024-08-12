import React, { useEffect, useState } from 'react';


const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await fetch(`${API_URL}/users/profiles/profile_data/`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error fetching user data: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        setUserData(data);
        setFormData({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_URL}/users/profiles/{id}/`, {
        method: 'PATCH', 
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error updating user data: ${response.status} ${errorText}`);
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setEditing(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Perfil de Usuario</h2>
      {editing ? (
        <div>
          <h3>Editar Perfil</h3>
          <form>
            <div>
              <label>Nombre de Usuario:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Primer Nombre:</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Apellido:</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Correo Electrónico:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <button type="button" onClick={handleSave}>Guardar Cambios</button>
            <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
          </form>
        </div>
      ) : (
        <div className="user-profile-container">
          <p><strong>ID de Usuario:</strong> {userData.user__id}</p>
          <p><strong>Nombre de Usuario:</strong> {userData.username}</p>
          <p><strong>Primer Nombre:</strong> {userData.first_name}</p>
          <p><strong>Apellido:</strong> {userData.last_name}</p>
          <p><strong>Correo Electrónico:</strong> {userData.email}</p>
          <button onClick={() => setEditing(true)}>Editar Perfil</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
