# Feature Request: 일정 리스트 클릭 시 폼 자동 채우기 및 UI 개선
<!-- 기능 요청: 일정 리스트 클릭 시 폼 자동 채우기 및 UI 개선 -->

**Date**: 2025-01-16
**Requester**: King (건물주)
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: 일정 리스트에서 일정을 클릭하면 왼쪽 일정 폼에 해당 일정 정보가 자동으로 채워지고, 타이틀을 "일정"으로 통일하며, 버튼을 disabled 상태로 관리하는 기능을 추가합니다.
<!-- 무엇을: 일정 리스트에서 일정을 클릭하면 왼쪽 일정 폼에 해당 일정 정보가 자동으로 채워지고, 타이틀을 "일정"으로 통일하며, 버튼을 disabled 상태로 관리하는 기능을 추가합니다. -->

**Why**: 사용자가 일정을 더 쉽게 확인하고 수정할 수 있도록 UX를 개선하고, UI를 더 간결하게 만듭니다.
<!-- 왜: 사용자가 일정을 더 쉽게 확인하고 수정할 수 있도록 UX를 개선하고, UI를 더 간결하게 만듭니다. -->

**User Story**: As a calendar user, I want to click on an event in the list to automatically load its details into the form, so that I can quickly view and edit event information without clicking the edit button.
<!-- 사용자 스토리: 캘린더 사용자로서, 리스트에서 일정을 클릭하면 폼에 자동으로 정보가 채워지기를 원합니다, 그래서 수정 버튼을 클릭하지 않고도 빠르게 일정 정보를 확인하고 수정할 수 있습니다. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. 오른쪽 일정 리스트에서 일정 항목 클릭 (Edit 버튼이 아닌 일정 자체 클릭)
2. 일정 폼 확인

Current State (Before):
- 일정 리스트에서 Edit 버튼을 클릭해야만 폼에 일정 정보가 채워짐
- 타이틀: "일정 추가" 또는 "일정 수정"
- 버튼: 항상 활성화 상태
- 예시: 일정 "팀 회의"를 클릭해도 폼에 정보가 채워지지 않음
```

### Process (변환 과정)
```
1. 일정 리스트 항목 클릭 감지:
   - EventListPanel의 일정 Box를 클릭 가능하게 만들기
   - onClick 핸들러 추가하여 onEdit 호출 (기존 Edit 버튼과 동일한 동작)

2. 폼 정보 채우기:
   - 기존 editEvent 함수 사용 (이미 구현됨)
   - 일정 정보가 폼에 자동으로 채워짐

3. 타이틀 변경:
   - EventFormPanel의 타이틀을 "일정 추가", "일정 수정"에서 "일정"으로 변경
   - editingEvent가 있으면 "일정"으로 표시 (추가/수정 구분 없음)

4. 버튼 disabled 상태 관리:
   - **기본값**: 버튼은 disabled (폼이 비어있거나 필수 필드가 없을 때)
   - **활성화 조건**: input(폼 필드)를 클릭하면 disabled가 풀리고 버튼이 활성화됨
   - 일정 수정 버튼이 활성화되어야 함
   - 폼 필드를 클릭하면 사용자가 입력을 시작한다는 의미로 간주
```

### Output (예상 결과)
```
After State:
- 일정 리스트에서 일정을 클릭하면 폼에 정보가 자동으로 채워짐
- 타이틀: "일정" (추가/수정 구분 없음)
- 버튼: 기본값 disabled, input 필드 클릭 시 enabled로 변경
- Edit 버튼도 계속 작동 (기존 기능 유지)

Expected Notification/Feedback:
- 알림 없음 (기존 동작 유지)

Detailed Behavior:
- 일정 리스트 클릭 → 폼 정보 채워짐 → 버튼: disabled
- input 필드(제목, 날짜, 시간 등) 클릭 → 버튼: enabled
- 여러 input 필드 중 하나라도 클릭하면 버튼 활성화
```

### Example
```
Before: 
  - 일정 리스트: "팀 회의" 일정이 있음
  - 사용자가 "팀 회의" 일정 Box를 클릭
  - 폼: 비어있음 (변경 없음)
  - 타이틀: "일정 추가"
  - 버튼: "일정 추가" (활성화)

