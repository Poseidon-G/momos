import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface VerifyCodeModalProps {
  open: boolean;
  handleClose: () => void;
  handleVerifyCode: (email: string, code: string) => void;
}

export default function VerifyCodeModal({ open, handleClose, handleVerifyCode }: VerifyCodeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
    
  const email = "dummy@email.com"; // Use the email from the store

  const handleSubmit = () => {
    if (code.length !== 4) {
      setError('Verification code must be 6 digits.');
      return;
    }
    setError('');

    if (email) {
      handleVerifyCode(email, code);
    } else {
      setError('Email is not available.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Verification Code</DialogTitle>
      <DialogContent>
        <Typography>Please enter the 6-digit verification code sent to your email.</Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Verification Code"
          fullWidth
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          inputProps={{ maxLength: 6 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
}