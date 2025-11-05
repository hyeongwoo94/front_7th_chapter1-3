# Feature Request: 캘린더 일정 더보기 모달
<!-- 기능 요청: 캘린더 일정 더보기 모달 -->

**Date**: 2025-01-15
**Requester**: King (건물주)
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: 캘린더에 일정이 많을 경우 셀 높이가 늘어나는 것을 방지하기 위해, 일정이 3개 이상인 날짜에 첫 번째와 두 번째 일정을 표시하고 "더보기" 버튼을 표시하며, 클릭 시 해당 날짜의 모든 일정만 모달에 표시하는 기능 (MonthView와 WeekView 모두 적용)
<!-- 무엇을: 캘린더에 일정이 많을 경우 셀 높이가 늘어나는 것을 방지하기 위해, 일정이 3개 이상인 날짜에 첫 번째와 두 번째 일정을 표시하고 "더보기" 버튼을 표시하며, 클릭 시 해당 날짜의 모든 일정만 모달에 표시하는 기능 (MonthView와 WeekView 모두 적용) -->

**Why**: 캘린더의 레이아웃이 깨지지 않도록 하고, 사용자가 많은 일정을 효율적으로 관리할 수 있도록 함
<!-- 왜: 캘린더의 레이아웃이 깨지지 않도록 하고, 사용자가 많은 일정을 효율적으로 관리할 수 있도록 함 -->

**User Story**: As a calendar user, I want to see first two events and a "더보기" button when there are 3+ events on a day, so that the calendar layout remains clean and I can access all events through a modal
<!-- 사용자 스토리: 캘린더 사용자로서, 하루에 3개 이상의 일정이 있을 때 첫 두 개의 일정과 "더보기" 버튼을 보고 싶습니다, 그래서 캘린더 레이아웃이 깔끔하게 유지되고 모달을 통해 모든 일정에 접근할 수 있습니다 -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. 캘린더 월간 뷰 또는 주간 뷰에서 일정이 3개 이상인 날짜 확인
2. "더보기" 버튼 클릭
3. 모달에서 일정 제목 클릭 또는 삭제 버튼 클릭

Current State (Before):
- MonthView와 WeekView에서 각 날짜 셀에 모든 일정이 표시됨
- 일정이 많을 경우 셀 높이가 늘어나서 레이아웃이 깨짐
- 예시: 2025-10-15 날짜에 5개의 일정이 있으면 모두 세로로 나열됨
```

### Process (변환 과정)
```
1. MonthView와 WeekView에서 각 날짜별 일정 개수 확인
2. 일정이 3개 이상인 경우:
   - 첫 번째 일정 표시
   - 두 번째 일정 표시
   - "더보기 (+N)" 버튼 표시 (N = 나머지 일정 개수)
3. 일정이 1개 또는 2개인 경우:
   - 모든 일정 표시 (기존 동작)
   - 더보기 버튼 없음
4. "더보기" 버튼 클릭 시:
   - 모달 열림
   - 클릭한 해당 날짜의 일정만 필터링하여 목록 표시 (다른 날짜의 일정은 표시하지 않음)
   - 간단한 리스트 형태로 표시
   - 각 일정마다 제목만 표시 (시간 정보는 표시하지 않음)
   - 각 일정마다 반복 아이콘(반복 일정인 경우), 삭제 버튼 표시
5. 모달에서 일정 제목 클릭 시:
   - 모달 닫힘
   - 오른쪽 EventFormPanel에 해당 일정의 정보가 채워짐 (오른쪽 리스트의 수정 아이콘을 누른 것과 동일한 동작)
   - EventFormPanel의 타이틀이 "일정 추가"에서 "일정 수정"으로 변경됨
   - 사용자가 폼에서 일정 정보를 수정할 수 있음
6. 모달에서 삭제 버튼 클릭 시:
   - 일정 삭제 (확인 없이 바로 삭제)
   - 모달은 열린 상태 유지
   - 삭제된 일정은 목록에서 제거
```

### Output (예상 결과)
```
After State:
- MonthView와 WeekView 모두에서 일정이 3개 이상인 날짜: 첫 번째 + 두 번째 일정 + "더보기 (+N)" 버튼 표시
- 일정이 1개 또는 2개인 날짜: 기존처럼 모든 일정 표시 (더보기 버튼 없음)
- "더보기" 클릭 시: 모달에 클릭한 해당 날짜의 일정만 표시 (다른 날짜 일정 제외)
- 모달 디자인: 간단한 리스트 형태 (카드 형태 아님)
- 모달에서 일정 표시: 제목만 표시 (시간 정보는 표시하지 않음)
- 반복 일정인 경우: 모달에서 반복 아이콘(RepeatIcon) 표시
- 일정 제목 클릭: 모달 닫히고 오른쪽 EventFormPanel에 해당 일정 정보가 채워짐 (타이틀: "일정 수정")
- 삭제 버튼 클릭: 일정 삭제 후 모달은 열린 상태 유지, 삭제된 일정은 목록에서 제거

