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
import React, { useEffect, useState } from 'react';

import { Event, RepeatType } from '../types';
import { formatDate, formatMonth, getEventsForDay, getWeeksAtMonth } from '../utils/dateUtils';

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDateClick?: (date: string) => void;
  onEventDrop?: (event: Event, newDate: string, newStartTime: string, newEndTime: string) => void;
}

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

export default function MonthView({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onDateClick,
  onEventDrop,
}: MonthViewProps) {
  const weeks = getWeeksAtMonth(currentDate);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (event: Event, e: React.MouseEvent) => {
    if (onEventDrop) {
      setDraggedEvent(event);
      setDragStartPosition({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (draggedEvent && onEventDrop && dragStartPosition) {
      // Check if mouse moved enough to consider it a drag (not just a click)
      // <!-- 드래그로 간주할 만큼 마우스가 이동했는지 확인 (단순 클릭 아님) -->
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPosition.x, 2) + Math.pow(e.clientY - dragStartPosition.y, 2)
      );

      // Only process if moved more than 5 pixels
      // <!-- 5픽셀 이상 이동한 경우에만 처리 -->
      if (moveDistance > 5) {
        const target = e.target as HTMLElement;
        const cell = target.closest('td') as HTMLElement;

        // Make sure we're not dropping on the same cell or event box
        // <!-- 같은 셀이나 이벤트 박스에 드롭하지 않았는지 확인 -->
        const eventBox = target.closest('div[class*="Box"]');
        if (cell && !eventBox?.closest('td')?.isSameNode(cell)) {
          // Extract date from cell (day number)
          // <!-- 셀에서 날짜 추출 (일 수) -->
          const dayText = cell.querySelector('p[class*="Typography"]')?.textContent;
          if (dayText) {
            const day = parseInt(dayText, 10);
            if (!isNaN(day) && day > 0) {
              // Format date using currentDate context
              // <!-- currentDate 컨텍스트를 사용하여 날짜 포맷 -->
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const newDate = `${year}-${month}-${dayStr}`;

              // Keep original time for now (simplified)
              // <!-- 현재는 원본 시간 유지 (단순화) -->
              onEventDrop(draggedEvent, newDate, draggedEvent.startTime, draggedEvent.endTime);
            }
          }
        }
      }

      setDraggedEvent(null);
      setDragStartPosition(null);
    }
  };

  useEffect(() => {
    if (draggedEvent) {
      const handleMouseMove = () => {
        document.body.style.cursor = 'grabbing';
      };
      const handleMouseUpGlobal = () => {
        setDraggedEvent(null);
        setDragStartPosition(null);
        document.body.style.cursor = '';
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUpGlobal);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
        document.body.style.cursor = '';
      };
    }
  }, [draggedEvent]);

  return (
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
                  const isEmpty = dayEvents.length === 0;

                  return (
                    <TableCell
                      key={dayIndex}
                      onClick={() => {
                        if (day && isEmpty && onDateClick) {
                          onDateClick(dateString);
                        }
                      }}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: day && isEmpty ? 'pointer' : 'default',
                      }}
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
                              <Box
                                key={event.id}
                                onMouseDown={(e) => handleMouseDown(event, e)}
                                onMouseUp={handleMouseUp}
                                sx={{
                                  p: 0.5,
                                  my: 0.5,
                                  backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                  borderRadius: 1,
                                  fontWeight: isNotified ? 'bold' : 'normal',
                                  color: isNotified ? '#d32f2f' : 'inherit',
                                  minHeight: '18px',
                                  width: '100%',
                                  overflow: 'hidden',
                                  cursor: onEventDrop ? 'grab' : 'default',
                                  '&:active': {
                                    cursor: onEventDrop ? 'grabbing' : 'default',
                                  },
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isNotified && <Notifications fontSize="small" />}
                                  {isRepeating && (
                                    <Tooltip
                                      title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
                                        event.repeat.endDate
                                          ? ` (종료: ${event.repeat.endDate})`
                                          : ''
                                      }`}
                                    >
                                      <Repeat fontSize="small" />
                                    </Tooltip>
                                  )}
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                  >
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Box>
                            );
                          })}
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
