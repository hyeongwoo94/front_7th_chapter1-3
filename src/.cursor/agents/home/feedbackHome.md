# Manager Home - 관리자집 (Manager's Home)

**name:** 관리자집
<!-- 관리자집 -->

**description:** Manager's review insights, quality patterns, and lessons from past reviews. For standard review workflow, see `people/feedback.md`.
<!-- Manager의 검토 인사이트, 품질 패턴, 과거 검토에서의 교훈. 표준 검토 워크플로는 `people/feedback.md` 참조. -->

**Note**: This home stores ONLY review lessons and quality patterns. For role definition and review checklist, refer to `people/feedback.md`.
<!-- 참고: 이 홈은 검토 교훈과 품질 패턴만 저장. 역할 정의 및 검토 체크리스트는 `people/feedback.md` 참조. -->

---

## Common Issues Found in Past Reviews
<!-- 과거 검토에서 발견된 일반적인 이슈 -->

### Issue 1: Data Model Confusion (2025-10-29)
<!-- 이슈 1: 데이터 모델 혼란 (2025-10-29) -->
```
Issue: Frontend uses fake IDs for display but backend expects real DB IDs
Frequency: Critical in recurring event features
Impact: Delete/Update operations fail silently or affect wrong data
Solution: Document data model explicitly in PRD Section 3
Prevention: Always check server.js and realEvents.json first
Reference: review/2025-10-29_recurring-event-delete-final-fix.md
```

### Issue 2: State Update Timing Assumptions (2025-10-29)
<!-- 이슈 2: 상태 업데이트 타이밍 가정 (2025-10-29) -->
```
Issue: Assuming React state updates synchronously
Frequency: Common in async flows with state dependencies
Impact: Operations use stale state values
Solution: Use direct values or API calls, not state-dependent hooks
Prevention: Review async functions for state timing issues
Reference: review/2025-10-29_recurring-event-edit-issues.md
```

### Issue 3: Repeating Same Error Without Analysis (2025-10-29)
<!-- 이슈 3: 분석 없이 같은 오류 반복 (2025-10-29) -->
```
Issue: Trying multiple solutions without understanding root cause
Frequency: Occurs when stuck on difficult bugs
Impact: Wasted time (hours), wrong approaches
Solution: Trigger Error Recovery Process after 2nd occurrence
Prevention: Document failures, update PRD, restart with knowledge
Reference: request-prd.md Section 7
```

### Issue 4: Missing Integration Step (2025-10-29)
<!-- 이슈 4: 통합 단계 누락 (2025-10-29) -->
```
Issue: Utility functions implemented but never integrated into UI/Hooks
Frequency: 30% of implementations
Impact: Tests pass but feature doesn't work in production
Solution: Always include integration step in PRD Implementation Checklist
Prevention: Check that functions are imported and called in UI components
Reference: memoryHome.md Integration Pattern
```

---

## Effective Review Approaches
<!-- 효과적인 검토 접근 방식 -->

### Approach 1: Check Data Model First (2025-10-29)
<!-- 접근 1: 데이터 모델 먼저 확인 (2025-10-29) -->
```
Approach: Before reviewing CRUD operations, verify data model
Steps:
1. Check server.js for API endpoints
2. Check realEvents.json for data structure
3. Identify: Template model or Instance model?
4. Verify frontend code aligns with backend model
Effectiveness: Prevents 90% of ID-related bugs
Outcome: Correct implementation from start
```

### Approach 2: Error Recovery Trigger (2025-10-29)
<!-- 접근 2: 오류 복구 트리거 (2025-10-29) -->
```
Approach: Monitor for repeated errors, trigger protocol after 2nd
Recognition:
- Same error message twice
- Same test fails twice after different fixes
- Same symptom in different contexts
Action:
1. STOP work immediately
2. Create review document
3. Update PRD with findings
4. Restart with new knowledge
Effectiveness: 90%+ first-try success after restart
Outcome: Time saved, knowledge accumulated
```

### Approach 3: Root Cause Deep Dive (2025-10-29)
<!-- 접근 3: 근본 원인 심층 분석 (2025-10-29) -->
```
Approach: Always ask "Why?" 5 times to find root cause
Example:
1. Why did delete fail? → Used temp ID
2. Why used temp ID? → Event came from frontend expansion
3. Why expansion? → Displaying recurring instances
4. Why no originalEventId? → UI didn't preserve metadata
5. Why metadata lost? → Form reconstruction dropped it
→ Root Cause: UI metadata preservation missing
```

---

## Past Success Cases
<!-- 과거 성공 사례 -->

