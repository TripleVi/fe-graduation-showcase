// src/pages/NoPermissionPage.js
import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NoPermissionPage = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/'); // Redirect the user to the login page
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20%' }}>
      <h2>You do not have permission to access this page</h2>
      <p>Please contact the administrator if you believe this is an error.</p>
      <Button variant="contained" onClick={handleRedirect}>
        Go back
      </Button>
    </div>
  );
};

export default NoPermissionPage;