Expected Notification/Feedback:
- 삭제 시: "일정이 삭제되었습니다" 스낵바 표시
```

### Example
```
Before: 
2025-10-15 날짜 셀:
- 회의 A (09:00-10:00)
- 회의 B (14:00-15:00)
- 회의 C (16:00-17:00)
- 회의 D (18:00-19:00)
- 회의 E (20:00-21:00)
→ 셀 높이가 매우 길어짐

After:
2025-10-15 날짜 셀:
- 회의 A (09:00-10:00)
- 회의 B (14:00-15:00)
- [더보기 (+3)] 버튼

Action: "더보기 (+3)" 클릭

Modal 열림:
┌─────────────────────────┐
│ 2025-10-15 일정 목록      │
├─────────────────────────┤
│ 회의 A            [삭제] │ (시간 정보 없음)
│ 회의 B            [삭제] │
│ 🔁 회의 C         [삭제] │ (반복 일정)
│ 회의 D            [삭제] │
│ 회의 E            [삭제] │
└─────────────────────────┘

Action: "회의 B" 클릭
→ 모달 닫힘
→ 오른쪽 EventFormPanel에 "회의 B"의 모든 정보가 채워짐
→ EventFormPanel 타이틀이 "일정 추가" → "일정 수정"으로 변경됨
→ 사용자가 폼에서 일정 정보를 수정할 수 있음 (오른쪽 리스트의 수정 아이콘 클릭과 동일한 동작)

Action: "삭제" 버튼 클릭 (회의 C)
→ "일정이 삭제되었습니다" 스낵바 표시
→ 모달은 열린 상태 유지
→ 모달에서 "회의 C" 제거됨
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Data Model Changes
```typescript
// 기존 Event 타입 사용 (변경 없음)
// interface Event {
//   id: string;
//   title: string;
//   date: string;
//   ...
// }
```

### UI Components
- [ ] Component to create: `EventListModal` (또는 `MoreEventsModal`)
  - 모달 컴포넌트
  - 간단한 리스트 형태 디자인
  - 클릭한 해당 날짜의 일정만 필터링하여 목록 표시
  - 각 일정에 제목만 표시 (시간 정보는 표시하지 않음)
  - 각 일정에 반복 아이콘(반복 일정인 경우), 삭제 버튼 표시
- [ ] Component to modify: `MonthView.tsx`
  - 일정이 3개 이상일 때 "더보기" 버튼 표시 로직 추가
  - 첫 번째와 두 번째 일정 표시, 나머지는 "더보기"로 처리
- [ ] Component to modify: `WeekView.tsx`
  - WeekView에도 동일 기능 적용 (필수)
  - 일정이 3개 이상일 때 "더보기" 버튼 표시 로직 추가
  - 첫 번째와 두 번째 일정 표시, 나머지는 "더보기"로 처리

### API/Storage Changes
- [ ] 기존 API 사용 (변경 없음)
- [ ] 삭제는 기존 `deleteEvent` 함수 사용

### Prerequisites
**MUST complete before implementation:**
- [ ] MonthView 컴포넌트 구조 파악 완료
- [ ] Event 수정 플로우 이해 (editEvent 함수 사용 방법)
- [ ] 모달 컴포넌트 패턴 확인 (RecurringEventDialog 참고)
- [ ] 삭제 기능 동작 방식 확인 (useEventOperations의 deleteEvent)

