import React, { useState, useEffect, useCallback } from 'react';
import {
    IconButton, Box, Typography, Grid, Dialog,
    DialogActions, Button, TextField, RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { Delete, Restore, GetApp } from '@mui/icons-material';
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://graduationshowcase.online/api/v1',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Token from localStorage
    }
});

const BackUpTab = () => {
    const [data, setData] = useState({
        backups: [],
    });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [openRestoreConfirm, setOpenRestoreConfirm] = useState(false);
    const [itemToRestore, setItemToRestore] = useState(null);
    const [backupType, setBackupType] = useState('specificHour');
    const [hours, setHours] = useState([3]);
    const [retainDays, setRetainDays] = useState(30);
    const [intervalHours, setIntervalHours] = useState(3);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = useCallback(async () => {
        try {
            const response = await api.get('/backups/database');
            
            const backupsWithId = response.data.data.map((backup, index) => ({
                ...backup,
                id: backup.id || index, 
            }));

            setData((prevData) => {
                const backupsChanged = backupsWithId.length !== prevData.backups.length ||
                                        !backupsWithId.every((backup, idx) => backup.id === prevData.backups[idx]?.id);
                if (backupsChanged) {
                    return { ...prevData, backups: backupsWithId };
                }
                return prevData;
            });
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    }, []);

    const handleDeleteBackup = (id) => {
        setItemToDelete(id);
        setOpenConfirm(true);
    };

    const confirmDeleteBackup = async () => {
        try {
            if (!itemToDelete) throw new Error("No item selected for deletion");
            await api.delete(`/backups/${itemToDelete}`);
            fetchBackups();
            setOpenConfirm(false);
            setItemToDelete(null); 
        } catch (error) {
            console.error('Error deleting backup:', error);
            alert('Failed to delete the backup');
        }
    };

    const handleRestoreBackup = (id) => {
        setItemToRestore(id);
        setOpenRestoreConfirm(true);
    };

    const confirmRestoreBackup = async () => {
        try {
            alert('Restore process started. This will take approximately 2 minutes.');
            setTimeout(async () => {
                await api.post(`/backups/${itemToRestore}/restore`);
                alert('Backup restored successfully');
                localStorage.setItem('restoreNotification', 'Backup restored successfully');
                setOpenRestoreConfirm(false);
                setItemToRestore(null); 
            }, 120000);
        } catch (error) {
            console.error('Error restoring backup:', error);
            alert('Failed to restore backup');
        }
    };

    const handleBackupConfigSubmit = async () => {
        const body = backupType === 'specificHour'
            ? { hours, retainDays }
            : { intervalHours, retainDays };
        
        try {
            await api.put('/settings/backups/database', body);
            alert('Backup configuration updated successfully');
        } catch (error) {
            console.error('Error updating backup configuration:', error);
            alert('Failed to update backup configuration');
        }
    };

    const handleHoursChange = (event) => {
        const value = event.target.value;
        setHours(value ? [parseInt(value)] : []);
    };

    const handleRetainDaysChange = (event) => {
        setRetainDays(parseInt(event.target.value));
    };

    const handleIntervalHoursChange = (event) => {
        setIntervalHours(parseInt(event.target.value));
    };

    const handleDownload = async (fileName, id) => {
        try {
            const response = await api.get(`/backups/${id}`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: response.data.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.sql`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading the backup file:', error);
            alert('Failed to download the backup file');
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Backup Configuration</Typography>
                </Grid>
                <Grid item xs={12}>
                    <RadioGroup row value={backupType} onChange={(e) => setBackupType(e.target.value)}>
                        <FormControlLabel value="specificHour" control={<Radio />} label="Specific Hour" />
                        <FormControlLabel value="intervalHours" control={<Radio />} label="Interval in Hours" />
                    </RadioGroup>
                </Grid>
                {backupType === 'specificHour' ? (
                    <Grid item xs={6}>
                        <TextField
                            label="Backup Hour"
                            type="number"
                            value={hours[0]}
                            onChange={handleHoursChange}
                            fullWidth
                        />
                    </Grid>
                ) : (
                    <Grid item xs={6}>
                        <TextField
                            label="Interval in Hours"
                            type="number"
                            value={intervalHours}
                            onChange={handleIntervalHoursChange}
                            fullWidth
                        />
                    </Grid>
                )}
                <Grid item xs={6}>
                    <TextField
                        label="Retention Days"
                        type="number"
                        value={retainDays}
                        onChange={handleRetainDaysChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleBackupConfigSubmit}>
                        Save Configuration
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">Existing Backups</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>File Name</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.backups.map((backup) => (
                                <TableRow key={backup.id}>
                                    <TableCell>{backup.id}</TableCell>
                                    <TableCell>{backup.name}</TableCell>
                                    <TableCell>{backup.size}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleDeleteBackup(backup.id)}><Delete /></IconButton>
                                        <IconButton onClick={() => handleRestoreBackup(backup.id)}><Restore /></IconButton>
                                        <IconButton onClick={() => handleDownload(backup.name, backup.id)}><GetApp /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <Typography variant="h6" sx={{ p: 3 }}>
                    Are you sure you want to delete this backup?
                </Typography>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
                    <Button onClick={confirmDeleteBackup} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRestoreConfirm} onClose={() => setOpenRestoreConfirm(false)}>
                <Typography variant="h6" sx={{ p: 3 }}>
                    Are you sure you want to restore this backup?
                </Typography>
                <DialogActions>
                    <Button onClick={() => setOpenRestoreConfirm(false)}>Cancel</Button>
                    <Button onClick={confirmRestoreBackup} color="primary">Restore</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BackUpTab;
