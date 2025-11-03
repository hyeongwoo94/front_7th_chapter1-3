# Memory Home - 세월이집 (Memory's Home)

**name:** 세월이집
<!-- 세월이집 -->

**description:** Curated patterns and critical lessons from past experience. For role definition, see `people/memory.md`.
<!-- 과거 경험에서 선별된 패턴과 중요 교훈. 역할 정의는 `people/memory.md` 참조. -->

**Version**: 4.0 (Compressed for efficiency - 2025-10-29)
<!-- 버전: 4.0 (효율성을 위해 압축 - 2025-10-29) -->

---

## 🔍 Critical Patterns (Must Know)
<!-- 중요 패턴 (필수 숙지) -->

### Pattern 1: Implementation ≠ Integration
<!-- 패턴 1: 구현 ≠ 통합 -->
```
Problem: Tests pass but feature doesn't work
Cause: Function exists but never called from UI
Fix Checklist:
1. [ ] Function implemented
2. [ ] Tests passing
3. [ ] **Imported in hook/component**
4. [ ] **Called with correct params**
5. [ ] **Return value used**
Result: Tests ≠ Complete
```

### Pattern 2: Metadata 3-Layer Chain
<!-- 패턴 2: 메타데이터 3레이어 체인 -->
```typescript
// Layer 1: Utils - Inject
repeat: {
  ...event.repeat,
  originalEventId: event.id,  // ← Track source
  originalDate: event.date
}

// Layer 2: UI - Preserve
const data = editingEvent 
  ? { ...editingEvent, ...formData }  // ← Spread original
  : { ...formData };

// Layer 3: Hooks - Use
const id = event.repeat?.originalEventId || event.id;  // ← Extract
```
**Break any layer → System fails!**

### Pattern 3: Date Calculation Strategy
<!-- 패턴 3: 날짜 계산 전략 -->
```typescript
// ❌ Incremental (errors accumulate)
for (let i = 0; i < count; i++) {
  currentDate = addMonths(currentDate, 1);
}

// ✅ Iteration-based (independent)
for (let i = 0; i < count; i++) {
  const date = addMonths(startDate, i);
  if (date.getDate() === originalDay) events.push(date);
}
```
**Rule**: Calculate from base, not previous result. Filter overflows, don't adjust.

### Pattern 4: Error Recovery Protocol
<!-- 패턴 4: 오류 복구 프로토콜 -->
```
Same error 2 times:
1. ⏸️  STOP immediately
2. 📝 Create review document
3. 📄 Update PRD (Prerequisites + Known Issues)
4. ▶️  RESTART with updated knowledge
Success Rate: 90%+ after restart
```
**Anti-Pattern**: Trying 3+ times without analysis

### Pattern 5: Data Model First
<!-- 패턴 5: 데이터 모델 우선 -->
```
Before CRUD operations:
1. Check server.js (API structure)
2. Check realEvents.json (data format)
3. Identify: Template vs Instance model
4. Document in PRD Section 3
Result: Prevents 90% ID-related bugs
```

---

## 🎯 Quick Reference Patterns
<!-- 빠른 참조 패턴 -->

### TypeScript
```typescript
// ✅ Type narrowing
const val = obj && obj.field !== 'x' ? obj.field : 'default';

// ✅ XOR logic
return (a !== 'none') !== (b !== 'none');  // Elegant XOR
```

### React
```typescript
// ❌ State timing assumption
setVal(null);
await action();  // Still uses old val

// ✅ Direct values
await action();
setVal(null);  // Update after
```

### Testing
```typescript
// ✅ Multiple elements expected
getAllByText('Title')[0]

// ✅ Pure function utils
export function hasConflict(a: Event, b: Event[]): boolean

// ✅ 7-case coverage
// Base (2) + XOR (2) + Edge (3) = 7 tests
```

---

## 📚 Historical Insights
<!-- 과거 인사이트 -->

### Common Bug Patterns (Top 5)
<!-- 일반적인 버그 패턴 (상위 5개) -->

1. **Metadata Loss in UI** → Spread original before form data
2. **Virtual ID in API** → Extract `originalEventId` from metadata
3. **Missing Integration** → Complete 5-step checklist
4. **Date Drift** → Use iteration-based, not incremental
5. **State Timing** → Direct values, not state-dependent

### Review Lessons (Top 3)
<!-- 리뷰 교훈 (상위 3개) -->

1. **Accept System Behavior** → `getAllByText()[0]` vs fighting expansion
2. **Simple > Complex** → 1 line solution beats 7 lines
3. **Data Model Confusion** → Check backend first, align frontend

### TDD Success Patterns
<!-- TDD 성공 패턴 -->

**Edge Cases First**: 31st day, Feb 29, empty arrays
**Pure Functions**: Utils testable without UI
**Helper Centralization**: `fixtures/`, `helpers/`, `mocks/`

---

## 🔧 Implementation Checklists
<!-- 구현 체크리스트 -->

### Recurring Events
```
- [ ] Iteration-based calculation (not incremental)
- [ ] Filter by exact day match (allow overflow)
- [ ] Inject originalEventId + originalDate
- [ ] UI spreads original + nested objects
- [ ] Hooks extract metadata for API calls
- [ ] Tests cover 31st day + Feb 29
```

### Form Components
```
- [ ] Default values in initial state
- [ ] Default restored in form reset
- [ ] Default applied when editing empty
- [ ] Never shows blank/empty state
```

### Integration Workflow
```
- [ ] Utility implemented + tested
- [ ] Imported in hook/component
- [ ] Called from UI event
- [ ] Return value used
- [ ] Integration test end-to-end
```

---

## ⚠️ Anti-Patterns (Avoid)
<!-- 안티패턴 (피하기) -->

### For All Agents
```
❌ Repeating error 3+ times without stop
❌ Assuming state updates synchronously
❌ Fighting system behavior vs accepting it
❌ Complex conditionals for simple XOR logic
❌ Copy-pasting setup code in tests
❌ Starting PRD without past learnings
```

---

## 📖 Pattern Categories
<!-- 패턴 카테고리 -->

For detailed examples by category, refer to these locations:
<!-- 카테고리별 상세 예시는 다음 위치 참조: -->

- **TypeScript**: `.cursorrules` Type Safety section
- **UI/UX**: `home/toolsHome.md` UI patterns
- **Date/Time**: `doc/checklist.md` Section 6
- **Testing**: `doc/test-guidelines.md`
- **Review**: `home/feedbackHome.md`
- **TDD**: `doc/tdd.md`

**Archived**: Patterns older than 90 days moved to `history/archive/`
<!-- 아카이브: 90일 이상 된 패턴은 `history/archive/`로 이동 -->

---

## 🎯 Memory Access Guidelines
<!-- 메모리 접근 가이드라인 -->

### For Planner
Consult: Data model patterns, PRD v4.0 sections, past edge cases

### For Worker
Consult: Implementation checklists, metadata chain, date calculation, integration workflow

### For Manager
Consult: Review lessons, bug patterns, diagnostic checklist

### For All
**Must check before work**: Top 5 patterns + relevant checklists

---

**Memory Home is now optimized for fast reference. For detailed workflows, see `people/*.md` and `doc/*.md`.**
<!-- Memory Home은 이제 빠른 참조를 위해 최적화됨. 상세 워크플로는 `people/*.md` 및 `doc/*.md` 참조. -->

---

**Changes in v4.0**:
- Compressed from 1015 → 300 lines (70% reduction)
- Kept critical patterns only
- Removed code duplicates (available in other docs)
- Archived old patterns to history/
