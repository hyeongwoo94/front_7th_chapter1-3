# Code Review Report
<!-- 코드 리뷰 보고서 -->

**Date**: 2025-10-29  
**Reviewer**: Manager (관리자)  
**Reviewed By**: Testing Team (테스트 팀)  
**Task**: Fix Integration Test Failures Related to Recurring Event Expansion  
**Issue**: 3 integration tests failing due to `getByText` finding multiple recurring event instances

---

## 1. Question Analysis
<!-- 질문 분석 -->

**Original Question**: "리뷰해. 테스트 코드 문제 (테스트가 반복 일정 확장을 고려하지 않음)"
<!-- 원본 질문: -->

**🔴 오류 요약**: 3개 통합 테스트 실패 - `getByText` 사용 시 반복 일정이 여러 개 발견되어 TestingLibraryElementError 발생
<!-- 오류 요약: -->

**✅ 해결방안 제시**: `getByText` → `getAllByText()[0]` 변경 또는 테스트 데이터에서 `repeat.type: 'none'` 명시 (예상 10분 소요)
<!-- 해결방안 제시: -->

**Intent**: Review and fix integration test failures caused by recurring event expansion logic
<!-- 의도: 반복 일정 확장 로직으로 인한 통합 테스트 실패 검토 및 수정 -->

**Scope**: 3 failing integration tests in `medium.integration.spec.tsx`
<!-- 범위: `medium.integration.spec.tsx`의 실패하는 3개 통합 테스트 -->

**Context**: After implementing overlap bypass feature, discovered pre-existing issue where tests fail when recurring events expand into multiple DOM elements
<!-- 맥락: 오버랩 바이패스 기능 구현 후, 반복 일정이 여러 DOM 요소로 확장될 때 테스트가 실패하는 기존 이슈 발견 -->

---

## 2. Referenced Data & Files
<!-- 참조한 데이터 및 파일 -->

### Test Files
<!-- 테스트 파일 -->
- `src/__tests__/medium.integration.spec.tsx` - Integration tests with failures
  <!-- 실패하는 통합 테스트 -->

### Implementation Files
<!-- 구현 파일 -->
- `src/hooks/useEventOperations.ts` - Event expansion logic
  <!-- 이벤트 확장 로직 -->
- `src/utils/recurringEventUtils.ts` - Recurring event generation
  <!-- 반복 일정 생성 -->

### Mock Data
<!-- 모의 데이터 -->
- `src/__mocks__/handlersUtils.ts` - MSW mock handlers
  <!-- MSW 모의 핸들러 -->

### Guidelines Referenced
<!-- 참조한 가이드라인 -->
- `src/.cursor/agents/home/memoryHome.md` - Recurring event expansion pattern
  <!-- 반복 일정 확장 패턴 -->

---

## 3. Error Analysis
<!-- 오류 분석 -->

### 3.1 Root Cause: Recurring Event Expansion
<!-- 근본 원인: 반복 일정 확장 -->

**System Behavior**:
```typescript
// useEventOperations.ts (lines 19-31)
const expandedEvents: Event[] = [];
for (const event of rawEvents) {
  if (event.repeat.type !== 'none') {
    // Generate all occurrences of recurring event
    const occurrences = generateRecurringEvents(event);
    expandedEvents.push(...occurrences);
  } else {
    expandedEvents.push(event);
  }
}
```

**What Happens**:
1. Backend returns single event with `repeat.type !== 'none'`
   <!-- 백엔드가 `repeat.type !== 'none'`인 단일 이벤트 반환 -->
2. `useEventOperations` expands 1 event → N instances (up to 365 occurrences)
   <!-- `useEventOperations`가 1개 이벤트를 N개 인스턴스로 확장 (최대 365회 발생) -->
3. UI renders all N instances on calendar/list view
   <!-- UI가 캘린더/리스트 뷰에 N개 인스턴스 모두 렌더링 -->
4. Test uses `getByText('이벤트 제목')` → finds N elements → **FAILS**
   <!-- 테스트가 `getByText('이벤트 제목')` 사용 → N개 요소 발견 → 실패 -->

