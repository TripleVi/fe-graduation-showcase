import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, MenuItem, Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const CreateItemForm = ({ open, handleClose, project, onCreate }) => {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || [{ title: '', content: '' }],
        authors: [{ name: '', email: '', avatar: null }],
        photos: [],
        report: null,
        year: project?.year || 2024,
        topicId: project?.topicId || 1,
        hashtags: Array.isArray(project?.hashtags) ? project.hashtags.join(', ') : '',
    });

    const [topics, setTopics] = useState([]);

    const api = axios.create({
        baseURL: 'http://graduationshowcase.online/api/v1',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    // Fetch topics from API
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await api.get('/topics');
                if (response.data && Array.isArray(response.data.data)) {
                    setTopics(response.data.data);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setTopics([]);
                }
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };
        fetchTopics();
    }, []);

    // Reset form data when opening the form
    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title || '',
                description: project.description || [{ title: '', content: '' }],
                authors: project.authors || [{ name: '', email: '', avatar: null }],
                photos: [],
                report: null,
                year: project.year || 2024,
                topicId: project.topicId || '',
                hashtags: Array.isArray(project.hashtags) ? project.hashtags.join(', ') : '',
            });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        const nameParts = name.split('.');
        if (nameParts[0] === 'authors') {
            const index = parseInt(nameParts[1].match(/\d+/)[0]);
            const field = nameParts[2];
            const updatedAuthors = [...formData.authors];
            updatedAuthors[index] = { ...updatedAuthors[index], [field]: files ? files[0] : value };
            setFormData({ ...formData, authors: updatedAuthors });
        } else if (nameParts[0] === 'description') {
            const index = parseInt(nameParts[1]);
            const field = nameParts[2];
            const updatedDescription = [...formData.description];
            updatedDescription[index] = { ...updatedDescription[index], [field]: value };
            setFormData({ ...formData, description: updatedDescription });
        } else if (name === 'photos') {
            setFormData({ ...formData, photos: [...formData.photos, ...Array.from(files)] });
        } else {
            setFormData({ ...formData, [name]: files ? files[0] : value });
        }
    };

    const handleAddDescription = () => {
        setFormData({
            ...formData,
            description: [...formData.description, { title: '', content: '' }],
        });
    };

    const handleAddAuthor = () => {
        setFormData({
            ...formData,
            authors: [...formData.authors, { name: '', email: '', avatar: null }],
        });
    };

    const handleRemovePhoto = (indexToRemove) => {
        setFormData({
            ...formData,
            photos: formData.photos.filter((_, index) => index !== indexToRemove),
        });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const { title, description, year, topicId, hashtags, authors, photos, report } = formData;
    
    //     const projectData = {
    //         title,
    //         description,
    //         year,
    //         topicId,
    //         hashtags: hashtags.split(',').map(tag => tag.trim()),
    //         authors: authors.map((author, index) => ({
    //             name: author.name.trim(),
    //             email: author.email.trim() || `author@example.com`,
    //             fileIndex: author.avatar ? index : null,  // Include the fileIndex if avatar is provided
    //         })),
    //     };
    
    //     const form = new FormData();
    //     form.append('project', JSON.stringify(projectData));
    
    //     // Append multiple photos
    //     if (photos.length > 0) {
    //         photos.forEach((photo) => {
    //             form.append('photos', photo);
    //         });
    //     }
    
    //     // Append report
    //     if (report) {
    //         form.append('report', report);
    //     }
    
    //     // Append avatars for authors with unique keys
    //     authors.forEach((author, index) => {
    //         if (author.avatar) {
    //             form.append('avatars', author.avatar); // Remove the index part
    //         }
    //     });
    
    //     try {
    //         if (project) {
    //             await api.put(`/projects/${project.id}`, form, {
    //                 headers: { 'Content-Type': 'multipart/form-data' },
    //             });
    //         } else {
    //             await api.post('/projects', form, {
    //                 headers: { 'Content-Type': 'multipart/form-data' },
    //             });
    //         }
    
    //         onCreate();
    //         handleClose();
    //     } catch (error) {
    //         console.error('Error creating/updating project:', error);
    //     }
    // };    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, description, year, topicId, hashtags, authors, photos, report } = formData;
    
        const projectData = {
            title,
            description,
            year,
            topicId,
            hashtags: hashtags.split(',').map(tag => tag.trim()),
            authors: authors.map((author, index) => ({
                name: author.name.trim(),
                email: author.email.trim() || `author@example.com`,
                fileIndex: author.avatar ? index : null,
            })),
        };
    
        const form = new FormData();
        form.append('project', JSON.stringify(projectData));
    
        if (photos.length > 0) {
            photos.forEach((photo) => {
                form.append('photos', photo);
            });
        }
    
        if (report) {
            form.append('report', report);
        }
    
        authors.forEach((author, index) => {
            if (author.avatar) {
                form.append('avatars', author.avatar);
            }
        });
    
        try {
            if (project) {
                await api.put(`/projects/${project.id}`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/projects', form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
    
            onCreate();
            handleClose();
        } catch (error) {
            console.error('Error creating/updating project:', error);
        }
    };    

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogContent>
                <TextField
                    label="Title"
                    name="title"
                    fullWidth
                    margin="normal"
                    value={formData.title}
                    onChange={handleChange}
                />
                {formData.description.map((desc, index) => (
                    <Grid container spacing={2} key={index} marginTop={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Description Title"
                                name={`description.${index}.title`}
                                fullWidth
                                margin="normal"
                                value={desc.title}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Content"
                                name={`description.${index}.content`}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={4}
                                value={desc.content}
                                onChange={handleChange}
                                variant="outlined"
                                style={{ maxHeight: 200, overflowY: 'auto' }}
                            />
                        </Grid>
                    </Grid>
                ))}

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddDescription}
                    style={{ marginTop: '10px' }}
                >
                    Add Description Section
                </Button>

                <TextField
                    label="Hashtags (comma separated)"
                    name="hashtags"
                    fullWidth
                    margin="normal"
                    value={formData.hashtags}
                    onChange={handleChange}
                />
                <TextField
                    label="Year"
                    name="year"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={formData.year}
                    onChange={handleChange}
                />
                <TextField
                    select
                    label="Topic"
                    name="topicId"
                    fullWidth
                    margin="normal"
                    value={formData.topicId || ''}
                    onChange={handleChange}
                >
                    {topics.length > 0 ? (
                        topics.map(topic => (
                            <MenuItem key={topic.id} value={topic.id}>
                                {topic.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>No topics available</MenuItem>
                    )}
                </TextField>

                {formData.authors.map((author, index) => (
                    <Grid container spacing={2} key={index} marginTop={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Author Name"
                                name={`authors.${index}.name`}
                                fullWidth
                                margin="normal"
                                value={author.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Author Email"
                                name={`authors.${index}.email`}
                                fullWidth
                                margin="normal"
                                value={author.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <input
                                type="file"
                                name={`authors.${index}.avatar`}
                                accept="image/*"
                                onChange={handleChange}
                            />
                            <label>Avatar: File</label>
                        </Grid>
                    </Grid>
                ))}
                <Button variant="outlined" onClick={handleAddAuthor}>
                    Add Author
                </Button>

                <Grid container spacing={2} marginTop={2}>
                    <Grid item xs={6}>
                        <input
                            type="file"
                            name="photos"
                            accept="image/*"
                            multiple
                            onChange={handleChange}
                        />
                        <label>Photos: File</label>
                    </Grid>
                    <Grid item xs={6}>
                        <input
                            type="file"
                            name="report"
                            accept="application/pdf"
                            onChange={handleChange}
                        />
                        <label>Report: File</label>
                    </Grid>
                </Grid>

                {formData.photos.length > 0 && (
                    <Grid container spacing={2} marginTop={2}>
                        {formData.photos.map((photo, index) => (
                            <Grid item xs={12} key={index}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span>{photo.name}</span>
                                    <IconButton onClick={() => handleRemovePhoto(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    {project ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateItemForm;
