import React, { useState, useEffect,useRef } from 'react';
import {
    Button, TextField, InputAdornment, MenuItem, Box, Grid, 
    IconButton, Typography, Autocomplete, CircularProgress
} from '@mui/material';
import { Search, FilterList, ThumbUp } from '@mui/icons-material'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Project.css';
import { splashScreen } from "../portfolio";
import { useLocalStorage } from "../useLocalStorage";

// Create axios instance
const api = axios.create({
    baseURL: 'http://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

const Project = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [majors, setMajors] = useState([]);
    const [topics, setTopics] = useState([]);
    const [likes, setLikes] = useState({});
    const darkPref = window.matchMedia("(prefers-color-scheme: dark)");
    const [isDark, setIsDark] = useLocalStorage("isDark", darkPref.matches);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [splashVisible, setSplashVisible] = useState(true);
    //const [searchExpanded, setSearchExpanded] = useState(false);
    //const searchInputRef = useRef(null);


    useEffect(() => {
        const timer = setTimeout(() => {
            setSplashVisible(false);
        }, splashScreen.duration); // Duration from your portfolio configuration

        return () => clearTimeout(timer);
    }, []);

    const changeTheme = () => {
        setIsDark(!isDark);
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('projects');
                console.log('Projects API response:', response.data); // Ghi log chi tiết phản hồi

                if (response.data && Array.isArray(response.data.data)) {
                    const projectsWithDetails = await Promise.all(response.data.data.map(async (project) => {
                        const detailResponse = await api.get(`projects/${project.id}`);
                        console.log(`Details for project ${project.id}:`, detailResponse.data); // Ghi log chi tiết
                        return {
                            ...project,
                            ...detailResponse.data,
                        };
                    }));
                    setProjects(projectsWithDetails);
                    const initialLikes = {};
                    projectsWithDetails.forEach(project => {
                        initialLikes[project.id] = localStorage.getItem(`liked_project_${project.id}`) === 'true';
                    });
                    setLikes(initialLikes);
                } else {
                    console.error('Unexpected data format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };


        const fetchMajors = async () => {
            try {
                const response = await api.get('majors');
                setMajors(response.data.data || []);
            } catch (error) {
                console.error('Error fetching majors:', error);
            }
        };

        const fetchTopics = async () => {
            try {
                const response = await api.get('topics');
                setTopics(response.data.data || []);
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };


        fetchProjects();
        fetchMajors();
        fetchTopics();
    }, []);

    useEffect(() => {
        // Initialize the likes state from Local Storage when the component mounts
        const initialLikes = {};
        projects.forEach((project) => {
            const likedStatus = localStorage.getItem(`liked_project_${project.id}`);
            initialLikes[project.id] = likedStatus === 'true';
        });
        setLikes(initialLikes);
    }, [projects]); // Run this effect whenever the projects are loaded

    useEffect(() => {
        const filterProjects = () => {
            const lowercasedTerm = searchTerm.toLowerCase();
            const isHashtagSearch = lowercasedTerm.startsWith("#");
    
            const filtered = projects.filter(project => {
                if (isHashtagSearch) {
                    // Extract multiple hashtags by splitting the term on spaces or commas
                    const hashtags = lowercasedTerm.slice(1).split(/[\s,]+/).filter(Boolean);
    
                    // Ensure all specified hashtags are present in the project's hashtags
                    return hashtags.every(hashtag =>
                        project.hashtags.some(tag => tag.toLowerCase() === hashtag)
                    );
                } else {
                    // Regular search by title, year, or author if `#` is not at the start
                    return (
                        project.title.toLowerCase().includes(lowercasedTerm) ||
                        project.year.toString().includes(lowercasedTerm) ||
                        (project.authors && project.authors.some(author => author.name.toLowerCase().includes(lowercasedTerm)))
                    );
                }
            });
    
            // Apply sorting
            if (sortOption === 'year') {
                filtered.sort((a, b) => sortDirection === 'asc' ? a.year - b.year : b.year - a.year);
            } else if (sortOption === 'views') {
                filtered.sort((a, b) => sortDirection === 'asc' ? a.views - b.views : b.views - a.views);
            } else if (sortOption === 'likes') {
                filtered.sort((a, b) => sortDirection === 'asc' ? a.likes - b.likes : b.likes - a.likes);
            }
    
            setFilteredProjects(filtered);
        };
    
        filterProjects();
    }, [searchTerm, selectedMajor, selectedTopic, sortOption, sortDirection, projects]);
    

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    const toggleLike = async (projectId) => {
        try {
            const isLiked = likes[projectId];
            console.log(`Project ID: ${projectId}, isLiked before click: ${isLiked}`); // Debugging
    
            if (isLiked) {
                const response = await api.delete(`/projects/${projectId}/reaction`);
                console.log('Unlike response:', response); // Log the response
                if (response.status === 204) { // Check for 204 status
                    setProjects((prevProjects) =>
                        prevProjects.map((project) =>
                            project.id === projectId
                                ? { ...project, likes: Math.max(0, project.likes - 1) }
                                : project
                        )
                    );
                    setLikes((prevLikes) => ({
                        ...prevLikes,
                        [projectId]: false,
                    }));
                    localStorage.setItem(`liked_project_${projectId}`, 'false');
                    console.log(`Local Storage updated: liked_project_${projectId} = false`); // Debugging
                } else {
                    console.warn('Unexpected response status:', response.status); // Warn if not 204
                }
            } else {
                const response = await api.post(`/projects/${projectId}/reaction`, { like: true });
                console.log('Like response:', response); // Log the response
                if (response.status === 204) { // Check for 204 status
                    setProjects((prevProjects) =>
                        prevProjects.map((project) =>
                            project.id === projectId
                                ? { ...project, likes: project.likes + 1 }
                                : project
                        )
                    );
                    setLikes((prevLikes) => ({
                        ...prevLikes,
                        [projectId]: true,
                    }));
                    localStorage.setItem(`liked_project_${projectId}`, 'true');
                    console.log(`Local Storage updated: liked_project_${projectId} = true`); // Debugging
                } else {
                    console.warn('Unexpected response status:', response.status); // Warn if not 204
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error); // Handle errors
        }
    };

    return (
        <div className={isDark ? "dark-mode" : "light-mode"}>
            <Box id="content" sx={{ marginTop: '40px', marginLeft: '40px', display: 'flex', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ marginRight: '20px', backgroundColor: 'var(--buttonColor)', '&:hover': { backgroundColor: 'var(--buttonHover)' } }}
                >
                    Filter
                </Button>
                {showFilters && (
                    <>
                        <TextField
                            select
                            label="Major"
                            value={selectedMajor}
                            onChange={(e) => setSelectedMajor(e.target.value)}
                            sx={{ width: 200, mx: 2 }}
                        >
                            {majors.map((major) => (
                                <MenuItem key={major.id} value={major.name}>
                                    {major.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Topic"
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            sx={{ width: 200 }}
                        >
                            {topics.map((topic) => (
                                <MenuItem key={topic.id} value={topic.name}>
                                    {topic.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Sort By"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            sx={{ width: 200, mx: 2 }}
                        >
                            <MenuItem value="year">Year</MenuItem>
                            <MenuItem value="views">Views</MenuItem>
                            <MenuItem value="likes">Likes</MenuItem>
                        </TextField>
                        <Button
                            variant="contained"
                            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                            sx={{ backgroundColor: 'var(--buttonColor)', '&:hover': { backgroundColor: 'var(--buttonHover)' } }} // Adjust button color
                        >
                            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                        </Button>
                    </>
                )}
                <Autocomplete
                    freeSolo
                    inputValue={searchTerm}
                    onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
                    options={projects.map((project) => project.title)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Projects"
                            variant="outlined"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                                style: { fontSize: '1.5rem' } 
                            }}
                            sx={{
                                margin: '20px',
                                display: 'flex',
                                width: '200%',  // Increased width
                                borderRadius: '25px',
                                backgroundColor: 'var(--bgColor)',
                            }}
                            InputLabelProps={{
                                style: { fontSize: '1rem' }  // Adjust label font size as well
                            }}
                        />
                    )}
                />
            </Box>
            <Grid container spacing={2}>
                    {loading ? (
                        <CircularProgress />
                    ) : filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project.id}>
                                <div className='certificate-card' onClick={() => handleProjectClick(project.id)}>
                                    <div className="project-image-div">
                                        {project.photoUrls.length > 0 && (
                                                <Box>
                                                    <Grid container spacing={1}>
                                                        {project.photoUrls.map((photoUrl, index) => (
                                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                                <img
                                                                    src={photoUrl}
                                                                    alt={`Project Photo ${index + 1}`}
                                                                    className="card-image"
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Box>
                                            )}
                                    </div>
                                    <div className="card-detail-div">
                                        <Typography variant="h5" className='card-title'>{project.title}</Typography>
                                        {project.description && project.description.map((desc, index) => (
                                            <Box key={index}>
                                                <Typography variant="subtitle1" className="description-title">{desc.title}</Typography>
                                            </Box>
                                        ))}
                                    </div>
                                    <div className="project-card-footer">
                                        {project.hashtags.map((tag, index) => (
                                            <span key={index} className='card-tag'>
                                                {typeof tag === "string" ? `#${tag}` : `#${tag.name}`}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="like-view-container">
                                        <IconButton onClick={(e) => { e.stopPropagation(); toggleLike(project.id); }}>
                                            <ThumbUp color={likes[project.id] ? 'primary' : 'action'} />
                                        </IconButton>
                                        <span className="likes-count">{project.likes}</span>
                                        <div className="views-container">
                                            <span className="views-icon">👁️</span>
                                            <span className="views-count">{project.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </Grid>
                        ))
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 2 }}>
                            <Typography variant="h6">No projects found</Typography>
                        </Box>
                    )}
                </Grid>
        </div>
    );
};
export default Project;
