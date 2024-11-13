import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const Slideshow = ({ project }) => {
    const [currentImage, setCurrentImage] = useState(0);

    const handlePrev = () => {
        setCurrentImage((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentImage((prev) => (prev === project.images.length - 1 ? 0 : prev + 1));
    };

    return (
        <Card>
            <CardMedia
                component="img"
                height="200"
                image={project.images[currentImage]} // Show current image
                alt={project.title}
            />
            <CardContent>
                <Typography variant="h5">{project.title}</Typography>
                <Typography variant="body2">Year: {project.year}</Typography>
                <Typography variant="body2">Views: {project.views}</Typography>
                <Typography variant="body2">Likes: {project.likes}</Typography>

                {/* Slideshow Controls */}
                <IconButton onClick={handlePrev}>
                    <ArrowBack />
                </IconButton>
                <IconButton onClick={handleNext}>
                    <ArrowForward />
                </IconButton>
            </CardContent>
        </Card>
    );
};

export default Slideshow;
