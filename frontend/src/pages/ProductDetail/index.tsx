import React from 'react';
import { Container, Typography, Grid, CardMedia, Button, Box } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Example data for a single product
const exampleProduct = {
  id: 1,
  name: 'Product 1',
  price: 29.99,
  image: 'https://via.placeholder.com/300',
  description: 'This is a great product that helps you achieve your goals. It is made from high-quality materials and is highly rated by our customers. Perfect for anyone looking to improve their lifestyle!'
};

const ProductDetail = () => {
  const { id } = useParams();

  // In a real application, you'd fetch product data by id here.
  const product = id ? (exampleProduct.id === parseInt(id) ? exampleProduct : null) : null;

  if (!product) {
    return <Typography variant="h5">Product not found</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={product.image}
            alt={product.name}
            sx={{ width: '100%', height: 'auto', borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="div" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 2 }}>
              {product.description}
            </Typography>
            <Typography variant="h5" color="text.primary" sx={{ marginBottom: 4 }}>
              Price: ${product.price.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" startIcon={<ShoppingCartIcon />}>
                Add to Cart
              </Button>
              <Button variant="outlined" color="secondary" component={Link} to="/">
                Back to Home
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
