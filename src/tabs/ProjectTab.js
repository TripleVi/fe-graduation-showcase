import React, { useState, useEffect } from 'react';
import {
    Box, Grid, IconButton, Dialog, DialogTitle, DialogActions, Button, Snackbar, Alert, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import UpdateProjectForm from '../components/UpdateProjectForm';

const api = axios.create({
    baseURL: 'https://graduationshowcase.onrender.com/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Token from localStorage
    }
});

const ProjectTab = () => {
    const [data, setData] = useState({
        projects: [],
    });
    const [totalItems, setTotalItems] = useState(0); // Store total number of items
    const [openConfirm, setOpenConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null); 
    const [openUpdateProjectForm, setOpenUpdateProjectForm] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Message for Snackbar
    const [page, setPage] = useState(0); // Current page number
    const [pageSize, setPageSize] = useState(25); // Rows per page (25 projects per page)

    useEffect(() => {
        // Fetch projects when the component mounts or page changes
        fetchProjects(page, pageSize);
    }, [page, pageSize]); // Re-fetch when page or pageSize changes

    const fetchProjects = async (page, pageSize) => {
        try {
            const offset = page * pageSize; // Offset dựa trên trang hiện tại
            const response = await api.get('/projects', {
                params: {
                    offset,
                    limit: pageSize,
                },
            });
    
            const projects = response.data.data ? response.data.data.map((project, index) => ({
                ...project,
                id: project.id,
                rowNumber: offset + index + 1,
                topicName: project.topic ? project.topic.name : '',
                hashtags: project.hashtags.join(', '),
            })) : [];
    
            setData({ projects });
            setTotalItems(response.data.metadata.totalItems); // Cập nhật tổng số lượng
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleProjectDeleteClick = (id) => {
        setItemToDelete(id);
        setOpenConfirm(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/projects/${itemToDelete}`);
            // Remove the deleted project from the state without re-fetching
            setData((prevData) => ({
                ...prevData,
                projects: prevData.projects.filter(project => project.id !== itemToDelete)
            }));
            setOpenConfirm(false);
            setSnackbarMessage('Project deleted successfully');
            setOpenSnackbar(true); // Show Snackbar after successful deletion
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleProjectEdit = (projectId) => {
        const project = data.projects.find(p => p.id === projectId);
        setSelectedProject(project); // Pass the full project object for editing
        setOpenUpdateProjectForm(true); // Open UpdateProjectForm
    };

    const handleUpdateProjectClose = () => {
        setOpenUpdateProjectForm(false);
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage); // Update the current page
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value, 10)); // Update the page size
        setPage(0); // Reset to the first page
    };

    return (
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {data.projects.length === 0 ? (
                        <Typography variant="h6" align="center" color="textSecondary">
                            No project right now
                        </Typography>
                    ) : (
                        <div>
                            <TableContainer sx={{ boxShadow: 3, borderRadius: 1, overflow: 'hidden' }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>No.</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Topic</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Hashtags</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.projects.map((project) => (
                                            <TableRow key={project.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                                                <TableCell>{project.rowNumber}</TableCell>
                                                <TableCell>{project.title}</TableCell>
                                                <TableCell>{project.topicName}</TableCell>
                                                <TableCell>{project.hashtags}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleProjectEdit(project.id)} sx={{ color: '#1976d2' }}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleProjectDeleteClick(project.id)} sx={{ color: '#d32f2f' }}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[25, 50, 100]}
                                component="div"
                                count={totalItems}
                                rowsPerPage={pageSize}
                                page={page}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handlePageSizeChange}
                                sx={{ marginTop: 2 }}
                            />
                        </div>
                    )}
                </Grid>
            </Grid>

            {/* UpdateProjectForm Dialog */}
            <UpdateProjectForm
                open={openUpdateProjectForm}
                handleClose={handleUpdateProjectClose}
                project={selectedProject} // Passing selected project for editing
                onUpdate={fetchProjects} // Callback to refresh the list of projects
            />

            {/* Confirmation Dialog for Deletion */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                    <Button onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProjectTab;