After: 
  - 일정 리스트: "팀 회의" 일정이 있음
  - 사용자가 "팀 회의" 일정 Box를 클릭
  - 폼: 일정 정보가 자동으로 채워짐 (제목, 날짜, 시간 등)
  - 타이틀: "일정"
  - 버튼: "일정" (기본값: disabled)
  - 사용자가 input(폼 필드)를 클릭하면 버튼이 활성화됨
  - 예: 제목 필드를 클릭하면 버튼이 enabled 상태로 변경됨
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### UI Components
<!-- UI 컴포넌트 -->
- `src/components/hw/EventListPanel.tsx` 수정
  - 일정 Box에 onClick 핸들러 추가
  - 클릭 가능한 스타일 추가 (cursor: pointer)
- `src/components/hw/EventFormPanel.tsx` 수정
  - 타이틀 변경: "일정 추가"/"일정 수정" → "일정"
  - 버튼 텍스트 변경: "일정 추가"/"일정 수정" → "일정"
  - 버튼 disabled 상태 로직 추가

### Hooks & Utilities
<!-- 훅 및 유틸리티 -->
- `src/hooks/useEventForm.ts` 확인 (필요시 수정)
  - 폼 상태 변경 감지 로직 추가 (버튼 disabled 판단용)

### Data Flow
<!-- 데이터 흐름 -->
```
1. EventListPanel에서 일정 Box 클릭
   - onClick 핸들러에서 onEdit(event) 호출
   - 기존 Edit 버튼과 동일한 동작

2. App.tsx의 handleEditEvent 호출
   - 반복일정인 경우 다이얼로그 표시
   - 일반일정인 경우 editEvent 호출

3. useEventForm의 editEvent 함수 실행
   - 폼에 일정 정보 채우기
   - editingEvent 상태 설정

4. EventFormPanel 렌더링
   - 타이틀: "일정" 표시
   - 버튼: 폼 상태에 따라 disabled/enabled
```

### Prerequisites
<!-- 전제 조건 -->
- 기존 editEvent 함수가 정상 작동함
- 폼 상태 관리 로직이 존재함
- 버튼 disabled 판단 로직 구현 필요

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] `src/components/hw/EventListPanel.tsx` 수정
  - [ ] 일정 Box에 onClick 핸들러 추가
  - [ ] onEdit(event) 호출
  - [ ] 클릭 가능한 스타일 추가 (cursor: pointer, hover 효과)
- [ ] `src/components/hw/EventFormPanel.tsx` 수정
  - [ ] 타이틀 변경: "일정 추가"/"일정 수정" → "일정"
  - [ ] 버튼 텍스트 변경: "일정 추가"/"일정 수정" → "일정"
  - [ ] 버튼 disabled 로직 추가
    - [ ] 기본값: disabled (폼이 비어있거나 필수 필드가 없을 때)
    - [ ] input(폼 필드) 클릭 시 버튼 활성화 (onFocus 이벤트 처리)
    - [ ] 모든 input 필드에 onFocus 핸들러 추가
    - [ ] input 클릭 시 버튼이 enabled 상태로 변경
- [ ] 테스트 작성 (필요시)

### Nice to Have (선택)
- [ ] 일정 클릭 시 시각적 피드백 (선택된 일정 표시)
- [ ] 키보드 접근성 지원 (Enter 키로 일정 선택)

### Edge Cases to Handle
<!-- 처리할 엣지 케이스 -->
- [ ] 반복일정 클릭 시 다이얼로그 표시 (기존 로직 유지)
- [ ] Edit 버튼 클릭 시에도 동일하게 작동 (기존 기능 유지)
- [ ] 폼이 비어있을 때 버튼 disabled (기본값)
- [ ] 필수 필드가 없을 때 버튼 disabled (기본값)
- [ ] input 필드를 클릭하면 버튼이 활성화됨
- [ ] 여러 input 필드 중 하나라도 클릭하면 버튼 활성화

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] 일정 리스트에서 일정을 클릭하면 폼에 정보가 자동으로 채워짐
- [ ] 타이틀이 "일정"으로 표시됨 (추가/수정 구분 없음)
- [ ] 버튼 텍스트가 "일정"으로 표시됨
- [ ] 버튼이 기본값으로 disabled 상태
- [ ] input 필드 클릭 시 버튼이 enabled로 변경됨
- [ ] Edit 버튼도 계속 작동함 (기존 기능 유지)
- [ ] 반복일정 클릭 시 다이얼로그 표시 (기존 로직 유지)
- [ ] 통합 테스트 2개 통과
- [ ] E2E 테스트 1개 통과
- [ ] 코드가 .cursorrules를 따름

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
- 버튼 disabled 조건
  - **확정**: 기본값은 disabled (폼이 비어있거나 필수 필드가 없을 때)
  - **확정**: input(폼 필드)를 클릭하면 disabled가 풀리고 버튼이 활성화됨
  - **확정**: 일정 수정 버튼이 활성화되어야 함
