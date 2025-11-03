/**
 * Calculate new date from drop position in calendar cell
 * <!-- 캘린더 셀의 드롭 위치에서 새 날짜 계산 -->
 */
export function calculateDateFromDrop(
  dropX: number,
  dropY: number,
  cellElement: HTMLElement,
  cellDate: Date
): string {
  // For now, just return the cell's date
  // <!-- 현재로서는 셀의 날짜만 반환 -->
  // TODO: Calculate time from Y position within cell
  // <!-- TODO: 셀 내 Y 위치에서 시간 계산 -->
  const year = cellDate.getFullYear();
  const month = String(cellDate.getMonth() + 1).padStart(2, '0');
  const day = String(cellDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate new time from Y position within calendar cell
 * <!-- 캘린더 셀 내 Y 위치에서 새 시간 계산 -->
 */
export function calculateTimeFromDrop(
  dropY: number,
  cellElement: HTMLElement,
  originalStartTime: string,
  originalEndTime: string
): { startTime: string; endTime: string } {
  const cellRect = cellElement.getBoundingClientRect();
  const relativeY = dropY - cellRect.top;
  const cellHeight = cellRect.height;

  // Assume cell represents one day (24 hours)
  // <!-- 셀이 하루(24시간)를 나타낸다고 가정 -->
  const hourOffset = (relativeY / cellHeight) * 24;

  // Parse original times
  // <!-- 원본 시간 파싱 -->
  const [originalStartHour, originalStartMinute] = originalStartTime.split(':').map(Number);
  const [originalEndHour, originalEndMinute] = originalEndTime.split(':').map(Number);
  const originalDuration =
    originalEndHour * 60 + originalEndMinute - (originalStartHour * 60 + originalStartMinute);

  // Calculate new start time
  // <!-- 새 시작 시간 계산 -->
  const newStartHour = Math.floor(hourOffset);
  const newStartMinute = Math.floor((hourOffset - newStartHour) * 60);
  const newEndTotalMinutes = newStartHour * 60 + newStartMinute + originalDuration;
  const newEndHour = Math.floor(newEndTotalMinutes / 60);
  const newEndMinute = newEndTotalMinutes % 60;

  // Format as HH:mm
  // <!-- HH:mm 형식으로 포맷 -->
  const formatTime = (hour: number, minute: number) => {
    const h = Math.max(0, Math.min(23, hour)).toString().padStart(2, '0');
    const m = Math.max(0, Math.min(59, minute)).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return {
    startTime: formatTime(newStartHour, newStartMinute),
    endTime: formatTime(newEndHour, newEndMinute),
  };
}

/**
 * Check if drop position is within valid calendar cell
 * <!-- 드롭 위치가 유효한 캘린더 셀 내에 있는지 확인 -->
 */
export function isValidDropTarget(element: HTMLElement | null): boolean {
  if (!element) return false;

  // Check if element is a calendar cell (TableCell)
  // <!-- 요소가 캘린더 셀(TableCell)인지 확인 -->
  return element.tagName === 'TD' || element.closest('td[class*="MuiTableCell"]') !== null;
}
