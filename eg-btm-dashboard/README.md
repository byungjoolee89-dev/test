# eG Enterprise BTM Dashboard

Tomcat Business Transaction Monitoring을 위한 실시간 대시보드

## 프로젝트 개요

이 프로젝트는 eG Enterprise REST API를 활용하여 Tomcat의 BTM(Business Transaction Monitoring) 데이터를 시각화하는 대시보드입니다. 제니퍼 APM 솔루션의 실시간 액티브 서비스 모니터링 스타일을 참고하여 만들어졌습니다.

## 주요 기능

### 1. 실시간 트랜잭션 시각화
- 스캐터 차트를 통한 트랜잭션 표시
- 응답 시간(Y축) vs 시간(X축)
- 상태별 색상 구분:
  - 🟢 정상 (녹색): 응답시간 < 2초
  - 🟠 느림 (주황색): 응답시간 2-5초
  - 🔴 에러 (빨강색): HTTP 5xx 에러

### 2. 통계 위젯
- **TPS (Transactions Per Second)**: 초당 트랜잭션 수
- **평균 응답시간**: 최근 60초간 평균 응답 시간
- **에러율**: 에러 발생 비율 (%)
- **활성 트랜잭션**: 현재 진행 중인 트랜잭션 수
- **느린 트랜잭션**: 느린 트랜잭션 수

### 3. 더미 데이터 생성기
- 실제 eG Enterprise API 데이터가 없는 환경에서 테스트 가능
- 실시간으로 트랜잭션 데이터 생성
- 90% 정상, 7% 느림, 3% 에러의 비율로 데이터 생성

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **차트 라이브러리**: Recharts
- **Date Utility**: date-fns
- **스타일링**: CSS3 (Flexbox, Grid)

## 설치 및 실행

### 사전 요구사항
- Node.js 14 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 실행

```bash
# 개발 서버 실행
npm start
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
eg-btm-dashboard/
├── src/
│   ├── components/
│   │   ├── ActiveTransactionChart.tsx  # 실시간 트랜잭션 차트
│   │   ├── StatisticsWidget.tsx        # 통계 위젯
│   │   └── Dashboard.tsx               # 메인 대시보드
│   ├── services/
│   │   └── dummyDataGenerator.ts       # 더미 데이터 생성기
│   ├── types/
│   │   └── transaction.ts              # TypeScript 타입 정의
│   ├── App.tsx                         # 메인 앱
│   └── App.css                         # 스타일시트
└── package.json
```

## eG Enterprise REST API 연동

현재는 더미 데이터를 사용하지만, 실제 eG Enterprise REST API와 연동하려면:

1. `src/services/egApiService.ts` 파일 생성
2. eG Enterprise API 엔드포인트 설정
3. 인증 토큰 설정
4. `Dashboard.tsx`에서 `dummyDataGenerator` 대신 `egApiService` 사용

### 예상 API 엔드포인트

```typescript
// 예시
const EG_API_BASE_URL = 'https://your-eg-server/api/v1';
const endpoints = {
  btmTransactions: `${EG_API_BASE_URL}/tomcat/btm/transactions`,
  btmStats: `${EG_API_BASE_URL}/tomcat/btm/stats`
};
```

## 데이터 모델

### Transaction
```typescript
interface Transaction {
  id: string;              // 트랜잭션 ID
  timestamp: number;       // 타임스탬프 (ms)
  service: string;         // 서비스 URL
  url: string;             // 요청 URL
  responseTime: number;    // 응답 시간 (ms)
  status: 'success' | 'slow' | 'error';  // 상태
  httpStatus: number;      // HTTP 상태 코드
  method: string;          // HTTP 메서드
}
```

### TransactionStats
```typescript
interface TransactionStats {
  tps: number;                 // 초당 트랜잭션 수
  avgResponseTime: number;     // 평균 응답 시간
  errorRate: number;           // 에러율 (%)
  activeTransactions: number;  // 활성 트랜잭션 수
  slowTransactions: number;    // 느린 트랜잭션 수
}
```

## 커스터마이징

### 트랜잭션 생성 주기 변경
`src/components/Dashboard.tsx`의 `generateTransaction` 함수에서 interval 조정:

```typescript
// 현재: 500ms ~ 2000ms
const nextInterval = Math.random() * 1500 + 500;

// 더 빠르게: 100ms ~ 500ms
const nextInterval = Math.random() * 400 + 100;
```

### 느림 기준 변경
`src/services/dummyDataGenerator.ts`에서 응답 시간 기준 조정:

```typescript
// 현재: 2000ms 이상이 느림
if (rand < 0.10) {
  status = 'slow';
  responseTime = Math.floor(Math.random() * 3000) + 2000;
}
```

## 스크린샷

대시보드는 다음 요소들을 포함합니다:
- 상단: 헤더 (제목 및 설명)
- 중단: 5개의 통계 위젯 카드
- 하단: 실시간 트랜잭션 스캐터 차트
- 푸터: 정보 표시

## 향후 개선 사항

- [ ] 실제 eG Enterprise REST API 연동
- [ ] 필터링 기능 (서비스별, 상태별)
- [ ] 시간 범위 조정 기능
- [ ] 트랜잭션 상세 정보 모달
- [ ] 알림 기능 (에러율 임계값 초과 시)
- [ ] 데이터 내보내기 (CSV, JSON)
- [ ] 다크 모드 지원

## 라이선스

MIT

## 참고 자료

- [eG Enterprise Documentation](https://docs.eginnovations.com)
- [Jennifer APM](https://jennifersoft.com/ko/product/apm/features/)
- [Recharts Documentation](https://recharts.org/)