**MUST understand before coding:**
- [ ] MonthView와 WeekView에서 날짜별 일정 필터링 로직 (getEventsForDay)
- [ ] EventFormPanel에 일정 로드하는 방법 (editEvent 함수 - 오른쪽 리스트의 수정 아이콘 클릭과 동일한 동작)
- [ ] EventFormPanel 타이틀 변경 방법 ("일정 추가" → "일정 수정")
- [ ] 모달 상태 관리 방법 (useState로 열림/닫힘 관리)
- [ ] 반복 일정 아이콘 표시 방법 (RepeatIcon 사용 방법)
- [ ] 삭제 후 모달 상태 유지 및 목록 업데이트 방법
- [ ] 모달에서 클릭한 날짜의 일정만 필터링하는 로직 (날짜 비교)
- [ ] 간단한 리스트 디자인 구현 방법 (시간 정보 제외)

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] MonthView에서 일정이 3개 이상인 날짜 감지
- [ ] WeekView에서 일정이 3개 이상인 날짜 감지
- [ ] 일정이 3개 이상일 때 첫 번째와 두 번째 일정 표시 (MonthView와 WeekView 모두)
- [ ] "더보기 (+N)" 버튼 UI 구현 (N = 나머지 일정 개수)
- [ ] "더보기" 버튼 클릭 시 모달 열림
- [ ] 모달에 클릭한 해당 날짜의 일정만 필터링하여 목록 표시 (다른 날짜 일정 제외)
- [ ] 모달 디자인: 간단한 리스트 형태 (카드 형태 아님)
- [ ] 각 일정에 제목만 표시 (시간 정보는 표시하지 않음)
- [ ] 각 일정에 반복 아이콘(반복 일정인 경우), 삭제 버튼 표시
- [ ] 일정 제목 클릭 시 모달 닫히고 오른쪽 EventFormPanel에 해당 일정 정보 채움 (editEvent 함수 호출)
- [ ] EventFormPanel 타이틀이 "일정 추가"에서 "일정 수정"으로 변경됨
- [ ] 삭제 버튼 클릭 시 일정 삭제 (확인 없이 바로 삭제)
- [ ] 삭제 후 모달은 열린 상태 유지, 삭제된 일정은 목록에서 제거
- [ ] 모달 닫기 버튼 (X 버튼 또는 외부 클릭)

### Nice to Have (선택)
- [ ] 모달에서 일정 색상(카테고리) 표시
- [ ] 키보드 네비게이션 (Tab, Enter, Escape)
- [ ] 모달 애니메이션 효과

### Edge Cases to Handle
- [ ] 일정이 정확히 2개일 때: 첫 번째 + 두 번째 일정 모두 표시 (더보기 버튼 없음) - MonthView와 WeekView 모두
- [ ] 일정이 정확히 3개일 때: 첫 번째 + 두 번째 + "더보기 (+1)" 표시 - MonthView와 WeekView 모두
- [ ] 일정이 4개 이상일 때: 첫 번째 + 두 번째 + "더보기 (+N)" 표시 (N >= 2) - MonthView와 WeekView 모두
- [ ] 일정이 1개일 때: 기존처럼 일정만 표시 (더보기 버튼 없음) - MonthView와 WeekView 모두
- [ ] 모달 열린 상태에서 다른 날짜의 "더보기" 클릭: 기존 모달 닫고 새 모달 열기 (새 날짜의 일정만 표시)
- [ ] 모달에서 모든 일정 삭제 후: 모달 자동 닫기 또는 빈 상태 표시
- [ ] 반복 일정이 포함된 경우: 모달에서 반복 아이콘(RepeatIcon) 표시
- [ ] 모달에서 일정 삭제 후 목록 업데이트: 삭제된 일정 즉시 제거
- [ ] 모달에서 일정 수정 후: 모달 상태 (닫힘/열림 유지) 결정
- [ ] 모달에 표시되는 일정이 클릭한 날짜의 일정만인지 확인 (다른 날짜 일정이 섞이지 않도록)

### Error Prevention
**Based on previous implementation patterns:**

**Before each step:**
- [ ] MonthView의 getEventsForDay 함수 사용 방법 확인
- [ ] 모달 컴포넌트는 RecurringEventDialog 패턴 참고
- [ ] editEvent 함수 호출 전에 Event 객체가 올바른지 확인

