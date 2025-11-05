# Feature Request: 반복일정 제자리 드롭 시 일반일정 변환 방지
<!-- 기능 요청: 반복일정 제자리 드롭 시 일반일정 변환 방지 -->

**Date**: 2025-01-16
**Requester**: King (건물주)
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: 반복일정을 드래그했다가 같은 날짜에 놓았을 때 반복일정이 일반일정으로 변환되지 않도록 수정합니다.
<!-- 무엇을: 반복일정을 드래그했다가 같은 날짜에 놓았을 때 반복일정이 일반일정으로 변환되지 않도록 수정합니다. -->

**Why**: 사용자가 반복일정을 실수로 클릭했다가 놓았을 때 반복일정이 일반일정으로 변환되는 것을 방지하여 사용자 경험을 개선합니다.
<!-- 왜: 사용자가 반복일정을 실수로 클릭했다가 놓았을 때 반복일정이 일반일정으로 변환되는 것을 방지하여 사용자 경험을 개선합니다. -->

**User Story**: As a calendar user, I want repeated events to remain as recurring events when I drag and drop them back to the same date, so that accidental drags don't break my recurring event series.
<!-- 사용자 스토리: 캘린더 사용자로서, 반복일정을 같은 날짜로 드래그 앤 드롭했을 때 반복일정이 그대로 유지되기를 원합니다, 그래서 실수로 드래그해도 반복일정 시리즈가 깨지지 않습니다. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. 11/1일부터 11/7일까지 매일 반복일정 등록 (예: "매일 회의")
2. 캘린더에서 11/4일에 있는 반복일정을 마우스로 클릭하고 드래그 시작
3. 드래그 중에 같은 11/4일 셀에서 마우스 버튼을 놓음 (드롭)

Current State (Before):
- 반복일정: { id: "1", title: "매일 회의", date: "2025-11-04", repeat: { type: "daily", interval: 1 } }
- 드래그 앤 드롭이 발생하면 handleEventDrop 함수가 호출됨
- 현재 로직: 반복일정을 드래그하면 무조건 일반일정으로 변환
```

### Process (변환 과정)
```
1. 드래그 시작: 사용자가 반복일정을 드래그 시작
   - 드래그 전 날짜 정보 저장 필요 (event.date)

2. 드롭 감지: 사용자가 마우스 버튼을 놓음
   - 드롭된 날짜 정보 확인 (newDate)

3. 날짜 비교: 드래그 전 날짜와 드롭 후 날짜를 비교
   - **중요**: 시간 정보는 완전히 무시하고 날짜만 비교 (YYYY-MM-DD 형식)
   - 같은 날짜인지 확인 (시간은 고려하지 않음)
   - 같은 날짜라면: 반복일정을 일반일정으로 변환하지 않음
   - 다른 날짜라면: 기존 로직대로 반복일정을 일반일정으로 변환

4. 이벤트 업데이트:
   - 같은 날짜: 반복일정 정보 유지 (repeat.type, repeat.interval 유지)
   - 다른 날짜: 반복일정을 일반일정으로 변환 (repeat.type = 'none', repeat.interval = 0)

5. 저장 및 알림:
   - 같은 날짜: 변경 없음이므로 저장하지 않음 또는 "일정이 이동되지 않았습니다" 알림
   - 다른 날짜: 기존 로직대로 저장 및 "일정이 이동되었습니다" 알림
```

### Output (예상 결과)
```
After State:
- 같은 날짜에 드롭한 경우:
  - 반복일정이 그대로 유지됨 (repeat.type = "daily", repeat.interval = 1)
  - 일정이 변경되지 않았으므로 저장하지 않음
  
- 다른 날짜에 드롭한 경우:
  - 기존 로직대로 반복일정이 일반일정으로 변환됨
  - 새 날짜로 이동됨
  - "일정이 이동되었습니다" 알림 표시

Expected Notification/Feedback:
- 같은 날짜: 알림 없음 또는 "일정이 이동되지 않았습니다" (선택사항)
- 다른 날짜: "일정이 이동되었습니다" (success variant)
```

### Example
```
Before: 
  Event: { id: "1", title: "매일 회의", date: "2025-11-04", startTime: "09:00", endTime: "10:00", repeat: { type: "daily", interval: 1 } }
  Location: WeekView에서 2025-11-04 (월요일) 셀

Action 1 (Same Date): 
  사용자가 "매일 회의" 일정을 드래그하여 같은 2025-11-04 셀로 다시 드롭
  (시간이 달라도 같은 날짜면 같은 날짜로 판단)

After (Same Date): 
  Event: { id: "1", title: "매일 회의", date: "2025-11-04", startTime: "09:00", endTime: "10:00", repeat: { type: "daily", interval: 1 } }
  Location: WeekView에서 2025-11-04 (월요일) 셀 (변경 없음)
  반복일정이 그대로 유지됨 (시간 정보는 무시하고 날짜만 비교)

Action 2 (Different Date): 
  사용자가 "매일 회의" 일정을 드래그하여 2025-11-05 셀로 드롭

