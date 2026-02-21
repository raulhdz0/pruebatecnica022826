import { useState } from "react";
import { Container, Typography, Box, Divider } from "@mui/material";
import UserList from "./components/user/UserList.jsx";
import TransferForm from "./components/transfer/TransferForm.jsx";

function App() {
    const [refresh, setRefresh] = useState(0);

    const handleRefresh = () => setRefresh((prev) => prev + 1);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                Mini Wallet
            </Typography>

            <Box sx={{ mb: 4, mt: 4}}>
                <UserList refresh={refresh} onRefresh={handleRefresh} />
            </Box>
        </Container>
    );
}

export default App;
