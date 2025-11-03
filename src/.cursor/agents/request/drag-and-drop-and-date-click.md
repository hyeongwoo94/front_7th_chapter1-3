# Feature Request: Drag & Drop and Date Click
<!-- 기능 요청: 드래그 앤 드롭 및 날짜 클릭 -->

**Date**: 2025-01-02
**Requester**: King (건물주)
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: 캘린더 일정에 드래그 앤 드롭 기능과 날짜 클릭으로 일정 생성 기능을 추가합니다.
<!-- 무엇을: 캘린더 일정에 드래그 앤 드롭 기능과 날짜 클릭으로 일정 생성 기능을 추가합니다. -->

**Why**: 사용자가 마우스로 일정을 쉽게 이동하고, 빈 날짜 셀을 클릭하여 빠르게 새 일정을 생성할 수 있도록 UX를 개선합니다.
<!-- 왜: 사용자가 마우스로 일정을 쉽게 이동하고, 빈 날짜 셀을 클릭하여 빠르게 새 일정을 생성할 수 있도록 UX를 개선합니다. -->

**User Story**: As a calendar user, I want to drag events to different dates/times and click empty date cells to create events, so that I can quickly reorganize my schedule without manually editing each event.
<!-- 사용자 스토리: 캘린더 사용자로서, 일정을 다른 날짜/시간으로 드래그하고 빈 날짜 셀을 클릭하여 일정을 생성할 수 있기를 원합니다, 그래서 각 일정을 수동으로 편집하지 않고 빠르게 일정을 재조직할 수 있습니다. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Feature 1: Drag & Drop Event
<!-- 기능 1: 일정 드래그 앤 드롭 -->

#### Input (사용자 행동)
```
User Action:
1. 캘린더에서 일정 박스를 마우스로 클릭하고 누른 채로 드래그
2. 다른 날짜의 셀(TableCell)로 드래그
3. 마우스 버튼을 놓음 (드롭)

Current State (Before):
- WeekView/MonthView에 일정들이 표시됨
- "팀 회의" 일정이 2025-10-01에 있음
- 일정은 Box 컴포넌트로 렌더링됨
```

#### Process (변환 과정)
```
1. 드래그 시작: 일정의 Box에서 mousedown 이벤트 발생
2. 드래그 중: @dnd-kit의 DndContext에서 드래그 상태 관리
3. 드래그 중 시각적 피드백: 마우스가 올라간 TableCell의 배경색이 변경됨 (예: #e3f2fd)
4. 드롭 감지: 드롭 대상 TableCell에서 drop 이벤트 처리
5. 새 날짜/시간 계산: 드롭된 셀의 날짜와 시간 정보 추출
6. 이벤트 업데이트: 
   - 일반 일정: 날짜/시간 업데이트하여 PUT 요청
   - 반복 일정 중 하나: 단일 일정으로 변환 (repeat.type = 'none', repeat.interval = 0)
7. 겹침 검사: 새 위치에서 겹치는 일정이 있는지 확인
8. 성공 알림: "일정이 이동되었습니다" 토스트 표시
```

#### Output (예상 결과)
```
After State:
- 일정이 새로운 날짜/시간으로 이동됨
- 반복 일정이었다면 단일 일정으로 변환됨
- 캘린더 뷰가 업데이트되어 새 위치에 일정 표시

Expected Notification/Feedback:
- 성공: "일정이 이동되었습니다" (success variant)
- 겹침 경고: 기존 OverlapWarningDialog 표시
- 오류: "일정 이동 실패" (error variant)
```

#### Example
```
Before: 
  Event: { id: "1", title: "팀 회의", date: "2025-10-01", startTime: "09:00", endTime: "10:00", repeat: { type: "weekly", interval: 1 } }
  Location: WeekView에서 2025-10-01 (월요일) 셀

Action: 
  사용자가 "팀 회의" 일정을 드래그하여 2025-10-03 (수요일) 셀로 이동

After: 
  Event: { id: "1", title: "팀 회의", date: "2025-10-03", startTime: "09:00", endTime: "10:00", repeat: { type: "none", interval: 0 } }
  Location: WeekView에서 2025-10-03 (수요일) 셀
  반복 일정이 단일 일정으로 변환됨
```

### Feature 2: Date Click for Event Creation
<!-- 기능 2: 날짜 클릭으로 일정 생성 -->

#### Input (사용자 행동)
```
User Action:
1. 캘린더에서 비어있는 날짜 셀(TableCell)을 클릭
2. 해당 셀에 일정이 없는 경우만 동작

Current State (Before):
- WeekView/MonthView에 일부 날짜 셀은 비어있음
- EventFormPanel의 날짜 필드는 현재 비어있거나 다른 날짜
- 폼의 다른 필드들도 비어있음
```

