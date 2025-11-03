# King Home - 건물주집 (Building Owner's Home)

**name:** 건물주집
<!-- 건물주집 -->

**description:** Commands and workflow management center for the King agent.
<!-- 킹 에이전트의 명령 및 워크플로 관리 센터 -->

## Trigger Commands
<!-- 트리거 명령 -->
These keywords trigger specific workflows when issued by the user.
<!-- 이러한 키워드는 사용자가 발행할 때 특정 워크플로를 트리거합니다. -->

### 학습해 [topic]
<!-- 학습해 [topic] -->
**Trigger:** "학습해 [주제]"
<!-- 트리거: "학습해 [주제]" -->
**Workflow:**
1. King receives learning command for specified topic
<!-- 1. 건물주가 지정된 주제에 대한 학습 명령을 받습니다 -->
2. King delegates to Planner: "Create learning workflow for [topic]"
<!-- 2. 건물주가 계획자에게 위임: "[주제]에 대한 학습 워크플로 작성" -->
3. Planner checks Memory for existing knowledge, creates plan, returns to King
<!-- 3. 계획자가 세월이에게서 기존 지식을 확인하고, 계획을 작성하여 건물주에게 반환 -->
4. King delegates to Worker: "Implement learning based on plan"
<!-- 4. 건물주가 노동자에게 위임: "계획에 기반으로 학습 구현" -->
5. Worker checks Memory for patterns, implements, returns to King
<!-- 5. 노동자가 세월이에게서 패턴을 확인하고, 구현하여 건물주에게 반환 -->
6. King delegates to Manager: "Review the implementation"
<!-- 6. 건물주가 관리자에게 위임: "구현 검토" -->
7. Manager checks Memory for quality patterns, reviews, returns feedback
<!-- 7. 관리자가 세월이에게서 품질 패턴을 확인하고, 검토하며 피드백 반환 -->
8. King delegates to Memory: "Store [topic] learning: [result]"
<!-- 8. 건물주가 세월이에게 위임: "[주제] 학습 저장: [결과]" -->
9. Memory stores successful patterns and failures for future reference
<!-- 9. 세월이가 이후 참조를 위해 성공 패턴과 실패를 저장 -->

**Storage:** Each step stores in respective agent home files
<!-- 저장: 각 단계가 해당 에이전트 홈 파일에 저장 -->

### 구현해 [feature]
<!-- 구현해 [feature] -->
**Trigger:** "구현해 [기능]"
<!-- 트리거: "구현해 [기능]" -->
**Workflow:** TDD-based implementation workflow for new features
<!-- 워크플로: 새 기능을 위한 TDD 기반 구현 워크플로 -->
*(Similar structure to 학습해 but focused on implementation)*
<!-- *(학습해와 유사한 구조이지만 구현에 초점)* -->

### 리뷰해 [code/test]
<!-- 리뷰해 [code/test] -->
**Trigger:** "리뷰해 [코드/테스트]"
<!-- 트리거: "리뷰해 [코드/테스트]" -->
**Workflow:** Code/test review and quality assurance
<!-- 워크플로: 코드/테스트 검토 및 품질 보증 -->
*(Similar structure to 학습해 but focused on review)*
<!-- *(학습해와 유사한 구조이지만 검토에 초점)* -->

### 작성해 [description]
<!-- 작성해 [description] -->
**Trigger:** "작성해 [테스트 디스크립션]"
<!-- 트리거: "작성해 [테스트 디스크립션]" -->
**Workflow:**
1. King receives test creation command with description
<!-- 1. 건물주가 디스크립션이 포함된 테스트 생성 명령을 받습니다 -->
2. King checks Memory (planerHome.md) for test description patterns learned
<!-- 2. 건물주가 세월이(planerHome.md)에서 학습된 테스트 디스크립션 패턴을 확인 -->
3. King validates description style against learned patterns
<!-- 3. 건물주가 학습된 패턴에 대해 디스크립션 스타일 검증 -->
4. King checks existing test files in `src/.cursor/agents/test/` and auto-increments file number (test_01.spec.ts → test_02.spec.ts → test_03.spec.ts, etc.)
<!-- 4. 건물주가 `src/.cursor/agents/test/`의 기존 테스트 파일을 확인하고 파일 번호를 자동 증가 (test_01.spec.ts → test_02.spec.ts → test_03.spec.ts 등) -->
5. King imports necessary functions/hooks from utils/apis/hooks based on description
<!-- 5. 건물주가 디스크립션에 기반하여 utils/apis/hooks에서 필요한 함수/훅을 import -->
6. King writes test following learned patterns (Arrange-Act-Assert, description format)
<!-- 6. 건물주가 학습된 패턴(Arrange-Act-Assert, 디스크립션 형식)을 따라 테스트 작성 -->
7. King stores implementation in memoryHome.md for future reference
<!-- 7. 건물주가 이후 참조를 위해 memoryHome.md에 구현 저장 -->

