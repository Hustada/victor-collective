import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { palette } from '../theme';

export interface Skill {
  name: string;
  level: number;
  description: string;
  color: string;
}

const SkillBar: React.FC<{ skill: Skill; index: number }> = ({ skill, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
  >
    <Box sx={{ mb: 4 }}>
      {/* Skill header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          mb: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.05em',
          }}
        >
          {skill.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: skill.color,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.875rem',
          }}
        >
          {skill.level}%
        </Typography>
      </Box>

      {/* Skill description */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 2,
          fontSize: '0.875rem',
        }}
      >
        {skill.description}
      </Typography>

      {/* Progress bar */}
      <Box
        sx={{
          height: 4,
          background: palette.border.subtle,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${skill.color}, ${alpha(skill.color, 0.6)})`,
            boxShadow: `0 0 20px ${alpha(skill.color, 0.5)}`,
          }}
        />
      </Box>
    </Box>
  </motion.div>
);

export default SkillBar;
