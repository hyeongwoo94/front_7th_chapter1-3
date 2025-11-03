# Feature Request: 반복 일정 삭제 시 단일/전체 선택 기능

**Date**: 2025-10-29
**Requester**: User/King
**Status**: ⏳ Pending Implementation
**PRD Template Version**: 4.0 (2025-10-29 - Added Error Recovery Process)

---

## 📌 Success Reference
<!-- 성공 참고 사례 -->

**Similar Feature**: "반복 일정 수정 시 단일/전체 선택 기능"
**File**: `src/.cursor/agents/request/recurring-event-edit-single-or-all.md`
**Status**: ✅ Successfully Implemented (2025-10-29)

**This feature follows the SAME pattern as the edit feature.**
<!-- 이 기능은 수정 기능과 동일한 패턴을 따릅니다. -->

**Key Success Factors**:
1. Reused `EditOptionsDialog` component (only text changed)
2. Followed Error Recovery Process from PRD v4.0
3. Created helper utilities BEFORE implementation
4. Used centralized test fixtures
5. Handled ID management correctly (POST vs DELETE)

---

## 1. Feature Overview
<!-- 기능 개요 -->

**What**: Add dialog to choose between deleting single instance or all instances when removing a recurring event
<!-- 무엇을: 반복 일정 삭제 시 단일 인스턴스 또는 전체 인스턴스 삭제 선택 다이얼로그 추가 -->

**Why**: Currently, deleting a recurring event removes ALL instances. Users need the option to delete just one occurrence without removing the entire series.
<!-- 왜: 현재 반복 일정 삭제 시 모든 인스턴스가 제거됩니다. 사용자는 전체 시리즈를 제거하지 않고 단일 발생만 삭제할 수 있어야 합니다. -->

**User Story**: As a calendar user, I want to choose whether to delete just one instance or all instances of a recurring event, so that I can cancel a single meeting without affecting the rest of the series.
<!-- 사용자 스토리: 캘린더 사용자로서, 반복 일정의 단일 인스턴스 또는 전체 인스턴스를 삭제할지 선택하고 싶습니다, 나머지 시리즈에 영향을 주지 않고 단일 회의를 취소할 수 있도록. -->

---

## 2. Input → Output ⭐
<!-- 입력 → 출력 ⭐ -->

### Input (사용자 행동)
```
User Action:
1. Click "삭제" button (🗑️) on a recurring event
2. Dialog appears: "해당 일정만 삭제하시겠어요?"
3. Choose "예" or "아니오"

Current State (Before):
- Recurring event: "주간 회의" (매주 월요일 10:00-11:00)
- 50 instances in the system
- All instances have repeat icon 🔁
```

### Process (변환 과정)

**Case A: User clicks "예" (Delete Single)**
```
1. Find the specific recurring instance by date
2. Create exception list (if not exists)
3. Add this date to exception list
4. Update recurring event with exception
5. Refetch events (instance no longer appears)
6. Other instances remain with repeat icon
```

**Case B: User clicks "아니오" (Delete All)**
```
1. Use originalEventId to find base recurring event
2. DELETE entire recurring event via API
3. All instances removed from system
4. Refetch events (all instances disappear)
```

### Output (예상 결과)

**After "예" (Delete Single)**:
```
After State:
- Original recurring event: Still exists with 49 instances
- Exception added: 2025-10-08 (this date hidden)
- Week View on 2025-10-08: No "주간 회의" event
- Week View on 2025-10-15: "주간 회의" still visible with repeat icon

Expected Notification/Feedback:
- Success message: "일정이 삭제되었습니다"
- Event list updates immediately (instance removed)
```

**After "아니오" (Delete All)**:
```
After State:
- Original recurring event: Deleted
- All 50 instances: Removed from system
- Event list: No "주간 회의" events at all
- Calendar views: No instances visible

Expected Notification/Feedback:
- Success message: "일정이 삭제되었습니다"
- Event list updates immediately (all instances removed)
```

---

## 3. Technical Requirements
<!-- 기술 요구사항 -->

### Prerequisites (New - Based on Previous Success)
<!-- 사전 요구사항 (신규 - 이전 성공 기반) -->

