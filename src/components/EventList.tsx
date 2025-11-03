import { FormControl, FormLabel, Stack, TextField, Typography } from '@mui/material';
import { Event } from '../types';
import EventItem from './EventItem.tsx';

interface EventListProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  notificationOptions: Array<{ value: number; label: string }>;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (event: Event) => void;
}

export default function EventList({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  notificationOptions,
  onEditEvent,
  onDeleteEvent,
}: EventListProps) {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <FormControl fullWidth>
        <FormLabel htmlFor="search">일정 검색</FormLabel>
        <TextField
          id="search"
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            notificationOptions={notificationOptions}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        ))
      )}
    </Stack>
  );
}

