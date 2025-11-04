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
import {
  formatDate,
  formatMonth,
  getEventsForDay,
  getWeeksAtMonth,
} from '../../utils/dateUtils.ts';
import { getRepeatBackgroundColor } from '../../utils/repeatTypeColors.ts';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

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

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
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
        p: 0.5,
        my: 0.5,
        backgroundColor,
        borderRadius: 1,
        fontWeight: isNotified ? 'bold' : 'normal',
        color: isNotified ? '#d32f2f' : 'inherit',
        minHeight: '18px',
        width: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0 : 1,
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
  day: number | null;
  currentDate: Date;
  children: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  onDateClick?: (date: Date) => void;
}

const DroppableCell = ({ day, currentDate, children, onDateClick }: DroppableCellProps) => {
  const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
  const { setNodeRef, isOver } = useDroppable({
    id: date ? `date-${date.toISOString()}` : `empty-${Math.random()}`,
    data: { date },
  });

  const handleClick = () => {
    if (date && onDateClick) {
      onDateClick(date);
    }
  };

  if (!day) {
    return (
      <TableCell
        sx={{
          height: '120px',
          verticalAlign: 'top',
          width: '14.28%',
          padding: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      />
    );
  }

  return (
    <TableCell
      ref={setNodeRef}
      data-date={date?.toISOString()}
      onClick={handleClick}
      sx={{
        height: '120px',
        verticalAlign: 'top',
        width: '14.28%',
        padding: 1,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: isOver ? '#e3f2fd' : 'transparent',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
      }}
    >
      {children}
    </TableCell>
  );
};

const MonthView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onEventDrop,
  onDateClick,
}: MonthViewProps) => {
  const weeks = getWeeksAtMonth(currentDate);
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
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
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
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];
                    const dayEvents = day ? getEventsForDay(filteredEvents, day) : [];

                    return (
                      <DroppableCell
                        key={dayIndex}
                        day={day}
                        currentDate={currentDate}
                        onDateClick={onDateClick}
                      >
                        {day && (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
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
                          </>
                        )}
                      </DroppableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
      <DragOverlay>
        {draggedEvent ? (
          <Box
            sx={{
              p: 0.5,
              my: 0.5,
              backgroundColor: getRepeatBackgroundColor(draggedEvent.repeat.type, false),
              borderRadius: 1,
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

export default MonthView;
