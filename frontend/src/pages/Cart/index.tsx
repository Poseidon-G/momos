// CartPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, TextField } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { CartItem } from '../../types/cartType';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { createOrderAction } from '../../redux/reducers/orderReducer';
import LoadingPage from '../../components/LoadingPage';

const CartPage = () => {

  // Initial cart items from local storage
  const initialCartItems: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems, setCartItems] = useState(initialCartItems);

  // Sync state with local storage when the component mounts and when cartItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate the total price of the cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // Handle quantity change and update local storage if quantity is 0
  const handleQuantityChange = (id: string, change: number) => {
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === id) {
        item.quantity += change;
      }
      return item;
    }).filter((item) => item.quantity > 0);

    setCartItems(updatedCartItems);
  };

  // Get token and order state from redux store
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const order = useSelector((state: RootState) => state.order.order);
  const loading = useSelector((state: RootState) => state.order.loading);
  const error = useSelector((state: RootState) => state.order.error);

  const handleCreateOrder = async () => {

    // Ensure only one product is in the cart
    if (cartItems.length !== 1) {
      toast.error("Only one product can be ordered at a time");
      return;
    }

    console.log("##CREATE_ORDER", token);

    const body = {
      productId: cartItems[0].id,
      quantity: cartItems[0].quantity,
    };

    if (token) {
      console.log("CALLING CREATE_ORDER_ACTION");
      const response = await createOrderAction(token, body)(dispatch);

      if (response.status === 200) {
        toast.success('Order created successfully');
        // Clear cart after successful order in local storage
        localStorage.removeItem('cart');
        setCartItems([]);
      } else {
        toast.error('Failed to create order');
      }
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img src={"/products/" + item.category.code + "/" + item.img} alt={item.name} style={{ width: '100px', marginRight: '10px' }} />
                  {item.name}
                </TableCell>
                <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleQuantityChange(item.id, -1)} disabled={item.quantity <= 0}>
                    <Remove />
                  </IconButton>
                  <TextField
                    value={item.quantity}
                    variant="outlined"
                    size="small"
                    inputProps={{ min: 0, style: { textAlign: 'center', width: '40px' } }}
                  />
                  <IconButton onClick={() => handleQuantityChange(item.id, 1)}>
                    <Add />
                  </IconButton>
                </TableCell>
                <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" component="div" align="right" sx={{ marginTop: 2 }}>
        Total: ${calculateTotal()}
      </Typography>

      <Button onClick={handleCreateOrder} variant="contained" color="primary" sx={{ marginTop: 2, display: "block", marginLeft: "auto" }}>
        Create Order
      </Button>
    </Container>
  );
};

export default CartPage;
