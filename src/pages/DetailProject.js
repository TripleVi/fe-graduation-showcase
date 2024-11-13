import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    Container,
    Typography,
    Avatar,
    Grid,
    Chip,
    ListItemAvatar,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../css/DetailProject.css';
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import { useLocalStorage } from "../useLocalStorage";
import { StyleProvider } from "../contexts/StyleContext";

const api = axios.create({
    baseURL: 'http://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

const DetailProjectPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null); // New state for replying to comments
    const [showReplies, setShowReplies] = useState({}); // New state to track which replies to show
    const [replyContent, setReplyContent] = useState(''); // New state for reply content
    const [user, setUser] = useState({
        avatar: '',
        name: '',
        email: '',
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const darkPref = window.matchMedia("(prefers-color-scheme: dark)");
    const [isDark, setIsDark] = useLocalStorage("isDark", darkPref.matches);
    

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await api.get(`/projects/${projectId}`);
                setProject(response.data);
                const commentsResponse = await api.get(`/projects/${projectId}/comments`);
                setComments(commentsResponse.data);
            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        };

        if (projectId) {
            fetchProjectDetails();
        }

        const token = localStorage.getItem('token');
        if (token) {
            setUser({
                avatar: localStorage.getItem('avatar'),
                name: localStorage.getItem('name'),
                email: localStorage.getItem('email'),
            });
        }
    }, [projectId]);

    const handlePostComment = async () => {
        if (!newComment) return;

        try {
            const response = await api.post(`/projects/${projectId}/comments`, {
                content: newComment,
                parentId: replyToCommentId || null, // Use replyToCommentId for parentId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Include Bearer token
                }
            });
            setComments([...comments, response.data]);
            setNewComment('');
            setReplyToCommentId(null); // Reset reply state after posting
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const handleUpdateComment = async () => {
        if (!editingCommentContent) return;

        try {
            await api.put(`/comments/${editingCommentId}`, {
                content: editingCommentContent,
            });
            setComments(comments.map((comment) =>
                comment.id === editingCommentId ? { ...comment, content: editingCommentContent } : comment
            ));
            setEditingCommentId(null);
            setEditingCommentContent('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
        if (!confirmDelete) return;

        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReplyToComment = (commentId) => {
        setReplyToCommentId(commentId); // Set the ID of the comment to reply to
        setReplyContent(''); // Reset reply content field
    };

    const handlePostReply = async () => {
        if (!replyContent) return;

        try {
            const response = await api.post(`/projects/${projectId}/comments`, {
                content: replyContent,
                parentId: replyToCommentId, // Link reply to parent comment
            });
            setComments([...comments, response.data]);
            setReplyToCommentId(null); // Clear reply state
            setReplyContent(''); // Clear input after posting reply
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId], // Toggle the visibility of replies
        }));
    };

    // Render loading message if project is not yet loaded
    if (!project) {
        return <div>Loading project details...</div>;
    }

    const changeTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <>
        <div className={isDark ? "dark-mode detail" : "light-mode"}>
            <StyleProvider value={{ isDark: isDark, changeTheme: changeTheme }}>
                <Header />

                <Container className="axil-post-details">
                    <figure className="post-images">
                        <Grid container spacing={1}>
                            {project.photoUrls.map((photoUrl, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <img src={photoUrl} alt={`Project Photo ${index + 1}`} className="card-image" />
                                </Grid>
                            ))}
                        </Grid>
                    </figure>

                    <blockquote>
                        <p>{project.title} — {project.authors.map(author => <span key={author.name}>{author.name}</span>)}</p>
                    </blockquote>

                    <div className="post-details-content">
                        <Typography variant="h4">{project.title}</Typography>
                        <Typography variant="subtitle1"><em>{project.year}</em></Typography>
                    </div>

                    <div className="embed-responsive">
                        <iframe
                            className="embed-responsive-item"
                            // src="https://www.youtube.com/embed/example"
                            title="Video Title"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="about-author">
                        {project.authors.map(author => (
                            <ListItem key={author.name}>
                                <ListItemAvatar>
                                    <Avatar src={author.avatarUrl || 'default_avatar_url.jpg'} alt={author.name} />
                                </ListItemAvatar>
                                <ListItemText primary={author.name} secondary={author.email} />
                            </ListItem>
                        ))}
                    </div>

                    <div className="tagcloud">
                        {project.hashtags.map((tag, index) => (
                            <Chip key={index} label={`#${tag}`} sx={{ marginRight: 1 }} />
                        ))}
                    </div>

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Add a Comment"
                            variant="outlined"
                            fullWidth
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            InputProps={{
                                style: {
                                    fontSize: '25px', // Increase font size as needed
                                    color: 'var(--textColor)', // Set input text color
                                },
                            }}
                        />

                        <Button onClick={handlePostComment} sx={{ mt: 1 }}>Post Comment</Button>
                    </Box>

                    {editingCommentId && (
                        <Box sx={{ marginTop: 2 }}>
                            <TextField
                                label="Edit Comment"
                                variant="outlined"
                                fullWidth
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                            />
                            <Button onClick={handleUpdateComment} variant="contained" color="primary" sx={{ marginTop: 1 }}>Update Comment</Button>
                        </Box>
                    )}

                    <ul className="comment-list">
                        {comments.map(comment => (
                            <li key={comment.id} className="single-comment">
                                <Avatar src={comment.user?.avatar || 'default-avatar.jpg'} alt={comment.user?.name} />
                                <div>
                                    <strong>{comment.user?.name || 'Anonymous'}</strong>
                                    <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                    <p>{comment.content}</p>
                                    <div>
                                        <Button onClick={() => handleReplyToComment(comment.id)}>Reply</Button>
                                        <Button onClick={() => handleEditComment(comment)}>Edit</Button>
                                        <Button onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                                        <Button onClick={() => toggleReplies(comment.id)}>
                                            {showReplies[comment.id] ? 'Hide Replies' : 'View Replies'}
                                        </Button>
                                    </div>
                                </div>

                                {showReplies[comment.id] && (
                                    <List>
                                        {comments.filter(c => c.parentId === comment.id).map(reply => (
                                            <ListItem key={reply.id}>
                                                <ListItemText primary={reply.content} />
                                                <Button onClick={() => handleEditComment(reply)}>Edit</Button>
                                                <Button onClick={() => handleDeleteComment(reply.id)}>Delete</Button>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}

                                {replyToCommentId === comment.id && (
                                    <Box sx={{ mt: 2 }}>
                                        <TextField
                                            label="Reply"
                                            variant="outlined"
                                            fullWidth
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                        />
                                        <Button onClick={handlePostReply} sx={{ mt: 1 }}>Post Reply</Button>
                                    </Box>
                                )}
                            </li>
                        ))}
                    </ul>
                </Container>
                <Footer />

            </StyleProvider>
        </div>
            
        </>
    );
};

export default DetailProjectPage;
