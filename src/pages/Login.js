import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { signInWithPopup } from 'firebase/auth'; // Import Firebase authentication functions
import { auth, provider } from '../firebase-config'; // Import cấu hình Firebase
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
            const response = await axios.post('http://graduationshowcase.online/api/v1/auth/sign-in', {
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

    // Gửi ID token từ Firebase tới back-end
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);  // Đăng nhập bằng Google
            const idToken = await result.user.getIdToken();  // Lấy ID token
            console.log('Google ID Token:', idToken);  // In ra token để kiểm tra
    
            // Gửi ID token tới backend để đổi lấy token khác
            const tokenResponse = await axios.post(
                'http://graduationshowcase.online/api/v1/auth/google',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,  // Gửi ID token trong header Authorization
                    },
                }
            );
            //console.log(token);
            // Lấy token từ phản hồi và lưu vào localStorage
            const backendToken = tokenResponse.data.token;
            localStorage.setItem('token', backendToken);  // Lưu token của back-end
            localStorage.setItem('avatar', result.user.photoURL); // Lưu avatar người dùng
            localStorage.setItem('name', result.user.displayName); // Lưu tên người dùng
            localStorage.setItem('email', result.user.email); // Lưu email người dùng
    
            window.location.href = '/userhome';  // Chuyển hướng sau khi đăng nhập thành công
        } catch (error) {
            console.error('Google login or sending token error:', error);
        }
    };
    
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <Grid item xs={false} sm={4} md={7} sx={{
                backgroundImage: 'url(https://img.freepik.com/free-vector/flat-university-concept-background_23-2148189718.jpg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className="login-container">
                    <Typography variant="h4" gutterBottom>
                        Welcome back!
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        If you are an Admin, please login below.
                    </Typography>

                    <form noValidate onSubmit={handleLogin}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="text-field"
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="text-field"
                            InputProps={{
                                endAdornment: (
                                    <Button onClick={toggleShowPassword}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Button>
                                ),
                            }}
                        />

                        {errorMessage && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {errorMessage}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2, padding: '10px 0', fontWeight: 'bold' }}
                        >
                            Login
                        </Button>
                    </form>

                    <Typography variant="body1" gutterBottom style={{ marginTop: '20px' }}>
                        If you are a user, please sign in with Google:
                    </Typography>

                    {/* Nút đăng nhập bằng Google */}
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleLogin}  // Thêm sự kiện đăng nhập Google
                        className="google-button"
                    >
                        Sign in with Google
                    </Button>
                </div>
            </Grid>
        </Grid>
    );
};

export default LoginPage;