import { Notifications, Repeat, Edit, Delete } from '@mui/icons-material';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { Event, RepeatType } from '../types';

interface EventItemProps {
  event: Event;
  isNotified: boolean;
  notificationOptions: Array<{ value: number; label: string }>;
  // eslint-disable-next-line no-unused-vars
  onEdit: (_event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (_event: Event) => void;
}

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

export default function EventItem({
  event,
  isNotified,
  notificationOptions,
  onEdit,
  onDelete,
}: EventItemProps) {
  return (
    <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {isNotified && <Notifications color="error" />}
            {event.repeat.type !== 'none' && (
              <Tooltip
                title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                  event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                }`}
              >
                <Repeat fontSize="small" />
              </Tooltip>
            )}
            <Typography
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'error' : 'inherit'}
            >
              {event.title}
            </Typography>
          </Stack>
          <Typography>{event.date}</Typography>
          <Typography>
            {event.startTime} - {event.endTime}
          </Typography>
          <Typography>{event.description}</Typography>
          <Typography>{event.location}</Typography>
          <Typography>카테고리: {event.category}</Typography>
          {event.repeat.type !== 'none' && (
            <Typography>
              반복: {event.repeat.interval}
              {event.repeat.type === 'daily' && '일'}
              {event.repeat.type === 'weekly' && '주'}
              {event.repeat.type === 'monthly' && '월'}
              {event.repeat.type === 'yearly' && '년'}
              마다
              {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
            </Typography>
          )}
          <Typography>
            알림:{' '}
            {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
          </Typography>
        </Stack>
        <Stack>
          <IconButton aria-label="Edit event" onClick={() => onEdit(event)}>
            <Edit />
          </IconButton>
          <IconButton aria-label="Delete event" onClick={() => onDelete(event)}>
            <Delete />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
