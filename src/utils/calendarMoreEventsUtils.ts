import { Event } from '../types';

/**
 * 일정이 3개 이상인지 판단하여 더보기 버튼을 표시해야 하는지 반환
 * @param events - 해당 날짜의 일정 배열
 * @returns 일정이 3개 이상이면 true, 그렇지 않으면 false
 */
export function shouldShowMoreButton(events: Event[]): boolean {
  return events.length >= 3;
}