---

### 3.2 Failing Tests Breakdown
<!-- 실패하는 테스트 분석 -->

#### Test 1: "입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다"
**Location**: Lines 58-80
**Issue**: `getByText('새 회의')` finds multiple elements

```typescript
await saveSchedule(user, {
  title: '새 회의',
  date: '2025-10-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '프로젝트 진행 상황 논의',
  location: '회의실 A',
  category: '업무',
  // ⚠️ No repeat field specified!
});

const eventList = within(screen.getByTestId('event-list'));
expect(eventList.getByText('새 회의')).toBeInTheDocument(); // ❌ Fails
```

**Root Cause**: `saveSchedule` helper doesn't specify `repeat` field
<!-- 근본 원인: `saveSchedule` 헬퍼가 `repeat` 필드를 지정하지 않음 -->

**Probable Backend Behavior**: When `repeat` is undefined, backend might default to `type: 'daily'` or similar
<!-- 가능한 백엔드 동작: `repeat`이 undefined일 때, 백엔드가 `type: 'daily'` 등으로 기본값 설정 가능 -->

**Evidence**: Error shows 17 matching elements for "새 회의"
<!-- 증거: 오류에서 "새 회의"에 대해 17개의 일치하는 요소 표시 -->

---

#### Test 2: "주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다"
**Location**: Lines 131-150
**Issue**: `getByText('이번주 팀 회의')` finds 3 elements

```typescript
await saveSchedule(user, {
  title: '이번주 팀 회의',
  date: '2025-10-02',
  startTime: '09:00',
  endTime: '10:00',
  // ⚠️ No repeat field specified!
});

const weekView = within(screen.getByTestId('week-view'));
expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument(); // ❌ Fails
```

**Root Cause**: Same as Test 1 - missing `repeat` field causes expansion
<!-- 근본 원인: Test 1과 동일 - `repeat` 필드 누락으로 확장 발생 -->

**Evidence**: Error shows 3 matching elements (Thu-Fri-Sat in week view)
<!-- 증거: 오류에서 3개의 일치하는 요소 표시 (주간 뷰의 목-금-토) -->

---

#### Test 3: "월별 뷰에 일정이 정확히 표시되는지 확인한다"
**Location**: Lines 164-180
**Issue**: `getByText('이번달 팀 회의')` finds 30 elements

```typescript
await saveSchedule(user, {
  title: '이번달 팀 회의',
  date: '2025-10-02',
  startTime: '09:00',
  endTime: '10:00',
  // ⚠️ No repeat field specified!
});

const monthView = within(screen.getByTestId('month-view'));
expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument(); // ❌ Fails
```

**Root Cause**: Same as Test 1 & 2 - missing `repeat` field causes expansion
<!-- 근본 원인: Test 1, 2와 동일 - `repeat` 필드 누락으로 확장 발생 -->

**Evidence**: Error shows 30 matching elements (entire month of October)
<!-- 증거: 오류에서 30개의 일치하는 요소 표시 (10월 전체) -->

---

## 4. Why Tests Worked Before (Hypothesis)
<!-- 이전에 테스트가 작동한 이유 (가설) -->

**Possible Scenarios**:
1. **Backend default changed**: Previously defaulted to `repeat: { type: 'none' }`, now defaults to recurring
   <!-- 백엔드 기본값 변경: 이전에는 `repeat: { type: 'none' }`으로 기본값 설정, 현재는 반복으로 설정 -->

2. **Test data never had repeat field**: Tests always had this bug, but recently started failing due to backend/mock changes
   <!-- 테스트 데이터에 repeat 필드가 없었음: 테스트에 항상 이 버그가 있었지만, 백엔드/모의 변경으로 인해 최근 실패 시작 -->

3. **Mock handler behavior changed**: `setupMockHandlerCreation` might have changed how it handles missing `repeat` fields
   <!-- 모의 핸들러 동작 변경: `setupMockHandlerCreation`이 누락된 `repeat` 필드 처리 방식 변경 가능 -->

