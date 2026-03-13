import React from 'react';
import { Box, Stack, Skeleton } from '@mui/material';
import DepthCard from './ui/DepthCard';

const ProjectSkeleton: React.FC = () => (
  <DepthCard shadowOffset={10}>
    <Skeleton variant="rectangular" sx={{ aspectRatio: '16/10' }} />
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Skeleton width={60} height={24} />
        <Skeleton width={80} height={24} />
        <Skeleton width={50} height={24} />
      </Stack>
      <Skeleton width="70%" height={32} sx={{ mb: 1.5 }} />
      <Skeleton width="100%" height={20} />
      <Skeleton width="90%" height={20} />
    </Box>
  </DepthCard>
);

export default ProjectSkeleton;
