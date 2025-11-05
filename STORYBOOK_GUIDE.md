# Storybook 사용 가이드

## 1. 스토리북 실행하기

### 개발 모드로 실행
```bash
pnpm run storybook
```

이 명령어를 실행하면:
- 스토리북이 자동으로 빌드됩니다
- 브라우저가 자동으로 열립니다 (또는 수동으로 접속)
- 기본 포트: `http://localhost:6006`

### 포트가 이미 사용 중인 경우
포트 6006이 사용 중이면 다른 포트(6007 등)로 실행됩니다.

## 2. 브라우저에서 확인하기

### 접속 URL
```
http://localhost:6006
```

### 스토리 확인 방법
1. **좌측 사이드바**에서 스토리 선택:
   - `Components/WeekView` - 주간 뷰 컴포넌트
   - `Components/MonthView` - 월간 뷰 컴포넌트
   - `Components/ViewToolbar` - 뷰 툴바 컴포넌트
   - `Visual Regression Tests` - 시각적 회귀 테스트

2. **각 스토리 확인**:
   - `Default`: 기본 상태
   - `Empty`: 빈 상태
   - `WithNotifications`: 알림 표시 상태
   - `WithManyEvents`: 많은 일정 상태 (MonthView)
   - `CalendarViewTypes`: 캘린더 뷰 타입 전환
   - `EventStatusVisualization`: 일정 상태별 시각화
   - `DialogsAndModals`: 다이얼로그 및 모달
   - `FormControlStates`: 폼 컨트롤 상태
   - `TextLengthHandling`: 텍스트 길이 처리

## 3. 스토리북 기능 사용하기

### Controls (컨트롤)
- 우측 하단의 **Controls** 탭 클릭
- Props를 실시간으로 변경하여 컴포넌트 테스트 가능

### Interactions (인터랙션)
- **Interactions** 탭에서 사용자 인터랙션 테스트 가능
- 버튼 클릭, 입력 등 상호작용 확인

### Docs (문서)
- **Docs** 탭에서 자동 생성된 문서 확인
- 컴포넌트 사용법 및 Props 정보 확인

## 4. 스토리북 중지하기

터미널에서 `Ctrl + C`를 눌러 중지합니다.

## 5. 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 다른 포트로 실행
pnpm run storybook -- --port 6007
```

### 스토리북이 열리지 않는 경우
1. 터미널에서 오류 메시지 확인
2. 브라우저에서 `http://localhost:6006` 직접 접속
3. 캐시 문제인 경우 브라우저 새로고침 (Ctrl + F5)

### 스토리가 보이지 않는 경우
1. `.storybook/main.ts` 파일의 `stories` 패턴 확인
2. 스토리 파일이 `src/story/` 또는 `src/**/*.stories.tsx` 경로에 있는지 확인

