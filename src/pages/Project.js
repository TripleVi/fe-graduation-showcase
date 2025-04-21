import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Project.css';
import { Search, FilterList, ThumbUp, Visibility } from '@mui/icons-material';
import { TextField, IconButton, Menu, MenuItem, Grid, Select, Box, CircularProgress,FormControl,InputLabel,Button } from '@mui/material';

const api = axios.create({
    baseURL: 'https://graduationshowcase.onrender.com/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

const Project = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [majors, setMajors] = useState([]);
    const [topics, setTopics] = useState([]);
    const [likes, setLikes] = useState({});
    const [loading, setLoading] = useState(true);
    const [splashVisible, setSplashVisible] = useState(true);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [sortOption, setSortOption] = useState('title');
    const [anchorElFilter, setAnchorElFilter] = useState(null);
    const [anchorElSort, setAnchorElSort] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const projectsPerPage = 25;
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortOrderMenuOpen, setSortOrderMenuOpen] = useState(false);
    const [sortOptionMenuOpen, setSortOptionMenuOpen] = useState(false);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const [projectsRes, topicsRes] = await Promise.all([
    //                 api.get('projects'),
    //                 api.get('topics')
    //             ]);

    //             if (projectsRes.data && Array.isArray(projectsRes.data.data)) {
    //                 const projectsWithDetails = await Promise.all(
    //                     projectsRes.data.data.map(async (project) => {
    //                         const detailRes = await api.get(`projects/${project.id}`);
    //                         return { ...project, ...detailRes.data };
    //                     })
    //                 );
    //                 setProjects(projectsWithDetails);
    //                 setFilteredProjects(projectsWithDetails);
    //             }

    //             if (topicsRes.data && Array.isArray(topicsRes.data.data)) {
    //                 setTopics(topicsRes.data.data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, []);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const offset = (currentPage - 1) * projectsPerPage;
                const projectsRes = await api.get(`projects?offset=${offset}&limit=${projectsPerPage}`);
                const topicsRes = await api.get('topics');

                if (projectsRes.data) {
                    const { data, total } = projectsRes.data;
                    setProjects(data);
                    setFilteredProjects(data);
                    setTotalProjects(total);
                }

                if (topicsRes.data && Array.isArray(topicsRes.data.data)) {
                    setTopics(topicsRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    useEffect(() => {
        
        const filterProjects = () => {
            const lowercasedTerm = searchTerm.toLowerCase();
            const isHashtagSearch = lowercasedTerm.startsWith("#");
    
            let filtered = projects.filter(project => {
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
            if (selectedMajor) {
                filtered = filtered.filter(project => project.major.id === selectedMajor);
            }

            if (selectedTopic) {
                filtered = filtered.filter(project => project.topic.id === selectedTopic);
            }

            // Sorting
            if (sortOption === 'year') {
                filtered.sort((a, b) => sortOrder === 'asc' ? a.year - b.year : b.year - a.year);
            } else if (sortOption === 'likes') {
                filtered.sort((a, b) => sortOrder === 'asc' ? a.likes - b.likes : b.likes - a.likes);
            } else if (sortOption === 'views') {
                filtered.sort((a, b) => sortOrder === 'asc' ? a.views - b.views : b.views - a.views);
            } else {
                filtered.sort((a, b) => sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
            }

            setFilteredProjects(filtered);
        };

        filterProjects();
    }, [searchTerm, projects, selectedMajor, selectedTopic, sortOption, sortOrder]);

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    const toggleLike = async (e, projectId) => {
        e.stopPropagation();
        try {
            const isLiked = likes[projectId];
            const endpoint = `/projects/${projectId}/reaction`;
            
            if (isLiked) {
                await api.delete(endpoint);
            } else {
                await api.post(endpoint, { like: true });
            }

            setProjects(prevProjects =>
                prevProjects.map(project =>
                    project.id === projectId
                        ? { ...project, likes: isLiked ? project.likes - 1 : project.likes + 1 }
                        : project
                )
            );
            setLikes(prev => ({ ...prev, [projectId]: !isLiked }));
            localStorage.setItem(`liked_project_${projectId}`, (!isLiked).toString());
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleSortOrderChange = () => {
        setSortOrder(prevSortOrder => (prevSortOrder === 'asc' ? 'desc' : 'asc'));
    };

    const handleSortOptionChange = (option) => {
        setSortOption(option);
        setSortOptionMenuOpen(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="project-container">
            <div className="project-header">
                <h1>Latest Projects</h1>
                <div className="search-filter-container">
                    <TextField
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <Search className="search-icon" />,
                        }}
                        className="search-input"
                    />
                    <div className="filter-buttons">
                        <IconButton onClick={(e) => setAnchorElFilter(e.currentTarget)}>
                            <FilterList />
                        </IconButton>
                        <Menu
                            anchorEl={anchorElFilter}
                            open={Boolean(anchorElFilter)}
                            onClose={() => setAnchorElFilter(null)}
                        >
                            <MenuItem onClick={() => setSelectedTopic('')}>All Topics</MenuItem>
                            {topics.map((topic) => (
                                <MenuItem
                                    key={topic.id}
                                    onClick={() => {
                                        setSelectedTopic(topic.id);
                                        setAnchorElFilter(null);
                                    }}
                                >
                                    {topic.name}
                                </MenuItem>
                            ))}
                        </Menu>

                        <FormControl>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortOption}
                                onChange={(e) => handleSortOptionChange(e.target.value)}
                                label="Sort By"
                                className="sort-select"
                            >
                                <MenuItem value="title">Title</MenuItem>
                                <MenuItem value="year">Year</MenuItem>
                                <MenuItem value="likes">Likes</MenuItem>
                                <MenuItem value="views">Views</MenuItem>
                            </Select>
                        </FormControl>

                        <IconButton onClick={handleSortOrderChange}>
                            {sortOrder === 'asc' ? '🔼' : '🔽'}
                        </IconButton>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <CircularProgress />
                </div>
            ) : (
                <div className="projects-grid">
                    {filteredProjects.map((project) => (
                        <article 
                            key={project.id} 
                            className="project-card"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <div className="project-image">
                                {/* {project.photos && project.photos.length > 0 ? ( */}
                                    <Grid container spacing={2}>
                                        
                                            <Grid item xs={12} sm={6} md={4}>
                                                <img
                                                    src={project.thumbnailUrl}
                                                    // alt={`Project Photo ${photo.id}`}
                                                    className="card-image"
                                                />
                                            </Grid>
                                    </Grid>
                                    {/* <img 
                                        src="https://via.placeholder.com/400x300"
                                        alt={project.title}
                                        className="card-image"
                                    /> */}
                                {/* )} */}
                            </div>
                            <div className="project-content">
                                <h2>{project.title}</h2>
                                <div className="project-meta">
                                    <span className="project-topic">{project.topic?.name}</span>
                                    <span className="project-date">
                                        {project.year}
                                    </span>
                                </div>
                                <p className="project-description">
                                    {project.description?.[0]?.title || 'No description available'}
                                    
                                </p>
                                <div className="project-tags">
                                    {project.hashtags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            #{typeof tag === 'string' ? tag : tag.name}
                                        </span>
                                    ))}
                                </div>
                                <div className="project-stats">
                                    <button 
                                        className={`like-button ${likes[project.id] ? 'liked' : ''}`}
                                        onClick={(e) => toggleLike(e, project.id)}
                                    >
                                        <ThumbUp /> {project.likes}
                                    </button>
                                    <div className="views">
                                        <Visibility /> {project.views}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                    
                </div>
            )}
            <div className="pagination">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </Button>
                        {/* <span>
                            Page {currentPage} of {Math.ceil(totalProjects / projectsPerPage)}
                        </span> */}
                        <Button
                            disabled={currentPage >= Math.ceil(totalProjects / projectsPerPage)}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
        </div>
    );
};

export default Project;
