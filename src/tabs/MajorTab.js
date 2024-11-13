import React, { useState, useEffect } from 'react';
import {
    IconButton, Box, Grid, Dialog, DialogTitle,
    DialogActions, Button, Select, MenuItem, TextField
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid'; // Import from MUI for table
import axios from 'axios';
const api = axios.create({
    baseURL: 'http://graduationshowcase.online/api/v1',
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
    
    useEffect(() => {
        fetchMajors();
        fetchTopics();
    }, []);

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
                fetchMajors();
            } 
            setOpenConfirm(false);
        } catch (error) {
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
                // Update logic
                await api.put(`/majors/${itemToEdit.id}`, { name: formValues.name });
            } else {
                // Create logic
                await api.post('/majors', { name: formValues.name });
            }
            fetchMajors();
            setOpenForm(false);
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Grid item xs={12}>
                <DataGrid rows={data.majors} columns={[
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
                ]} pageSize={5} />
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
        </Box>
    );
};

export default MajorTab;
