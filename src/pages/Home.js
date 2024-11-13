import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, IconButton, Avatar, Drawer, List, ListItem, ListItemText,
    ListItemIcon, Divider, Box, Typography, Grid, Dialog, DialogTitle,
    DialogActions, Button, Select, MenuItem, TextField,RadioGroup,FormControlLabel,Radio
} from '@mui/material';
import { Dashboard, Folder, School, Topic, Add, Backup} from '@mui/icons-material';
import Chart from 'react-apexcharts'; // For displaying charts
import axios from 'axios';
import CreateItemForm from '../components/CreateItemForm'; // Importing CreateItemForm
import UpdateProjectForm from '../components/UpdateProjectForm';
import ProjectTab from '../tabs/ProjectTab';
import MajorTab from '../tabs/MajorTab';
import TopicTab from '../tabs/TopicTab';
import BackUpTab from '../tabs/BackUpTab';
const api = axios.create({
    baseURL: 'http://graduationshowcase.online/api/v1',
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
    const [openProjectForm, setOpenProjectForm] = useState(false); // State for CreateItemForm
    const [currentItemType, setCurrentItemType] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [formValues, setFormValues] = useState({ name: '', majorId: '' });
    const [selectedProject, setSelectedProject] = useState(null); // Selected project for editing
    const [openUpdateProjectForm, setOpenUpdateProjectForm] = useState(false); 

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
    
    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const projects = response.data.data.map(project => ({
                ...project,
                topicName: project.topic ? project.topic.name : '', // Flattening the topic name
                hashtags: project.hashtags.join(', '), // Converting hashtags array to a string
            }));

            setData((prevData) => ({
                ...prevData,
                projects
            }));
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchBackups = async () => {
        try {
            const response = await api.get('/backups/database');
            // Ensure we update only the backups array and not overwrite the entire data state
            if (Array.isArray(response.data.data)) {
                setData((prevData) => ({
                    ...prevData, // Spread the previous data to keep other arrays intact
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


    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEditing) {
                // Update logic
                if (currentItemType === 'majors') {
                    await api.put(`/majors/${itemToEdit.id}`, { name: formValues.name }); // Update the correct major
                } else if (currentItemType === 'topics') {
                    await api.put(`/topics/${itemToEdit.id}`, { name: formValues.name });
                }
            } else {
                // Create logic
                if (currentItemType === 'majors') {
                    await api.post('/majors', { name: formValues.name });
                } else if (currentItemType === 'topics') {
                    await api.post(`/majors/${formValues.majorId}/topics`, { name: formValues.name });
                }
            }
            fetchMajors();
            fetchTopics(selectedMajor);
            fetchProjects();
            setOpenForm(false);
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleUpdateProjectClose = () => {
        setOpenUpdateProjectForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Xóa token
        window.location.href = '/'; // Điều hướng đến trang đăng nhập
    };
    

    return (
        <Box sx={{ display: 'flex' }}>
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
                        <ListItem>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-mEZMcexBGVNOrE63UGvgHwppdXEl96XdiA&s" alt="Logo" style={{ width: '100%' }} />
                        </ListItem>
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

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            Admin
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>Logout</Button> {/* Nút Logout ở bên phải */}
                    </Toolbar>
                </AppBar>
                <Toolbar />
                <Grid container spacing={3}>
                    {activeTab === 'dashboard' && (
                        <Grid item xs={12}>
                            <Chart options={{}} series={[{ name: 'Data', data: [1, 2, 3] }]} type="line" />
                        </Grid>
                    )}

                    {activeTab === 'projects' && (
                        <ProjectTab/>
                    )}
                    {activeTab === 'majors' && (
                        <MajorTab/>
                    )}
                    {activeTab === 'topics' && (
                        <TopicTab/>
                    )}
                    {activeTab === 'backups' && (
                        <BackUpTab/>
                    )}
                </Grid>

                <UpdateProjectForm
                    open={openUpdateProjectForm}
                    handleClose={handleUpdateProjectClose}
                    project={selectedProject} // Truyền dự án đang chỉnh sửa
                    onUpdate={fetchProjects} // Callback để làm mới danh sách dự án
                />
                <Dialog open={openForm} onClose={handleCreateClose}>
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
                                {/* Show major dropdown if the current item type is a topic */}
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
                    {/* CreateItemForm for projects */}
                    <CreateItemForm
                        open={openProjectForm}
                        handleClose={handleCreateClose}
                        project={selectedProject} // Pass the selected project for editing
                        onCreate={fetchProjects} // Callback to refetch projects after creation
                    />
            </Box>
        </Box>
    );
};
export default HomePage;
