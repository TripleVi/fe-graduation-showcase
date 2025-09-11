import React, { useContext, useEffect, useState } from "react";
import Headroom from "react-headroom";
import "../css/Header.css";
import { useNavigate, Link } from 'react-router-dom';
import { Button, MenuItem, IconButton, Avatar, Menu } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ProjectIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';

function Header() {
    const [user, setUser] = useState({
        avatar: '',
        name: '',
        email: '',
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            setUser({
                avatar: localStorage.getItem('avatar') || 'https://via.placeholder.com/40',
                name: localStorage.getItem('name'),
                email: localStorage.getItem('email'),
            });
        }
    }, []);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const handleNavigate = (path) => {
        navigate(path);
        handleMenuClose();
    };

    return (
        <Headroom>
            <header className="header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/userhome" className="logo">
                        <img 
                            src="/logo.jpg"
                            alt="Logo"
                            className="logo-image"
                        />
                    </Link>
                    
                    {isLoggedIn && (
                        <nav className="nav-links">
                            <Link to="/" className="nav-link">
                                <HomeIcon sx={{ mr: 1 }} />
                                Home
                            </Link>
                            <Link to="/userhome" className="nav-link">
                                <ProjectIcon sx={{ mr: 1 }} />
                                Projects
                            </Link>
                            {/* <Link to="/chat" className="nav-link">
                                <ChatIcon sx={{ mr: 1 }} />
                                Chat
                            </Link> */}
                        </nav>
                    )}
                </div>

                <div className="menu">
                    {isLoggedIn ? (
                        <>
                            <IconButton 
                                onClick={handleAvatarClick}
                                sx={{ padding: 0 }}
                            >
                                <Avatar 
                                    src={user.avatar} 
                                    alt={user.name}
                                    sx={{ 
                                        width: 40, 
                                        height: 40,
                                    }}
                                />
                            </IconButton>
                            {isClient && (
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    disableScrollLock={true}
                                    PaperProps={{
                                        elevation: 3,
                                        sx: {
                                            mt: 1.5,
                                            borderRadius: 2,
                                            minWidth: 200,
                                        }
                                    }}
                                >
                                    <MenuItem 
                                        onClick={() => handleNavigate('/profile')}
                                        sx={{ 
                                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {user.name}
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={() => handleNavigate('/profile')}
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        {user.email}
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={handleLogout}
                                        sx={{ 
                                            color: 'error.main',
                                            mt: 1
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Menu>
                            )}
                        </>
                    ) : (
                        <Button 
                            className="login-button"
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                    )}
                </div>
            </header>
        </Headroom>
    );
}

export default Header;
