# Product Requirements Document: Overlap Dialog Bugs Fix
<!-- 제품 요구사항 문서: 겹침 다이얼로그 버그 수정 -->

**Created**: 2025-10-29
**Status**: Ready for Implementation
**Priority**: High

---

## Section 1: Feature Overview
<!-- 섹션 1: 기능 개요 -->

### What (무엇을)
Fix two critical bugs in the overlap detection dialog:
1. "계속 진행" button appears for ALL overlaps, but should only appear for recurring vs normal event conflicts
2. Form is not reset after clicking "계속 진행" and successfully adding the event

### Why (왜)
- **Bug 1**: Misleading UX - users should not be able to bypass normal event overlaps
- **Bug 2**: Poor UX - users must manually clear form after forced submission

### User Story (사용자 스토리)
**As a** calendar user  
**I want** overlap warnings to only allow bypass when recurring and normal events conflict  
**So that** I don't accidentally create overlapping regular events

**As a** calendar user  
**I want** the form to reset after successfully adding an event via "계속 진행"  
**So that** I can immediately add a new event without manual cleanup

---

## Section 2: Input → Output ⭐
<!-- 섹션 2: 입력 → 출력 (가장 중요) -->

### Bug 1: Overlap Dialog Logic

**Current (Incorrect)**:
```typescript
Input: ANY two events overlap
├─ Event A: Normal event (09:00-10:00)
└─ Event B: Normal event (09:30-10:30)

Current Behavior:
└─ Shows dialog with "계속 진행" button ❌
   → User can bypass and create overlap ❌

Input: Recurring + Normal event overlap
├─ Event A: Recurring event (09:00-10:00)
└─ Event B: Normal event (09:30-10:30)

Current Behavior:
└─ Shows dialog with "계속 진행" button ✅
   → User can bypass (correct for this case)
```

**Expected (Correct)**:
```typescript
Case 1: Normal + Normal overlap
Input:
├─ Event A: { repeat: { type: 'none' } }
└─ Event B: { repeat: { type: 'none' } }

Expected Output:
└─ Dialog shows: "일정이 겹칩니다"
   └─ Only "취소" button visible ✅
   └─ NO "계속 진행" button ❌
   └─ User CANNOT bypass

Case 2: Recurring + Normal overlap
Input:
├─ Event A: { repeat: { type: 'daily' } }
└─ Event B: { repeat: { type: 'none' } }

Expected Output:
└─ Dialog shows: "반복 일정과 일반 일정이 겹칩니다"
   └─ "취소" button
   └─ "계속 진행" button ✅
   └─ User CAN bypass

Case 3: Recurring + Recurring overlap
Input:
├─ Event A: { repeat: { type: 'weekly' } }
└─ Event B: { repeat: { type: 'monthly' } }

Expected Output:
└─ Dialog shows: "일정이 겹칩니다"
   └─ Only "취소" button visible ✅
   └─ NO "계속 진행" button ❌
   └─ User CANNOT bypass
```

### Bug 2: Form Reset After "계속 진행"

**Current (Incorrect)**:
```typescript
Input: User clicks "계속 진행" in overlap dialog

Current Flow:
1. Dialog closes
2. saveEvent() called
3. Event added to server ✅
4. Events refetched ✅
5. Form NOT reset ❌

Result:
Form still has:
- title: "Team Meeting" (old value)
- date: "2025-01-15" (old value)
- startTime: "09:00" (old value)
- ... all fields retain old values ❌
```

**Expected (Correct)**:
```typescript
Input: User clicks "계속 진행"

Expected Flow:
1. Dialog closes
2. saveEvent() called
3. Event added to server ✅
4. Events refetched ✅
5. resetForm() called ✅

Result:
Form reset to:
- title: "" (empty)
- date: "" (empty)
- startTime: "" (empty)
- category: "업무" (default)
- isRepeating: false (default)
- ... all fields reset to defaults ✅
```

---

## Section 4: Implementation Checklist
<!-- 섹션 4: 구현 체크리스트 -->

### Must Have (필수)

