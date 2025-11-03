# Feature Request: 드래그 앤 드롭 및 날짜 클릭 기능
<!-- Feature Request: Drag and Drop and Date Click Features -->

**Date**: 2025-01-28
**Requester**: User/King
**Status**: ⏳ Pending Review

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: Implement drag-and-drop functionality for events in calendar view and date click to auto-fill event form
<!-- 무엇을: 캘린더 뷰에서 일정의 드래그 앤 드롭 기능 구현 및 날짜 클릭으로 일정 폼 자동 채우기 -->

**Why**: Improve user experience by allowing intuitive event management through drag-and-drop and quick event creation by clicking empty dates
<!-- 왜: 드래그 앤 드롭을 통한 직관적인 일정 관리와 빈 날짜 클릭으로 빠른 일정 생성을 통해 사용자 경험 향상 -->

**User Story**: As a calendar user, I want to drag events to different dates/times and click empty calendar cells to create events, so that I can manage my schedule more efficiently.
<!-- 사용자 스토리: 캘린더 사용자로서, 일정을 다른 날짜/시간으로 끌어다 놓고 빈 캘린더 셀을 클릭하여 일정을 생성하고 싶습니다, 일정을 더 효율적으로 관리할 수 있도록. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Feature 1: Drag and Drop
<!-- 기능 1: 드래그 앤 드롭 -->

#### Input (사용자 행동)
<!-- Input (User Action) -->
```
User Action:
<!-- 사용자 행동: -->
1. User hovers over an event in calendar (WeekView or MonthView)
<!-- 1. 사용자가 캘린더(WeekView 또는 MonthView)에서 일정에 마우스를 올림 -->
2. User clicks and holds (mousedown) on the event
<!-- 2. 사용자가 일정을 클릭하고 유지(마우스다운) -->
3. User drags the event to a different date or time slot
<!-- 3. 사용자가 일정을 다른 날짜나 시간 슬롯으로 드래그 -->
4. User releases mouse (mouseup) at the target location
<!-- 4. 사용자가 대상 위치에서 마우스를 놓음(마우스업) -->

Current State (Before):
<!-- 현재 상태 (이전): -->
- Event "팀 회의" at 2025-10-15 14:00-15:00
<!-- 일정 "팀 회의" 2025-10-15 14:00-15:00 -->
- Calendar shows event in WeekView on Wednesday
<!-- 캘린더가 WeekView에서 수요일에 일정 표시 -->
- Event is not draggable
<!-- 일정이 드래그 가능하지 않음 -->
```

#### Process (변환 과정)
<!-- Process (Transformation Process) -->
```
1. Detect mousedown event on event element
<!-- 1. 일정 요소에서 mousedown 이벤트 감지 -->
2. Set drag state and store original event data
<!-- 2. 드래그 상태 설정 및 원본 일정 데이터 저장 -->
3. Track mouse movement (mousemove) and highlight drop zones
<!-- 3. 마우스 이동 추적(mousemove) 및 드롭 영역 강조 -->
4. Detect mouseup on valid drop target (calendar cell)
<!-- 4. 유효한 드롭 대상(캘린더 셀)에서 mouseup 감지 -->
5. Calculate new date and time from drop position
<!-- 5. 드롭 위치에서 새 날짜 및 시간 계산 -->
6. Update event with new date/time via PUT API
<!-- 6. PUT API를 통해 새 날짜/시간으로 일정 업데이트 -->
7. Refresh events list
<!-- 7. 일정 목록 새로고침 -->
```

#### Output (예상 결과)
<!-- Output (Expected Result) -->
```
After State:
<!-- 이후 상태: -->
- Event "팀 회의" moved to 2025-10-16 14:00-15:00
<!-- 일정 "팀 회의"가 2025-10-16 14:00-15:00로 이동 -->
- Calendar shows event in new position (Thursday)
<!-- 캘린더가 새 위치(목요일)에 일정 표시 -->
- Original event position is empty
<!-- 원본 일정 위치가 비어있음 -->

Expected Notification/Feedback:
<!-- 예상 알림/피드백: -->
- Success message: "일정이 이동되었습니다"
<!-- 성공 메시지: "일정이 이동되었습니다" -->
- Visual feedback during drag (cursor change, highlight)
<!-- 드래그 중 시각적 피드백 (커서 변경, 강조 표시) -->
```

