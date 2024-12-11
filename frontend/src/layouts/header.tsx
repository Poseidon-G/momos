import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { logOutAction } from '../redux/reducers/authReducer';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

interface HeaderProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

const Header = ({ isLoggedIn, isAdmin }: HeaderProps) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // remove token from local storage
    localStorage.removeItem('token');
    //navigate to login page
    navigate('/login');
  }
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginLeft:2 }} >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Crawler Site
        </Link>
        </Typography>
        {isLoggedIn ? (
          <>
            <Button color="inherit" 
              onClick={handleLogout}
              >Logout</Button>
          </>
        ) : (
          <Button component={Link} to="/login" color="inherit">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