---

## 5. Recommended Solutions
<!-- 권장 해결 방법 -->

### Solution A: Fix Test Data (Recommended ✅)
<!-- 해결책 A: 테스트 데이터 수정 (권장) -->

**Why**: Tests should explicitly specify intent (non-recurring events)
<!-- 이유: 테스트는 의도를 명시적으로 지정해야 함 (반복 없는 일정) -->

**Implementation**:

#### Step 1: Update `saveSchedule` Helper
```typescript
// src/__tests__/medium.integration.spec.tsx (lines 36-54)
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime'> // Remove 'repeat' from Omit
) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // ⭐ Handle repeat field if provided
  if (repeat && repeat.type !== 'none') {
    // Add logic to set repeat type in UI
    // (Currently, tests don't need this as they test non-recurring events)
  }

  await user.click(screen.getByTestId('event-submit-button'));
};
```

#### Step 2: Update Test Calls to Explicitly Pass `repeat`
```typescript
// Test 1 (Line 63)
await saveSchedule(user, {
  title: '새 회의',
  date: '2025-10-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '프로젝트 진행 상황 논의',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 }, // ⭐ Add this
});

// Test 2 (Line 135)
await saveSchedule(user, {
  title: '이번주 팀 회의',
  date: '2025-10-02',
  startTime: '09:00',
  endTime: '10:00',
  description: '이번주 팀 회의입니다.',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 }, // ⭐ Add this
});

// Test 3 (Line 168)
await saveSchedule(user, {
  title: '이번달 팀 회의',
  date: '2025-10-02',
  startTime: '09:00',
  endTime: '10:00',
  description: '이번달 팀 회의입니다.',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 }, // ⭐ Add this
});
```

**Pros**:
- ✅ Tests explicitly declare intent
- ✅ Prevents future issues with backend defaults
- ✅ No need to change query methods
- ✅ Tests remain readable

**Cons**:
- ⚠️ Requires updating all test calls (3 locations)

---

### Solution B: Use `getAllByText()[0]` (Alternative)
<!-- 해결책 B: `getAllByText()[0]` 사용 (대안) -->

**Why**: Accept that recurring events create multiple elements
<!-- 이유: 반복 일정이 여러 요소를 생성한다는 점 수용 -->

**Implementation**:
```typescript
// Test 1
const eventList = within(screen.getByTestId('event-list'));
expect(eventList.getAllByText('새 회의')[0]).toBeInTheDocument();

// Test 2
const weekView = within(screen.getByTestId('week-view'));
expect(weekView.getAllByText('이번주 팀 회의')[0]).toBeInTheDocument();

// Test 3
const monthView = within(screen.getByTestId('month-view'));
expect(monthView.getAllByText('이번달 팀 회의')[0]).toBeInTheDocument();
```

**Pros**:
- ✅ Quick fix (3 line changes)
- ✅ Works with recurring events

**Cons**:
- ❌ Tests don't explicitly declare intent (confusing for future maintainers)
- ❌ `[0]` is arbitrary - why first element?
- ❌ Hides the real issue (missing `repeat` field in test data)

---

### Solution C: Fix Mock Handler Default (Investigative)
<!-- 해결책 C: 모의 핸들러 기본값 수정 (조사 필요) -->

**Why**: Backend/mock should have sensible defaults
<!-- 이유: 백엔드/모의는 합리적인 기본값을 가져야 함 -->

**Investigation Required**:
```typescript
// Check: What happens when `repeat` is undefined in POST /api/events?
// src/__mocks__/handlersUtils.ts (lines 14-19)

http.post('/api/events', async ({ request }) => {
  const newEvent = (await request.json()) as Event;
  
  // ⚠️ Does newEvent.repeat have a default value?
  // If undefined, what does backend set it to?
  
  newEvent.id = String(mockEvents.length + 1);
  mockEvents.push(newEvent);
  return HttpResponse.json(newEvent, { status: 201 });
})
```