**Known Pitfalls:**
- ⚠️ **날짜 포맷 불일치**: 모달에서 필터링할 때 날짜 비교 로직 정확히 구현
- ⚠️ **상태 관리**: 모달 열림/닫힘 상태를 MonthView에서 관리할지, App에서 관리할지 결정 필요
- ⚠️ **이벤트 전파**: 모달 내부 클릭이 MonthView의 날짜 클릭 이벤트와 충돌하지 않도록 주의

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] MonthView와 WeekView 모두에서 일정이 3개 이상인 날짜에 첫 번째, 두 번째 일정과 "더보기" 버튼이 표시됨
- [ ] MonthView와 WeekView 모두에서 일정이 1개 또는 2개인 날짜는 기존처럼 모든 일정이 정상 표시됨
- [ ] "더보기" 버튼 클릭 시 모달이 열리고 클릭한 해당 날짜의 일정만 표시됨 (다른 날짜 일정 제외)
- [ ] 모달 디자인이 간단한 리스트 형태로 구현됨
- [ ] 모달에서 일정 제목만 표시됨 (시간 정보는 표시되지 않음)
- [ ] 반복 일정인 경우 모달에서 반복 아이콘(RepeatIcon)이 표시됨
- [ ] 모달에서 일정 제목 클릭 시 모달이 닫히고 오른쪽 EventFormPanel에 해당 일정 정보가 채워짐
- [ ] EventFormPanel의 타이틀이 "일정 추가"에서 "일정 수정"으로 변경됨 (오른쪽 리스트의 수정 아이콘 클릭과 동일한 동작)
- [ ] 모달에서 삭제 버튼 클릭 시 일정이 바로 삭제되고 모달은 열린 상태 유지
- [ ] 삭제 후 모달 목록에서 해당 일정이 제거됨
- [ ] 모든 테스트 통과
- [ ] TypeScript 타입 오류 없음
- [ ] 코드가 .cursorrules 준수 (함수명 camelCase, 클래스명 snake_case)

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
- [x] WeekView에도 동일 기능을 적용할까요? → **확정: WeekView에도 필수 적용**
- [x] 모달에서 삭제 후 모달을 자동으로 닫을까요, 아니면 열린 상태를 유지할까요? → **확정: 모달은 열린 상태 유지**
- [x] "더보기" 버튼에 표시할 일정 개수는 "나머지 개수"인가요, "전체 개수"인가요? → **확정: 나머지 개수 (예: 5개일 때 첫 두 개 표시, "+3" 표시)**
- [x] 모달에서 일정을 표시할 때 시간 정보도 함께 표시할까요? → **확정: 시간 정보는 표시하지 않음 (제목만 표시)**
- [x] 모달에서 반복 일정인 경우 반복 아이콘을 표시할까요? → **확정: 반복 아이콘 표시**
- [x] 모달 디자인: 간단한 리스트인가요, 카드 형태인가요? → **확정: 간단한 리스트 형태**
- [x] 모달에 표시되는 일정은 해당 날짜의 일정만인가요? → **확정: 클릭한 해당 날짜의 일정만 표시 (다른 날짜 일정 제외)**

**Potential issues:**
- 모달이 열린 상태에서 다른 날짜 클릭 시 모달과의 상호작용 충돌 가능성
- 드래그앤드롭 기능과 모달 열림 기능의 충돌 가능성
- 일정이 매우 많을 경우 (10개 이상) 모달 스크롤 처리

---

## User Confirmation
<!-- 사용자 컨펌 -->

**Status**: ⏳ Awaiting user confirmation
<!-- 상태: 사용자 컨펌 대기 중 -->

**User Comments**:
```
[사용자 피드백 작성 공간]
```

**Final Decision**: 
- [ ] ✅ Approved - Proceed with implementation
- [ ] 🔄 Revise - Need changes (specify below)
- [ ] ❌ Rejected - Do not implement

**Revision Notes** (if applicable):
```
[수정 필요 사항]
```

---

## 7. Error Recovery Process ⚠️
<!-- 오류 복구 프로세스 ⚠️ -->

**When same error occurs 2+ times during implementation:**
<!-- 구현 중 같은 오류가 2번 이상 발생할 때: -->

### Step 1: Immediate Pause ⏸️
<!-- 1단계: 즉시 중단 -->

**Trigger**: Same error/test failure occurs twice despite fixes
<!-- 트리거: 수정했는데도 같은 오류/테스트 실패가 두 번 발생 -->

**Action**: 
```
1. Stop current implementation immediately
   <!-- 현재 구현 즉시 중단 -->
2. Document the error pattern
   <!-- 오류 패턴 문서화 -->
3. Do NOT attempt third fix
   <!-- 세 번째 수정 시도하지 말 것 -->
```

### Step 2: Conduct Review 🔍
<!-- 2단계: 리뷰 실시 -->

**Action**: Create review document in `review/` folder
<!-- 작업: `review/` 폴더에 리뷰 문서 생성 -->

