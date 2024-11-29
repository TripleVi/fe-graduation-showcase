import React, { useState, useEffect } from 'react';
import {
    IconButton, Box, Grid, Dialog, DialogTitle,
    DialogActions, Button, TextField, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Token from localStorage
    }
});

const MajorTab = () => {
    const [data, setData] = useState({
        majors: [],
        topics: []
    });
    const [openForm, setOpenForm] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [formValues, setFormValues] = useState({ name: '', majorId: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    
    useEffect(() => {
        fetchMajors();
        fetchTopics();
    }, []);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const fetchMajors = async () => {
        try {
            const response = await api.get('/majors');
            setData((prevData) => ({
                ...prevData,
                majors: Array.isArray(response.data.data) ? response.data.data : []
            }));
        } catch (error) {
            console.error('Error fetching majors:', error);
        }
    };

    const fetchTopics = async (majorId = '') => {
        try {
            const response = await api.get('/topics');
            setData((prevData) => ({
                ...prevData,
                topics: Array.isArray(response.data.data) ? response.data.data : []
            }));
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    };
    
    const handleDelete = async () => {
        try {
            if (itemToDelete) {
                await api.delete(`/majors/${itemToDelete}`);
                setSnackbarMessage('Major deleted successfully');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setData((prevData) => ({
                    ...prevData,
                    majors: prevData.majors.filter((major) => major.id !== itemToDelete)
                }));
            }
            setOpenConfirm(false);
        } catch (error) {
            setSnackbarMessage('Error deleting major');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            console.error('Error deleting item:', error);
        }
    };

    const handleCreateClose = () => {
        setOpenForm(false);
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setOpenConfirm(true);
    };

    const handleEdit = (row) => {
        setItemToEdit(row);
        setFormValues({ name: row.name, majorId: row.majorId || '' });
        setOpenForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
    
        try {
            if (itemToEdit) {
                await api.put(`/majors/${itemToEdit.id}`, { name: formValues.name });
                setSnackbarMessage('Major updated successfully');
                setSnackbarSeverity('success');
                setData((prevData) => ({
                    ...prevData,
                    majors: prevData.majors.map((major) =>
                        major.id === itemToEdit.id ? { ...major, name: formValues.name } : major
                    ),
                }));
            } else {
                await api.post('/majors', { name: formValues.name });
            }
            setOpenSnackbar(true);
            fetchMajors();
            setOpenForm(false);
        } catch (error) {
            setSnackbarMessage('Error saving major');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            console.error('Error saving item:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Grid item xs={12}>
            <DataGrid
                rows={data.majors.map((major, index) => ({
                    ...major,
                    no: index + 1,  // Tính số thứ tự (index + 1)
                }))}
                columns={[
                    {
                        field: 'no',
                        headerName: 'No.',
                        width: 90,
                        renderCell: (params) => <span>{params.row.no}</span>,  // Hiển thị số thứ tự
                    },
                    { field: 'name', headerName: 'Name', flex: 1 },
                    {
                        field: 'actions',
                        headerName: 'Actions',
                        renderCell: (params) => (
                            <>
                                <IconButton onClick={() => handleEdit(params.row)}><Edit /></IconButton>
                                <IconButton onClick={() => handleDeleteClick(params.row.id)}><Delete /></IconButton>
                            </>
                        ),
                        flex: 1,
                    }
                ]}
                pageSize={5}
            />
            </Grid>

            <Dialog open={openForm} onClose={handleCreateClose}>
                <DialogTitle>{itemToEdit ? 'Edit Major' : 'Create Major'}</DialogTitle>
                <form onSubmit={handleFormSubmit}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            label="Name"
                            value={formValues.name}
                            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                            fullWidth
                            required
                        />
                    </Box>
                    <DialogActions>
                        <Button onClick={handleCreateClose}>Cancel</Button>
                        <Button type="submit">{itemToEdit ? 'Update' : 'Create'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                    <Button onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MajorTab;