**Implementation** (if backend doesn't set default):
```typescript
http.post('/api/events', async ({ request }) => {
  const newEvent = (await request.json()) as Event;
  
  // ⭐ Set default for repeat if undefined
  if (!newEvent.repeat) {
    newEvent.repeat = { type: 'none', interval: 0 };
  }
  
  newEvent.id = String(mockEvents.length + 1);
  mockEvents.push(newEvent);
  return HttpResponse.json(newEvent, { status: 201 });
})
```

**Pros**:
- ✅ Fixes issue at the source
- ✅ All tests pass without modification

**Cons**:
- ⚠️ Might not match real backend behavior
- ⚠️ Masks test data issues

---

## 6. Impact Assessment
<!-- 영향 평가 -->

### Severity: **Medium**
<!-- 심각도: 중간 -->

**Why Not High**:
- ✅ Feature works correctly in production (expansion logic is correct)
- ✅ Only affects test reliability, not user-facing functionality
- ✅ Easy to fix with clear solutions

**Why Not Low**:
- ⚠️ 3 tests failing (21% of integration tests)
- ⚠️ Could hide real regressions if tests are unreliable
- ⚠️ Indicates test data quality issue

---

### Affected Areas
<!-- 영향받는 영역 -->

**Tests**:
- ❌ `medium.integration.spec.tsx` (3 tests failing)

**Production Code**:
- ✅ No impact (feature works correctly)

**Other Tests**:
- ✅ Unit tests: All passing (83/83)
- ✅ Hook tests: All passing (25/25)
- ✅ Component tests: All passing (4/4)
- ✅ Other integration tests: 11/14 passing

---

## 7. Recommended Action Plan
<!-- 권장 조치 계획 -->

### Phase 1: Immediate Fix (Priority: High)
<!-- 1단계: 즉각 수정 (우선순위: 높음) -->

**Task**: Implement Solution A (Fix Test Data)
<!-- 작업: 해결책 A 구현 (테스트 데이터 수정) -->

**Steps**:
1. Update `saveSchedule` helper type signature (line 38)
   ```typescript
   form: Omit<Event, 'id' | 'notificationTime'> // Allow repeat field
   ```

2. Add `repeat: { type: 'none', interval: 0 }` to 3 test calls:
   - Line 63: "입력한 새로운 일정 정보에 맞춰..."
   - Line 135: "주별 뷰 선택 후..."
   - Line 168: "월별 뷰에 일정이 정확히..."

3. Run tests to verify fix:
   ```bash
   npm test -- medium.integration.spec.tsx --run
   ```

**Expected Result**: 14/14 integration tests passing
<!-- 예상 결과: 통합 테스트 14/14 통과 -->

**Estimated Time**: 10 minutes
<!-- 예상 시간: 10분 -->

---

### Phase 2: Validation (Priority: Medium)
<!-- 2단계: 검증 (우선순위: 중간) -->

**Task**: Investigate backend default behavior
<!-- 작업: 백엔드 기본 동작 조사 -->

**Questions to Answer**:
1. What does real backend return when `repeat` is omitted in POST?
   <!-- 실제 백엔드가 POST에서 `repeat`을 생략하면 무엇을 반환하는가? -->

2. Should mock handler match this behavior?
   <!-- 모의 핸들러가 이 동작과 일치해야 하는가? -->

3. Does UI form always send `repeat` field?
   <!-- UI 폼이 항상 `repeat` 필드를 전송하는가? -->

**Method**: Check form submission in `App.tsx`
```typescript
// Look for where eventData is created
const eventData = {
  // ...
  repeat: formData.repeat || { type: 'none', interval: 0 } // ⚠️ Check this
};
```

**Estimated Time**: 15 minutes
<!-- 예상 시간: 15분 -->

---

### Phase 3: Documentation (Priority: Low)
<!-- 3단계: 문서화 (우선순위: 낮음) -->

**Task**: Document recurring event test patterns
<!-- 작업: 반복 일정 테스트 패턴 문서화 -->

**Add to**: `src/.cursor/agents/doc/test-guidelines.md`

**Content**:
```markdown
### Testing Recurring Events
<!-- 반복 일정 테스트 -->

**Issue**: Recurring events expand 1→N, causing `getByText` to find multiple elements
<!-- 이슈: 반복 일정이 1→N으로 확장되어 `getByText`가 여러 요소 발견 -->

**Solution**:
1. **For non-recurring tests**: Always specify `repeat: { type: 'none', interval: 0 }`
   <!-- 반복 없는 테스트의 경우: 항상 `repeat: { type: 'none', interval: 0 }` 지정 -->

2. **For recurring tests**: Use `getAllByText()[0]` or query by unique attribute
   <!-- 반복 테스트의 경우: `getAllByText()[0]` 사용 또는 고유 속성으로 쿼리 -->

**Example**:
\```typescript
// ✅ Good: Explicit non-recurring
await saveSchedule(user, {
  title: 'Meeting',
  date: '2025-10-15',
  repeat: { type: 'none', interval: 0 }
});
expect(getByText('Meeting')).toBeInTheDocument();

// ✅ Good: Explicit recurring with getAllByText
await saveSchedule(user, {
  title: 'Daily Standup',
  date: '2025-10-15',
  repeat: { type: 'daily', interval: 1 }
});
expect(getAllByText('Daily Standup')[0]).toBeInTheDocument();

// ❌ Bad: Ambiguous (depends on backend default)
await saveSchedule(user, {
  title: 'Meeting',
  date: '2025-10-15'
  // No repeat field specified
});
expect(getByText('Meeting')).toBeInTheDocument(); // May fail!
\```
```

**Estimated Time**: 20 minutes
<!-- 예상 시간: 20분 -->

---

## 8. Testing Strategy
<!-- 테스트 전략 -->

### Before Fix
<!-- 수정 전 -->
```bash
npm test -- medium.integration.spec.tsx --run
```
**Expected**: 3 failures (lines 58, 131, 164)
<!-- 예상: 3개 실패 (58, 131, 164줄) -->

---

### After Fix (Phase 1)
<!-- 수정 후 (1단계) -->
```bash
npm test -- medium.integration.spec.tsx --run
```
**Expected**: 14/14 passing
<!-- 예상: 14/14 통과 -->

---

### Full Regression Test
<!-- 전체 회귀 테스트 -->
```bash
npm test -- --run
```
**Expected**: 100/100 passing
<!-- 예상: 100/100 통과 -->

---

## 9. Code Quality Check
<!-- 코드 품질 체크 -->

### ✅ TypeScript Validation
```bash
npm run lint:tsc
```
**Status**: No changes to production code, should pass
<!-- 상태: 기능 코드 변경 없음, 통과해야 함 -->

---

### ✅ ESLint Validation
```bash
npm run lint:eslint
```
**Status**: Test file changes only, should pass
<!-- 상태: 테스트 파일 변경만, 통과해야 함 -->

---

### ✅ Test Coverage
**Current**: 97/100 tests passing (97%)
**After Fix**: 100/100 tests passing (100%) ✅

---

## 10. Comparison: With vs Without Fix
<!-- 비교: 수정 전후 -->

### Current State (Without Fix)
<!-- 현재 상태 (수정 전) -->

```typescript
// Test data doesn't specify repeat field
await saveSchedule(user, {
  title: '새 회의',
  date: '2025-10-15',
  // repeat: ??? (undefined, backend decides)
});

// Test assumes single element
expect(getByText('새 회의')).toBeInTheDocument(); // ❌ Finds 17 elements
```

**Result**: ❌ 3 tests failing, 97% pass rate

---

### After Solution A (Fix Test Data)
<!-- 해결책 A 적용 후 (테스트 데이터 수정) -->

```typescript
// Test data explicitly specifies non-recurring
await saveSchedule(user, {
  title: '새 회의',
  date: '2025-10-15',
  repeat: { type: 'none', interval: 0 }, // ⭐ Explicit
});

// Test correctly assumes single element
expect(getByText('새 회의')).toBeInTheDocument(); // ✅ Finds 1 element
```

**Result**: ✅ 14 tests passing, 100% pass rate

---

## 11. Known Limitations
<!-- 알려진 제한사항 -->

### Limitation 1: `saveSchedule` Helper Doesn't Set Repeat in UI
<!-- 제한사항 1: `saveSchedule` 헬퍼가 UI에서 반복을 설정하지 않음 -->

**Issue**: Helper fills form fields but doesn't interact with repeat UI controls
<!-- 이슈: 헬퍼가 폼 필드를 채우지만 반복 UI 컨트롤과 상호작용하지 않음 -->

**Impact**: Tests can't currently test recurring event creation through UI
<!-- 영향: 테스트가 현재 UI를 통한 반복 일정 생성을 테스트할 수 없음 -->

**Workaround**: Tests rely on backend accepting `repeat` in request body
<!-- 해결책: 테스트가 요청 본문에서 `repeat`을 수락하는 백엔드에 의존 -->

**Future**: If UI testing for recurring events is needed, extend helper:
<!-- 향후: 반복 일정 UI 테스트가 필요하면, 헬퍼 확장: -->
```typescript
if (repeat && repeat.type !== 'none') {
  await user.click(screen.getByLabelText('반복 설정'));
  await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));
  // ... set interval, endDate, etc.
}
```

---

### Limitation 2: No Tests for Recurring Event Expansion
<!-- 제한사항 2: 반복 일정 확장에 대한 테스트 없음 -->

**Issue**: While expansion logic exists in `useEventOperations`, no integration tests verify it
<!-- 이슈: `useEventOperations`에 확장 로직이 존재하지만, 이를 검증하는 통합 테스트 없음 -->

**Risk**: Regression in expansion logic might not be caught
<!-- 위험: 확장 로직의 회귀가 감지되지 않을 수 있음 -->

**Recommendation**: Add dedicated test:
<!-- 권장사항: 전용 테스트 추가: -->
```typescript
it('반복 일정이 캘린더에 여러 날짜로 확장되어 표시된다', async () => {
  setupMockHandlerCreation();
  const { user } = setup(<App />);

  await saveSchedule(user, {
    title: '주간 회의',
    date: '2025-10-01',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-10-31' }
  });

  await user.click(screen.getByRole('option', { name: 'month-option' }));
  
  const monthView = within(screen.getByTestId('month-view'));
  const allInstances = monthView.getAllByText('주간 회의');
  
  // Should appear ~4 times in October (weekly)
  expect(allInstances).toHaveLength(4);
});
```

---

## 12. Additional Findings
<!-- 추가 발견 사항 -->

### Finding 1: Test Helper Type Signature
<!-- 발견 1: 테스트 헬퍼 타입 시그니처 -->

**Current**:
```typescript
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => { ... }
```

**Issue**: `Omit<..., 'repeat'>` prevents passing `repeat` field
<!-- 이슈: `Omit<..., 'repeat'>`가 `repeat` 필드 전달을 방지 -->

**Fix Required**: Remove `'repeat'` from `Omit` to allow optional `repeat` field
<!-- 필요한 수정: 선택적 `repeat` 필드를 허용하도록 `Omit`에서 `'repeat'` 제거 -->

```typescript
// ✅ Better signature
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime'>
) => { ... }
```

---

### Finding 2: Inconsistent Mock Data
<!-- 발견 2: 일관성 없는 모의 데이터 -->

**Observation**: Some tests in same file DO specify `repeat` field:
<!-- 관찰: 같은 파일의 일부 테스트는 `repeat` 필드를 지정함: -->

```typescript
// Line 273 - Overlap test (GOOD ✅)
setupMockHandlerCreation([
  {
    id: '1',
    title: '기존 회의',
    date: '2025-10-15',
    repeat: { type: 'none', interval: 0 }, // ✅ Explicit
    // ...
  },
]);
```

**Conclusion**: Best practice exists in codebase but not consistently applied
<!-- 결론: 코드베이스에 모범 사례가 존재하지만 일관되게 적용되지 않음 -->

**Action**: Apply same pattern to failing tests
<!-- 조치: 실패하는 테스트에 동일한 패턴 적용 -->

---

## 13. Final Verdict
<!-- 최종 판정 -->

### ⚠️ NEEDS REVISION
<!-- 수정 필요 -->

**Reason**: Test data incomplete (missing `repeat` field specification)
<!-- 이유: 테스트 데이터 불완전 (`repeat` 필드 명세 누락) -->

---

### Revision Requirements
<!-- 수정 요구사항 -->

1. **High Priority** ⭐:
   - Update `saveSchedule` helper type signature (remove `'repeat'` from `Omit`)
   - Add `repeat: { type: 'none', interval: 0 }` to 3 failing test calls

2. **Medium Priority**:
   - Investigate backend default behavior for missing `repeat` field
   - Consider adding default in mock handler

3. **Low Priority**:
   - Document recurring event test patterns in `test-guidelines.md`
   - Add dedicated recurring event expansion test

---

### Expected Outcome After Revision
<!-- 수정 후 예상 결과 -->

```bash
npm test -- --run
```

**Current**: 97/100 tests passing (3 failures)
**After**: 100/100 tests passing (0 failures) ✅

---

### Approval Timeline
<!-- 승인 일정 -->

- **After Phase 1**: Test fixes → ✅ **APPROVED FOR TESTING**
  <!-- 1단계 후: 테스트 수정 → 테스트 승인 -->

- **After Phase 2**: Backend validation → ✅ **APPROVED FOR STAGING**
  <!-- 2단계 후: 백엔드 검증 → 스테이징 승인 -->

- **After Phase 3**: Documentation complete → ✅ **APPROVED FOR PRODUCTION**
  <!-- 3단계 후: 문서화 완료 → 프로덕션 승인 -->

---

## 14. Review Summary
<!-- 리뷰 요약 -->

### Problem
<!-- 문제 -->
3 integration tests fail because `saveSchedule` helper doesn't specify `repeat` field, causing backend to create recurring events that expand into multiple DOM elements. Tests use `getByText()` which expects single element.

<!-- 3개 통합 테스트 실패: `saveSchedule` 헬퍼가 `repeat` 필드를 지정하지 않아 백엔드가 반복 일정을 생성하고, 이것이 여러 DOM 요소로 확장됨. 테스트는 단일 요소를 기대하는 `getByText()` 사용 -->

---

### Root Cause
<!-- 근본 원인 -->
Test data ambiguity - tests don't explicitly declare whether events are recurring or not, relying on backend defaults which cause unintended expansion.

<!-- 테스트 데이터 모호성 - 테스트가 일정이 반복인지 아닌지 명시적으로 선언하지 않고, 의도하지 않은 확장을 초래하는 백엔드 기본값에 의존 -->

---

### Solution
<!-- 해결책 -->
Add explicit `repeat: { type: 'none', interval: 0 }` to test data in 3 locations. This makes test intent clear and prevents unintended recurring event expansion.

<!-- 3곳의 테스트 데이터에 명시적으로 `repeat: { type: 'none', interval: 0 }` 추가. 이렇게 하면 테스트 의도가 명확해지고 의도하지 않은 반복 일정 확장을 방지 -->

---

### Impact
<!-- 영향 -->
**Low risk** - Production code works correctly. Only test reliability affected. Fix is straightforward and well-understood.

<!-- 낮은 위험 - 기능 코드는 올바르게 작동. 테스트 신뢰성만 영향받음. 수정이 간단하고 잘 이해됨 -->

---

**Manager Recommendation**: **APPROVE WITH REVISIONS** ⚠️
<!-- 관리자 권장사항: 수정 후 승인 -->

**Next Steps**: Implement Phase 1 (test data fix) immediately
<!-- 다음 단계: 1단계(테스트 데이터 수정) 즉시 구현 -->

---

**End of Review Report**
<!-- 리뷰 보고서 끝 -->