**Review Document Must Include**:
```markdown
# Code Review Report

**Date**: YYYY-MM-DD
**Task**: 캘린더 일정 더보기 모달
**Status**: ⚠️ PAUSED DUE TO RECURRING ERROR

## Error Pattern
<!-- 오류 패턴 -->
**Error**: [오류 메시지]
**Occurrences**: [1차 발생 상황], [2차 발생 상황]
**Attempted Fixes**: [시도한 해결책들]

## Root Cause Analysis
<!-- 근본 원인 분석 -->
**Why error occurred**: [분석]
**Why fixes didn't work**: [분석]
**Missing understanding**: [부족했던 이해]

## Detailed Solutions
<!-- 상세 해결방안 -->
1. **Solution 1**: [구체적 해결책 + 코드 예시]
2. **Solution 2**: [대안 해결책]
3. **Prevention**: [재발 방지책]

## Updated Prerequisites
<!-- 업데이트된 전제조건 -->
- [ ] [새로 필요한 이해사항 1]
- [ ] [새로 필요한 유틸리티/헬퍼 1]
- [ ] [새로 필요한 설정 1]
```

### Step 3: Update This PRD 📝
<!-- 3단계: 이 PRD 업데이트 -->

**Action**: Modify the request document based on review findings
<!-- 작업: 리뷰 결과를 바탕으로 request 문서 수정 -->

### Step 4: Restart Implementation 🔄
<!-- 4단계: 구현 재시작 -->

**Before Restart - Verification Checklist**:
```
- [ ] Review document created in review/ folder
- [ ] PRD updated with new prerequisites
- [ ] PRD updated with error prevention checklist
- [ ] PRD updated with known issues section
- [ ] All prerequisites from review are ready
- [ ] Root cause is understood
- [ ] Solution approach is clear
```

---

## 8. Test Strategy (테스트 트로피 전략)
<!-- 테스트 피라미드 전략 -->

테스트는 **테스트 피라미드 전략**을 따라 작성합니다:
- **단위 테스트 1개**: 핵심 로직 함수 (순수 함수)
- **통합 테스트 4개**: 컴포넌트 간 상호작용
- **E2E 테스트 1개**: 전체 사용자 워크플로우

**참고**: 이 섹션은 테스트 계획/명세입니다. 실제 테스트 코드는 구현 단계에서 작성합니다.
<!-- 참고: 이 섹션은 테스트 계획/명세입니다. 실제 테스트 코드는 구현 단계에서 작성합니다. -->

---

### 8.1 Unit Tests (단위 테스트) - 1개
<!-- 단위 테스트 1개 -->

**위치**: `src/__tests__/unit/calendarMoreEventsUtils.spec.ts`

**목적**: 핵심 로직 함수를 독립적으로 테스트

**테스트 케이스**:
- 일정이 3개 이상인지 판단하는 함수 테스트
  - 일정이 3개 이상일 때 true 반환
  - 일정이 2개 이하일 때 false 반환

**테스트할 함수**:
- `shouldShowMoreButton(events: Event[]): boolean` - 일정이 3개 이상인지 판단

---

### 8.2 Integration Tests (통합 테스트) - 4개
<!-- 통합 테스트 4개 -->

**위치**: `src/__tests__/integration/calendarMoreEventsModal.spec.tsx`

**목적**: 여러 컴포넌트가 함께 작동하는지 테스트

**테스트 케이스**:
1. MonthView에서 일정이 3개 이상인 날짜에 더보기 버튼이 표시되는지
2. WeekView에서 일정이 3개 이상인 날짜에 더보기 버튼이 표시되는지
3. 더보기 버튼 클릭 시 모달이 열리고 해당 날짜의 일정만 표시되는지
4. 모달에서 일정 제목 클릭 시 EventFormPanel에 일정 정보가 채워지는지

---

### 8.3 E2E Test (E2E 테스트) - 1개
<!-- E2E 테스트 1개 -->

**위치**: `src/__tests__/e2e/calendarMoreEventsModal.e2e.spec.tsx`

**목적**: 전체 사용자 워크플로우를 처음부터 끝까지 테스트

**테스트 케이스**:
- 일정 생성 → 더보기 클릭 → 모달에서 수정/삭제 전체 플로우
  - 일정 3개 생성
  - MonthView에서 더보기 버튼 확인
  - 더보기 버튼 클릭하여 모달 열기
  - 모달에서 일정 제목 클릭하여 수정 화면으로 이동
  - 다시 모달 열어서 삭제 버튼 클릭
  - 삭제 후 모달이 열린 상태 유지 확인

---

**PRD Template Version**: 4.0 (2025-10-29 - Added Error Recovery Process)
<!-- PRD 템플릿 버전: 4.0 (2025-10-29 - 오류 복구 프로세스 추가) -->