#### Example
<!-- Example -->
```
Before: 
<!-- 이전: -->
- Calendar WeekView showing 7 days
<!-- 7일을 표시하는 Calendar WeekView -->
- Event "팀 미팅" at 2025-10-15 (Wed) 14:00-15:00
<!-- 일정 "팀 미팅" 2025-10-15 (수) 14:00-15:00 -->

Action: 
<!-- 행동: -->
1. Click and hold on "팀 미팅" event box
<!-- 1. "팀 미팅" 일정 박스를 클릭하고 유지 -->
2. Drag to Thursday (2025-10-16) 14:00-15:00 position
<!-- 2. 목요일(2025-10-16) 14:00-15:00 위치로 드래그 -->
3. Release mouse
<!-- 3. 마우스 놓기 -->

After: 
<!-- 이후: -->
- Event "팀 미팅" at 2025-10-16 (Thu) 14:00-15:00
<!-- 일정 "팀 미팅" 2025-10-16 (목) 14:00-15:00 -->
- Wednesday cell shows no events
<!-- 수요일 셀에 일정 없음 표시 -->
- Success notification displayed
<!-- 성공 알림 표시 -->
```

### Feature 2: Date Click to Create Event
<!-- 기능 2: 날짜 클릭으로 일정 생성 -->

#### Input (사용자 행동)
<!-- Input (User Action) -->
```
User Action:
<!-- 사용자 행동: -->
1. User views calendar (WeekView or MonthView)
<!-- 1. 사용자가 캘린더(WeekView 또는 MonthView)를 봄 -->
2. User clicks on an empty date cell (no events)
<!-- 2. 사용자가 빈 날짜 셀(일정 없음)을 클릭 -->
3. Event form opens or focuses
<!-- 3. 일정 폼이 열리거나 포커스됨 -->

Current State (Before):
<!-- 현재 상태 (이전): -->
- Calendar showing WeekView for 2025-10-15 week
<!-- 2025-10-15 주의 WeekView를 표시하는 캘린더 -->
- Thursday (2025-10-16) cell is empty
<!-- 목요일(2025-10-16) 셀이 비어있음 -->
- Event form has empty date field
<!-- 일정 폼에 날짜 필드가 비어있음 -->
```

#### Process (변환 과정)
<!-- Process (Transformation Process) -->
```
1. Detect click event on empty calendar cell
<!-- 1. 빈 캘린더 셀에서 클릭 이벤트 감지 -->
2. Extract date from clicked cell
<!-- 2. 클릭된 셀에서 날짜 추출 -->
3. Pass date to EventForm component via props/callback
<!-- 3. props/callback을 통해 EventForm 컴포넌트에 날짜 전달 -->
4. Set date field in form to clicked date
<!-- 4. 폼의 날짜 필드를 클릭된 날짜로 설정 -->
5. Optionally focus on title field for quick input
<!-- 5. 선택적으로 빠른 입력을 위해 제목 필드에 포커스 -->
```

#### Output (예상 결과)
<!-- Output (Expected Result) -->
```
After State:
<!-- 이후 상태: -->
- Event form date field filled with "2025-10-16"
<!-- 일정 폼 날짜 필드가 "2025-10-16"로 채워짐 -->
- User can immediately start typing title
<!-- 사용자가 즉시 제목 입력 시작 가능 -->
- Form is ready for event creation
<!-- 폼이 일정 생성 준비 완료 -->

Expected Notification/Feedback:
<!-- 예상 알림/피드백: -->
- Date field automatically populated
<!-- 날짜 필드가 자동으로 채워짐 -->
- Visual indication that form is ready (optional highlight)
<!-- 폼이 준비되었음을 나타내는 시각적 표시 (선택적 강조) -->
```

