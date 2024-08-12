import { useState } from 'react';
import '../styles/login.css'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async () => {
      
      console.log('Username:', username);
      console.log('Password:', password);
      
      
      console.log('Payload:', JSON.stringify({ username, password }));

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api-auth/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });
    
        
        if (!response.ok) {
          const errorText = await response.text(); // Leer el cuerpo como texto
          console.error('Response Status:', response.status);
          console.error('Response Text:', errorText); // Mostrar el cuerpo de la respuesta
          throw new Error('Error en la solicitud de inicio de sesión');
        }
    
        
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        console.log('Sesión iniciada correctamente:', data);
        console.log('Token almacenado:', localStorage.getItem('authToken'));
       
         
      setSuccessMessage('Inicio de sesión exitoso');
      
      
      setTimeout(() => {
        window.location.href = '/songs';
      }, 1500); 
      
    } catch (err) {
        setError(err.message);
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const handleSubmit = (e) => {
      e.preventDefault(); 
      setLoading(true); 
      handleLogin(); 
    };
  
  return (
    <div className="login-container">
  <h2>Iniciar Sesión</h2>
  <form onSubmit={handleSubmit} className="login-form">
    <div className="input-group">
      <label htmlFor="username" className="login-label">Nombre de Usuario:</label>
      <input
        type="text"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="login-input"
      />
    </div>
    <div className="input-group">
      <label htmlFor="password" className="login-label">Contraseña:</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="login-input"
      />
    </div>
    <button type="submit" disabled={loading} className="login-button">
      {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
    </button>
    {error && <p className="error">{error}</p>}
    {successMessage && <p className="success">{successMessage}</p>}
  </form>
</div>

  );
};

export default Login;
