import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Navbar.css';

interface NavbarProps {
    isLoggedIn: boolean;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">MEDICAL CHATBOT</Link>
            <div className="navbar-links">
                {!isLoggedIn && <Link to="/login" className="navbar-link">Login</Link>}
                {!isLoggedIn && <Link to="/register" className="navbar-link">Register</Link>}
                {isLoggedIn && <Link to="/home" className="navbar-link">Home</Link>}
                {isLoggedIn && <Link to="/chatbot" className="navbar-link">Chatbot</Link>}
                {isLoggedIn && <button onClick={handleLogout} className="navbar-link logout-button">Logout</button>}
            </div>
        </nav>
    );
};

export default Navbar;