- 일정 클릭 영역
  - **확정**: 일정 Box 전체 클릭 가능

---

## 7. Technical Context
<!-- 기술 컨텍스트 -->

### Files to Modify
<!-- 수정할 파일 -->
- `src/components/hw/EventListPanel.tsx` - 일정 Box 클릭 핸들러 추가
- `src/components/hw/EventFormPanel.tsx` - 타이틀/버튼 텍스트 변경, disabled 로직 추가

### Related Code to Review
<!-- 검토할 관련 코드 -->
- `src/components/hw/EventListPanel.tsx` - 현재 구조 확인
- `src/components/hw/EventFormPanel.tsx` - 타이틀 및 버튼 위치 확인
- `src/App.tsx` - handleEditEvent 함수 확인
- `src/hooks/useEventForm.ts` - editEvent 함수 확인

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

## 9. Implementation Notes
<!-- 구현 노트 -->

### 일정 Box 클릭 핸들러
<!-- 일정 Box 클릭 핸들러 -->
```typescript
// EventListPanel.tsx
<Box 
  key={event.id} 
  sx={{ 
    border: 1, 
    borderRadius: 2, 
    p: 3, 
    width: '100%',
    cursor: 'pointer', // 추가
    '&:hover': { backgroundColor: 'action.hover' } // 추가
  }}
  onClick={() => onEdit(event)} // 추가
>
  {/* 기존 내용 */}
</Box>
```

### 타이틀 및 버튼 텍스트 변경
<!-- 타이틀 및 버튼 텍스트 변경 -->
```typescript
// EventFormPanel.tsx
// 변경 전
<Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>
<Button>{editingEvent ? '일정 수정' : '일정 추가'}</Button>

// 변경 후
<Typography variant="h4">일정</Typography>
<Button disabled={/* disabled 조건 */}>일정</Button>
```

### 버튼 disabled 로직
<!-- 버튼 disabled 로직 -->
```typescript
// EventFormPanel.tsx
const [isFormInteracted, setIsFormInteracted] = useState(false);

// 모든 input 필드에 onFocus 핸들러 추가
const handleInputFocus = () => {
  setIsFormInteracted(true);
};

// 버튼 disabled 조건
const isButtonDisabled = !isFormInteracted;

<TextField
  id="title"
  onFocus={handleInputFocus}
  // ... 기타 props
/>

<Button disabled={isButtonDisabled}>일정</Button>
```

### 테스트 전략
<!-- 테스트 전략 -->
- **통합 테스트 2개**: 
  1. 일정 리스트 클릭 시 폼에 정보가 채워지는지
  2. input 필드 클릭 시 버튼이 활성화되는지
- **E2E 테스트 1개**: 
  - 일정 리스트 클릭 → 폼 정보 채워짐 → input 클릭 → 버튼 활성화 전체 플로우

---

## 10. Test Strategy (테스트 피라미드 전략)
<!-- 테스트 전략 (테스트 피라미드 전략) -->

### 통합 테스트 (2개)
<!-- 통합 테스트 (2개) -->
- **목적**: 일정 리스트 클릭 및 버튼 활성화 로직 검증
- **위치**: `src/__tests__/scenario/eventListClickToLoadForm.spec.tsx` (Scenario 폴더 안에 생성)
- **테스트 내용**:
  1. 일정 리스트에서 일정 클릭 시 폼에 정보가 채워지는지
  2. input 필드 클릭 시 버튼이 활성화되는지

### E2E 테스트 (1개)
<!-- E2E 테스트 (1개) -->
- **목적**: 전체 사용자 워크플로우 검증
- **위치**: `src/__tests__/scenario/eventListClickToLoadForm.spec.tsx` (Scenario 폴더 안에 생성)
- **테스트 내용**:
  - 일정 리스트 클릭 → 폼 정보 채워짐 → input 클릭 → 버튼 활성화 전체 플로우

---

**Document Status**: ⏳ Pending User Approval
<!-- 문서 상태: 사용자 승인 대기 중 -->

