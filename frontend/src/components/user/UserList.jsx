import { useEffect, useState } from "react";
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    CircularProgress,
    Box,
    Button,
    Modal,
} from "@mui/material";
import { getUsers } from "../../api/client";
import CreateUserForm from "./CreateUserForm.jsx";

export default function UserList({ refresh, onRefresh }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [refresh]);

    const handleUserCreated = () => {
        setOpenModal(false);
        if (onRefresh) onRefresh();
    };

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Usuarios
                </Typography>
                <Button variant="contained" onClick={() => setOpenModal(true)}>
                    Crear Usuario
                </Button>
            </Box>

            {loading && <CircularProgress size={24} />}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nombre</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Balance</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>${parseFloat(user.Wallet?.balance || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Paper
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        p: 4,
                        minWidth: 400,
                    }}
                >
                    <CreateUserForm onUserCreated={handleUserCreated} />
                </Paper>
            </Modal>
        </Box>
    );
}
