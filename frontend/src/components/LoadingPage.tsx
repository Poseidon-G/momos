import React from "react";
import { Box, CircularProgress } from "@mui/material";

export default function LoadingPage() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        </Box>
    );
}