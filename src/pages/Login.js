import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Paper, IconButton, InputAdornment } from '@mui/material';
import { Google as GoogleIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase-config';
import axios from 'axios';
import '../css/Login.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://graduationshowcase.onrender.com/api/v1/auth/sign-in', {
                username: username,
                password: password,
            });
            localStorage.setItem('token', response.data.token);
            window.location.href = '/home';
        } catch (error) {
            if (error.response && error.response.status === 401) {
                if (error.response.data.message === 'Invalid username') {
                    setErrorMessage('Incorrect login name. Please try again.');
                } else if (error.response.data.message === 'Invalid password') {
                    setErrorMessage('Password is incorrect. Please try again.');
                } else {
                    setErrorMessage('Incorrect username or password.');
                }
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            
            const tokenResponse = await axios.post(
                'https://graduationshowcase.onrender.com/api/v1/auth/google',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );
            
            const backendToken = tokenResponse.data.token;
            localStorage.setItem('token', backendToken);
            localStorage.setItem('avatar', result.user.photoURL);
            localStorage.setItem('name', result.user.displayName);
            localStorage.setItem('email', result.user.email);
    
            window.location.href = '/userhome';
        } catch (error) {
            console.error('Google login or sending token error:', error);
            setErrorMessage('Failed to sign in with Google. Please try again.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-wrapper">
                <div className="login-left">
                    <div className="login-left-content">
                        <h1>Welcome to Graduation Showcase</h1>
                        <p>Share your projects and connect with other students</p>
                    </div>
                </div>
                
                <div className="login-right">
                    <div className="login-form-container">
                        <div className="login-header">
                            <h2>Sign In</h2>
                            <p>Welcome back! Please enter your details</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="login-input"
                                />
                            </div>

                            <div className="form-group">
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>

                            {errorMessage && (
                                <div className="error-message">
                                    {errorMessage}
                                </div>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                className="login-button"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={handleGoogleLogin}
                            className="google-button"
                        >
                            Sign in with Google
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
