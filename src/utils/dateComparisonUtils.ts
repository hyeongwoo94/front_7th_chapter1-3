/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환합니다
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 두 날짜가 같은 날짜인지 비교합니다 (시간 정보는 무시)
 * @param date1 - 첫 번째 날짜 (YYYY-MM-DD 문자열 또는 Date 객체)
 * @param date2 - 두 번째 날짜 (YYYY-MM-DD 문자열 또는 Date 객체)
 * @returns 같은 날짜면 true, 다르면 false
 */
export function isSameDate(date1: string | Date, date2: string | Date): boolean {
  // 두 날짜를 모두 YYYY-MM-DD 형식의 문자열로 변환
  const date1String = typeof date1 === 'string' ? date1 : formatDateToString(date1);
  const date2String = typeof date2 === 'string' ? date2 : formatDateToString(date2);

  // 시간 정보 없이 날짜만 비교
  return date1String === date2String;
}
