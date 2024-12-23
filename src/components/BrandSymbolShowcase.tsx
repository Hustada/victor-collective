import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import BrandSymbol from './BrandSymbol';

const BrandSymbolShowcase: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Brand Symbol Variations
      </Typography>
      
      <Stack 
        direction="row" 
        spacing={4} 
        alignItems="center" 
        justifyContent="center"
        sx={{ 
          flexWrap: 'wrap', 
          gap: 4,
          p: 4,
          background: 'linear-gradient(45deg, #000000 30%, #D35400 90%)',
          borderRadius: 2
        }}
      >
        {/* First image variation */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
            Victor Collective 1
          </Typography>
          <BrandSymbol imageSrc="/assets/brand/victorcol.jpg" />
        </Box>

        {/* Second image variation */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
            Victor Collective 2
          </Typography>
          <BrandSymbol imageSrc="/assets/brand/victorco2l.jpg" />
        </Box>

        {/* Third image variation */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
            Victor Collective 4
          </Typography>
          <BrandSymbol imageSrc="/assets/brand/victorcol4.jpg" />
        </Box>

        {/* Larger size */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
            Large (200px)
          </Typography>
          <BrandSymbol size={200} />
        </Box>

        {/* Small size */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
            Small (50px)
          </Typography>
          <BrandSymbol size={50} />
        </Box>

        {/* Non-animated */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'white' }}>
            Non-Animated
          </Typography>
          <BrandSymbol animated={false} />
        </Box>
      </Stack>
    </Container>
  );
};

export default BrandSymbolShowcase;
