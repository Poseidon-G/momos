import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import {
  Box,
  Button,
  Card as MuiCard,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from './CustomIcons';
import { loginAction, verifyTokenAction } from '../../redux/reducers/authReducer';
import VerifyCodeModal from './VerifyCode'; // Import VerifyCodeModal
import { loginApi, verifyCodeApi } from '../../services/authService';
import { toast } from 'react-toastify';
import { redirect, useNavigate } from 'react-router-dom';
import * as Yup from 'yup'
import { useFormik } from 'formik';
import { useAuth } from '../../context/AuthContext';

const Card = styled(MuiCard)(({ theme }) => ({
  // Custom styles here
}));

export default function SignInCard() {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [openVerifyCode, setOpenVerifyCode] = useState(false); // State to control modal
  const navigate = useNavigate(); 
  const dispatch = useDispatch<AppDispatch>();
  const { login } = useAuth(); // Get login function from context

  const handleForgotPasswordOpen = () => setOpenForgotPassword(true);
  const handleForgotPasswordClose = () => setOpenForgotPassword(false);

  const handleVerifyCodeClose = () => setOpenVerifyCode(false);

  const handleVerifyCode = async (email: string, code: string) => {
    // Implement verification logic here, e.g., dispatch to verify the code

    const result: any = await dispatch(verifyTokenAction(email, code));

    if (result.status === 200) {
      toast.success('Verification successful');
      navigate('/'); // Redirect to dashboard after verification
    }
    setOpenVerifyCode(false); // Close the modal after verification
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (emailError || passwordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    // Dispatch login action and open the verify code modal on success
    const result: any = await dispatch(loginAction(email, password));
  };

  const validationSchema = Yup.object({
    email: Yup.string().required('Username is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const result: any = await loginApi(values.email, values.password);
        console.log("Login result", result);
        if (result.statusCode === 200) {
          
          // Use window.btoa for Base64 encoding
          const basicAuth = `Basic ${window.btoa(`${values.email}:${values.password}`)}`;
          
          // Use login function from context
          login(basicAuth);
          
          toast.success('Login successful');
          navigate('/');
          
        } else {
          toast.error(result.message || 'Login failed');
        }
      } catch (error: any) {
        toast.error(error.message || 'An unexpected error occurred');
      }
    },
  });
  



  return (
    <Card variant="outlined">
      <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
        Sign in
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            fullWidth
            id="email"
            name="email"
            placeholder="your@email.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link component="button" type="button" onClick={handleForgotPasswordOpen} variant="body2" sx={{ alignSelf: 'baseline' }}>
              Forgot your password?
            </Link>
          </Box>
          <TextField
           fullWidth
            id="password"
            name="password"
            type="password"
            placeholder="••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </FormControl>
        <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
        <ForgotPassword open={openForgotPassword} handleClose={handleForgotPasswordClose} />
        <Button type="submit" fullWidth variant="contained" >
          Sign in
        </Button>
        <Typography sx={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup/" variant="body2" sx={{ alignSelf: 'center' }}>
            Sign up
          </Link>
        </Typography>
      </Box>
      <Divider>or</Divider>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button fullWidth variant="outlined" onClick={() => alert('Sign in with Google')} startIcon={<GoogleIcon />}>
          Sign in with Google
        </Button>
        <Button fullWidth variant="outlined" onClick={() => alert('Sign in with Facebook')} startIcon={<FacebookIcon />}>
          Sign in with Facebook
        </Button>
      </Box>
      
      </Card>
  );
}
