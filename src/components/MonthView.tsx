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
  // eslint-disable-next-line no-unused-vars
  onDateClick?: (date: string) => void;
  // eslint-disable-next-line no-unused-vars
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
  const [highlightedCell, setHighlightedCell] = useState<HTMLElement | null>(null);

  const handleMouseDown = (event: Event, e: React.MouseEvent) => {
    if (onEventDrop) {
      setDraggedEvent(event);
      setDragStartPosition({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // MouseUp is now handled globally in useEffect
  // <!-- MouseUp은 이제 useEffect에서 전역으로 처리됨 -->
  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Actual drop handling is done in global mouseup event
    // <!-- 실제 드롭 처리는 전역 mouseup 이벤트에서 수행됨 -->
  };

  useEffect(() => {
    if (draggedEvent && dragStartPosition) {
      const handleMouseMove = (e: MouseEvent) => {
        document.body.style.cursor = 'grabbing';

        // Find cell under mouse cursor
        // <!-- 마우스 커서 아래의 셀 찾기 -->
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        const cell = elementUnderMouse?.closest('td') as HTMLElement;

        // Remove previous highlight
        // <!-- 이전 하이라이트 제거 -->
        if (highlightedCell && highlightedCell !== cell) {
          highlightedCell.style.backgroundColor = '';
        }

        // Highlight new cell if valid and different from original date
        // <!-- 새 셀 하이라이트 (유효하고 원본 날짜와 다른 경우) -->
        if (cell) {
          const cellDate = cell.getAttribute('data-date');
          if (cellDate && cellDate !== draggedEvent.date) {
            cell.style.backgroundColor = '#e3f2fd'; // Light blue highlight
            // <!-- 연한 파란색 하이라이트 -->
            setHighlightedCell(cell);
          } else if (cellDate === draggedEvent.date) {
            // Don't highlight original date cell
            // <!-- 원본 날짜 셀은 하이라이트하지 않음 -->
            cell.style.backgroundColor = '';
            setHighlightedCell(null);
          }
        }
      };

      const handleMouseUpGlobal = (e: MouseEvent) => {
        // Check if mouse moved enough to consider it a drag (not just a click)
        // <!-- 드래그로 간주할 만큼 마우스가 이동했는지 확인 (단순 클릭 아님) -->
        const moveDistance = Math.sqrt(
          Math.pow(e.clientX - dragStartPosition.x, 2) +
            Math.pow(e.clientY - dragStartPosition.y, 2)
        );

        // Only process if moved more than 5 pixels
        // <!-- 5픽셀 이상 이동한 경우에만 처리 -->
        if (moveDistance > 5 && onEventDrop) {
          // Find drop target element
          // <!-- 드롭 대상 요소 찾기 -->
          const dropElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
          const cell = dropElement?.closest('td') as HTMLElement;

          if (cell) {
            // Extract date from cell's data-date attribute
            // <!-- 셀의 data-date 속성에서 날짜 추출 -->
            const newDate = cell.getAttribute('data-date');

            if (newDate && newDate !== draggedEvent.date) {
              // Only drop if date is different from original
              // <!-- 원본 날짜와 다른 경우에만 드롭 -->
              onEventDrop(draggedEvent, newDate, draggedEvent.startTime, draggedEvent.endTime);
            }
          }
        }

        // Remove highlight before resetting
        // <!-- 리셋 전 하이라이트 제거 -->
        if (highlightedCell) {
          highlightedCell.style.backgroundColor = '';
          setHighlightedCell(null);
        }

        // Reset drag state
        // <!-- 드래그 상태 리셋 -->
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
        // Clean up highlight on unmount
        // <!-- 언마운트 시 하이라이트 정리 -->
        if (highlightedCell) {
          highlightedCell.style.backgroundColor = '';
        }
      };
    }
  }, [draggedEvent, dragStartPosition, onEventDrop, highlightedCell]);

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
                      data-date={dateString}
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
