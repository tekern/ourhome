export interface QrSpotInfo {
  code: string; // e.g. "FRIDGE-01"
  rawPayload: string; // e.g. "SHYG:FRIDGE-01"
  name: string; // e.g. "냉장고"
  detail: string; // e.g. "1구역 메인 냉장고"
  category: 'CCP' | 'ATP';
}

export const QR_PREFIX = 'SHYG:';

export const OFFICIAL_QR_SPOTS: QrSpotInfo[] = [
  {
    code: 'FRIDGE-01',
    rawPayload: 'SHYG:FRIDGE-01',
    name: '냉장고',
    detail: '08:30 냉장고 온도 점검 (1구역 메인 냉장고)',
    category: 'CCP',
  },
  {
    code: 'FREEZER-01',
    rawPayload: 'SHYG:FREEZER-01',
    name: '냉동고',
    detail: '11:00 냉동고 온도 점검 (2구역 워크인 냉동고)',
    category: 'CCP',
  },
  {
    code: 'SANITIZE-01',
    rawPayload: 'SHYG:SANITIZE-01',
    name: '세척·소독',
    detail: '14:00 조리도구 소독하기 (세척 싱크대 앞)',
    category: 'CCP',
  },
  {
    code: 'ATP-01',
    rawPayload: 'SHYG:ATP-01',
    name: '칼·도마 세트',
    detail: '1번 고정 지점 (조리대 A구역)',
    category: 'ATP',
  },
  {
    code: 'ATP-02',
    rawPayload: 'SHYG:ATP-02',
    name: '대형 배식대 트레이',
    detail: '2번 고정 지점 (배식라인 중앙)',
    category: 'ATP',
  },
  {
    code: 'ATP-03',
    rawPayload: 'SHYG:ATP-03',
    name: '믹서기 분쇄날',
    detail: '3번 고정 지점 (전처리실 분쇄기)',
    category: 'ATP',
  },
  {
    code: 'ATP-04',
    rawPayload: 'SHYG:ATP-04',
    name: '조리원 위생 손소독대',
    detail: '4번 고정 지점 (조리실 입구 소독대)',
    category: 'ATP',
  },
];

export function getSpotNameByCode(code: string): string {
  const match = OFFICIAL_QR_SPOTS.find((s) => s.code === code);
  return match ? match.name : code;
}

export function parseShygQr(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith(QR_PREFIX)) {
    return trimmed.slice(QR_PREFIX.length).trim();
  }
  return null;
}
