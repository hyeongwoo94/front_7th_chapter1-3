# Test Guidelines
<!-- 테스트 가이드라인 -->

## Test File Structure and Naming Conventions
<!-- 테스트 파일 구조 및 명명 규칙 -->

### File Extension Rules
<!-- 파일 확장자 규칙 -->

1. **Unit Tests (Pure Functions/Utils)**: Use `.spec.ts`
<!-- **단위 테스트 (순수 함수/유틸)**: `.spec.ts` 사용 -->
   - Location: `src/__tests__/unit/`
   <!-- 위치: `src/__tests__/unit/` -->
   - For testing pure functions, utilities, and logic without JSX
   <!-- JSX 없는 순수 함수, 유틸리티, 로직 테스트용 -->
   - Examples: `dateUtils.spec.ts`, `eventUtils.spec.ts`, `timeValidation.spec.ts`
   <!-- 예시: `dateUtils.spec.ts`, `eventUtils.spec.ts`, `timeValidation.spec.ts` -->

2. **Hook Tests**: Use `.spec.ts`
<!-- **훅 테스트**: `.spec.ts` 사용 -->
   - Location: `src/__tests__/hooks/`
   <!-- 위치: `src/__tests__/hooks/` -->
   - For testing React hooks using `renderHook`
   <!-- `renderHook`을 사용한 React 훅 테스트용 -->
   - Examples: `useSearch.spec.ts`, `useCalendarView.spec.ts`
   <!-- 예시: `useSearch.spec.ts`, `useCalendarView.spec.ts` -->

3. **Component Tests**: Use `.spec.tsx`
<!-- **컴포넌트 테스트**: `.spec.tsx` 사용 -->
   - Location: `src/__tests__/components/`
   <!-- 위치: `src/__tests__/components/` -->
   - For testing React components with JSX rendering
   <!-- JSX 렌더링이 필요한 React 컴포넌트 테스트용 -->
   - Examples: `Modal.spec.tsx`
   <!-- 예시: `Modal.spec.tsx` -->

4. **Integration Tests**: Use `.spec.tsx`
<!-- **통합 테스트**: `.spec.tsx` 사용 -->
   - Location: `src/__tests__/`
   <!-- 위치: `src/__tests__/` -->
   - For testing full application flows with JSX
   <!-- JSX를 사용한 전체 애플리케이션 흐름 테스트용 -->
   - Examples: `integration.spec.tsx`
   <!-- 예시: `integration.spec.tsx` -->

### Test Description Rules
<!-- 테스트 설명 규칙 -->

1. **Use Korean for all test descriptions**
<!-- **모든 테스트 설명은 한글로 작성** -->
   - `describe()`: Korean
   <!-- `describe()`: 한글 -->
   - `it()`: Korean
   <!-- `it()`: 한글 -->

2. **Pattern**: `describe('ComponentName >', () => { ... })`
<!-- **패턴**: `describe('컴포넌트명 >', () => { ... })` -->
   - Use `>` after the component/function name
   <!-- 컴포넌트/함수명 뒤에 `>` 사용 -->

3. **No Arrange/Act/Assert comments**
<!-- **Arrange/Act/Assert 주석 사용 안 함** -->
   - Keep test code clean without inline comments
   <!-- 인라인 주석 없이 테스트 코드를 깔끔하게 유지 -->

### Example: Correct Component Test
<!-- 예시: 올바른 컴포넌트 테스트 -->

```typescript
// File: src/__tests__/components/Modal.spec.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../../components/Modal';

describe('Modal >', () => {
  it('모달이 열려있을 때 "이것은 모달입니다." 텍스트가 렌더링된다', () => {
    const handleClose = vi.fn();

    render(<Modal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('이것은 모달입니다.')).toBeInTheDocument();
  });

  it('확인 버튼을 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<Modal isOpen={true} onClose={handleClose} />);
    const confirmButton = screen.getByRole('button', { name: /확인/i });
    await user.click(confirmButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

### Example: Correct Unit Test
<!-- 예시: 올바른 단위 테스트 -->

```typescript
// File: src/__tests__/unit/timeValidation.spec.ts
import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('14:00', '13:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });
});
```

## Vitest Configuration and IDE Plugin Issues
<!-- Vitest 설정 및 IDE 플러그인 이슈 -->

### Problem: Vitest Plugin Not Working in Components Folder
<!-- 문제: components 폴더에서 Vitest 플러그인이 작동하지 않음 -->

**Symptom**: IDE's vitest plugin doesn't recognize `.spec.tsx` files in `components/` folder
<!-- 증상: IDE의 vitest 플러그인이 `components/` 폴더의 `.spec.tsx` 파일을 인식하지 못함 -->

**Root Cause**: Missing explicit test file pattern in `vite.config.ts`
<!-- 근본 원인: `vite.config.ts`에 명시적인 테스트 파일 패턴 누락 -->

**Solution**: Add explicit `include` pattern in `vite.config.ts`
<!-- 해결 방법: `vite.config.ts`에 명시적인 `include` 패턴 추가 -->

```typescript
// vite.config.ts
defineTestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // ⭐ Add this
    coverage: {
      reportsDirectory: './.coverage',
      reporter: ['lcov', 'json', 'json-summary'],
    },
  },
})
```

**Why This Works**:
<!-- 작동 원리: -->
- Explicitly tells vitest (and IDE plugins) which files to recognize as tests
<!-- vitest와 IDE 플러그인에 어떤 파일을 테스트로 인식할지 명시적으로 알려줌 -->
- Covers all test file patterns: `.test.*` and `.spec.*` with all extensions
<!-- 모든 테스트 파일 패턴 포함: `.test.*`와 `.spec.*` 모든 확장자 -->
- Ensures consistent behavior across terminal and IDE
<!-- 터미널과 IDE에서 일관된 동작 보장 -->

**Additional Troubleshooting**:
<!-- 추가 문제 해결: -->
1. Restart IDE after configuration change
<!-- 설정 변경 후 IDE 재시작 -->
2. Clear IDE cache if problem persists
<!-- 문제가 지속되면 IDE 캐시 삭제 -->
3. Ensure vitest extension is installed and enabled
<!-- vitest 확장이 설치되고 활성화되어 있는지 확인 -->

## Key Takeaways
<!-- 핵심 요약 -->

- ✅ **Unit tests (utils/functions)** → `.spec.ts` in `unit/` folder
<!-- ✅ **단위 테스트 (유틸/함수)** → `unit/` 폴더에 `.spec.ts` -->
- ✅ **Component tests (JSX needed)** → `.spec.tsx` in `components/` folder
<!-- ✅ **컴포넌트 테스트 (JSX 필요)** → `components/` 폴더에 `.spec.tsx` -->
- ✅ **All descriptions in Korean**
<!-- ✅ **모든 설명은 한글로** -->
- ✅ **No Arrange/Act/Assert comments**
<!-- ✅ **Arrange/Act/Assert 주석 없음** -->
- ✅ **Use `describe('Name >', () => {})` pattern**
<!-- ✅ **`describe('이름 >', () => {})` 패턴 사용** -->
- ✅ **Add explicit test include pattern in vite.config.ts**
<!-- ✅ **vite.config.ts에 명시적인 테스트 include 패턴 추가** -->

