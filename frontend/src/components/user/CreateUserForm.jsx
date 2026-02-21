import { useState } from "react";
import {
    TextField,
    Button,
    Alert,
    Box,
    CircularProgress,
    Typography,
} from "@mui/material";
import { createUser } from "../../api/client";
import { toast } from "react-toastify";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateUserForm({ onUserCreated }) {
    const [form, setForm] = useState({ name: "", email: "", balance: "" });
    const [touched, setTouched] = useState({ name: false, email: false, balance: false });
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const errors = {
        name: !form.name.trim() ? "El nombre es requerido." : "",
        email: !form.email.trim()
            ? "El email es requerido."
            : !emailRegex.test(form.email)
                ? "El email no es válido."
                : "",
        balance:
            form.balance !== "" && parseFloat(form.balance) < 0
                ? "El balance no puede ser negativo."
                : "",
    };

    const isFormValid = !errors.name && !errors.email && !errors.balance;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setTouched({ ...touched, [e.target.name]: true });
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setTouched({ name: true, email: true, balance: true });

        if (!isFormValid) return;

        setLoading(true);
        try {
            await createUser({
                name: form.name,
                email: form.email,
                balance: parseFloat(form.balance) || 0,
            });
            toast.success("Usuario creado exitosamente.");
            if (onUserCreated) onUserCreated();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" fontWeight="bold" textAlign="center">
                Crear Usuario
            </Typography>

            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField
                label="Nombre"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                size="small"
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                required
            />
            <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                size="small"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                required
            />
            <TextField
                label="Balance inicial"
                name="balance"
                type="number"
                value={form.balance}
                onChange={handleChange}
                onBlur={handleBlur}
                size="small"
                error={touched.balance && !!errors.balance}
                helperText={touched.balance && errors.balance}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={loading || !isFormValid}
            >
                {loading ? <CircularProgress size={20} /> : "Crear"}
            </Button>
        </Box>
    );
}