#### Example
<!-- Example -->
```
Before:
<!-- 이전: -->
- Calendar MonthView showing October 2025
<!-- 2025년 10월을 표시하는 Calendar MonthView -->
- Empty cell for October 16, 2025
<!-- 2025년 10월 16일의 빈 셀 -->
- Event form with empty date field
<!-- 빈 날짜 필드가 있는 일정 폼 -->

Action:
<!-- 행동: -->
1. Click on empty October 16 cell
<!-- 1. 빈 10월 16일 셀 클릭 -->

After:
<!-- 이후: -->
- Event form date field shows "2025-10-16"
<!-- 일정 폼 날짜 필드가 "2025-10-16" 표시 -->
- User can type event title immediately
<!-- 사용자가 즉시 일정 제목 입력 가능 -->
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Data Model Changes
<!-- 데이터 모델 변경사항 -->
No data model changes required. Event structure remains the same:
<!-- 데이터 모델 변경 불필요. 일정 구조는 동일: -->
```typescript
interface Event {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
  // ... other fields remain unchanged
}
```

### UI Components
<!-- UI 컴포넌트 -->
- [ ] Component to modify: `WeekView.tsx` - Add drag handlers and click handlers
<!-- 수정할 컴포넌트: `WeekView.tsx` - 드래그 핸들러 및 클릭 핸들러 추가 -->
- [ ] Component to modify: `MonthView.tsx` - Add drag handlers and click handlers
<!-- 수정할 컴포넌트: `MonthView.tsx` - 드래그 핸들러 및 클릭 핸들러 추가 -->
- [ ] Component to modify: `CalendarView.tsx` - Pass date click callback to views
<!-- 수정할 컴포넌트: `CalendarView.tsx` - 뷰에 날짜 클릭 콜백 전달 -->
- [ ] Component to modify: `EventForm.tsx` - Accept date prop and set initial value
<!-- 수정할 컴포넌트: `EventForm.tsx` - 날짜 prop 수락 및 초기값 설정 -->
- [ ] Hook to create: `useDragAndDrop.ts` - Handle drag and drop logic
<!-- 생성할 훅: `useDragAndDrop.ts` - 드래그 앤 드롭 로직 처리 -->
- [ ] Utility to create: `dragDropUtils.ts` - Calculate drop position and new date/time
<!-- 생성할 유틸리티: `dragDropUtils.ts` - 드롭 위치 및 새 날짜/시간 계산 -->

### API/Storage Changes
<!-- API/Storage 변경사항 -->
- [ ] Modified endpoint/method: `PUT /api/events/:id` - Used for updating event date/time
<!-- 수정된 엔드포인트/메서드: `PUT /api/events/:id` - 일정 날짜/시간 업데이트에 사용 -->
- [ ] No new endpoints needed
<!-- 새로운 엔드포인트 불필요 -->

### Libraries/Dependencies
<!-- 라이브러리/의존성 -->
- React DnD or native HTML5 drag and drop API
<!-- React DnD 또는 네이티브 HTML5 드래그 앤 드롭 API -->
- Consider `react-dnd` or `@dnd-kit/core` for better DX, or use native HTML5 API
<!-- 더 나은 개발 경험을 위해 `react-dnd` 또는 `@dnd-kit/core` 고려, 또는 네이티브 HTML5 API 사용 -->

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Must Have (필수)
<!-- Must Have (Required) -->
- [ ] Implement drag handlers (mousedown, mousemove, mouseup) for events
<!-- 일정에 대한 드래그 핸들러(mousedown, mousemove, mouseup) 구현 -->
- [ ] Implement drop zone detection in calendar cells
<!-- 캘린더 셀의 드롭 영역 감지 구현 -->
- [ ] Calculate new date/time from drop position
<!-- 드롭 위치에서 새 날짜/시간 계산 -->
- [ ] Update event via API when dropped
<!-- 드롭 시 API를 통해 일정 업데이트 -->
- [ ] Add visual feedback during drag (cursor, highlight)
<!-- 드래그 중 시각적 피드백 추가 (커서, 강조 표시) -->
- [ ] Handle date click in empty cells for both WeekView and MonthView
<!-- WeekView와 MonthView 모두에서 빈 셀의 날짜 클릭 처리 -->
- [ ] Pass clicked date to EventForm
<!-- 클릭된 날짜를 EventForm에 전달 -->
- [ ] Auto-fill date field in EventForm
<!-- EventForm의 날짜 필드 자동 채우기 -->
- [ ] Handle overlap detection after drag (if time changed)
<!-- 드래그 후 겹침 감지 처리 (시간이 변경된 경우) -->
- [ ] Show success notification after drag
<!-- 드래그 후 성공 알림 표시 -->

### Nice to Have (선택)
<!-- Nice to Have (Optional) -->
- [ ] Drag preview (ghost image following cursor)
<!-- 드래그 미리보기 (커서를 따라가는 고스트 이미지) -->
- [ ] Snap to time slots (e.g., 30-minute intervals)
<!-- 시간 슬롯에 스냅 (예: 30분 간격) -->
- [ ] Keyboard shortcuts for drag operations
<!-- 드래그 작업을 위한 키보드 단축키 -->
- [ ] Touch support for mobile drag and drop
<!-- 모바일 드래그 앤 드롭을 위한 터치 지원 -->
- [ ] Undo/redo for drag operations
<!-- 드래그 작업에 대한 실행 취소/다시 실행 -->

### Edge Cases to Handle
<!-- 처리할 엣지 케이스 -->
- [ ] Dragging to invalid dates (past dates, outside view)
<!-- 유효하지 않은 날짜로 드래그 (과거 날짜, 뷰 외부) -->
- [ ] Dragging recurring events (should prompt for single/all)
<!-- 반복 일정 드래그 (단일/전체 선택 프롬프트 표시) -->
- [ ] Dragging event over existing event (overlap detection)
<!-- 기존 일정 위로 일정 드래그 (겹침 감지) -->
- [ ] Clicking date cell that already has events
<!-- 이미 일정이 있는 날짜 셀 클릭 -->
- [ ] Drag cancellation (mouseup outside valid drop zone)
<!-- 드래그 취소 (유효한 드롭 영역 외부에서 mouseup) -->
- [ ] Network error during drag update
<!-- 드래그 업데이트 중 네트워크 오류 -->
- [ ] Concurrent drag operations
<!-- 동시 드래그 작업 -->
- [ ] Very long events spanning multiple days
<!-- 여러 날짜에 걸친 매우 긴 일정 -->

---

## 5. Success Criteria
<!-- 성공 기준 -->

**Feature is complete when:**
<!-- 기능이 완료될 때: -->
- [ ] User can drag events from one date to another in WeekView
<!-- 사용자가 WeekView에서 일정을 한 날짜에서 다른 날짜로 드래그할 수 있음 -->
- [ ] User can drag events from one date to another in MonthView
<!-- 사용자가 MonthView에서 일정을 한 날짜에서 다른 날짜로 드래그할 수 있음 -->
- [ ] Dragged events update correctly via API
<!-- 드래그된 일정이 API를 통해 올바르게 업데이트됨 -->
- [ ] Visual feedback is provided during drag operation
<!-- 드래그 작업 중 시각적 피드백 제공 -->
- [ ] User can click empty date cell in WeekView to auto-fill form
<!-- 사용자가 WeekView에서 빈 날짜 셀을 클릭하여 폼 자동 채우기 가능 -->
- [ ] User can click empty date cell in MonthView to auto-fill form
<!-- 사용자가 MonthView에서 빈 날짜 셀을 클릭하여 폼 자동 채우기 가능 -->
- [ ] EventForm date field is populated when date cell is clicked
<!-- 날짜 셀을 클릭하면 EventForm 날짜 필드가 채워짐 -->
- [ ] Overlap detection works after drag if time changed
<!-- 시간이 변경된 경우 드래그 후 겹침 감지 작동 -->
- [ ] Success notification appears after successful drag
<!-- 성공적인 드래그 후 성공 알림 표시 -->
- [ ] All tests pass (`npm test -- --run`)
<!-- 모든 테스트 통과 (`npm test -- --run`) -->
- [ ] All lint checks pass (`npm run lint`)
<!-- 모든 린트 검사 통과 (`npm run lint`) -->
- [ ] Integration tests created for drag-and-drop functionality
<!-- 드래그 앤 드롭 기능에 대한 통합 테스트 생성 -->
- [ ] Integration tests created for date click functionality
<!-- 날짜 클릭 기능에 대한 통합 테스트 생성 -->

---

## 6. Questions/Concerns (Optional)
<!-- 질문/우려사항 (선택사항) -->

**Unclear points:**
<!-- 불명확한 점: -->
- Should dragging also change time, or only date? (Assume both date and time can change based on drop position)
<!-- 드래그가 시간도 변경해야 하는가, 아니면 날짜만? (드롭 위치를 기반으로 날짜와 시간 모두 변경 가능하다고 가정) -->
- Should time slots be snapped to intervals (e.g., 15min, 30min)? (Assume flexible positioning for MVP)
<!-- 시간 슬롯을 간격(예: 15분, 30분)에 맞춰야 하는가? (MVP를 위해 유연한 위치 지정 가정) -->

**Potential issues:**
<!-- 잠재적 문제: -->
- Touch device support may require additional implementation
<!-- 터치 기기 지원은 추가 구현이 필요할 수 있음 -->
- Complex drag interactions with nested elements
<!-- 중첩된 요소와의 복잡한 드래그 상호작용 -->
- Performance with many events on screen
<!-- 화면에 많은 일정이 있을 때의 성능 -->
- Browser compatibility for HTML5 drag API
<!-- HTML5 드래그 API의 브라우저 호환성 -->

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
<!-- 최종 결정: -->
- [ ] ✅ Approved - Proceed with implementation
<!-- ✅ 승인 - 구현 진행 -->
- [ ] 🔄 Revise - Need changes (specify below)
<!-- 🔄 수정 - 변경 필요 (아래에 명시) -->
- [ ] ❌ Rejected - Do not implement
<!-- ❌ 거부 - 구현하지 않음 -->

**Revision Notes** (if applicable):
<!-- 수정 사항 (해당되는 경우): -->
```
[수정 필요 사항]
<!-- [수정 필요 사항] -->
```

