import React, { useState, useEffect } from 'react';
import {
    IconButton, Box, Grid, Dialog, DialogTitle,
    DialogActions, Button, Select, MenuItem, TextField, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid'; // Import from MUI for table
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Token from localStorage
    }
});

const TopicTab = () => {
    const [data, setData] = useState({
        projects: [],
        majors: [],
        topics: [],
        backups: []
    });
    const [openForm, setOpenForm] = useState(false);
    const [openProjectForm, setOpenProjectForm] = useState(false); // State for CreateItemForm
    const [isEditing, setIsEditing] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [formValues, setFormValues] = useState({ name: '', majorId: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        fetchMajors();
        fetchTopics();
    }, [selectedMajor]); // Fetch topics when the selected major changes

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

    const fetchTopics = async () => {
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
                await api.delete(`/topics/${itemToDelete}`);
                setSnackbarMessage('Topic deleted successfully');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setData((prevData) => ({
                    ...prevData,
                    topics: prevData.topics.filter((topic) => topic.id !== itemToDelete)
                }));
            }
            setOpenConfirm(false);
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleCreateClose = () => {
        setOpenForm(false);
        setOpenProjectForm(false); // Close CreateItemForm
    };

    const handleMajorChange = (event) => {
        const majorId = event.target.value;
        setSelectedMajor(majorId);
        setFormValues((prevValues) => ({
            ...prevValues,
            majorId // Gán ID của major vào formValues.majorId
        }));
        fetchTopics();
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setOpenConfirm(true);
    };

    const handleEdit = (row) => {
        setIsEditing(true);
        setItemToEdit(row); // Set the item to be edited
        setFormValues({ name: row.name, majorId: row.majorId || '' });
        setOpenForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update logic
                await api.put(`/topics/${itemToEdit.id}`, { name: formValues.name });
                setSnackbarMessage('Topic updated successfully');
                setSnackbarSeverity('success');
                // Update the topic directly in the state
                setData((prevData) => ({
                    ...prevData,
                    topics: prevData.topics.map(topic => 
                        topic.id === itemToEdit.id ? { ...topic, name: formValues.name } : topic
                    )
                }));
            } else {
                // Create logic
                const response = await api.post(`/majors/${formValues.majorId}/topics`, { name: formValues.name });
                // Add the new topic to the state
                setData((prevData) => ({
                    ...prevData,
                    topics: [response.data.data, ...prevData.topics], // Add new topic at the start of the list
                }));
            }
            setOpenSnackbar(true);
            fetchTopics();
            setOpenForm(false); // Close the form
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
                {/* <Select value={selectedMajor} onChange={handleMajorChange} displayEmpty>
                    <MenuItem value="">
                        <em>Select Major</em>
                    </MenuItem>
                    {data.majors.map((major) => (
                        <MenuItem key={major.id} value={major.id}>{major.name}</MenuItem>
                    ))}
                </Select> */}
                <DataGrid
                    rows={data.topics.map((topic, index) => ({
                        ...topic,
                        no: index + 1,  // Tính số thứ tự (index + 1)
                    }))}
                    columns={[
                        
                        {
                            field: 'no',
                            headerName: 'No.',
                            width: 90,
                            renderCell: (params) => <span>{params.row.no}</span>,  // Hiển thị số thứ tự
                        },
                        { field: 'name', headerName: 'Name', width: 200 },
                        {
                            field: 'actions',
                            headerName: 'Actions',
                            renderCell: (params) => (
                                <div>
                                    <IconButton onClick={() => handleEdit(params.row)}><Edit /></IconButton>
                                    <IconButton onClick={() => handleDeleteClick(params.row.id)}><Delete /></IconButton>
                                </div>
                            ),
                        }
                    ]}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    autoHeight
                />
            </Grid>

            <Dialog open={openForm} onClose={handleCreateClose}>
                <DialogTitle>{isEditing ? 'Edit Topic' : 'Create Topic'}</DialogTitle>
                <form onSubmit={handleFormSubmit}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            label="Name"
                            value={formValues.name}
                            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                            fullWidth
                            required
                        />
                        {isEditing && (
                            <Select
                                value={formValues.majorId}
                                onChange={(e) => setFormValues({ ...formValues, majorId: e.target.value })}
                                fullWidth
                                displayEmpty
                                required
                                sx={{ mt: 2 }}
                            >
                                <MenuItem value="" disabled>Select Major</MenuItem>
                                {data.majors.map((major) => (
                                    <MenuItem key={major.id} value={major.id}>{major.name}</MenuItem>
                                ))}
                            </Select>
                        )}
                    </Box>
                    <DialogActions>
                        <Button onClick={handleCreateClose}>Cancel</Button>
                        <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
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

export default TopicTab;
