import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { Event, RepeatType } from '../../types.ts';
import { formatWeek, getWeekDates } from '../../utils/dateUtils.ts';
import { getRepeatBackgroundColor } from '../../utils/repeatTypeColors.ts';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const eventBoxCommonStyles = {
  p: 0.5,
  my: 0.5,
  borderRadius: 1,
  minHeight: '18px',
  width: '100%',
  overflow: 'hidden',
} as const;

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

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  // eslint-disable-next-line no-unused-vars
  onEventDrop?: (event: Event, newDate: Date) => void;
  // eslint-disable-next-line no-unused-vars
  onDateClick?: (date: Date) => void;
}

interface DraggableEventBoxProps {
  event: Event;
  isNotified: boolean;
  isRepeating: boolean;
}

const DraggableEventBox = ({ event, isNotified, isRepeating }: DraggableEventBoxProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: { event },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const backgroundColor = getRepeatBackgroundColor(event.repeat.type, isNotified);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        ...eventBoxCommonStyles,
        backgroundColor,
        fontWeight: isNotified ? 'bold' : 'normal',
        color: isNotified ? '#d32f2f' : 'inherit',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        ...style,
      }}
      {...listeners}
      {...attributes}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRepeating && (
          <Tooltip
            title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
              event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
            }`}
          >
            <Repeat fontSize="small" />
          </Tooltip>
        )}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};

interface DroppableCellProps {
  date: Date;
  children: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  onDateClick?: (date: Date) => void;
}

const DroppableCell = ({ date, children, onDateClick }: DroppableCellProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${date.toISOString()}`,
    data: { date },
  });

  const handleClick = () => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <TableCell
      ref={setNodeRef}
      key={date.toISOString()}
      data-date={date.toISOString()}
      onClick={handleClick}
      sx={{
        height: '120px',
        verticalAlign: 'top',
        width: '14.28%',
        padding: 1,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        backgroundColor: isOver ? '#e3f2fd' : 'transparent',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
      }}
    >
      {children}
    </TableCell>
  );
};

const WeekView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  onEventDrop,
  onDateClick,
}: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const eventData = event.active.data.current as { event: Event };
    if (eventData?.event) {
      setDraggedEvent(eventData.event);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onEventDrop) {
      setDraggedEvent(null);
      return;
    }

    const eventData = active.data.current as { event: Event };
    const dropData = over.data.current as { date: Date };

    if (eventData?.event && dropData?.date) {
      onEventDrop(eventData.event, dropData.date);
    }

    setDraggedEvent(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => {
                  const dayEvents = filteredEvents.filter(
                    (event) => new Date(event.date).toDateString() === date.toDateString()
                  );

                  return (
                    <DroppableCell key={date.toISOString()} date={date} onDateClick={onDateClick}>
                      <Typography variant="body2" fontWeight="bold">
                        {date.getDate()}
                      </Typography>
                      {dayEvents.map((event) => {
                        const isNotified = notifiedEvents.includes(event.id);
                        const isRepeating = event.repeat.type !== 'none';

                        return (
                          <DraggableEventBox
                            key={event.id}
                            event={event}
                            isNotified={isNotified}
                            isRepeating={isRepeating}
                          />
                        );
                      })}
                    </DroppableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
      <DragOverlay>
        {draggedEvent ? (
          <Box
            sx={{
              ...eventBoxCommonStyles,
              backgroundColor: getRepeatBackgroundColor(draggedEvent.repeat.type, false),
              opacity: 0.8,
              transform: 'rotate(5deg)',
            }}
          >
            <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              {draggedEvent.title}
            </Typography>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default WeekView;
