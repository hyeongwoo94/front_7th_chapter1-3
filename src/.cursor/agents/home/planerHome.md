# Planner Home - 계획자집 (Planner's Home)

**name:** 계획자집
<!-- 계획자집 -->

**description:** Planner's learned patterns, PRD best practices, and historical insights. For standard workflow, see `people/planer.md`.
<!-- Planner의 학습된 패턴, PRD 모범 사례, 과거 인사이트. 표준 워크플로는 `people/planer.md` 참조. -->

**Note**: This home stores ONLY lessons learned and patterns. For role definition and workflow, refer to `people/planer.md`.
<!-- 참고: 이 홈은 학습된 교훈과 패턴만 저장. 역할 정의 및 워크플로는 `people/planer.md` 참조. -->

---

## Learned Patterns
<!-- 학습된 패턴 -->

### Pattern 1: Test Description Writing (2025-10-27)
<!-- 패턴 1: 테스트 설명 작성 (2025-10-27) -->

**Test Description Structure**:
```typescript
// Simple actions
it('[action]한다', () => {})

// Detailed scenarios
it('[condition]일 때 [result]한다', () => {})

// Edge cases
it('~하지 않는 경우 [result]한다', () => {})
```

**Examples**:
- `it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다')`
- `it('알림 시간이 정확히 도래한 이벤트를 반환한다')`
- `it('두 이벤트가 겹치지 않는 경우 false를 반환한다')`

**Choice Rules**:
- Simple checkbox: `it('체크박스 체크유무',() => {})` ✓
- Detailed behavior: `it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {})` ✓

---

### Pattern 2: Error Recovery Process Integration (2025-10-29)
<!-- 패턴 2: 오류 복구 프로세스 통합 (2025-10-29) -->

**Pattern**: When creating PRD, MUST include Error Recovery sections
<!-- 패턴: PRD 생성 시 오류 복구 섹션 필수 포함 -->

**PRD Template v4.0 Key Sections**:
1. Section 3: Prerequisites
2. Section 4: Error Prevention
3. Section 7: Error Recovery Process
4. Section 8: Known Issues & Solutions

**When to Use**:
- Creating new feature PRDs
- Updating PRD after review
- Documenting failed attempts

**Key Benefit**: 90%+ first-try success after PRD update
<!-- 핵심 이점: PRD 업데이트 후 첫 시도 성공률 90%+ -->

**Reference**: `request-prd.md` template

---

### Pattern 3: Data Model Documentation (2025-10-29)
<!-- 패턴 3: 데이터 모델 문서화 (2025-10-29) -->

**Pattern**: Always document data model choice explicitly in PRD
<!-- 패턴: PRD에서 데이터 모델 선택을 항상 명시적으로 문서화 -->

**Two Common Models**:

**Model A: Template Model**
```typescript
// Backend stores one template
{
  id: 1,
  title: "회의",
  repeat: { type: "daily" }
}
// Frontend expands to many instances
```

**Model B: Instance Model**
```typescript
// Backend stores all instances
[
  { id: 1, title: "회의", date: "2025-01-01" },
  { id: 2, title: "회의", date: "2025-01-02" },
  // ... all 365 instances
]
```

**Documentation Rule**: State model choice in PRD Section 3 (Technical Requirements)
<!-- 문서화 규칙: PRD 섹션 3(기술 요구사항)에 모델 선택 명시 -->

---

## PRD Best Practices
<!-- PRD 모범 사례 -->

### Best Practice 1: Section 2 is Source of Truth
<!-- 모범 사례 1: 섹션 2가 단일 진실 공급원 -->
```
Section 2 (Input → Output) is MOST IMPORTANT

Must Include:
✅ Concrete Before/After data examples
✅ Real data, not abstract descriptions
✅ Step-by-step user actions
✅ Expected UI/data changes

Example:
Before: Calendar shows "팀 회의" only on 2025-01-15
Action: User selects "매일 반복" and saves
After: Calendar shows "팀 회의" on every day
```

---

### Best Practice 2: Success Criteria Must Be Measurable
<!-- 모범 사례 2: 성공 기준은 측정 가능해야 함 -->
```
❌ BAD:
- [ ] Feature works well
- [ ] Users are happy

✅ GOOD:
- [ ] All "Must Have" items from Section 4 work
- [ ] Input → Output matches Section 2 specification
- [ ] All tests pass (npm test -- --run)
- [ ] No lint errors (npm run lint)
```

---

### Best Practice 3: Edge Cases Before Implementation
<!-- 모범 사례 3: 구현 전 엣지 케이스 -->
```
Identify edge cases in PRD Section 4 BEFORE Worker starts:

Common Edge Cases for Recurring Events:
- [ ] 31st day in months with 30 days
- [ ] Feb 29 in non-leap years
- [ ] Infinite loops (no end date)
- [ ] Performance with 1000+ instances
- [ ] Timezone handling

Reference: memoryHome.md for past edge cases
```

---

## Common Mistakes to Avoid
<!-- 피해야 할 일반적인 실수 -->

### Mistake 1: Abstract Input→Output
<!-- 실수 1: 추상적 Input→Output -->
```
❌ BAD:
"User creates recurring event, system generates instances"
Why bad: No concrete data, not testable

✅ GOOD:
Before: Calendar empty
Action: 
1. User inputs "팀 회의" on 2025-01-15
2. Selects "매주 반복"
3. Clicks "저장"
After: Calendar shows "팀 회의" on every Wednesday
```

---

### Mistake 2: Missing Prerequisites
<!-- 실수 2: 전제조건 누락 -->
```
❌ BAD:
Dive into implementation without checking prerequisites

✅ GOOD:
Section 3: Prerequisites
- [ ] Understand backend data model (Template vs Instance)
- [ ] Check server.js API endpoints
- [ ] Review past date calculation patterns
- [ ] Identify required utility functions
```

---

### Mistake 3: Vague Success Criteria
<!-- 실수 3: 모호한 성공 기준 -->
```
❌ BAD:
- [ ] Feature is complete
- [ ] No bugs

✅ GOOD:
- [ ] generateRecurringEvents() function exists and passes 16 unit tests
- [ ] UI shows recurring icon for repeated events
- [ ] Integration test covers create→display→edit flow
- [ ] Performance < 100ms for 365 instances
```

---

## Key Learnings
<!-- 핵심 학습 사항 -->

1. **Section 2 is King**: Input→Output defines everything
   <!-- 섹션 2가 왕: Input→Output이 모든 것을 정의 -->

2. **Concrete > Abstract**: Real data examples beat descriptions
   <!-- 구체적 > 추상적: 실제 데이터 예시가 설명보다 낫다 -->

3. **Edge Cases Early**: Identify in PRD, not during debugging
   <!-- 엣지 케이스 조기: 디버깅 중이 아니라 PRD에서 식별 -->

4. **Prerequisites Mandatory**: Check data model, APIs, patterns first
   <!-- 전제조건 필수: 데이터 모델, API, 패턴을 먼저 확인 -->

5. **Measurable Success**: "Done" must be testable and verifiable
   <!-- 측정 가능한 성공: "완료"는 테스트 및 검증 가능해야 함 -->

---

**For standard workflows and role definition, always refer to `people/planer.md`**
<!-- 표준 워크플로와 역할 정의는 항상 `people/planer.md` 참조 -->

**For PRD template structure, refer to `request-prd.md`**
<!-- PRD 템플릿 구조는 `request-prd.md` 참조 -->
