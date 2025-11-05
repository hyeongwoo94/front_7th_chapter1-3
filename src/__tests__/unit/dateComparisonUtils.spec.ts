import { describe, it, expect } from 'vitest';
import { isSameDate } from '../../utils/dateComparisonUtils';

describe('isSameDate', () => {
  it('같은 날짜(YYYY-MM-DD)를 비교하면 true를 반환해야 한다', () => {
    const date1 = '2025-11-04';
    const date2 = '2025-11-04';
    expect(isSameDate(date1, date2)).toBe(true);
  });

  it('다른 날짜(YYYY-MM-DD)를 비교하면 false를 반환해야 한다', () => {
    const date1 = '2025-11-04';
    const date2 = '2025-11-05';
    expect(isSameDate(date1, date2)).toBe(false);
  });

  it('시간이 달라도 같은 날짜면 true를 반환해야 한다', () => {
    // Date 객체를 YYYY-MM-DD 형식으로 변환하여 비교
    const date1 = '2025-11-04';
    const date2 = new Date('2025-11-04T09:00:00');
    const date3 = new Date('2025-11-04T14:00:00');
    
    // date1과 date2는 같은 날짜로 판단되어야 함
    expect(isSameDate(date1, date2)).toBe(true);
    // date2와 date3도 같은 날짜로 판단되어야 함
    expect(isSameDate(date2, date3)).toBe(true);
  });

  it('윤년 날짜를 올바르게 비교해야 한다', () => {
    const date1 = '2024-02-29'; // 윤년
    const date2 = '2024-02-29';
    const date3 = '2024-03-01';
    
    expect(isSameDate(date1, date2)).toBe(true);
    expect(isSameDate(date1, date3)).toBe(false);
  });

  it('월말 날짜를 올바르게 비교해야 한다', () => {
    const date1 = '2025-01-31';
    const date2 = '2025-01-31';
    const date3 = '2025-02-01';
    
    expect(isSameDate(date1, date2)).toBe(true);
    expect(isSameDate(date1, date3)).toBe(false);
  });

  it('년도가 다른 경우 false를 반환해야 한다', () => {
    const date1 = '2025-11-04';
    const date2 = '2024-11-04';
    
    expect(isSameDate(date1, date2)).toBe(false);
  });

  it('월이 다른 경우 false를 반환해야 한다', () => {
    const date1 = '2025-11-04';
    const date2 = '2025-12-04';
    
    expect(isSameDate(date1, date2)).toBe(false);
  });
});

