import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';
import type React from 'react';

interface ViewToolbarProps {
  view: 'week' | 'month';
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  // eslint-disable-next-line no-unused-vars
  navigate: (dir: 'prev' | 'next') => void;
}

const ViewToolbar = ({ view, setView, navigate }: ViewToolbarProps) => {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
        <ChevronLeft />
      </IconButton>
      <Select
        size="small"
        aria-label="뷰 타입 선택"
        value={view}
        onChange={(e) => setView(e.target.value as 'week' | 'month')}
      >
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>
      <IconButton aria-label="Next" onClick={() => navigate('next')}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
};

export default ViewToolbar;
