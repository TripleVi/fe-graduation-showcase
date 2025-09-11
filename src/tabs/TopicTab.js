import React, { useState, useEffect } from "react";
import {
  IconButton,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const api = axios.create({
  baseURL: "https://admin-greenshowcase.onrender.com/api/v1",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`, // Token from localStorage
  },
});

const TopicTab = ({ topics }) => {
  const [data, setData] = useState({ topics: [] });
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [formValues, setFormValues] = useState({ name: "" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Đồng bộ state topics khi props topics thay đổi
  useEffect(() => {
    if (topics) {
      setData((prevData) => ({
        ...prevData,
        topics: topics
          .filter((topic) => topic) // Loại bỏ các phần tử undefined/null
          .map((topic, index) => ({
            ...topic,
            id: topic?.id || `temp-id-${index}`, // Đảm bảo topic tồn tại trước khi truy cập id
          })),
      }));
    }
  }, [topics]);

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleDelete = async () => {
    try {
      if (itemToDelete) {
        await api.delete(`/topics/${itemToDelete}`);
        setSnackbarMessage("Topic deleted successfully");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        // Xóa topic khỏi state
        setData((prevData) => ({
          ...prevData,
          topics: prevData.topics.filter((topic) => topic.id !== itemToDelete),
        }));
      }
      setOpenConfirm(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteClick = (id) => {
    if (!id) {
      console.error("Item does not have a valid id:", id);
      return;
    }
    setItemToDelete(id);
    setOpenConfirm(true);
  };

  const handleEdit = (row) => {
    setIsEditing(true);
    setItemToEdit(row);
    setFormValues({ name: row.name });
    setOpenForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // if (!formValues.name || (isEditing && !formValues.majorId)) {
    //     setSnackbarMessage('Please fill in all required fields.');
    //     setSnackbarSeverity('error');
    //     setOpenSnackbar(true);
    //     return;
    // }
    try {
      if (isEditing) {
        const updatedTopic = { name: formValues.name };
        await api.put(`/topics/${itemToEdit.id}`, updatedTopic);
        setSnackbarMessage("Topic updated successfully");
        setSnackbarSeverity("success");

        // Cập nhật topic trong state
        setData((prevData) => ({
          ...prevData,
          topics: prevData.topics.map((topic) =>
            topic.id === itemToEdit.id
              ? { ...topic, name: formValues.name }
              : topic
          ),
        }));
      }
      setOpenSnackbar(true);
      setOpenForm(false); // Đóng form
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setSnackbarMessage("Topic name already exists.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage("Error saving topic");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        console.error("Error saving item:", error);
      }
    }
  };

  const handleCreateClose = () => {
    setOpenForm(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Grid item xs={12}>
        <DataGrid
          rows={data.topics} // Sử dụng state data.topics
          getRowId={(row) => row.id || row.tempId}
          columns={[
            { field: "id", headerName: "ID", width: 100 },
            { field: "name", headerName: "Name", width: 200 },
            {
              field: "actions",
              headerName: "Actions",
              width: 150,
              renderCell: (params) => (
                <>
                  <IconButton onClick={() => handleEdit(params.row)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                    <Delete />
                  </IconButton>
                </>
              ),
            },
          ]}
          autoHeight
        />
      </Grid>

      {/* Form xử lý thêm/sửa topic */}
      <Dialog open={openForm} onClose={handleCreateClose}>
        <DialogTitle>{isEditing ? "Edit Topic" : "Create Topic"}</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <Box sx={{ p: 2 }}>
            <TextField
              label="Name"
              value={formValues.name}
              onChange={(e) =>
                setFormValues({ ...formValues, name: e.target.value })
              }
              fullWidth
              required
            />
          </Box>
          <DialogActions>
            <Button onClick={handleCreateClose}>Cancel</Button>
            <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TopicTab;
