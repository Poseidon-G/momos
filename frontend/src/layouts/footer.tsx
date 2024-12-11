import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer">
      <Container maxWidth="lg" sx={{ py: 2, borderTop: '1px solid #ddd' }}>
        <Typography variant="body2" color="textSecondary" align="center">
          &copy; 2024 eCommerce Site. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;