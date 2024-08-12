
import { Link } from 'react-router-dom';
import './Navbar.css'; 
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-inicio">INICIO</Link>
        <ul className="navbar-menu">
          <li><Link to="/login">INICIO DE SESION</Link></li>
          <li><Link to="/profile">PERFIL DE USUARIO</Link></li>
          <li><Link to="/songs">CANCIONES</Link></li>
          <li><Link to="/generos">GENEROS</Link></li>
          <li><Link to="/artistas">ARTISTAS</Link></li>
          <li><Link to="/albumes">ALBUMES</Link></li>
          <li><Link to="/playlists">LISTAS DE REPRODUCCION</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
