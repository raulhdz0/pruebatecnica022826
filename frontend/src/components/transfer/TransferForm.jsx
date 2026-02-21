import { useState, useEffect } from "react";
import {
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import { createTransfer, getUsers } from "../../api/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

export default function TransferForm({ onTransferDone }) {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ from_user_id: "", to_user_id: "", amount: "" });
    const [touched, setTouched] = useState({ from_user_id: false, to_user_id: false, amount: false });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUsers().then(setUsers).catch(console.error);
    }, []);

    const fromUser = users.find((u) => u.id === form.from_user_id);
    const availableBalance = parseFloat(fromUser?.Wallet?.balance || 0);

    const errors = {
        from_user_id: !form.from_user_id ? "El usuario origen es requerido." : "",
        to_user_id: !form.to_user_id
            ? "El usuario destino es requerido."
            : form.to_user_id === form.from_user_id
                ? "El usuario destino no puede ser el mismo que el origen."
                : "",
        amount: !form.amount
            ? "El monto es requerido."
            : parseFloat(form.amount) <= 0
                ? "El monto debe ser mayor a cero."
                : parseFloat(form.amount) > availableBalance
                    ? `Saldo insuficiente. Disponible: $${availableBalance.toFixed(2)}`
                    : "",
    };

    const isFormValid = !errors.from_user_id && !errors.to_user_id && !errors.amount;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setTouched({ ...touched, [e.target.name]: true });
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ from_user_id: true, to_user_id: true, amount: true });
        if (!isFormValid) return;

        setLoading(true);
        try {
            await createTransfer({
                from_user_id: form.from_user_id,
                to_user_id: form.to_user_id,
                amount: parseFloat(form.amount),
                idempotency_key: uuidv4(),
            });
            toast.success("Transferencia realizada exitosamente.");
            setForm({ from_user_id: "", to_user_id: "", amount: "" });
            setTouched({ from_user_id: false, to_user_id: false, amount: false });
            if (onTransferDone) onTransferDone();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" fontWeight="bold" textAlign="center">
                Nueva Transferencia
            </Typography>

            <TextField
                select
                label="Usuario origen"
                name="from_user_id"
                value={form.from_user_id}
                onChange={handleChange}
                onBlur={handleBlur}
                size="small"
                error={touched.from_user_id && !!errors.from_user_id}
                helperText={touched.from_user_id && errors.from_user_id}
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
                onBlur={handleBlur}
                size="small"
                error={touched.to_user_id && !!errors.to_user_id}
                helperText={touched.to_user_id && errors.to_user_id}
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
                onBlur={handleBlur}
                size="small"
                error={touched.amount && !!errors.amount}
                helperText={touched.amount && errors.amount}
            />

            <Button type="submit" variant="contained" disabled={loading || !isFormValid}>
                {loading ? <CircularProgress size={20} /> : "Transferir"}
            </Button>
        </Box>
    );
}