After (Different Date): 
  Event: { id: "1", title: "매일 회의", date: "2025-11-05", startTime: "09:00", endTime: "10:00", repeat: { type: "none", interval: 0 } }
  Location: WeekView에서 2025-11-05 (화요일) 셀
  반복일정이 일반일정으로 변환됨
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### UI Components
<!-- UI 컴포넌트 -->
- 수정 없음 (기존 드래그 앤 드롭 UI 그대로 사용)

### Hooks & Utilities
<!-- 훅 및 유틸리티 -->
- `src/App.tsx`의 `handleEventDrop` 함수 수정 필요
- 날짜 비교 함수 추가 필요 (YYYY-MM-DD 형식으로 비교)

### Data Flow
<!-- 데이터 흐름 -->
```
1. MonthView/WeekView에서 드래그 시작
   - handleDragStart: 드래그할 이벤트 정보 저장 (event.date 포함)
   
2. MonthView/WeekView에서 드롭 완료
   - handleDragEnd: 드롭된 날짜 정보와 함께 onEventDrop 호출
   
3. App.tsx의 handleEventDrop에서 처리
   - 드래그 전 날짜 (event.date)와 드롭 후 날짜 (newDate) 비교
   - 같은 날짜면: 반복일정 정보 유지, 저장하지 않음
   - 다른 날짜면: 기존 로직대로 반복일정을 일반일정으로 변환 후 저장
```

### Prerequisites
<!-- 전제 조건 -->
- 드래그 앤 드롭 기능이 이미 구현되어 있음
- 반복일정 드래그 시 일반일정으로 변환하는 로직이 존재함
- 날짜 비교를 위한 유틸리티 함수 필요 (YYYY-MM-DD 형식)

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] `src/App.tsx`의 `handleEventDrop` 함수 수정
  - [ ] 드래그 전 날짜와 드롭 후 날짜 비교 로직 추가
  - [ ] 같은 날짜인 경우 반복일정 정보 유지 로직 추가
  - [ ] 같은 날짜인 경우 저장하지 않도록 처리
- [ ] 날짜 비교 유틸리티 함수 추가 (필요한 경우)
  - [ ] YYYY-MM-DD 형식으로 날짜 비교하는 함수
- [ ] 단위 테스트 1개 작성: `src/__tests__/unit/dateComparisonUtils.spec.ts` (또는 유틸리티 함수 테스트)
- [ ] 통합 테스트 3개 작성: `src/__tests__/scenario/preventRecurringUnwrap.spec.tsx`
- [ ] E2E 테스트 1개 작성: 동일 파일에 포함

### Edge Cases to Handle
<!-- 처리할 엣지 케이스 -->
- [ ] 드래그 시작 후 드롭하지 않고 취소한 경우 (기존 동작 유지)
- [ ] 드롭 대상이 없는 경우 (기존 동작 유지)
- [ ] 같은 날짜이지만 다른 시간으로 이동한 경우 (현재는 날짜만 비교하므로 시간 변경은 무시)
- [ ] 반복일정이 아닌 일반일정을 같은 날짜에 드롭한 경우 (기존 동작 유지)

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] 반복일정을 같은 날짜에 드롭하면 반복일정이 일반일정으로 변환되지 않음
- [ ] 반복일정을 다른 날짜에 드롭하면 기존 로직대로 일반일정으로 변환됨
- [ ] 같은 날짜에 드롭한 경우 저장하지 않음 (또는 변경 없음 알림)
- [ ] 다른 날짜에 드롭한 경우 기존 로직대로 저장 및 알림 표시
- [ ] 단위 테스트 1개 통과
- [ ] 통합 테스트 3개 통과
- [ ] E2E 테스트 1개 통과
- [ ] 코드가 .cursorrules를 따름
- [ ] MonthView와 WeekView 모두에서 동작함

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
- 같은 날짜에 드롭한 경우 알림을 표시할지 여부
  - 옵션 1: 알림 없음 (변경이 없으므로)
  - 옵션 2: "일정이 이동되지 않았습니다" 알림 (사용자 피드백)
  - **확정**: 알림 없음 (변경이 없으므로 불필요)
- 날짜 비교 시 시간 정보는 무시할지 여부
  - **확정**: **시간 정보는 완전히 무시하고 날짜만 비교 (YYYY-MM-DD 형식)**
  - 시간이 달라도 같은 날짜면 반복일정 유지
  - 예: 2025-11-04 09:00 → 2025-11-04 14:00 (같은 날짜로 판단)

---

## 7. Technical Context
<!-- 기술 컨텍스트 -->

### Files to Modify
<!-- 수정할 파일 -->
- `src/App.tsx` - `handleEventDrop` 함수 수정
- `src/utils/dateUtils.ts` - 날짜 비교 함수 추가 (필요한 경우)

