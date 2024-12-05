import React, { useState, useEffect } from 'react';
import '../css/Home.css'; // Importing Home.css for styling
import {
    AppBar, Toolbar, IconButton, Avatar, Drawer, List, ListItem, ListItemText,
    ListItemIcon, Divider, Box, Typography, Grid, Dialog, DialogTitle,
    DialogActions, Button, Select, MenuItem, TextField, Snackbar, Alert
} from '@mui/material';
import {Dashboard, Folder, School, Topic, Add, Backup} from '@mui/icons-material';

import axios from 'axios';
import CreateItemForm from '../components/CreateItemForm'; // Importing CreateItemForm
import UpdateProjectForm from '../components/UpdateProjectForm';
import ProjectTab from '../tabs/ProjectTab';
import MajorTab from '../tabs/MajorTab';
import TopicTab from '../tabs/TopicTab';
import BackUpTab from '../tabs/BackUpTab';
import DashboardTab from '../tabs/Dashboard';

const api = axios.create({
    baseURL: 'https://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Token from localStorage
    }
});

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [data, setData] = useState({
        projects: [],
        majors: [],
        topics: [],
        backups: []
    });
    const [openForm, setOpenForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openProjectForm, setOpenProjectForm] = useState(false); // State for CreateItemForm
    const [currentItemType, setCurrentItemType] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [formValues, setFormValues] = useState({ name: '', majorId: '' });
    const [selectedProject, setSelectedProject] = useState(null); // Selected project for editing
    const [openUpdateProjectForm, setOpenUpdateProjectForm] = useState(false); 
    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar open state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity (success, error)
    const [projects, setProjects] = useState([]);
    useEffect(() => {
        fetchProjects();
        fetchMajors();
        fetchTopics();
        fetchBackups();
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
            // setSnackbarMessage(errorMessage);
            // setSnackbarSeverity('error');
            // setOpenSnackbar(true);
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
            // setSnackbarMessage(errorMessage);
            // setSnackbarSeverity('error');
            // setOpenSnackbar(true);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            if (response.data && response.data.data) {
                setProjects(response.data.data);
            } else {
                console.error('Unexpected response format:', response);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            // setSnackbarMessage(errorMessage);
            // setSnackbarSeverity('error');
            // setOpenSnackbar(true);
        }
    };

    const fetchBackups = async () => {
        try {
            const response = await api.get('/backups/database');
            if (Array.isArray(response.data.data)) {
                setData((prevData) => ({
                    ...prevData,
                    backups: response.data.data
                }));
            } else {
                setData((prevData) => ({
                    ...prevData,
                    backups: []
                }));
            }
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleCreateOpen = (itemType) => {
        setCurrentItemType(itemType);
        setIsEditing(false);
        setFormValues({ name: '', majorId: '' });
        setOpenForm(true);
    };

    const handleProjectCreateOpen = () => {
        setSelectedProject(null); // Clear project for a new one
        setOpenProjectForm(true); // Open CreateItemForm
    };

    const handleCreateClose = () => {
        setOpenForm(false);
        setOpenProjectForm(false); // Close CreateItemForm
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token
        window.location.href = '/login'; // Redirect to login page
    };
    
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formValues.name || (currentItemType === 'topics' && !formValues.majorId)) {
            setSnackbarMessage('Please fill in all required fields.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return; // Stop form submission if validation fails
        }
        setIsSubmitting(true);
        try {
            if (currentItemType === 'majors') {
                const response = await api.post('/majors', { name: formValues.name });
                const newMajor = response.data.data;
                setData((prevData) => ({
                    ...prevData,
                    majors: [newMajor, ...prevData.majors],
                }));
                setSnackbarMessage('Major created successfully');
                setSnackbarSeverity('success');
                // Update majors in the data state and also fetch again
                setOpenSnackbar(true);
                setOpenForm(false);
                await fetchMajors();
            } else if (currentItemType === 'topics') {
                const response = await api.post(`/majors/${formValues.majorId}/topics`, { name: formValues.name });
                const newTopic = response.data.data; // Lấy Topic mới được trả về
                setData((prevData) => ({
                    ...prevData,
                    topics: [newTopic, ...prevData.topics], // Cập nhật danh sách topics
                }));
                setSnackbarMessage('Topic created successfully');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setOpenForm(false);
                await fetchTopics();
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setSnackbarMessage('Topic name already exists.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }else if(error.response && error.response.status === 400){
                setSnackbarMessage('Major name already exists.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            }
            else {
                setSnackbarMessage('Error saving items');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                console.error('Error saving item:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    

    const handleProjectCreateSuccess = () => {
        setSnackbarMessage('Project created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchProjects(); // Fetch projects after successful creation
    };
    

    return (
        <Box sx={{ display: 'flex' }} className="home-container">
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' }
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem button onClick={() => handleTabChange('dashboard')}>
                            <ListItemIcon><Dashboard /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('projects')}>
                            <ListItemIcon><Folder /></ListItemIcon>
                            <ListItemText primary="Projects" />
                            <IconButton onClick={handleProjectCreateOpen}><Add /></IconButton>
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('majors')}>
                            <ListItemIcon><School /></ListItemIcon>
                            <ListItemText primary="Majors" />
                            <IconButton onClick={() => handleCreateOpen('majors')}><Add /></IconButton>
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('topics')}>
                            <ListItemIcon><Topic /></ListItemIcon>
                            <ListItemText primary="Topics" />
                            <IconButton onClick={() => handleCreateOpen('topics')}><Add /></IconButton>
                        </ListItem>
                        <ListItem button onClick={() => handleTabChange('backups')}>
                            <ListItemIcon><Backup /></ListItemIcon>
                            <ListItemText primary="Backups" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }} className="main-content">
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            Admin Dashboard
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </Toolbar>
                </AppBar>
                <Toolbar />
                <Grid container spacing={3}>
                    {activeTab === 'dashboard' && (
                        <DashboardTab/>
                    )}
                    {activeTab === 'projects' && (
                        <ProjectTab projects={projects} />
                    )}
                    {activeTab === 'majors' && (
                        <MajorTab majors={data.majors}/>
                    )}
                    
                    {activeTab === 'topics' && (
                        <TopicTab topics={data.topics}/>
                    )}
                    {activeTab === 'backups' && (
                        <BackUpTab/>
                    )}
                </Grid>

                <CreateItemForm
                    open={openProjectForm}
                    handleCreateClose={handleCreateClose}
                    onCreateSuccess={handleProjectCreateSuccess}
                />

                <Dialog open={openForm} onClose={handleCreateClose}
                    sx={{
                        '& .MuiPaper-root': {
                            
                            maxWidth: 'none', // Remove the max width restriction
                            
                        }
                    }}
                
                >
                    <DialogTitle>{isEditing ? 'Edit ' + currentItemType : 'Create ' + currentItemType}</DialogTitle>
                    <form onSubmit={handleFormSubmit}>
                        <Box sx={{ p: 2 }}>
                            <TextField
                                label="Name"
                                value={formValues.name}
                                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                fullWidth
                                required
                            />
                            {currentItemType === 'topics' && (
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

                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

            </Box>
        </Box>
    );
};

export default HomePage;
