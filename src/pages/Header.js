import React, { useContext, useEffect, useState } from "react";
import Headroom from "react-headroom";
import "../css/Header.css";
import ToggleSwitch from "../pages/ToggleSwitch";
import StyleContext from "../contexts/StyleContext";
import { useNavigate } from 'react-router-dom';
import { Button, MenuItem, IconButton, Avatar, Menu } from '@mui/material';

function Header() {
    const { isDark } = useContext(StyleContext);
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
        setIsClient(true); // This ensures the component only renders on the client
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            setUser({
                avatar: localStorage.getItem('avatar'),
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

    return (
        <Headroom>
            <header className={isDark ? "dark-menu header" : "header"}>
                <a href="/" className="logo">
                    <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-mEZMcexBGVNOrE63UGvgHwppdXEl96XdiA&s" 
                        alt="Logo"
                        className="logo-image"
                    />
                </a>
                <ul className={isDark ? "dark-menu menu" : "menu"}>
                    {isLoggedIn ? (
                        <>
                            <IconButton onClick={handleAvatarClick}>
                                <Avatar src={user.avatar} alt={user.name} />
                            </IconButton>
                            {isClient && (
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    disableScrollLock={true} // This line prevents document errors
                                >
                                    <MenuItem onClick={handleMenuClose}>Name: {user.name}</MenuItem>
                                    <MenuItem onClick={handleMenuClose}>Email: {user.email}</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            )}
                        </>
                    ) : (
                        <Button color="primary" variant="outlined" onClick={() => navigate('/')}>
                            Login
                        </Button>
                    )}
                    <li>
                        <a>
                            <ToggleSwitch />
                        </a>
                    </li>
                </ul>
            </header>
        </Headroom>
    );
}

export default Header;