**These helper utilities ALREADY EXIST from the edit feature implementation:**
<!-- 이러한 헬퍼 유틸리티는 수정 기능 구현에서 이미 존재합니다: -->

✅ **Existing Helper Files**:
```
src/__tests__/fixtures/eventFixtures.ts
  - createNormalEvent()
  - createRecurringEvent()

src/__tests__/helpers/mockHelpers.ts
  - setupRecurringEventMocks()

src/__tests__/helpers/asyncHelpers.ts
  - waitForEventInList()

src/__tests__/helpers/domHelpers.ts
  - hasRepeatIcon()

src/components/EditOptionsDialog.tsx
  - Reusable dialog component
  - Only text props need to change
```

**These files are REUSED for delete feature - No new creation needed!**
<!-- 이 파일들은 삭제 기능에 재사용됩니다 - 새로 만들 필요 없음! -->

### UI Requirements
<!-- UI 요구사항 -->

**Component Reuse**:
- **Reuse** `EditOptionsDialog` component
  - Change title text: "해당 일정만 삭제하시겠어요?"
  - Change buttons remain same: "예", "아니오"
  - Callback props: `onDeleteSingle`, `onDeleteAll` (instead of edit callbacks)

**Dialog Flow**:
```typescript
// App.tsx - Delete button click handler
<IconButton 
  aria-label="Delete event" 
  onClick={() => {
    // For recurring events
    if (event.repeat?.type !== 'none') {
      setDeleteOptionsOpen(true);
      setEventToDelete(event);
    } else {
      // For normal events - direct delete
      deleteEvent(event.id);
    }
  }}
>
  <Delete />
</IconButton>

// Dialog for recurring event deletion
<EditOptionsDialog 
  open={deleteOptionsOpen}
  onClose={() => setDeleteOptionsOpen(false)}
  onEditSingle={handleDeleteSingle}  // Reuse same callback name
  onEditAll={handleDeleteAll}        // Reuse same callback name
  title="해당 일정만 삭제하시겠어요?"
  message="'예'를 선택하면 이 일정만 삭제되고, '아니오'를 선택하면 모든 반복 일정이 삭제됩니다."
/>
```

### Deletion Logic

**Single Instance Deletion** (`handleDeleteSingle`):
```typescript
const handleDeleteSingle = async () => {
  if (!eventToDelete) return;
  
  // Option A: Create exception list (Preferred)
  const originalId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
  const exceptionDate = eventToDelete.date;
  
  // Fetch original event
  const originalEvent = await fetch(`/api/events/${originalId}`);
  const eventData = await originalEvent.json();
  
  // Add exception
  const updatedEvent = {
    ...eventData,
    repeat: {
      ...eventData.repeat,
      exceptions: [...(eventData.repeat.exceptions || []), exceptionDate]
    }
  };
  
  // Update with exception
  await fetch(`/api/events/${originalId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedEvent)
  });
  
  await fetchEvents();
  setDeleteOptionsOpen(false);
  setEventToDelete(null);
};
```

**All Instances Deletion** (`handleDeleteAll`):
```typescript
const handleDeleteAll = async () => {
  if (!eventToDelete) return;
  
  // Use original event ID
  const deleteId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
  
  // Delete entire recurring event
  await deleteEvent(deleteId);
  
  setDeleteOptionsOpen(false);
  setEventToDelete(null);
};
```

### API Considerations

**Single Delete**:
- Method: `PUT /api/events/:id`
- Body: Updated event with `exceptions` array
- Effect: Instance hidden, not deleted

**All Delete**:
- Method: `DELETE /api/events/:id`
- Body: None
- Effect: All instances removed

---

## 4. Implementation Checklist
<!-- 구현 체크리스트 -->

### Phase 0: Prerequisites ✅ (Already Complete!)
<!-- 0단계: 사전 요구사항 ✅ (이미 완료!) -->

**All helper files already exist from edit feature implementation.**
<!-- 모든 헬퍼 파일은 수정 기능 구현에서 이미 존재합니다. -->

- [x] `src/__tests__/fixtures/eventFixtures.ts` - Event test data
- [x] `src/__tests__/helpers/mockHelpers.ts` - MSW setup
- [x] `src/__tests__/helpers/asyncHelpers.ts` - Async test helpers
- [x] `src/__tests__/helpers/domHelpers.ts` - DOM query helpers
- [x] `src/components/EditOptionsDialog.tsx` - Reusable dialog

**Action: SKIP Phase 0 - Go directly to Phase 1!**
<!-- 조치: 0단계 건너뛰기 - 바로 1단계로! -->

### Phase 1: UI Implementation (TDD - RED)
<!-- 1단계: UI 구현 (TDD - RED) -->

**Write Tests First**:
```typescript
// src/__tests__/medium.integration.spec.tsx