#### Process (변환 과정)
```
1. 셀 클릭 감지: TableCell에서 onClick 이벤트 발생
2. 셀 상태 확인: 해당 셀에 일정이 있는지 확인
3. 비어있으면: 셀의 날짜 정보 추출 (data-date 속성 또는 셀 위치 기반)
4. 폼 업데이트: EventFormPanel의 date 필드에 추출한 날짜 설정
5. 폼 리셋: 다른 필드는 초기화 (기존 resetForm 호출 후 date만 설정)
6. 시각적 피드백: 폼이 활성화되고 날짜 필드에 값이 채워짐
```

#### Output (예상 결과)
```
After State:
- EventFormPanel의 날짜 필드에 클릭한 날짜가 자동으로 채워짐
- 사용자가 나머지 정보(제목, 시간 등)만 입력하면 됨
- 폼 제목이 "일정 추가"로 표시됨

Expected Notification/Feedback:
- 별도 알림 없음 (폼에 날짜가 채워진 것이 명확히 보임)
```

#### Example
```
Before:
  EventFormPanel 상태: { date: "", title: "", startTime: "", ... }
  WeekView: 2025-10-05 (금요일) 셀이 비어있음

Action:
  사용자가 2025-10-05 셀을 클릭

After:
  EventFormPanel 상태: { date: "2025-10-05", title: "", startTime: "", ... }
  폼의 날짜 필드에 "2025-10-05"가 표시됨
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Dependencies
```json
{
  "@dnd-kit/core": "^latest",
  "@dnd-kit/sortable": "^latest",
  "@dnd-kit/utilities": "^latest"
}
```

### Data Model Changes
```typescript
// 기존 Event 타입은 변경 없음
// 드래그 앤 드롭 시 반복 일정을 단일 일정으로 변환:
interface Event {
  // ... 기존 필드
  repeat: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    id?: string;
  };
}