**File Naming:** Auto-increments based on existing files (test_01.spec.ts, test_02.spec.ts, test_03.spec.ts, ...)
<!-- 파일 네이밍: 기존 파일 기반 자동 증가 (test_01.spec.ts, test_02.spec.ts, test_03.spec.ts, ...) -->

### 전체 테스트코드
<!-- 전체 테스트코드 -->
**Trigger:** "전체 테스트코드"
<!-- 트리거: "전체 테스트코드" -->
**Workflow:**
1. King receives test execution command
<!-- 1. 건물주가 테스트 실행 명령을 받습니다 -->
2. King executes: `npm test -- --run`
<!-- 2. 건물주가 실행: `npm test -- --run` -->
3. King collects test results (total tests, passed, failed, duration)
<!-- 3. 건물주가 테스트 결과 수집 (총 테스트, 통과, 실패, 소요시간) -->
4. King reports summary to user
<!-- 4. 건물주가 사용자에게 요약 보고 -->

**Expected Output:**
<!-- 예상 출력: -->
```
✅ All tests passed: [X] tests passed out of [Y] total
Duration: [Z] seconds
또는
❌ Some tests failed: [X] tests passed, [Y] tests failed out of [Z] total
Duration: [W] seconds
```

### 린트 검사
<!-- 린트 검사 -->
**Trigger:** "린트 검사"
<!-- 트리거: "린트 검사" -->
**Workflow:**
1. King receives lint check command
<!-- 1. 건물주가 린트 검사 명령을 받습니다 -->
2. King executes TypeScript check: `npm run lint:tsc`
<!-- 2. 건물주가 TypeScript 검사 실행: `npm run lint:tsc` -->
3. King executes ESLint check: `npm run lint:eslint`
<!-- 3. 건물주가 ESLint 검사 실행: `npm run lint:eslint` -->
4. King reports any errors or warnings
<!-- 4. 건물주가 오류 또는 경고 보고 -->

**Expected Output:** Linting results summary
<!-- 예상 출력: 린팅 결과 요약 -->

### 커밋 전 체크
<!-- 커밋 전 체크 -->
**Trigger:** "커밋 전 체크"
<!-- 트리거: "커밋 전 체크" -->
**Workflow:**
1. King receives pre-commit validation command
<!-- 1. 건물주가 커밋 전 검증 명령을 받습니다 -->
2. King checks CRLF: `git diff --check`
<!-- 2. 건물주가 CRLF 확인: `git diff --check` -->
3. King validates TypeScript: `npm run lint:tsc`
<!-- 3. 건물주가 TypeScript 검증: `npm run lint:tsc` -->
4. King validates ESLint: `npm run lint:eslint`
<!-- 4. 건물주가 ESLint 검증: `npm run lint:eslint` -->
5. King runs all tests: `npm test -- --run`
<!-- 5. 건물주가 모든 테스트 실행: `npm test -- --run` -->
6. King generates checklist report
<!-- 6. 건물주가 체크리스트 보고서 생성 -->

**Expected Output:** Complete pre-commit validation report
<!-- 예상 출력: 완전한 커밋 전 검증 보고서 -->

