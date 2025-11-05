import { Delete, Repeat } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material';
import React from 'react';

import { Event } from '../../types';

interface MoreEventsModalProps {
  open: boolean;
  onClose: () => void;
  events: Event[];
  selectedDate: string;
  // eslint-disable-next-line no-unused-vars
  onEventClick: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  onDeleteClick: (eventId: string) => void;
}

/**
 * MoreEventsModal component
 * Displays a list of events for a specific date in a simple list format
 */
const MoreEventsModal = ({
  open,
  onClose,
  events,
  selectedDate,
  onEventClick,
  onDeleteClick,
}: MoreEventsModalProps) => {
  // Format date for display (YYYY-MM-DD to YYYY년 M월 D일)
  const formatDateForDisplay = (dateString: string): string => {
    // dateString is in YYYY-MM-DD format, parse directly
    if (!dateString || dateString.trim() === '') {
      return '일정 목록';
    }
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      return '일정 목록';
    }
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return '일정 목록';
    }
    return `${year}년 ${month}월 ${day}일`;
  };

  const handleEventTitleClick = (event: Event) => {
    onEventClick(event);
    onClose();
  };

  const handleDeleteClick = (eventId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event title click when clicking delete button
    onDeleteClick(eventId);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formatDateForDisplay(selectedDate)} 일정 목록</DialogTitle>
      <DialogContent>
        <List>
          {events.length === 0 ? (
            <ListItem>
              <ListItemText primary="일정이 없습니다." />
            </ListItem>
          ) : (
            events.map((event) => {
              const isRepeating = event.repeat.type !== 'none';
              return (
                <ListItem
                  key={event.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => handleEventTitleClick(event)}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    {isRepeating && <Repeat data-testid="RepeatIcon" fontSize="small" />}
                    <ListItemText primary={event.title} primaryTypographyProps={{ noWrap: true }} />
                    <IconButton
                      edge="end"
                      aria-label="Delete event"
                      onClick={(e) => handleDeleteClick(event.id, e)}
                      size="small"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.light',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </ListItem>
              );
            })
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default MoreEventsModal;
