import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  MenuItem,
  Grid,
  Snackbar,
} from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const CreateItemForm = ({ open, handleCreateClose, project, onCreate }) => {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || [
      { title: "", content: "", fileIndex: null },
    ],
    authors: [{ name: "", email: "", avatar: null }],
    photos: [],
    thumbnail: null, // Add thumbnail field
    report: null,
    year: project?.year || 2024,
    topicId: project?.topicId || 1,
    hashtags: Array.isArray(project?.hashtags)
      ? project.hashtags.join(", ")
      : "",
  });

  const [topics, setTopics] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const api = axios.create({
    baseURL: "https://admin-greenshowcase.onrender.com/api/v1",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get("/topics");
        if (response.data && Array.isArray(response.data.data)) {
          setTopics(response.data.data);
        } else {
          console.error("Unexpected response structure:", response.data);
          setTopics([]);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, []);

  // Reset form data when opening the form
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || [{ title: "", content: "" }],
        authors: project.authors || [{ name: "", email: "", avatar: null }],
        photos: [],
        thumbnail: null, // Reset thumbnail
        report: null,
        year: project.year || 2024,
        topicId: project.topicId || "",
        hashtags: Array.isArray(project.hashtags)
          ? project.hashtags.join(", ")
          : "",
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const nameParts = name.split(".");
    if (nameParts[0] === "authors") {
      const index = parseInt(nameParts[1].match(/\d+/)[0]);
      const field = nameParts[2];
      const updatedAuthors = [...formData.authors];
      updatedAuthors[index] = {
        ...updatedAuthors[index],
        [field]: files ? files[0] : value,
      };
      setFormData({ ...formData, authors: updatedAuthors });
    } else if (nameParts[0] === "description") {
      const index = parseInt(nameParts[1]);
      const field = nameParts[2];
      const updatedDescription = [...formData.description];
      updatedDescription[index] = {
        ...updatedDescription[index],
        [field]: value,
      };
      setFormData({ ...formData, description: updatedDescription });
    } else if (name === "photos") {
      setFormData({
        ...formData,
        photos: [...formData.photos, ...Array.from(files)],
      });
    } else if (name === "thumbnail") {
      setFormData({ ...formData, thumbnail: files ? files[0] : null });
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }
  };

  const handleAddDescription = () => {
    setFormData({
      ...formData,
      description: [...formData.description, { title: "", content: "" }],
    });
  };

  const handleAddAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: "", email: "", avatar: null }],
    });
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for required fields
    if (
      !formData.title ||
      !formData.year ||
      !formData.topicId ||
      formData.authors.some((author) => !author.name || !author.email)
    ) {
      setSnackbarMessage("Please fill all required sections.");
      setSnackbarOpen(true);
      return;
    }

    const authorNames = formData.authors.map((author) =>
      author.name.trim().toLowerCase()
    );
    const authorEmails = formData.authors.map((author) =>
      author.email.trim().toLowerCase()
    );
    const duplicateName = authorNames.find(
      (name, index) => authorNames.indexOf(name) !== index
    );
    const duplicateEmail = authorEmails.find(
      (email, index) => authorEmails.indexOf(email) !== index
    );

    if (duplicateName) {
      setSnackbarMessage(
        `The author name "${duplicateName}" has already been used.`
      );
      setSnackbarOpen(true);
      return;
    }

    if (duplicateEmail) {
      setSnackbarMessage(
        `The email "${duplicateEmail}" has already been used.`
      );
      setSnackbarOpen(true);
      return;
    }

    // Prepare project data
    const {
      title,
      description,
      year,
      topicId,
      hashtags,
      authors,
      photos,
      report,
      thumbnail,
    } = formData;

    const projectData = {
      title,
      description: description.map((desc) => ({
        title: desc.title.trim(),
        content: desc.content.trim(),
        ...(desc.fileIndex !== undefined && { fileIndex: desc.fileIndex }),
      })),
      year,
      topicId,
      hashtags: hashtags ? hashtags.split(",").map((tag) => tag.trim()) : [],
      authors: authors.map((author, index) => ({
        name: author.name.trim(),
        email: author.email.trim() || `author@example.com`,
        ...(author.avatar && { fileIndex: index }),
      })),
    };

    const form = new FormData();
    form.append("project", JSON.stringify(projectData));

    // Add photos if any
    if (photos.length > 0) {
      photos.forEach((photo) => {
        form.append("photos", photo);
      });
    }

    // Only add report if it exists
    if (report) {
      form.append("report", report);
    }

    // Only add authors' avatars if they exist
    authors.forEach((author, index) => {
      if (author.avatar) {
        form.append("avatars", author.avatar);
      }
    });

    // Add thumbnail if selected
    if (thumbnail) {
      form.append("thumbnail", thumbnail);
    }

    try {
      let response;
      if (project) {
        // Update project
        response = await api.put(`/projects/${project.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create new project
        response = await api.post("/projects", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      console.log("Project created/updated response:", response.data); // Log the response for debugging
      setSnackbarMessage(
        project
          ? "Project updated successfully!"
          : "Project created successfully!"
      );
      setSnackbarOpen(true);

      onCreate(response.data.data); // Update the new project in the list immediately
      handleCreateClose();
    } catch (error) {
      console.error("Error creating/updating project:", error);
      if (error.response && error.response.status === 409) {
        setSnackbarMessage("Conflict error: Name or Email already used.");
      } else {
        setSnackbarMessage("Error while saving the project.");
      }

      setSnackbarMessage("Error while saving the project.");
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCreateClose}
        sx={{
          "& .MuiPaper-root": {
            maxWidth: "none", // Remove the max width restriction
          },
        }}
      >
        <DialogTitle>
          {project ? "Edit Project" : "Create New Project"}
        </DialogTitle>
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
                  style={{ maxHeight: 200, overflowY: "auto" }}
                />
              </Grid>

              <Grid item xs={12}>
                <input
                  type="file"
                  name={`description.${index}.photo`}
                  accept="image/*"
                  onChange={(e) => {
                    const photo = e.target.files[0]; // Get the selected photo
                    const newDescription = [...formData.description];

                    // If a photo is selected, set the fileIndex
                    if (photo) {
                      // Set fileIndex based on photos array length
                      newDescription[index].fileIndex = formData.photos.length;
                      setFormData({
                        ...formData,
                        description: newDescription,
                        photos: [...formData.photos, photo], // Add photo to the photos array
                      });
                    } else {
                      // If no photo is selected, remove fileIndex (or leave it undefined)
                      delete newDescription[index].fileIndex; // Or set it to undefined
                      setFormData({
                        ...formData,
                        description: newDescription,
                      });
                    }
                  }}
                />
                <label>Photo</label>
              </Grid>
            </Grid>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddDescription}
            style={{ marginTop: "10px" }}
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
            value={formData.topicId || ""}
            onChange={handleChange}
          >
            {topics.length > 0 ? (
              topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No topics available</MenuItem>
            )}
          </TextField>

          <Grid container spacing={2} marginTop={2}>
            <Grid item xs={12}>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                onChange={handleChange}
              />
              <label>Thumbnail (Cover Image)</label>
            </Grid>
          </Grid>

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
              <Grid item xs={12}>
                <input
                  type="file"
                  name={`authors.${index}.avatar`}
                  accept="image/*"
                  onChange={(e) => {
                    const avatar = e.target.files[0];
                    const updatedAuthors = [...formData.authors];
                    updatedAuthors[index].avatar = avatar;
                    setFormData({ ...formData, authors: updatedAuthors });
                  }}
                />
                <label>Avatar</label>
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
                name="report"
                accept="application/pdf"
                onChange={handleChange}
              />
              <label>Report: File</label>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {project ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)} // Đảm bảo Snackbar đóng lại khi hết thời gian
        message="Project created successfully!"
      />
    </>
  );
};

export default CreateItemForm;
