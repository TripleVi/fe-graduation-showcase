import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [projectStats, setProjectStats] = useState({
        totalViews: 0,
        totalLikes: 0,
        monthlyData: [],
    });

    useEffect(() => {
        const fetchProjectStats = async () => {
            try {
                const response = await axios.get('https://graduationshowcase.onrender.com/api/v1/projects');
                const projects = response.data.data;
    
                // Calculate total views and likes
                const totalViews = projects.reduce((sum, project) => sum + project.views, 0);
                const totalLikes = projects.reduce((sum, project) => sum + project.likes, 0);
    
                // Calculate total interactions (views + likes)
                const totalInteractions = totalViews + totalLikes;
    
                // Calculate percentage distribution
                const viewsPercentage = ((totalViews / totalInteractions) * 100).toFixed(2);
                const likesPercentage = ((totalLikes / totalInteractions) * 100).toFixed(2);
    
                // Group data by month for charts
                const monthlyData = projects.reduce((acc, project) => {
                    const month = new Date(project.createdAt).toLocaleString('default', { month: 'short' });
                    if (!acc[month]) acc[month] = { views: 0, likes: 0 };
                    acc[month].views += project.views;
                    acc[month].likes += project.likes;
                    return acc;
                }, {});
    
                // Process monthly data
                const processedMonthlyData = Object.entries(monthlyData).map(([month, { views, likes }]) => ({
                    month,
                    viewsPercentage: ((views / totalViews) * 100).toFixed(2),
                    likesPercentage: ((likes / totalLikes) * 100).toFixed(2),
                }));
    
                // Update state with all data
                setProjectStats({
                    totalViews,
                    totalLikes,
                    viewsPercentage,
                    likesPercentage,
                    monthlyData: processedMonthlyData,
                });
            } catch (error) {
                console.error('Error fetching project statistics:', error);
            }
        };
    
        fetchProjectStats();
    }, []);    
    

    // Prepare data for bar chart
    // Prepare data for bar chart showing overall percentages
    const barChartData = {
        labels: ['Views', 'Likes'], // Overall categories
        datasets: [
            {
                label: 'Overall Percentage',
                data: [projectStats.viewsPercentage, projectStats.likesPercentage], // Overall percentages
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };


    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Overall Views and Likes Distribution (%)' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `${value}%`, // Add % to y-axis labels
                },
            },
        },
    };    

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
    {/* Total Views Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Views
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {projectStats.totalViews}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {projectStats.viewsPercentage}% of total interactions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Likes Card */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Likes
                            </Typography>
                            <Typography variant="h4" color="secondary">
                                {projectStats.totalLikes}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {projectStats.likesPercentage}% of total interactions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bar Chart for Monthly Views and Likes */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Monthly Project Views and Likes (%)
                            </Typography>
                            <Bar data={barChartData} options={barChartOptions} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </Box>
    );
};

export default Dashboard;
