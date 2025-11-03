import { RepeatType } from '../types';

/**
 * Get background color for event based on repeat type and notification status
 * 반복 타입과 알림 상태에 따라 이벤트 배경색을 반환하는 함수
 * @param repeatType - Repeat type of the event (일정의 반복 타입)
 * @param isNotified - Whether the event is notified (일정이 알림되었는지 여부)
 * @returns Background color hex code (배경색 hex 코드)
 */
export function getRepeatBackgroundColor(repeatType: RepeatType, isNotified: boolean): string {
  // 알림된 일정은 항상 빨간색 (최우선)
  // Notified events are always red (highest priority)
  if (isNotified) {
    return '#ffebee';
  }

  // 반복 타입별 색상 매핑
  // Color mapping by repeat type
  switch (repeatType) {
    case 'daily':
      return '#e3f2fd'; // 연한 파란색 (Light blue)
    case 'weekly':
      return '#f3e5f5'; // 연한 보라색 (Light purple)
    case 'monthly':
      return '#fff3e0'; // 연한 주황색 (Light orange)
    case 'yearly':
      return '#e8f5e9'; // 연한 녹색 (Light green)
    case 'none':
    default:
      return '#f5f5f5'; // 회색 (Gray)
  }
}