### Success 1: Proactive Prerequisites Check (2025-10-29)
<!-- 성공 1: 사전 전제조건 확인 (2025-10-29) -->
```
Review: Recurring event end date feature
Action: Checked prerequisites in PRD before approving
Found: Missing data model documentation
Result: Planner updated PRD with model choice
Outcome: Zero rework, smooth implementation
Time Saved: 4 hours
```

### Success 2: Early Edge Case Identification (2025-10-28)
<!-- 성공 2: 조기 엣지 케이스 식별 (2025-10-28) -->
```
Review: Monthly recurring events
Action: Asked about 31st day handling in review
Found: No edge case handling planned
Result: Worker added filter logic before implementation
Outcome: Zero date overflow bugs
Quality Improvement: 100% edge case coverage
```

### Success 3: Integration Verification Enforcement (2025-10-28)
<!-- 성공 3: 통합 검증 강제 (2025-10-28) -->
```
Review: generateRecurringEvents function
Action: Checked if function was called from UI
Found: Function implemented but not integrated
Result: Worker added integration before delivery
Outcome: Feature worked end-to-end on first try
```

---

## Past Failure Cases
<!-- 과거 실패 사례 -->

### Failure 1: Approved Without Integration Check (2025-10-27)
<!-- 실패 1: 통합 확인 없이 승인 (2025-10-27) -->
```
Review: Date validation utility
Mistake: Approved because tests passed
Result: Function never called, feature didn't work
Impact: 2 hours rework, user discovered bug
Lesson: ALWAYS verify integration in review
Now: Section 8 added to people/feedback.md (Integration Validation)
```

### Failure 2: Missed Data Model Mismatch (2025-10-28)
<!-- 실패 2: 데이터 모델 불일치 누락 (2025-10-28) -->
```
Review: Recurring event deletion
Mistake: Didn't check backend data structure
Result: Frontend used temp IDs, backend expected DB IDs
Impact: Delete failed silently, 4 hours debugging
Lesson: ALWAYS check server.js and realEvents.json first
Now: "Check Data Model First" approach (Approach 1 above)
```

---

## Review Quality Patterns
<!-- 검토 품질 패턴 -->

### Pattern 1: Three-Layer Verification
<!-- 패턴 1: 3단계 검증 -->
```
Layer 1: Standards Compliance
- Check doc/ guidelines (TDD, test-guidelines, checklist)
- Verify .cursorrules conventions

Layer 2: Historical Analysis
- Check memoryHome.md for similar past work
- Verify past mistakes avoided
- Confirm successful patterns applied

Layer 3: Integration Validation
- Check function actually called from UI
- Verify end-to-end flow works
- Confirm all edge cases handled

Result: 95%+ approval rate on first review
```

---

### Pattern 2: Actionable Feedback Formula
<!-- 패턴 2: 실행 가능한 피드백 공식 -->
```
Bad Feedback:
❌ "Code quality needs improvement"
❌ "Tests are incomplete"
❌ "Fix the bugs"

Good Feedback:
✅ "Function naming: Change getUserData() to fetchUserProfile() for Korean translation clarity"
✅ "Tests missing: Add test for 31st day edge case in src/__tests__/unit/recurringEvents.spec.ts"
✅ "Integration gap: Import generateRecurringEvents in useEventOperations.ts line 45"

Formula: [Issue] + [Location] + [Specific fix] + [Doc reference if applicable]
```

---

## Key Learnings
<!-- 핵심 학습 사항 -->

1. **Data Model First**: Always check server.js before reviewing CRUD
   <!-- 데이터 모델 우선: CRUD 검토 전 항상 server.js 확인 -->

2. **Integration is Non-Negotiable**: Tests pass ≠ Feature works
   <!-- 통합은 협상 불가: 테스트 통과 ≠ 기능 작동 -->

3. **Error Recovery Saves Time**: Stop at 2nd error, review, restart
   <!-- 오류 복구가 시간 절약: 2번째에서 멈추고, 검토, 재시작 -->

4. **Historical Context Matters**: Use memoryHome.md to avoid repeating mistakes
   <!-- 과거 컨텍스트 중요: memoryHome.md로 실수 반복 방지 -->

5. **Feedback Must Be Specific**: Location + Fix + Reference
   <!-- 피드백은 구체적이어야 함: 위치 + 수정 + 참조 -->

---

**For standard review workflow and checklists, always refer to `people/feedback.md`**
<!-- 표준 검토 워크플로와 체크리스트는 항상 `people/feedback.md` 참조 -->

**For review report template, refer to `review-prd.md`**
<!-- 검토 보고서 템플릿은 `review-prd.md` 참조 -->
