# Feature Request: 검색 결과 날짜 정렬 버튼 추가
<!-- Feature Request: Search Results Date Sort Buttons -->

**Date**: 2025-10-29
**Requester**: User/King
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: 검색 input 밑에 "최신순", "오래된순" 날짜 정렬 버튼을 추가하여 검색 결과를 날짜 기준으로 정렬할 수 있도록 합니다.
<!-- 무엇을: 검색 input 밑에 "최신순", "오래된순" 날짜 정렬 버튼을 추가하여 검색 결과를 날짜 기준으로 정렬할 수 있도록 합니다. -->

**Why**: 사용자가 검색 결과를 날짜 순서로 정렬하여 최신 일정이나 오래된 일정을 쉽게 찾을 수 있도록 합니다.
<!-- 왜: 사용자가 검색 결과를 날짜 순서로 정렬하여 최신 일정이나 오래된 일정을 쉽게 찾을 수 있도록 합니다. -->

**User Story**: As a calendar user, I want to sort search results by date (newest first or oldest first), so that I can quickly find recent events or historical events.
<!-- 사용자 스토리: 캘린더 사용자로서, 검색 결과를 날짜 순서(최신순 또는 오래된순)로 정렬하고 싶습니다, 최근 일정이나 과거 일정을 빠르게 찾을 수 있도록. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. 검색 input에 검색어 입력 (예: "회의")
2. 검색 input 밑에 표시된 "최신순" 또는 "오래된순" 버튼 클릭

Current State (Before):
- 검색 결과는 날짜 순서와 무관하게 표시됨
- 정렬 옵션이 없음
```

### Process (변환 과정)
```
1. 사용자가 검색어 입력 → 검색 결과 필터링
2. 사용자가 정렬 버튼 클릭 → 정렬 모드 변경 (최신순/오래된순)
3. 검색 결과를 다중 기준으로 정렬
   - 최신순: 날짜 내림차순 → 시간 내림차순 → 제목 오름차순
     (2025-10-30 15:00 → 2025-10-30 09:00 → 2025-10-01)
   - 오래된순: 날짜 오름차순 → 시간 오름차순 → 제목 오름차순
     (2025-10-01 09:00 → 2025-10-30 15:00)
   - 정렬 우선순위: date → startTime → title
4. 정렬된 결과를 EventListPanel에 표시
```

### Output (예상 결과)
```
After State:
- 검색 input 밑에 "최신순", "오래된순" 버튼이 표시됨
- 기본값: 오래된순 (1일부터 30일까지 순서)
- 버튼 클릭 시 검색 결과가 선택한 정렬 방식으로 정렬됨
- 선택된 정렬 버튼이 시각적으로 강조됨 (예: 배경색 변경)

Expected Notification/Feedback:
- 버튼 클릭 시 즉시 정렬된 결과가 표시됨
- 선택된 정렬 옵션이 명확하게 표시됨
```

### Example
```
Example 1: 기본 정렬 (날짜 기준)
Before:
검색어: "회의"
검색 결과:
- 2025-10-15 10:00 회의 A
- 2025-10-05 14:00 회의 B
- 2025-10-25 09:00 회의 C

Action: 
1. 검색어 입력: "회의"
2. "최신순" 버튼 클릭

After:
검색어: "회의"
정렬: 최신순 (선택됨)
검색 결과:
- 2025-10-25 09:00 회의 C
- 2025-10-15 10:00 회의 A
- 2025-10-05 14:00 회의 B

---

Example 2: 같은 날짜, 다른 시간
Before:
검색어: "회의"
정렬: 오래된순 (선택됨)
검색 결과:
- 2025-10-15 14:00 회의 C
- 2025-10-15 09:00 회의 A
- 2025-10-15 11:00 회의 B

Action: "오래된순" 유지 (이미 선택됨)

After:
정렬: 오래된순 (선택됨)
검색 결과:
- 2025-10-15 09:00 회의 A  (시간 오름차순)
- 2025-10-15 11:00 회의 B
- 2025-10-15 14:00 회의 C

---

Example 3: 같은 날짜, 같은 시간, 다른 제목
Before:
검색어: "회의"
정렬: 오래된순 (선택됨)
검색 결과:
- 2025-10-15 09:00 회의 C
- 2025-10-15 09:00 회의 A
- 2025-10-15 09:00 회의 B

After:
정렬: 오래된순 (선택됨)
검색 결과:
- 2025-10-15 09:00 회의 A  (제목 오름차순)
- 2025-10-15 09:00 회의 B
- 2025-10-15 09:00 회의 C

---

Example 4: 검색 결과 없음
Before:
검색어: "존재하지않는일정"
검색 결과: 없음

After:
검색어: "존재하지않는일정"
정렬 버튼: 여전히 표시됨 (최신순/오래된순)
검색 결과: "검색 결과가 없습니다."
```

---

## 3. Technical Requirements (Optional)
<!-- 기술 요구사항 (선택사항) -->

### Data Model Changes
```typescript
// useSearch 훅에 정렬 상태 추가 필요
// useSearch.ts
export const useSearch = (events: Event[], currentDate: Date, view: 'week' | 'month') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = 오래된순, 'desc' = 최신순
  
  // 정렬 로직 추가 (다중 기준: date → startTime → title)
  const sortedAndFilteredEvents = useMemo(() => {
    const filtered = getFilteredEvents(events, searchTerm, currentDate, view);
    return sortEventsByDate(filtered, sortOrder);
  }, [events, searchTerm, currentDate, view, sortOrder]);
  
  return {
    searchTerm,
    setSearchTerm,
    filteredEvents: sortedAndFilteredEvents,
    sortOrder,
    setSortOrder,
  };
};