describe('반복 일정 삭제 (단일/전체 선택)', () => {
  it('반복 일정 삭제 시 "해당 일정만 삭제하시겠어요?" 다이얼로그가 표시된다', async () => {
    // Given: Recurring event exists
    // When: Click delete button
    // Then: Dialog appears with correct text
  });
  
  it('일반 일정 삭제 시 다이얼로그 없이 바로 삭제된다', async () => {
    // Given: Normal event exists
    // When: Click delete button
    // Then: Event deleted immediately (no dialog)
  });
});
```

**Implement UI**:
```typescript
// src/App.tsx

// Add state for delete options dialog
const [deleteOptionsOpen, setDeleteOptionsOpen] = useState(false);
const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

// Modify delete button click handler
const handleDeleteClick = (event: Event) => {
  if (event.repeat?.type !== 'none') {
    setDeleteOptionsOpen(true);
    setEventToDelete(event);
  } else {
    deleteEvent(event.id);
  }
};

// Add dialog (reuse EditOptionsDialog)
<EditOptionsDialog 
  open={deleteOptionsOpen}
  onClose={() => setDeleteOptionsOpen(false)}
  onEditSingle={handleDeleteSingle}
  onEditAll={handleDeleteAll}
  title="해당 일정만 삭제하시겠어요?"
  message="'예'를 선택하면 이 일정만 삭제되고, '아니오'를 선택하면 모든 반복 일정이 삭제됩니다."
/>
```

**Run Tests**: `npm test -- src/__tests__/medium.integration.spec.tsx`
**Expected**: ❌ Tests fail (RED) - Dialog not yet implemented

### Phase 2: Delete Logic (TDD - GREEN)
<!-- 2단계: 삭제 로직 (TDD - GREEN) -->

**Write Tests**:
```typescript
describe('반복 일정 삭제 - 단일 인스턴스', () => {
  it('"예"를 누르면 해당 일정만 삭제되고 다른 인스턴스는 유지된다', async () => {
    // Given: 3 recurring instances visible
    // When: Delete one, click "예"
    // Then: 2 instances remain
  });
});

describe('반복 일정 삭제 - 전체 인스턴스', () => {
  it('"아니오"를 누르면 모든 반복 일정이 삭제된다', async () => {
    // Given: 3 recurring instances visible
    // When: Delete one, click "아니오"
    // Then: 0 instances remain
  });
});
```

**Implement Logic**:
```typescript
// src/App.tsx