### Related Code to Review
<!-- 검토할 관련 코드 -->
- `src/App.tsx` - `handleEventDrop` 함수 (153-192줄)
- `src/components/hw/MonthView.tsx` - `handleDragEnd` 함수
- `src/components/hw/WeekView.tsx` - `handleDragEnd` 함수
- `src/utils/dateUtils.ts` - 날짜 유틸리티 함수들

### Test Files Location
<!-- 테스트 파일 위치 -->
**Folder Structure**:
```
src/
  __tests__/
    unit/
      dateComparisonUtils.spec.ts  ← 단위 테스트 (날짜 비교 함수 테스트)
    scenario/
      preventRecurringUnwrap.spec.tsx  ← 통합 테스트 3개 + E2E 테스트 1개
```

### Patterns to Follow
<!-- 따를 패턴 -->
- `.cursorrules` - 코드 컨벤션 (camelCase 함수, snake_case 클래스, TypeScript)
- TDD 방법론: Red → Green → Refactor

---

## 8. Error Recovery Process ⚠️
<!-- 오류 복구 프로세스 ⚠️ -->

**When same error occurs 2+ times during implementation:**
<!-- 구현 중 같은 오류가 2번 이상 발생할 때: -->

1. **Stop Implementation**: 즉시 구현 중단
<!-- 구현 중단: 즉시 구현 중단 -->
2. **Document Error**: 오류 상황과 원인을 명확히 문서화
<!-- 오류 문서화: 오류 상황과 원인을 명확히 문서화 -->
3. **Escalate to User**: 사용자에게 상황 보고 및 해결 방안 제시
<!-- 사용자에게 에스컬레이션: 사용자에게 상황 보고 및 해결 방안 제시 -->

---

## 9. Test Strategy (테스트 피라미드 전략)
<!-- 테스트 전략 (테스트 피라미드 전략) -->

### 단위 테스트 (1개)
<!-- 단위 테스트 (1개) -->
- **목적**: 날짜 비교 함수의 정확성 검증
- **위치**: `src/__tests__/unit/dateComparisonUtils.spec.ts`
- **테스트 내용**:
  - 같은 날짜 비교 (YYYY-MM-DD 형식, 시간 정보 무시)
  - 다른 날짜 비교
  - 시간이 달라도 같은 날짜면 같은 날짜로 판단하는지 확인
  - 엣지 케이스 (윤년, 월말 등)

### 통합 테스트 (3개)
<!-- 통합 테스트 (3개) -->
- **목적**: 반복일정 드래그 앤 드롭 시나리오 검증
- **위치**: `src/__tests__/scenario/preventRecurringUnwrap.spec.tsx`
- **테스트 내용**:
  1. 반복일정을 같은 날짜에 드롭하면 반복일정이 유지되는지
  2. 반복일정을 다른 날짜에 드롭하면 일반일정으로 변환되는지
  3. MonthView와 WeekView 모두에서 동작하는지

### E2E 테스트 (1개)
<!-- E2E 테스트 (1개) -->
- **목적**: 전체 사용자 워크플로우 검증
- **위치**: `src/__tests__/scenario/preventRecurringUnwrap.spec.tsx`
- **테스트 내용**:
  - 반복일정 생성 → 같은 날짜에 드롭 → 반복일정 유지 확인
  - 반복일정 생성 → 다른 날짜에 드롭 → 일반일정 변환 확인

---

## 10. Implementation Notes
<!-- 구현 노트 -->

### 날짜 비교 로직
<!-- 날짜 비교 로직 -->
- **중요**: 시간 정보는 완전히 무시하고 날짜만 비교
- `event.date`는 이미 YYYY-MM-DD 형식 (시간 정보 없음)
- `newDate`는 Date 객체이므로 YYYY-MM-DD로 변환 필요 (시간 정보 제거)
- `formatDateToString` 함수가 이미 존재하므로 재사용 가능
- 비교 예시:
  - 2025-11-04 09:00 → 2025-11-04 14:00 = 같은 날짜 (반복일정 유지)
  - 2025-11-04 09:00 → 2025-11-05 09:00 = 다른 날짜 (일반일정 변환)

### 반복일정 변환 로직 수정
<!-- 반복일정 변환 로직 수정 -->
```typescript
// 기존 코드 (153-167줄)
const isRecurring = event.repeat.type !== 'none' && event.repeat.interval > 0;
const updatedEvent: Event = {
  ...event,
  date: newDateString,
  repeat: isRecurring
    ? { type: 'none', interval: 0 }
    : event.repeat,
};

// 수정 후 코드
const isRecurring = event.repeat.type !== 'none' && event.repeat.interval > 0;
const isSameDate = event.date === newDateString; // 날짜 비교 추가

const updatedEvent: Event = {
  ...event,
  date: newDateString,
  repeat: isRecurring && !isSameDate // 같은 날짜면 변환하지 않음
    ? { type: 'none', interval: 0 }
    : event.repeat,
};

// 같은 날짜면 저장하지 않음
if (isRecurring && isSameDate) {
  return; // 저장하지 않고 종료
}
```

---

**Document Status**: ⏳ Pending User Approval
<!-- 문서 상태: 사용자 승인 대기 중 -->

