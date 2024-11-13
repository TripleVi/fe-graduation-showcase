import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    MenuItem,
    TextField,
    Grid,
    InputLabel,
    Select,
    FormControl
} from "@mui/material";
import axios from "axios";

const UpdateProjectForm = ({ open, handleClose, project, onUpdate }) => {
    const [section, setSection] = useState(""); // To control which section is being edited
    const [formData, setFormData] = useState({
        title: project?.title || "",
        description: project?.description || "",
        year: project?.year || 2024,
        topicId: project?.topicId || 1,
        hashtags: Array.isArray(project?.hashtags) ? project.hashtags.join(", ") : "",
        authors: [{ id: null, name: "", email: "", avatar: null }], // Default values
        photos: null,
        report: null,
        authorAvatar: null,
        videoId: project?.videoId || "",
    });
    const [topics, setTopics] = useState([]);
    const api = axios.create({
        baseURL: "http://graduationshowcase.online/api/v1",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const handleSectionChange = (e) => setSection(e.target.value);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name.startsWith("authors")) {
            const [_, index, field] = name.split(".");
            const updatedAuthors = [...formData.authors];
            updatedAuthors[parseInt(index)][field] = value;
            setFormData({ ...formData, authors: updatedAuthors });
        } else {
            setFormData({ ...formData, [name]: files ? files[0] : value });
        }
    };

    // Fetch project detail including authors
    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(`/projects/${project.id}`);
            const projectData = response.data;
            
            setFormData({
                title: projectData.title || "",
                description: projectData.description || "",
                year: projectData.year || 2024,
                topicId: projectData.topicId || 1,
                hashtags: Array.isArray(projectData.hashtags) ? projectData.hashtags.join(", ") : "",
                authors: Array.isArray(projectData.authors) && projectData.authors.length > 0 ? 
                    projectData.authors.map(author => ({
                        id: author.id || null,
                        name: author.name || "",
                        email: author.email || "",
                        avatar: author.avatar || null,
                    })) : 
                    [{ id: null, name: "", email: "", avatar: null }],
                videoId: projectData.videoId || "",
            });
        } catch (error) {
            console.error("Error fetching project details:", error);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [project]);

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

    const handleSubmit = async () => {
        debugger;
        if (!project || !project.id) {
            console.error("Project ID is undefined.");
            return;
        }

        try {
            if (section === "Information") {
                const { title, description, year, topicId, hashtags, videoId } = formData;
                const projectInfo = {
                    title,
                    description,
                    year,
                    topicId,
                    hashtags: hashtags.split(",").map(tag => tag.trim()),
                    videoId,
                };
                await api.put(`/projects/${project.id}`, projectInfo);
            } else if (section === "Report" && formData.report) {
                const form = new FormData();
                form.append("report", formData.report);
                await api.put(`/projects/${project.id}/report`, form);
            } else if (section === "Author") {
                const author = formData.authors[0]; 
                
                if (author.id) {
                    await api.put(`/authors/${author.id}`, {
                        name: author.name,
                        email: author.email,
                    });
                } else {
                    console.error("Author ID is undefined.");
                }
            } else if (section === "Avatar" && formData.authorAvatar) {
                const form = new FormData();
                form.append("avatar", formData.authorAvatar);  // Add the avatar file correctly here
                const author = formData.authors[0];
                if (author.id) {
                    await api.put(`/authors/${author.id}/avatar`, form, {
                        headers: {
                            'Content-Type': 'multipart/form-data',  // Make sure content type is set to multipart/form-data
                        }
                    });
                } else {
                    console.error("Author ID is undefined.");
                }
            }

            onUpdate(); 
            handleClose(); 
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Update Project</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Choose Section</InputLabel>
                    <Select
                        value={section}
                        onChange={handleSectionChange}
                        sx={{ width: '400px', mx: 2 }}
                    >
                        <MenuItem value="Information">Information</MenuItem>
                        <MenuItem value="Report">Report</MenuItem>
                        <MenuItem value="Author">Author</MenuItem>
                        <MenuItem value="Avatar">Author Avatar</MenuItem>
                    </Select>
                </FormControl>

                {section === "Information" && (
                    <>
                        <TextField
                            label="Title"
                            name="title"
                            fullWidth
                            margin="normal"
                            value={formData.title}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            fullWidth
                            margin="normal"
                            value={formData.description}
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
                            label="Hashtags (comma-separated)"
                            name="hashtags"
                            fullWidth
                            margin="normal"
                            value={formData.hashtags}
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
                        <TextField
                            label="Video ID"
                            name="videoId"
                            fullWidth
                            margin="normal"
                            value={formData.videoId}
                            onChange={handleChange}
                        />
                    </>
                )}

                {section === "Report" && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <input
                                type="file"
                                name="report"
                                accept="application/pdf"
                                onChange={handleChange}
                            />
                            <label>Upload Report</label>
                        </Grid>
                    </Grid>
                )}

                {section === "Author" && (
                    <>
                        <TextField
                            label="Author Name"
                            name="authors.0.name"
                            fullWidth
                            margin="normal"
                            value={formData.authors[0].name}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Author Email"
                            name="authors.0.email"
                            fullWidth
                            margin="normal"
                            value={formData.authors[0].email}
                            onChange={handleChange}
                        />
                    </>
                )}

                {section === "Avatar" && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <input
                                type="file"
                                name="authorAvatar"
                                accept="image/*"
                                onChange={handleChange}
                            />
                            <label>Upload Author Avatar</label>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary">
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateProjectForm;
