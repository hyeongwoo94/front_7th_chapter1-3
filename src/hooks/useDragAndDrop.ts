import { useCallback, useRef, useState } from 'react';

import { Event } from '../types';
import {
  calculateDateFromDrop,
  calculateTimeFromDrop,
  isValidDropTarget,
} from '../utils/dragDropUtils';

interface DragState {
  isDragging: boolean;
  draggedEvent: Event | null;
  dragStartPosition: { x: number; y: number } | null;
}

interface UseDragAndDropProps {
  onDrop: (_event: Event, _newDate: string, _newStartTime: string, _newEndTime: string) => void;
}

export const useDragAndDrop = ({ onDrop }: UseDragAndDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEvent: null,
    dragStartPosition: null,
  });

  const dragElementRef = useRef<HTMLElement | null>(null);

  const handleDragStart = useCallback(
    (event: Event, element: HTMLElement, clientX: number, clientY: number) => {
      setDragState({
        isDragging: true,
        draggedEvent: event,
        dragStartPosition: { x: clientX, y: clientY },
      });
      dragElementRef.current = element;

      // Change cursor style
      // <!-- 커서 스타일 변경 -->
      document.body.style.cursor = 'grabbing';
    },
    []
  );

  const handleDragMove = useCallback(() => {
    if (!dragState.isDragging) return;

    // Update drag position for visual feedback
    // <!-- 시각적 피드백을 위해 드래그 위치 업데이트 -->
    // TODO: Add visual feedback (highlight drop zones)
    // <!-- TODO: 시각적 피드백 추가 (드롭 영역 강조) -->
  }, [dragState.isDragging]);

  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState.draggedEvent || !dragElementRef.current) {
        setDragState({
          isDragging: false,
          draggedEvent: null,
          dragStartPosition: null,
        });
        document.body.style.cursor = '';
        return;
      }

      // Find drop target element
      // <!-- 드롭 대상 요소 찾기 -->
      const dropElement = document.elementFromPoint(clientX, clientY) as HTMLElement;
      const targetCell = dropElement?.closest('td[class*="MuiTableCell"]') as HTMLElement;

      if (isValidDropTarget(targetCell)) {
        // Extract date from cell
        // <!-- 셀에서 날짜 추출 -->
        const cellDate = extractDateFromCell(targetCell);

        if (cellDate) {
          // Calculate new date and time
          // <!-- 새 날짜 및 시간 계산 -->
          const newDate = calculateDateFromDrop(clientX, clientY, targetCell, cellDate);
          const { startTime, endTime } = calculateTimeFromDrop(
            clientY,
            targetCell,
            dragState.draggedEvent.startTime,
            dragState.draggedEvent.endTime
          );

          // Call onDrop callback
          // <!-- onDrop 콜백 호출 -->
          onDrop(dragState.draggedEvent, newDate, startTime, endTime);
        }
      }

      // Reset drag state
      // <!-- 드래그 상태 리셋 -->
      setDragState({
        isDragging: false,
        draggedEvent: null,
        dragStartPosition: null,
      });
      document.body.style.cursor = '';
      dragElementRef.current = null;
    },
    [dragState.draggedEvent, onDrop]
  );

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};

/**
 * Extract date from calendar cell element
 * <!-- 캘린더 셀 요소에서 날짜 추출 -->
 */
function extractDateFromCell(cell: HTMLElement): Date | null {
  // Try to find date from cell's data attribute or text content
  // <!-- 셀의 data 속성 또는 텍스트 내용에서 날짜 찾기 -->
  const dateText = cell.querySelector('p[class*="Typography"]')?.textContent;
  if (!dateText) return null;

  // Find current date context from parent calendar
  // <!-- 부모 캘린더에서 현재 날짜 컨텍스트 찾기 -->
  // For now, use a simple approach - get date from nearest calendar view
  // <!-- 현재로서는 간단한 접근 방식 사용 - 가장 가까운 캘린더 뷰에서 날짜 가져오기 -->
  const day = parseInt(dateText, 10);
  if (isNaN(day)) return null;

  // This is a simplified version - in real implementation,
  // we'd need to track the current month/year context
  // <!-- 이것은 단순화된 버전입니다 - 실제 구현에서는 현재 월/년 컨텍스트를 추적해야 합니다 -->
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), day);
}
