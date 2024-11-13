import React, { useState, useEffect } from 'react';
import {
    Box, Grid, IconButton, Dialog, DialogTitle, DialogActions, Button
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid'; // Import from MUI for table
import axios from 'axios';
import UpdateProjectForm from '../components/UpdateProjectForm';

const api = axios.create({
    baseURL: 'http://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Token from localStorage
    }
});

const ProjectTab = () => {
    const [data, setData] = useState({
        projects: [],
    });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null); 
    
    const [openUpdateProjectForm, setOpenUpdateProjectForm] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const projects = response.data.data.map(project => ({
                ...project,
                topicName: project.topic ? project.topic.name : '', // Flattening the topic name
                hashtags: project.hashtags.join(', '), // Converting hashtags array to a string
                description: project.description.map(desc => desc.title).join(', ') // Extracting only titles from descriptions
            }));
    
            setData((prevData) => ({
                ...prevData,
                projects
            }));
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
            fetchProjects();
            setOpenConfirm(false);
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

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* DataGrid */}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <DataGrid
                        rows={data.projects}
                        columns={[
                            { field: 'id', headerName: 'ID', width: 90 },
                            { field: 'title', headerName: 'Title', width: 200 },
                            { field: 'description', headerName: 'Description', width: 300 },
                            { field: 'topicName', headerName: 'Topic', width: 150 },
                            { field: 'hashtags', headerName: 'Hashtags', width: 250 },
                            {
                                field: 'action',
                                headerName: 'Action',
                                renderCell: (params) => (
                                    <div>
                                        <IconButton onClick={() => handleProjectEdit(params.row.id)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleProjectDeleteClick(params.row.id)}>
                                            <Delete />
                                        </IconButton>
                                    </div>
                                ),
                            },
                        ]}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                    />
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
        </Box>
    );
};

export default ProjectTab;
