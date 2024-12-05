import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, Button,
    MenuItem, TextField, Grid, FormControl, Select, InputLabel, Snackbar
} from "@mui/material";
import axios from "axios";

const UpdateProjectForm = ({ open, handleClose, project, onUpdate }) => {
    const [section, setSection] = useState(""); // Current editing section
    const [formData, setFormData] = useState({
        title: project?.title || "",
        description: project?.description || [{ title: "", content: "", fileIndex: null }],
        year: project?.year || 2024,
        topicId: project?.topicId || 1,
        hashtags: Array.isArray(project?.hashtags) ? project.hashtags.join(", ") : "",
        authors: Array.isArray(project?.authors) ? project.authors : [{ id: null, name: "", email: "", avatar: null }],
        photos: null,
        report: null,
        thumbnail: null,
        paragraphIndices: [], // Ensure this is initialized as an array
        authorIds: Array.isArray(project?.authorIds) ? project.authorIds : [], 
    });
    
    const [topics, setTopics] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const api = axios.create({
        baseURL: "https://graduationshowcase.online/api/v1",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(`/projects/${project.id}`);
            const projectData = response.data;

            setFormData({
                title: projectData.title || "",
                description: Array.isArray(projectData.description) ? projectData.description : [{ title: "", content: "" }],
                year: projectData.year || 2024,
                topicId: projectData.topicId || 1,
                hashtags: Array.isArray(projectData.hashtags) ? projectData.hashtags.join(", ") : "",
                // authors: Array.isArray(projectData.authors) && projectData.authors.length > 0 ? 
                //     projectData.authors.map(author => ({
                //         id: author.id || null,
                //         name: author.name || "",
                //         email: author.email || "",
                //         avatar: author.avatar || null,
                //     })) : 
                //     [{ id: null, name: "", email: "", avatar: null }],
                authors: Array.isArray(projectData.authors) ? projectData.authors : [{ id: null, name: "", email: "" }],
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
                setTopics(response.data.data || []);
            } catch (error) {
                console.error("Error fetching topics:", error);
            }
        };
        fetchTopics();
    }, []);

    const handleSectionChange = (e) => setSection(e.target.value);

    // const handleChange = (e) => {
    //     const { name, value, files } = e.target;
    //     setFormData({ ...formData, [name]: files ? files[0] : value });
    // };
    // const handleChange = (e) => {
    //     const { name, value, files } = e.target;
    //     if (name.startsWith("authors")) {
    //         const [_, index, field] = name.split(".");
    //         const updatedAuthors = [...formData.authors];
    //         updatedAuthors[parseInt(index)][field] = value;
    //         setFormData({ ...formData, authors: updatedAuthors });
    //     } else if (name.startsWith("description")) {
    //         const [_, index, field] = name.split(".");
    //         const updatedDescription = [...formData.description];
    //         updatedDescription[index][field] = value;
    //         setFormData({ ...formData, description: updatedDescription });
    //     } else {
    //         setFormData({ ...formData, [name]: files ? files[0] : value });
    //     }
    // };
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name.startsWith("description")) {
            const [_, index, field] = name.split(".");
            const updatedDescription = [...formData.description];
            if (field === "file") {
                updatedDescription[index][field] = files[0]; // Store the file for the selected description
            } else {
                updatedDescription[index][field] = value;
            }
            setFormData({ ...formData, description: updatedDescription });
        } else {
            setFormData({ ...formData, [name]: files ? files[0] : value });
        }
    };
    
    

    const handleParagraphSelection = (event) => {
        const { value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            paragraphIndices: Array.isArray(value) ? value : [value], // Ensure the value is an array
        }));
    };
    

    // const handleAuthorSelection = (index) => {
    //     const updatedIndices = Array.isArray(formData.authorIds) && formData.authorIds.includes(index)
    //         ? formData.authorIds.filter(i => i !== index)
    //         : [...(formData.authorIds || []), index]; // Ensure authorIds is an array
    //     setFormData({ ...formData, authorIds: updatedIndices });
    // };
    const handleAuthorSelection = (selectedIndices) => {
        // Đảm bảo authorIds là mảng
        setFormData({
            ...formData,
            authorIds: Array.isArray(selectedIndices) ? selectedIndices : [], // Chắc chắn authorIds là mảng
        });
    };
    
    
    const handleAuthorChange = (index, field, value) => {
        const updatedAuthors = Array.isArray(formData.authors) ? [...formData.authors] : []; // Đảm bảo authors là mảng
        updatedAuthors[index][field] = value;
        setFormData({ ...formData, authors: updatedAuthors });
    };
    

    
    const handleSubmit = async () => {
        try {
            // Kiểm tra phần thông tin (Information) được chọn
            if (section === "Information") {
                const infoData = {
                    title: formData.title,
                    description: formData.description,
                    year: formData.year,
                    topicId: formData.topicId,
                    videoId: formData.videoId || null,
                    hashtags: formData.hashtags ? formData.hashtags.split(",").map(tag => tag.trim()) : []
                };
    
                // Cập nhật thông tin dự án
                await api.put(`/projects/${project.id}`, infoData);
                setSnackbarMessage("Project information updated successfully!");
                setSnackbarOpen(true);
                onUpdate();
            }
    
            // Kiểm tra phần file (Files) được chọn
            if (section === "Files") {
                const fileData = new FormData();
    
                // Kiểm tra nếu có các chỉ mục đoạn văn và ảnh
                if (formData.paragraphIndices && formData.paragraphIndices.length > 0 && formData.photos) {
                    formData.paragraphIndices.forEach((index) => {
                        const photo = formData.photos[index];
                        if (photo) {
                            // Đính kèm ảnh vào FormData
                            fileData.append('photos', photo);
                        }
                    });
                }
    
                // Nếu có các file báo cáo và thumbnail
                if (formData.report) fileData.append("report", formData.report);
                if (formData.thumbnail) fileData.append("thumbnail", formData.thumbnail);
    
                // Xử lý avatar cho các tác giả nếu có
                if (formData.authorIds && formData.authorIds.length > 0) {
                    formData.authorIds.forEach((authorIndex) => {
                        const author = formData.authors[authorIndex];
                        if (author && author.avatar) {
                            // Đính kèm ảnh avatar cho các tác giả đã chọn, sử dụng fileIndex
                            fileData.append('avatars', author.avatar);
                        }
                    });
                }
    
                // Chỉ gửi FormData khi có tệp tin cần cập nhật
                const hasFilesToUpdate = 
                    fileData.has('photos') || 
                    fileData.has('report') || 
                    fileData.has('thumbnail') || 
                    Array.from(fileData.entries()).some(([key, value]) => key === 'avatars' && value);
    
                if (hasFilesToUpdate) {
                    // Gửi yêu cầu API POST với FormData
                    const formPayload = new FormData();
                    formPayload.append("authorIds", JSON.stringify(formData.authorIds)); // Gửi các authorIds đã chọn
    
                    // Đính kèm các tệp vào formPayload
                    Array.from(fileData.entries()).forEach(([key, value]) => {
                        formPayload.append(key, value);
                    });
    
                    // Gửi yêu cầu cập nhật API
                    await api.post(`/projects/${project.id}`, formPayload);
                    setSnackbarMessage("Project files updated successfully!");
                    setSnackbarOpen(true);
                    onUpdate();
                } else {
                    setSnackbarMessage("No new files to update.");
                    setSnackbarOpen(true);
                }
            }
    
            // Nếu phần tác giả (Author) được chọn
            if (section === "Author") {
                const authorsData = formData.authors
                    .filter(author => author.name && author.email)
                    .map(author => ({
                        id: author.id,
                        name: author.name,
                        email: author.email,
                    }));
    
                // Cập nhật thông tin tác giả
                await api.put(`/projects/${project.id}/author-group`, { authors: authorsData });
                setSnackbarMessage("Authors updated successfully!");
                setSnackbarOpen(true);
                onUpdate();
            }
    
            handleClose(); // Đóng dialog sau khi cập nhật
        } catch (error) {
            if (error.response && error.response.status === 409) {
                // If it's a conflict error (409), show appropriate message
                setSnackbarMessage("Conflict: The title, author name, or email is already in use.");
            } else {
                // If it's any other error
                setSnackbarMessage("Failed to update project.");
            }
            setSnackbarMessage("Failed to update project.");
            setSnackbarOpen(true);
        }
    };
    
    const handleAddDescription = () => {
        setFormData({
            ...formData,
            description: [...formData.description, { title: "", content: "" }]
        });
    };

    const handleRemoveDescription = (index) => {
        const updatedDescription = formData.description.filter((_, i) => i !== index);
        setFormData({ ...formData, description: updatedDescription });
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose}
                sx={{
                    '& .MuiPaper-root': {
                        
                        maxWidth: 'none', // Remove the max width restriction
                        
                    }
                }}
            >
                <DialogTitle>Update Project</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Choose Section</InputLabel>
                        <Select 
                            value={section} 
                            onChange={handleSectionChange}
                            sx={{
                                '& .MuiSelect-root': {
                                    maxWidth: '100%', // Đặt chiều rộng của Select ở mức 100%
                                },
                                '& .MuiPaper-root': {
                                    maxWidth: '700px', // Giới hạn maxWidth của thẻ menu
                                },
                            }}
                        >
                            <MenuItem value="Information">Information</MenuItem>
                            <MenuItem value="Files">Files</MenuItem>
                            <MenuItem value="Author">Author Info</MenuItem>
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
                        {formData.description.map((desc, index) => (
                            <div key={index}>
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
                                
                                <Button onClick={() => handleRemoveDescription(index)} color="secondary">
                                    Remove
                                </Button>
                                
                            </div>
                        ))}
                        <Button onClick={handleAddDescription} color="primary">
                            Add Description
                        </Button>
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
                    {section === "Author" && (
                        <>
                            {formData.authors.map((author, index) => (
                                <div key={index}>
                                    <TextField
                                        label="Author Name"
                                        name={`authors.${index}.name`}
                                        fullWidth
                                        margin="normal"
                                        value={author.name}
                                        onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                                    />
                                    <TextField
                                        label="Author Email"
                                        name={`authors.${index}.email`}
                                        fullWidth
                                        margin="normal"
                                        value={author.email}
                                        onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                                    />
                                </div>
                            ))}
                            {/* Bạn có thể thêm các nút để thêm tác giả hoặc chỉnh sửa thông tin tác giả */}
                        </>
                    )}
                    {section === "Files" && (
                        <>
                            <Grid container spacing={2}>
                                {/* <Grid item xs={12}>
                                    <TextField
                                        label="Photos"
                                        type="file"
                                        name="photos"
                                        inputProps={{ multiple: true }}
                                        onChange={handleChange}
                                    />
                                </Grid> */}
                                <Grid item xs={12}>
                                    <TextField
                                        label="Report"
                                        type="file"
                                        name="report"
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Thumbnail"
                                        type="file"
                                        name="thumbnail"
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                            {/* <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <InputLabel>Select Description Indices</InputLabel>
                                    <Select
                                        multiple
                                        value={Array.isArray(formData.paragraphIndices) ? formData.paragraphIndices : []} // Ensure it's an array
                                        onChange={handleParagraphSelection}
                                        renderValue={(selected) => {
                                            
                                            return selected.map(index => formData.description[index]?.title).join(", ");
                                        }} 
                                    >
                                        {formData.description.map((desc, index) => (
                                            <MenuItem key={index} value={index}>
                                                {desc.title || `Description ${index + 1}`} 
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {(formData.paragraphIndices || []).map((index) => {
                                        const desc = formData.description[index];
                                        return (
                                            <div key={index}>
                                                <TextField
                                                    label={`Select Image for ${desc.title || `Description ${index + 1}`}`}
                                                    type="file"
                                                    name={`description.${index}.file`}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        );
                                    })}
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Select Author Indices</InputLabel>
                                        <Select
                                            multiple
                                            value={Array.isArray(formData.authorIds) ? formData.authorIds : []} 
                                            onChange={(event) => handleAuthorSelection(event.target.value)}
                                            renderValue={(selected) => {
                                                return selected
                                                    .map(index => formData.authors[index]?.name || `Author ${index + 1}`)
                                                    .join(", ");
                                            }}
                                        >
                                            {formData.authors.map((author, index) => (
                                                <MenuItem key={index} value={index}>
                                                    {author.name || `Author ${index + 1}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {(formData.authorIds || []).map((index) => {
                                            const author = formData.authors[index];
                                            return (
                                                <div key={index}>
                                                    <TextField
                                                        label={`Upload Avatar for ${author.name || `Author ${index + 1}`}`}
                                                        type="file"
                                                        name={`author.${index}.avatar`}
                                                        onChange={(e) => handleAuthorChange(index, 'avatar', e.target.files[0])}
                                                    />
                                                </div>
                                            );
                                        })}

                                    </FormControl>
                                </Grid> */}
                            {/* </Grid> */}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </>
    );
};
export default UpdateProjectForm; 