### 리뷰 학습
<!-- 리뷰 학습 -->
**Trigger:** "리뷰 학습" or automatic after "리뷰해"
<!-- 트리거: "리뷰 학습" 또는 "리뷰해" 후 자동 -->
**Workflow:**
1. King receives review learning command
<!-- 1. 건물주가 리뷰 학습 명령을 받습니다 -->
2. King scans `src/.cursor/agents/review/` folder for new reviews
<!-- 2. 건물주가 `src/.cursor/agents/review/` 폴더에서 새 리뷰 스캔 -->
3. King delegates to Memory: "Process new review files"
<!-- 3. 건물주가 세월이에게 위임: "새 리뷰 파일 처리" -->
4. Memory extracts core information:
<!-- 4. 세월이가 핵심 정보 추출: -->
   - Problem description and symptoms
   <!-- 문제 설명과 증상 -->
   - Root cause analysis
   <!-- 근본 원인 분석 -->
   - Solution approach (correct and rejected)
   <!-- 해결책 접근 (올바른 것과 거부된 것) -->
   - Diagnostic mistakes (if any)
   <!-- 진단 실수 (있는 경우) -->
   - Lessons learned
   <!-- 교훈 -->
5. Memory categorizes by pattern type:
<!-- 5. 세월이가 패턴 유형별로 분류: -->
   - TypeScript/Type Safety Issues
   - UI/UX Bugs
   - Integration/Implementation Gaps
   - Data Flow/State Management
   - Test Strategy/Coverage
   - Diagnostic Process Issues
6. Memory stores in `memoryHome.md` Review Patterns section
<!-- 6. 세월이가 `memoryHome.md` 리뷰 패턴 섹션에 저장 -->
7. Memory updates Diagnostic Checklist
<!-- 7. 세월이가 진단 체크리스트 업데이트 -->
8. King reports learning summary to user
<!-- 8. 건물주가 사용자에게 학습 요약 보고 -->

**Format**: Problem → Root Cause → Solution → Anti-Pattern → Lesson → Applies To
<!-- 형식: 문제 → 근본 원인 → 해결책 → 안티패턴 → 교훈 → 적용 대상 -->

**Expected Output:**
<!-- 예상 출력: -->
```
✅ Review Learning Complete

Processed: [N] new review files
- review/[filename-1].md
- review/[filename-2].md

Extracted Patterns:
- [Pattern 1]: [Category] - [Key Lesson]
- [Pattern 2]: [Category] - [Key Lesson]

Updated:
- memoryHome.md: Added [N] new patterns
- Diagnostic Checklist: Added [M] new items

All agents can now reference these patterns to avoid repeating mistakes.
```

**Agent Benefits:**
<!-- 에이전트 이점: -->
- **Planner**: Check Review Patterns before planning to avoid past mistakes
  <!-- 계획자: 과거 실수를 피하기 위해 계획 전 리뷰 패턴 확인 -->
- **Worker**: Reference successful solutions and avoid anti-patterns
  <!-- 노동자: 성공적인 해결책 참조 및 안티패턴 방지 -->
- **Manager**: Improve diagnostic accuracy by learning from past misdiagnoses
  <!-- 관리자: 과거 오진에서 학습하여 진단 정확도 향상 -->

## Command Management
<!-- 명령 관리 -->
- **Adding New Commands**: Add trigger keyword and workflow steps here
<!-- 새 명령 추가: 트리거 키워드와 워크플로 단계를 여기에 추가 -->
- **Modifying Commands**: Update workflow steps as needed
<!-- 명령 수정: 필요에 따라 워크플로 단계 업데이트 -->
- **Removing Commands**: Delete trigger keyword and workflow section
<!-- 명령 제거: 트리거 키워드와 워크플로 섹션 삭제 -->

## Workflow Tracking
<!-- 워크플로 추적 -->
Each command execution creates entries in:
- `src/.cursor/agents/home/kingHome.md` - King's actions and decisions
- `src/.cursor/agents/home/planerHome.md` - Planner's plans and workflows
- `src/.cursor/agents/home/toolsHome.md` - Worker's implementations
- `src/.cursor/agents/home/feedbackHome.md` - Manager's reviews
- `src/.cursor/agents/home/memoryHome.md` - Memory's storage

<!-- 각 명령 실행은 다음에 항목 생성 -->
<!-- - `src/.cursor/agents/home/kingHome.md` - 건물주의 행동과 결정 -->
<!-- - `src/.cursor/agents/home/planerHome.md` - 계획자의 계획과 워크플로 -->
<!-- - `src/.cursor/agents/home/toolsHome.md` - 노동자의 구현 -->
<!-- - `src/.cursor/agents/home/feedbackHome.md` - 관리자의 검토 -->
<!-- - `src/.cursor/agents/home/memoryHome.md` - 세월이의 저장 -->
