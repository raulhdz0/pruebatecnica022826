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
import CreateUserForm from "./CreateUserForm";
import TransferForm from "../transfer/TransferForm";

interface Wallet {
  balance: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  Wallet?: Wallet;
}

interface UserListProps {
  refresh: number;
  onRefresh?: () => void;
}

export default function UserList({ refresh, onRefresh }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [openUserModal, setOpenUserModal] = useState<boolean>(false);
  const [openTransferModal, setOpenTransferModal] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refresh]);

  const handleUserCreated = () => {
    setOpenUserModal(false);
    if (onRefresh) onRefresh();
  };

  const handleTransferDone = () => {
    setOpenTransferModal(false);
    if (onRefresh) onRefresh();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Usuarios
        </Typography>
        <Button variant="contained" onClick={() => setOpenUserModal(true)}>
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No hay usuarios para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${parseFloat(String(user.Wallet?.balance || 0)).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Button variant="outlined" onClick={() => setOpenTransferModal(true)}>
          Nueva Transferencia
        </Button>
      </Box>

      <Modal open={openUserModal} onClose={() => setOpenUserModal(false)}>
        <Paper sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", p: 4, minWidth: 400 }}>
          <CreateUserForm onUserCreated={handleUserCreated} />
        </Paper>
      </Modal>

      <Modal open={openTransferModal} onClose={() => setOpenTransferModal(false)}>
        <Paper sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", p: 4, minWidth: 400 }}>
          <TransferForm onTransferDone={handleTransferDone} />
        </Paper>
      </Modal>
    </Box>
  );
}
