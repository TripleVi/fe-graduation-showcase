import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, TextField, Container, Typography, Avatar, Grid, Chip } from '@mui/material';
import '../css/DetailProject.css';
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import BoxAi from "./ChatBox";

const api = axios.create({
    baseURL: 'https://graduationshowcase.online/api/v1',
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
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [showReplies, setShowReplies] = useState({});
    const [replies, setReplies] = useState({});
    const [user, setUser] = useState({
        avatar: '',
        name: '',
        email: '',
    });

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await api.get(`/projects/${projectId}`);
                setProject(response.data);
                const commentsResponse = await api.get(`/projects/${projectId}/comments`);
                const commentData = commentsResponse.data.data;
                const parentComments = commentData.filter((comment) => !comment.parentId);
                const replyComments = commentData.filter((comment) => comment.parentId);
                const repliesMap = replyComments.reduce((acc, reply) => {
                    if (!acc[reply.parentId]) {
                        acc[reply.parentId] = [];
                    }
                    acc[reply.parentId].push(reply);
                    return acc;
                }, {});
                setComments(parentComments);
                setReplies(repliesMap);
            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        };

        if (projectId) fetchProjectDetails();
        const token = localStorage.getItem('token');
        if (token) {
            setUser({
                avatar: localStorage.getItem('avatar'),
                name: localStorage.getItem('name'),
                email: localStorage.getItem('email'),
            });
        }
    }, [projectId]);

    // Comment handling functions remain the same
    const handlePostComment = async () => {
        if (!newComment) return;
        try {
            const response = await api.post(`/projects/${projectId}/comments`, {
                content: newComment,
                parentId: null,
            });
            const newCommentData = {
                ...response.data,
                author: {
                    name: user.name,
                    avatarUrl: user.avatar,
                },
            };
            setComments([...comments, newCommentData]);
            setNewComment('');
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
        setReplyToCommentId(commentId);
        setReplyContent('');
    };

    const handleToggleReplies = async (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));

        if (!replies[commentId]) {
            try {
                const response = await api.get(`/comments/${commentId}/descendants`);
                const replyData = response.data.data;
                setReplies((prev) => ({
                    ...prev,
                    [commentId]: replyData,
                }));
            } catch (error) {
                console.error('Error fetching replies:', error);
            }
        }
    };

    const handlePostReply = async () => {
        if (!replyContent) return;
        try {
            const response = await api.post(`/projects/${projectId}/comments`, {
                content: replyContent,
                parentId: replyToCommentId,
            });
            const newReplyData = {
                ...response.data,
                author: {
                    name: user.name,
                    avatarUrl: user.avatar,
                },
            };
            setReplies((prev) => ({
                ...prev,
                [replyToCommentId]: [...(prev[replyToCommentId] || []), newReplyData],
            }));
            setShowReplies((prev) => ({
                ...prev,
                [replyToCommentId]: true,
            }));
            setReplyToCommentId(null);
            setReplyContent('');
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    if (!project) {
        return <div className="loading">Loading project details...</div>;
    }

    return (
        <div className="project-detail">
            <Header />
            
            <article className="blog-post">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="embed-responsive">
                        <iframe
                            src={`https://www.youtube.com/embed/${project.videoId}`}
                            title={project.title}
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                {/* Article Header */}
                <div className="article-header">
                    <Typography variant="h1" className="article-title">
                        {project.title}
                    </Typography>
                    <div className="article-meta">
                        <span className="article-date">{project.year}</span>
                        <span className="article-authors">
                            By {project.authors.map(author => author.name).join(', ')}
                        </span>
                    </div>
                    <div className="tagcloud">
                        {project.hashtags.map((tag, index) => (
                            <Chip key={index} label={`#${tag}`} className="tag-chip" />
                        ))}
                    </div>
                </div>

                {/* Article Content */}
                <div className="article-content">
                    {project.description && project.description.map((desc, index) => (
                        <section key={index} className="content-section">
                            <Typography variant="h2" className="section-title">
                                {desc.title}
                            </Typography>
                            <Typography variant="body1" className="section-content">
                                {desc.content}
                            </Typography>
                            
                            {project.photos && (
                                <div className="image-gallery">
                                    <Grid container spacing={3}>
                                        {project.photos.map((photo) => {
                                            if (photo.id === desc.photoId) {
                                                return (
                                                    <Grid item xs={12} md={6} key={photo.id}>
                                                        <figure className="image-figure">
                                                            <img
                                                                src={photo.url}
                                                                alt={`Project visual ${photo.id}`}
                                                                className="content-image"
                                                            />
                                                        </figure>
                                                    </Grid>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Grid>
                                </div>
                            )}
                        </section>
                    ))}
                </div>

                {/* Author Section */}
                <section className="author-section">
                    <Typography variant="h3" className="section-title">
                        About the Authors
                    </Typography>
                    <div className="authors-grid">
                        {project.authors.map(author => (
                            <div key={author.name} className="author-card">
                                <Avatar 
                                    src={author.avatarUrl || '/default-avatar.jpg'} 
                                    alt={author.name}
                                    className="author-avatar"
                                />
                                <div className="author-info">
                                    <Typography variant="h4" className="author-name">
                                        {author.name}
                                    </Typography>
                                    <Typography variant="body2" className="author-email">
                                        {author.email}
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Comments Section */}
                <section className="comments-section">
                    <Typography variant="h3" className="section-title">
                        Discussion
                    </Typography>
                    
                    <div className="comment-form">
                        <TextField
                            label="Add to the discussion"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="comment-input"
                        />
                        <Button 
                            onClick={handlePostComment}
                            variant="contained"
                            className="submit-comment"
                        >
                            Post Comment
                        </Button>
                    </div>

                    <div className="comments-list">
                        {comments.map((comment) => (
                            <div key={comment.id} className="comment-thread">
                                <div className="comment">
                                    <div className="comment-header">
                                        <Avatar 
                                            src={comment.author?.avatarUrl || '/default-avatar.jpg'}
                                            alt={comment.author?.name}
                                            className="comment-avatar"
                                        />
                                        <div className="comment-meta">
                                            <Typography variant="subtitle1" className="comment-author">
                                                {comment.author?.name || 'Anonymous'}
                                            </Typography>
                                            <Typography variant="caption" className="comment-date">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                        </div>
                                    </div>
                                    
                                    {editingCommentId === comment.id ? (
                                        <div className="edit-comment-form">
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                value={editingCommentContent}
                                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                                className="edit-comment-input"
                                            />
                                            <div className="edit-comment-actions">
                                                <Button 
                                                    onClick={handleUpdateComment}
                                                    variant="contained"
                                                    color="primary"
                                                >
                                                    Save Changes
                                                </Button>
                                                <Button 
                                                    onClick={() => {
                                                        setEditingCommentId(null);
                                                        setEditingCommentContent('');
                                                    }}
                                                    variant="outlined"
                                                    color="secondary"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Typography variant="body1" className="comment-content">
                                                {comment.content}
                                            </Typography>

                                            <div className="comment-actions">
                                                <Button 
                                                    onClick={() => handleReplyToComment(comment.id)}
                                                    variant="text"
                                                    color="primary"
                                                >
                                                    Reply
                                                </Button>
                                                <Button 
                                                    onClick={() => handleToggleReplies(comment.id)}
                                                    variant="text"
                                                    color="primary"
                                                >
                                                    {showReplies[comment.id] ? 'Hide Replies' : 'Show Replies'}
                                                </Button>
                                                
                                                    <>
                                                        <Button 
                                                            onClick={() => handleEditComment(comment)}
                                                            variant="text"
                                                            color="primary"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            variant="text"
                                                            color="error"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                
                                            </div>
                                        </>
                                    )}
                                    {replyToCommentId === comment.id && (
                                        <div className="reply-form">
                                            <TextField
                                                label="Write a reply"
                                                variant="outlined"
                                                fullWidth
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="reply-input"
                                            />
                                            <div className="reply-actions">
                                                <Button 
                                                    onClick={handlePostReply}
                                                    variant="contained"
                                                >
                                                    Post Reply
                                                </Button>
                                                <Button 
                                                    onClick={() => setReplyToCommentId(null)}
                                                    variant="outlined"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {showReplies[comment.id] && replies[comment.id] && (
                                        <div className="replies-list">
                                            {replies[comment.id].map((reply) => (
                                                <div key={reply.id} className="reply">
                                                    <div className="reply-header">
                                                        <Avatar 
                                                            src={reply.author?.avatarUrl || '/default-avatar.jpg'}
                                                            alt={reply.author?.name}
                                                            className="reply-avatar"
                                                        />
                                                        <div className="reply-meta">
                                                            <Typography variant="subtitle2" className="reply-author">
                                                                {reply.author?.name || 'Anonymous'}
                                                            </Typography>
                                                            <Typography variant="caption" className="reply-date">
                                                                {new Date(reply.createdAt).toLocaleString()}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                    <Typography variant="body2" className="reply-content">
                                                        {reply.content}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </article>

            <BoxAi />
            <Footer />
        </div>
    );
};

export default DetailProjectPage;