#### Bug 1: Conditional Dialog Buttons
- [ ] Detect if overlap involves recurring + normal event
  - Check `newEvent.repeat.type` and `overlappingEvent.repeat.type`
  - One must be 'none', other must NOT be 'none'
- [ ] Pass this information to overlap dialog state
  - Add new state: `allowBypass` (boolean)
  - Set to `true` only for recurring + normal conflicts
- [ ] Conditionally render "계속 진행" button
  - Show button only when `allowBypass === true`
  - Always show "취소" button
- [ ] Update dialog message based on conflict type
  - Normal + Normal: "일정이 겹칩니다. 다른 시간을 선택해주세요."
  - Recurring + Normal: "반복 일정과 일반 일정이 겹칩니다. 계속 진행하시겠습니까?"

#### Bug 2: Form Reset After Bypass
- [ ] Call `resetForm()` after successful `saveEvent()` in "계속 진행" handler
- [ ] Ensure reset happens AFTER async `saveEvent()` completes
- [ ] Clear `editingEvent` state (set to `null`)

### Edge Cases (엣지 케이스)
- [ ] Multiple overlaps with mixed types (some recurring, some normal)
  - Solution: Allow bypass if ANY overlapping event forms recurring + normal pair
- [ ] User editing an existing event that creates overlap
  - Solution: Apply same logic - check if editing event is recurring vs overlapping events
- [ ] Overlap dialog already open when form changes
  - Solution: Not applicable - dialog blocks interaction

---

## Section 5: Success Criteria
<!-- 섹션 5: 성공 기준 -->

### Bug 1: Dialog Logic
- [ ] Normal + Normal overlap shows dialog WITHOUT "계속 진행" button
- [ ] Recurring + Normal overlap shows dialog WITH "계속 진행" button
- [ ] Recurring + Recurring overlap shows dialog WITHOUT "계속 진행" button
- [ ] Dialog message accurately describes conflict type
- [ ] "취소" button always visible and functional

### Bug 2: Form Reset
- [ ] After clicking "계속 진행", form resets to defaults
- [ ] All fields cleared (title, date, times, description, location)
- [ ] Category reset to default "업무"
- [ ] Repeat settings reset to defaults (false, 'daily', 1)
- [ ] User can immediately add new event without manual cleanup

### Testing
- [ ] Unit tests for overlap detection logic with different event types
- [ ] Integration tests for overlap dialog behavior
  - Normal + Normal → No bypass
  - Recurring + Normal → Allow bypass
  - Recurring + Recurring → No bypass
- [ ] Form reset test after bypass submission

---

## Section 6: Questions/Concerns
<!-- 섹션 6: 질문/우려사항 -->

### Q1: Should we prevent overlap for Recurring + Recurring?
**Answer**: YES - only allow bypass for Recurring + Normal conflicts

### Q2: What if multiple overlaps exist with mixed types?
**Answer**: Allow bypass if ANY pair is Recurring + Normal

### Q3: Should form reset also happen on normal save (non-overlap)?
**Answer**: ALREADY IMPLEMENTED - only missing for bypass case

---

## Technical Notes
<!-- 기술 노트 -->

### Files to Modify
1. **`src/App.tsx`** (Primary changes)
   - Add `allowBypass` state
   - Modify `addOrUpdateEvent()` to detect conflict type
   - Update overlap dialog rendering (conditional button)
   - Add `resetForm()` call in "계속 진행" handler

### Current Code Locations
- Overlap detection: `App.tsx` line 172-179
- Dialog rendering: `App.tsx` line 656-715
- Reset form logic: `useEventForm.ts` line 43-56
- Event types: `types.ts`

### Helper Function Needed
```typescript
function hasRecurringNormalConflict(
  newEvent: Event | EventForm, 
  overlappingEvents: Event[]
): boolean {
  const newIsRecurring = newEvent.repeat.type !== 'none';
  
  return overlappingEvents.some((event) => {
    const overlapIsRecurring = event.repeat.type !== 'none';
    // XOR: One is recurring, other is not
    return newIsRecurring !== overlapIsRecurring;
  });
}
```

