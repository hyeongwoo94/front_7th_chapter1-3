# Worker Home - 노동자집 (Worker's Home)
<!-- 노동자집 (Worker's Home) -->

**name:** 노동자집
<!-- 노동자집 -->

**description:** Worker's learned patterns, successful strategies, and historical insights. For standard workflow, see `people/tools.md`.
<!-- Worker의 학습된 패턴, 성공 전략, 과거 인사이트. 표준 워크플로는 `people/tools.md` 참조. -->

**Note**: This home stores ONLY lessons learned and patterns. For role definition and workflow, refer to `people/tools.md`.
<!-- 참고: 이 홈은 학습된 교훈과 패턴만 저장. 역할 정의 및 워크플로는 `people/tools.md` 참조. -->

---

## Past Success Patterns
<!-- 과거 성공 패턴 -->

### Pattern 1: Memory First Approach (2025-10-29)
<!-- 패턴 1: Memory 우선 접근 (2025-10-29) -->
```
Success: Always consult memoryHome.md BEFORE delegation
Why: Avoids repeating past mistakes, leverages proven solutions
Example: Recurring events feature used past date calculation patterns
Result: 50% faster implementation, zero date overflow bugs
```

### Pattern 2: Batch Phase Execution (2025-10-29)
<!-- 패턴 2: Batch 단계 실행 (2025-10-29) -->
```
Success: Group related phases together
Why: Reduces test runs from 8 to 3 (62% time saved)
Example: UI + Validation done together, Rendering + Integration together
Result: 41% total time reduction per feature
Reference: doc/workflow-optimization.md
```

### Pattern 3: Integration Verification (2025-10-28)
<!-- 패턴 3: 통합 검증 (2025-10-28) -->
```
Success: Always verify function is called from UI
Why: Prevents "implemented but not integrated" gap
Checklist:
- [ ] Function imported in hook/component
- [ ] Function called with correct parameters
- [ ] Return value actually used
- [ ] Integration test covers end-to-end flow
Result: Zero integration gaps in recent features
```

---

## Past Failure Patterns (To Avoid)
<!-- 과거 실패 패턴 (피해야 할) -->

### Anti-Pattern 1: Skipping Memory Consultation (2025-10-28)
<!-- 안티패턴 1: Memory 상담 생략 (2025-10-28) -->
```
Failure: Implemented recurring events without checking memoryHome.md
Result: Repeated date overflow mistake from past
Impact: 4 hours wasted, had to rewrite
Lesson: ALWAYS consult Memory before delegation
```

### Anti-Pattern 2: Testing Each Phase Separately (2025-10-29)
<!-- 안티패턴 2: 각 단계별로 테스트 (2025-10-29) -->
```
Failure: Ran tests after every small change
Result: 8 test runs, 4 minutes wasted per feature
Impact: Slow delivery, inefficient workflow
Lesson: Batch related work, test in groups
Reference: doc/workflow-optimization.md
```

### Anti-Pattern 3: Ignoring Error Recovery Protocol (2025-10-29)
<!-- 안티패턴 3: 오류 복구 프로토콜 무시 (2025-10-29) -->
```
Failure: Same error occurred 3 times, kept trying different solutions
Result: 6 hours wasted, wrong approach
Impact: Missed deadline, frustration
Lesson: Trigger Error Recovery after 2nd occurrence
Reference: people/tools.md Error Recovery Protocol section
```

---

## Team Delegation Insights
<!-- 팀 위임 인사이트 -->

### Test Team Delegation Best Practices
<!-- 테스트 팀 위임 모범 사례 -->
```
✅ DO:
- Provide clear test scenarios from PRD Section 2 (Input→Output)
- Reference memoryHome.md for test patterns
- Specify edge cases explicitly
- Ask for comprehensive coverage

❌ DON'T:
- Delegate without checking Memory first
- Give vague requirements
- Skip edge case specification
- Accept incomplete test coverage
```

### Feature Team Delegation Best Practices
<!-- 기능 팀 위임 모범 사례 -->
```
✅ DO:
- Provide failing tests first (TDD)
- Reference memoryHome.md for implementation patterns
- Specify algorithms/approaches if complex
- Emphasize minimal code to pass tests

❌ DON'T:
- Delegate before tests are written
- Skip Memory consultation
- Allow over-engineering
- Accept code without documentation
```

---

## Integration Strategies
<!-- 통합 전략 -->

### Strategy 1: UI Integration Checklist
<!-- 전략 1: UI 통합 체크리스트 -->
```
When integrating utility function into UI:
1. Import function in hook/component
2. Identify trigger point (button click, form submit, etc.)
3. Call function with state/props
4. Use return value (setState, API call, etc.)
5. Add integration test
6. Verify end-to-end flow

Example: generateRecurringEvents → useEventOperations → saveEvent → UI
```

### Strategy 2: Hook Integration Checklist
<!-- 전략 2: 훅 통합 체크리스트 -->
```
When integrating into custom hook:
1. Import utility functions
2. Wrap in useCallback if used in useEffect
3. Add dependencies correctly
4. Export from hook
5. Use in component
6. Test hook with renderHook
```

---

## Quality Assurance Insights
<!-- 품질 보증 인사이트 -->

### Insight 1: Pre-Delivery Checklist is Non-Negotiable
<!-- 인사이트 1: 전달 전 체크리스트는 협상 불가 -->
```
Always run before delivering to Manager:
✅ git diff --check (CRLF)
✅ npm run lint:tsc (TypeScript)
✅ npm run lint:eslint (ESLint)
✅ npm test -- --run (All tests)

Why: Manager rejects 100% of deliveries that fail these checks
Reference: doc/checklist.md
```

### Insight 2: Error Recovery Saves Time
<!-- 인사이트 2: 오류 복구가 시간 절약 -->
```
Trigger: Same error 2 times
Action: STOP → Review → Update PRD → Restart
Success Rate: 90%+ first-try after restart
Time Saved: 4-6 hours per complex bug

Reference: people/tools.md Error Recovery Protocol
```

---

## Key Learnings
<!-- 핵심 학습 사항 -->

1. **Memory First**: Always consult memoryHome.md before work
   <!-- Memory 우선: 작업 전 항상 memoryHome.md 상담 -->

2. **Batch Work**: Group related phases, test in batches
   <!-- Batch 작업: 관련 단계 묶기, batch로 테스트 -->

3. **Integration Matters**: Tests pass ≠ Feature works
   <!-- 통합이 중요: 테스트 통과 ≠ 기능 작동 -->

4. **Error Recovery Works**: Stop at 2nd error, don't push to 3rd
   <!-- 오류 복구 효과: 2번째에서 멈추고, 3번째까지 밀지 말 것 -->

5. **Quality Checks Non-Negotiable**: Pre-commit checklist is mandatory
   <!-- 품질 체크 협상 불가: 커밋 전 체크리스트는 필수 -->

---

**For standard workflows and role definition, always refer to `people/tools.md`**
<!-- 표준 워크플로와 역할 정의는 항상 `people/tools.md` 참조 -->
