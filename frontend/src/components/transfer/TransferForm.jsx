import { useState, useEffect } from "react";
import {
    Typography,
    TextField,
    Button,
    Alert,
    Box,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import { createTransfer, getUsers } from "../../api/client";
import { v4 as uuidv4 } from "uuid";

export default function TransferForm({ onTransferDone }) {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ from_user_id: "", to_user_id: "", amount: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        getUsers().then(setUsers).catch(console.error);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.from_user_id || !form.to_user_id || !form.amount) {
            setError("Todos los campos son requeridos.");
            return;
        }

        if (form.from_user_id === form.to_user_id) {
            setError("El usuario origen y destino no pueden ser el mismo.");
            return;
        }

        if (parseFloat(form.amount) <= 0) {
            setError("El monto debe ser mayor a cero.");
            return;
        }

        setLoading(true);
        try {
            await createTransfer({
                from_user_id: form.from_user_id,
                to_user_id: form.to_user_id,
                amount: parseFloat(form.amount),
                idempotency_key: uuidv4(),
            });
            setSuccess("Transferencia realizada exitosamente.");
            setForm({ from_user_id: "", to_user_id: "", amount: "" });
            if (onTransferDone) onTransferDone();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Realizar Transferencia
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                    select
                    label="Usuario origen"
                    name="from_user_id"
                    value={form.from_user_id}
                    onChange={handleChange}
                    size="small"
                    sx={{ minWidth: 180 }}
                >
                    {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                            {u.name} (${parseFloat(u.Wallet?.balance || 0).toFixed(2)})
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Usuario destino"
                    name="to_user_id"
                    value={form.to_user_id}
                    onChange={handleChange}
                    size="small"
                    sx={{ minWidth: 180 }}
                >
                    {users.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                            {u.name} (${parseFloat(u.Wallet?.balance || 0).toFixed(2)})
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Monto"
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    size="small"
                    sx={{ minWidth: 120 }}
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : "Transferir"}
                </Button>
            </Box>
        </Box>
    );
}