// 드래그 앤 드롭 시:
// Before: { repeat: { type: 'weekly', interval: 1 } }
// After: { repeat: { type: 'none', interval: 0 } }
```

### UI Components
- [ ] Component to modify: `src/components/hw/WeekView.tsx` - DndContext, Draggable, Droppable 추가
- [ ] Component to modify: `src/components/hw/MonthView.tsx` - DndContext, Draggable, Droppable 추가
- [ ] Component to create: `src/components/hw/DraggableEventBox.tsx` (선택사항 - 재사용 가능한 드래그 가능한 이벤트 박스)
- [ ] Component to modify: `src/components/hw/EventFormPanel.tsx` - date 필드 자동 채우기 로직 추가 (onDateClick prop)

### Test Files Location
<!-- 테스트 파일 위치 -->
**IMPORTANT**: 모든 테스트 코드는 `src/__tests__/hw/` 폴더에 생성합니다.
<!-- 중요: 모든 테스트 코드는 `src/__tests__/hw/` 폴더에 생성합니다. -->

- [ ] Test file to create: `src/__tests__/hw/dragAndDrop.spec.tsx` - 드래그 앤 드롭 기능 테스트
- [ ] Test file to create: `src/__tests__/hw/dateClick.spec.tsx` - 날짜 클릭 기능 테스트
- [ ] Test file to create: `src/__tests__/hw/dragAndDropIntegration.spec.tsx` - 통합 테스트 (선택사항)

### API/Storage Changes
- [ ] Modified endpoint: `PUT /api/events/:id` - 일정 업데이트 (기존 존재)
- [ ] 사용 로직: 드래그 앤 드롭으로 이동한 일정은 기존 saveEvent 함수로 업데이트

### Visual Feedback
```typescript
// 드래그 중 타겟 셀 배경색 변경
const dropZoneStyle = {
  backgroundColor: isOver ? '#e3f2fd' : 'transparent',
  transition: 'background-color 0.2s',
};
```

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
- [ ] @dnd-kit 라이브러리 설치 및 설정
- [ ] `src/components/hw/WeekView.tsx`에 DndContext, Draggable, Droppable 구현
- [ ] `src/components/hw/MonthView.tsx`에 DndContext, Draggable, Droppable 구현
- [ ] 일정을 드래그하여 다른 날짜로 이동 기능
- [ ] 드래그 중 타겟 TableCell 배경색 변경 (#e3f2fd)
- [ ] 드롭 시 일정 날짜/시간 업데이트 (API 호출)
- [ ] 반복 일정 드래그 시 단일 일정으로 자동 변환
- [ ] 이동 후 겹침 검사 (기존 findOverlappingEvents 활용)
- [ ] 빈 날짜 셀 클릭 시 EventFormPanel에 날짜 자동 채우기
- [ ] 성공/실패 알림 토스트 표시
- [ ] 테스트 코드 작성: `src/__tests__/hw/dragAndDrop.spec.tsx`
- [ ] 테스트 코드 작성: `src/__tests__/hw/dateClick.spec.tsx`

### Nice to Have (선택)
- [ ] 시간대도 드래그로 변경 가능 (세로 드래그로 시간 조정)
- [ ] 드래그 중 일정 미리보기 표시
- [ ] 키보드 접근성 지원 (드래그 대신 키보드로 이동)

### Edge Cases to Handle
- [ ] 반복 일정 중 하나를 이동할 때 다른 반복 일정들은 영향받지 않음
- [ ] 같은 날짜/시간으로 이동하는 경우 (변경 없음)
- [ ] 드래그 중 취소 (ESC 키 또는 드래그 해제)
- [ ] 드롭 대상이 유효하지 않은 경우 (일정이 아닌 곳)
- [ ] 네트워크 오류 시 롤백 (원래 위치로 복원)
- [ ] 겹침 발생 시 기존 OverlapWarningDialog 표시
- [ ] 빈 셀 클릭 시 해당 셀에 이미 일정이 있으면 동작하지 않음

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
- [ ] 모든 "Must Have" 항목이 작동함
- [ ] Input → Output이 명세와 일치함
- [ ] 드래그 앤 드롭으로 일정이 정확히 이동됨
- [ ] 반복 일정 이동 시 단일 일정으로 변환됨
- [ ] 드래그 중 타겟 셀 배경색이 변경됨
- [ ] 빈 날짜 셀 클릭 시 폼에 날짜가 자동 채워짐
- [ ] 겹침 검사가 정상 작동함
- [ ] 성공/실패 알림이 표시됨
- [ ] 엣지 케이스가 처리됨
- [ ] 테스트가 통과함
- [ ] 코드가 .cursorrules를 따름
- [ ] 모든 일정 타입(일반, 반복)에서 작동함

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
- 시간 변경도 드래그로 할지, 아니면 날짜만 변경할지? (현재는 날짜 변경 중심으로 가정)
- 드래그 시작 조건: 일정 전체를 드래그할지, 특정 핸들이나 아이콘이 있어야 할지? (현재는 일정 전체로 가정)
- WeekView와 MonthView에서 드래그 범위 제한: 같은 뷰 내에서만 가능한지, 다른 뷰로도 이동 가능한지? (현재는 같은 뷰 내로 가정)

**Potential issues:**
- 모바일 터치 환경에서 @dnd-kit의 터치 지원이 제대로 작동하는지 확인 필요
- 많은 일정이 있는 경우 드래그 성능 이슈 가능성
- 반복 일정 변환 시 기존 반복 일정의 다른 인스턴스들과의 관계 처리

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

## 7. Reference Documents
<!-- 참고 문서 -->

### Must Read Before Implementation
<!-- 구현 전 필수 읽기 -->
- `src/.cursor/agents/doc/tdd.md` - TDD 방법론 (Red-Green-Refactor)
- `src/.cursor/agents/doc/checklist.md` - 커밋 전 체크리스트
- `src/.cursor/agents/doc/test-guidelines.md` - 테스트 작성 가이드
- `.cursorrules` - 코드 컨벤션 (camelCase 함수, snake_case 클래스, TypeScript)

### Related Code to Review
<!-- 검토할 관련 코드 -->
- `src/components/hw/WeekView.tsx` - 수정 대상 (DndContext 추가)
- `src/components/hw/MonthView.tsx` - 수정 대상 (DndContext 추가)
- `src/components/hw/EventFormPanel.tsx` - 날짜 자동 채우기 추가 (onDateClick prop)
- `src/hooks/useEventOperations.ts` - saveEvent 함수 활용
- `src/utils/eventOverlap.ts` - 겹침 검사 로직
- `src/hooks/useRecurringEventOperations.ts` - 반복 일정 처리 패턴 참고

### Test Files Location
<!-- 테스트 파일 위치 -->
**Folder Structure**:
```
src/
  __tests__/
    hw/                          ← 새로 생성할 폴더
      dragAndDrop.spec.tsx       ← 드래그 앤 드롭 테스트
      dateClick.spec.tsx          ← 날짜 클릭 테스트
      dragAndDropIntegration.spec.tsx  ← 통합 테스트 (선택사항)
```

**All new test files MUST be created in `src/__tests__/hw/` folder**
<!-- 모든 새 테스트 파일은 `src/__tests__/hw/` 폴더에 생성해야 함 -->

### Patterns to Follow
<!-- 따를 패턴 -->
- `src/.cursor/agents/home/memoryHome.md` - 과거 패턴 및 교훈
  - Pattern 1: Implementation ≠ Integration (함수 구현 후 실제 호출 확인)
  - Pattern 5: Data Model First (데이터 모델 이해 후 구현)

---

## 8. Error Recovery Process ⚠️
<!-- 오류 복구 프로세스 ⚠️ -->

**When same error occurs 2+ times during implementation:**
<!-- 구현 중 같은 오류가 2번 이상 발생할 때: -->

1. ⏸️ **Stop immediately** - 즉시 중단
2. 📝 **Create review document** - 리뷰 문서 생성 (`review/` 폴더)
3. 📄 **Update this PRD** - 이 PRD 업데이트 (Section 3에 Prerequisites, Section 4에 Error Prevention 추가)
4. ▶️ **Restart with updated knowledge** - 업데이트된 지식으로 재시작

**DO NOT:**
- ❌ 같은 수정을 3번 이상 시도
- ❌ 근본 원인 파악 없이 계속 진행
- ❌ 리뷰 프로세스 건너뛰기