// eventUtils.ts에 정렬 함수 추가
export function sortEventsByDate(events: Event[], order: 'asc' | 'desc'): Event[] {
  return [...events].sort((a, b) => {
    // 1순위: 날짜 비교
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return order === 'asc' ? dateCompare : -dateCompare;
    }
    
    // 2순위: 시간 비교 (날짜가 같을 경우)
    const timeCompare = a.startTime.localeCompare(b.startTime);
    if (timeCompare !== 0) {
      return order === 'asc' ? timeCompare : -timeCompare;
    }
    
    // 3순위: 제목 비교 (날짜와 시간이 모두 같을 경우)
    const titleCompare = a.title.localeCompare(b.title);
    return order === 'asc' ? titleCompare : -titleCompare;
  });
}
```

### UI Components
- [ ] Component to create: 정렬 버튼 그룹 (최신순/오래된순)
- [ ] Component to modify: `App.tsx` (검색 input 밑에 정렬 버튼 추가)
- [ ] Component to modify: `useSearch.ts` (정렬 상태 및 로직 추가)
- [ ] Component to modify: `eventUtils.ts` (정렬 유틸리티 함수 추가)

### API/Storage Changes
- [ ] New endpoint/method: 없음 (클라이언트 사이드 정렬)
- [ ] Modified data structure: 없음

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] 검색 input 밑에 "최신순", "오래된순" 버튼 추가
- [ ] 기본값: 오래된순 (날짜 오름차순, 1일부터 30일까지)
- [ ] 버튼 클릭 시 정렬 모드 변경
- [ ] 선택된 정렬 버튼 시각적 표시 (예: variant="contained" 또는 배경색)
- [ ] 검색 결과가 선택한 정렬 방식으로 정렬됨
- [ ] 정렬 로직 구현 (다중 기준 정렬: date → startTime → title)
  - 날짜가 같으면 시작 시간(startTime) 기준 정렬
  - 날짜와 시간이 모두 같으면 제목(title) 기준 정렬
- [ ] 검색 결과가 없어도 버튼은 항상 표시
- [ ] 테스트 작성 (scenario 폴더)
  - 통합 테스트 3개
  - E2E 테스트 1개

### Nice to Have (선택)
- [ ] 버튼에 아이콘 추가 (예: ArrowUpward, ArrowDownward)
- [ ] 정렬 상태를 URL 쿼리 파라미터로 저장 (뒤로가기 시 상태 유지)

### Edge Cases to Handle
- [ ] 날짜가 같은 일정들의 정렬: 날짜 → 시간 → 제목 순서로 정렬
  - 같은 날짜면 시작 시간(startTime) 기준 오름차순/내림차순
  - 날짜와 시간이 모두 같으면 제목(title) 기준 알파벳/가나다 순서
- [ ] 검색 결과가 없을 때 버튼 표시 여부 (버튼은 항상 표시)
- [ ] 정렬 상태 초기화 시점 (검색어 변경 시 정렬 유지)
- [ ] 반복 일정의 정렬 처리 (일정 인스턴스의 date 기준)

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] 검색 input 밑에 "최신순", "오래된순" 버튼이 표시됨
- [ ] 검색 결과가 없어도 버튼은 항상 표시됨
- [ ] 기본값이 오래된순(날짜 오름차순)으로 설정됨
- [ ] 버튼 클릭 시 검색 결과가 정확히 정렬됨
- [ ] 선택된 정렬 버튼이 시각적으로 구분됨
- [ ] 날짜가 같은 일정은 시간 순서로 정렬됨
- [ ] 날짜와 시간이 모두 같은 일정은 제목 순서로 정렬됨
- [ ] 모든 Edge Cases 처리됨
- [ ] Tests pass (통합 테스트 3개, E2E 테스트 1개 - scenario 폴더)
- [ ] Code follows .cursorrules

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
- [x] 같은 날짜의 일정 정렬 기준: 날짜 → 시간 → 제목 순서 (확인 완료)
- [x] 검색어 변경 시 정렬 상태 유지 여부: 유지 (확인 완료)
- [ ] 버튼 스타일: Material-UI Button 사용? ToggleButtonGroup 사용?

**Potential issues:**
- [ ] 날짜 문자열 형식이 일관되지 않을 경우 정렬 오류 가능
- [ ] 반복 일정의 경우 여러 날짜에 표시되므로 정렬 기준 명확화 필요

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
**Task**: 검색 결과 날짜 정렬 버튼 추가
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

**Reference**: Check existing reviews for pattern
- `review/` folder의 기존 리뷰 파일들 참조

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

**Restart Protocol**:
1. ✅ Read updated PRD completely
2. ✅ Complete all new prerequisites
3. ✅ Follow new error prevention checklist
4. ✅ Implement with solutions from review
5. ⚠️ If same error occurs again → Escalate to King for approach change

---

## Implementation History
<!-- 구현 이력 -->

(구현 완료 후 기록)