const handleDeleteSingle = async () => {
  if (!eventToDelete) return;
  
  try {
    const originalId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
    
    // Fetch original event
    const response = await fetch(`/api/events/${originalId}`);
    const eventData = await response.json();
    
    // Add exception
    const updatedEvent = {
      ...eventData,
      repeat: {
        ...eventData.repeat,
        exceptions: [...(eventData.repeat.exceptions || []), eventToDelete.date]
      }
    };
    
    // Update
    await fetch(`/api/events/${originalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });
    
    await fetchEvents();
    setDeleteOptionsOpen(false);
    setEventToDelete(null);
  } catch (error) {
    console.error('Error deleting single instance:', error);
  }
};

const handleDeleteAll = async () => {
  if (!eventToDelete) return;
  
  const deleteId = eventToDelete.repeat?.originalEventId || eventToDelete.id;
  await deleteEvent(deleteId);
  
  setDeleteOptionsOpen(false);
  setEventToDelete(null);
};
```

**Run Tests**: `npm test -- src/__tests__/medium.integration.spec.tsx`
**Expected**: ✅ Tests pass (GREEN)

### Phase 3: Backend Support (Exception Handling)
<!-- 3단계: 백엔드 지원 (예외 처리) -->

**Update Types**:
```typescript
// src/types.ts

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
  exceptions?: string[]; // New: Array of excluded dates
  originalEventId?: string;
  originalDate?: string;
}
```

**Update Rendering Logic**:
```typescript
// src/utils/recurringEventUtils.ts

export function generateRecurringEvents(event: Event, maxOccurrences: number = 365): Event[] {
  // ... existing logic ...
  
  const instances: Event[] = [];
  
  for (let i = 0; i < maxOccurrences; i++) {
    const instanceDate = calculateNextDate(startDate, i, interval, type);
    
    // Skip if in exceptions list
    if (event.repeat.exceptions?.includes(instanceDate.toISOString().split('T')[0])) {
      continue;
    }
    
    // ... rest of logic ...
  }
  
  return instances;
}
```

**Run Tests**: `npm test -- src/__tests__/unit/recurringEventUtils.spec.ts`

### Phase 4: Integration Tests
<!-- 4단계: 통합 테스트 -->

**Write Comprehensive Tests**:
```typescript
describe('반복 일정 삭제 - Full Integration', () => {
  it('Week View에서 반복 일정 단일 삭제 후 해당 주에만 사라진다', async () => {
    // Test complete flow in Week View
  });
  
  it('Month View에서 반복 일정 단일 삭제 후 해당 날짜에만 사라진다', async () => {
    // Test complete flow in Month View
  });
  
  it('단일 삭제 후 다른 인스턴스는 여전히 반복 아이콘을 유지한다', async () => {
    // Verify repeat icon still shows
  });
});
```

**Run Tests**: `npm test -- --run`
**Expected**: All tests pass

---

## 5. Success Criteria
<!-- 성공 기준 -->

### Functional Requirements
<!-- 기능 요구사항 -->

- [x] Recurring event delete shows dialog
<!-- 반복 일정 삭제 시 다이얼로그 표시 -->
- [x] Normal event deletes immediately (no dialog)
<!-- 일반 일정은 바로 삭제 (다이얼로그 없음) -->
- [x] "예" deletes only single instance
<!-- "예"를 누르면 단일 인스턴스만 삭제 -->
- [x] "아니오" deletes all instances
<!-- "아니오"를 누르면 모든 인스턴스 삭제 -->
- [x] Other instances maintain repeat icon after single delete
<!-- 단일 삭제 후 다른 인스턴스는 반복 아이콘 유지 -->

### Test Coverage
<!-- 테스트 커버리지 -->

- [x] Unit tests for exception logic (5+ tests)
<!-- 예외 로직 단위 테스트 (5개 이상) -->
- [x] Integration tests for delete flows (4+ tests)
<!-- 삭제 흐름 통합 테스트 (4개 이상) -->
- [x] UI tests for dialog display (2+ tests)
<!-- 다이얼로그 표시 UI 테스트 (2개 이상) -->

### Code Quality
<!-- 코드 품질 -->

- [x] TypeScript: 0 errors
- [x] ESLint: 0 errors
- [x] All tests passing
- [x] Reused existing components and helpers

---

## 6. Error Prevention
<!-- 오류 예방 -->

### Known Pitfalls (from Edit Feature Experience)
<!-- 알려진 함정 (수정 기능 경험에서) -->

**All these pitfalls were SOLVED in the edit feature. Apply the same solutions!**
<!-- 이 모든 함정은 수정 기능에서 해결되었습니다. 동일한 해결책 적용! -->

1. **Test Data Dates**: Ensure mock data uses October 2025 (current test month)
<!-- 테스트 데이터 날짜: 목 데이터가 2025년 10월 사용하는지 확인 (현재 테스트 월) -->

2. **Async State Updates**: Use `waitFor` and `findBy` queries
<!-- 비동기 상태 업데이트: `waitFor`와 `findBy` 쿼리 사용 -->

3. **DOM Query Strategy**: Use `findAllByLabelText('Delete event')` for delete buttons
<!-- DOM 쿼리 전략: 삭제 버튼에 `findAllByLabelText('Delete event')` 사용 -->

4. **Dialog Flow**: Close dialog AFTER async operations complete
<!-- 다이얼로그 흐름: 비동기 작업 완료 후 다이얼로그 닫기 -->

5. **ID Management**: Use `originalEventId` for DELETE operations
<!-- ID 관리: DELETE 작업에 `originalEventId` 사용 -->

### New Considerations for Delete Feature
<!-- 삭제 기능을 위한 새로운 고려사항 -->

1. **Exception Array Management**:
   - Always initialize as empty array if not exists: `exceptions: []`
   - Use spread to add new exception: `[...existing, newDate]`
   - Format dates consistently: `YYYY-MM-DD`

2. **API Response Handling**:
   - After PUT (single delete): Refetch events
   - After DELETE (all delete): Refetch events
   - Handle 404 if original event already deleted

3. **UI State Management**:
   - Clear `eventToDelete` after operation
   - Close dialog only after success
   - Show error message if operation fails

---

## 7. Related Files
<!-- 관련 파일 -->

### Files to Modify
<!-- 수정할 파일 -->

```
src/App.tsx
  - Add delete options state
  - Modify delete button handler
  - Add handleDeleteSingle, handleDeleteAll
  - Render EditOptionsDialog for delete

src/types.ts
  - Add exceptions?: string[] to RepeatInfo

src/utils/recurringEventUtils.ts
  - Filter out exception dates in generateRecurringEvents
```

### Files to Create (Tests Only)
<!-- 생성할 파일 (테스트만) -->

```
src/__tests__/unit/recurringEventUtils.spec.ts
  - Add tests for exception filtering (if not already exists)

src/__tests__/medium.integration.spec.tsx
  - Add delete dialog tests
  - Add single delete tests
  - Add all delete tests
```

### Files to Reuse (No Changes)
<!-- 재사용할 파일 (변경 없음) -->

```
src/components/EditOptionsDialog.tsx (✅ Already exists)
src/__tests__/fixtures/eventFixtures.ts (✅ Already exists)
src/__tests__/helpers/mockHelpers.ts (✅ Already exists)
src/__tests__/helpers/asyncHelpers.ts (✅ Already exists)
src/__tests__/helpers/domHelpers.ts (✅ Already exists)
```

---

## 8. Known Issues & Solutions
<!-- 알려진 이슈 및 해결방안 -->

### Issue 1: Test Data Management
<!-- 이슈 1: 테스트 데이터 관리 -->

**Symptom**: "Unable to find an element with the text: [event title]"
**Root Cause**: Mock data dates don't match current test month
**Solution**: Use `createRecurringEvent()` from fixtures with October 2025 dates

### Issue 2: Async State Updates
<!-- 이슈 2: 비동기 상태 업데이트 -->

**Symptom**: Dialog doesn't close, or events don't update immediately
**Root Cause**: Not waiting for async operations
**Solution**: Use `await fetchEvents()` before closing dialog

### Issue 3: DOM Query Strategy
<!-- 이슈 3: DOM 쿼리 전략 -->

**Symptom**: Cannot find delete button
**Root Cause**: Using wrong query method
**Solution**: Use `screen.findAllByLabelText('Delete event')` with proper await

### Issue 4: Exception Date Format
<!-- 이슈 4: 예외 날짜 형식 -->

**Symptom**: Exception doesn't work (instance still appears)
**Root Cause**: Date format mismatch (YYYY-MM-DD vs ISO string)
**Solution**: Always use `date.split('T')[0]` for consistent YYYY-MM-DD format

### Issue 5: ID Management for Delete
<!-- 이슈 5: 삭제를 위한 ID 관리 -->

**Symptom**: Wrong event deleted (deletes temp ID instead of original)
**Root Cause**: Using virtual ID instead of originalEventId
**Solution**: Always use `event.repeat?.originalEventId || event.id` for DELETE

---

## 9. UX Flow Diagram
<!-- UX 흐름 다이어그램 -->

```
[User clicks Delete button on recurring event]
                ↓
    [Is it a recurring event?]
        ├─ No → [Delete immediately]
        │         ↓
        │    [Show success message]
        │
        └─ Yes → [Show dialog: "해당 일정만 삭제하시겠어요?"]
                      ↓
            [User chooses option]
                ├─ "예" (Single Delete)
                │    ↓
                │  [Fetch original event]
                │    ↓
                │  [Add date to exceptions array]
                │    ↓
                │  [PUT /api/events/:id with updated exceptions]
                │    ↓
                │  [Refetch events]
                │    ↓
                │  [Instance hidden, others remain with 🔁]
                │    ↓
                │  [Show: "일정이 삭제되었습니다"]
                │
                └─ "아니오" (Delete All)
                     ↓
                   [Use originalEventId]
                     ↓
                   [DELETE /api/events/:id]
                     ↓
                   [Refetch events]
                     ↓
                   [All instances removed]
                     ↓
                   [Show: "일정이 삭제되었습니다"]
```

---

## 10. Testing Strategy
<!-- 테스팅 전략 -->

### Unit Tests (src/__tests__/unit/recurringEventUtils.spec.ts)
<!-- 단위 테스트 -->

```typescript
describe('Exception Handling in generateRecurringEvents', () => {
  it('exceptions 배열이 없으면 모든 인스턴스를 생성한다', () => {});
  it('exceptions 배열에 포함된 날짜는 건너뛴다', () => {});
  it('여러 개의 예외 날짜를 처리한다', () => {});
  it('예외 날짜 형식이 YYYY-MM-DD가 아니면 무시한다', () => {});
  it('endDate와 exceptions를 동시에 처리한다', () => {});
});
```

### Integration Tests (src/__tests__/medium.integration.spec.tsx)
<!-- 통합 테스트 -->

```typescript
describe('반복 일정 삭제 통합 테스트', () => {
  it('반복 일정 삭제 시 다이얼로그가 표시된다', () => {});
  it('일반 일정 삭제 시 다이얼로그 없이 바로 삭제된다', () => {});
  it('"예" 선택 시 해당 일정만 삭제되고 다른 인스턴스는 유지된다', () => {});
  it('"아니오" 선택 시 모든 반복 일정이 삭제된다', () => {});
  it('단일 삭제 후 남은 인스턴스는 반복 아이콘을 유지한다', () => {});
  it('Week View에서 단일 삭제가 정상 작동한다', () => {});
  it('Month View에서 단일 삭제가 정상 작동한다', () => {});
});
```

---

## 11. Implementation Timeline
<!-- 구현 일정 -->

### Optimized Workflow (Based on workflow-optimization.md)
<!-- 최적화된 워크플로우 (workflow-optimization.md 기반) -->

**Total Estimated Time: ~20분** (Previous similar feature: 27분)

**Why Faster?**
- Helper files already exist (skip Phase 0)
- Dialog component reusable (no new component)
- Pattern already established from edit feature
- Deletion logic simpler than edit logic

**Breakdown**:
```
Phase 0: Prerequisites - SKIP (0분) ✅ Already exists
Phase 1-2: UI + Logic - 10분 (batch implementation)
Phase 3-4: Backend + Integration - 8분 (batch testing)
Final Validation - 2분 (1회만)

Total: ~20분
```

**Key Time Savers**:
- Reuse `EditOptionsDialog` → Save 5분
- Reuse test helpers → Save 5분  
- Simpler logic than edit → Save 5분
- Apply optimized workflow → Save 2분

---

## 12. Post-Implementation Checklist
<!-- 구현 후 체크리스트 -->

### Before Committing
<!-- 커밋 전 -->

- [ ] `npm run lint:tsc` - 0 errors
- [ ] `npm run lint:eslint` - 0 errors  
- [ ] `npm test -- --run` - All passing
- [ ] Manual test in browser - Feature works

### Documentation
<!-- 문서화 -->

- [ ] Add implementation notes to this file (Section 13)
- [ ] Create history file: `history/1029/1029_[n].md`
- [ ] Update Memory if new patterns discovered

### Code Review Self-Check
<!-- 코드 리뷰 자가 점검 -->

- [ ] Reused components where possible
- [ ] No duplicate code
- [ ] Proper error handling
- [ ] Consistent date formatting
- [ ] ID management correct (originalEventId)

---

## 13. Implementation History
<!-- 구현 히스토리 -->

*This section will be filled after implementation*
<!-- 이 섹션은 구현 후 작성됩니다 -->

---

**Ready for Worker Implementation** ✅
<!-- Worker 구현 준비 완료 ✅ -->

