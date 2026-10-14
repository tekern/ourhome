import { CcpTask, InspectionRecord, TaskStatus, BranchPerformance, AtpSpot } from '../types';

const STORAGE_KEY = 's_hygiene_state_v1';

export const INITIAL_TASKS: CcpTask[] = [
  {
    id: 'fridge',
    title: '냉장고 온도 점검',
    subtitle: '조리실 1구역 메인 냉장고 #01',
    scheduledTime: '08:30',
    hour: 8,
    minute: 30,
    standardDesc: '5.0℃ 이하',
    targetMax: 5.0,
    locationName: '조리실 냉장고 1호기 앞',
    qrCodeId: 'QR-FRIDGE-01',
    type: 'temperature',
  },
  {
    id: 'freezer',
    title: '냉동고 온도 점검',
    subtitle: '조리실 2구역 워크인 냉동고 #02',
    scheduledTime: '11:00',
    hour: 11,
    minute: 0,
    standardDesc: '-18.0℃ 이하',
    targetMax: -18.0,
    locationName: '조리실 냉동고 2호기 앞',
    qrCodeId: 'QR-FREEZER-02',
    type: 'temperature',
  },
  {
    id: 'sanitize',
    title: '조리도구 세척·소독',
    subtitle: '야채·조리기구 100ppm 침지 및 헹굼',
    scheduledTime: '14:00',
    hour: 14,
    minute: 0,
    standardDesc: '5분 침지 소독 후 음용수 헹굼',
    locationName: '세척소독 전용 싱크대 #01',
    qrCodeId: 'QR-SINK-03',
    type: 'sanitize',
  },
];

export const INITIAL_ATP_SPOTS: AtpSpot[] = [
  { id: 1, name: '칼·도마 세트', zone: '조리대 A구역', qrCode: 'ATP-QR-01' },
  { id: 2, name: '대형 배식대 트레이', zone: '배식라인 중앙', qrCode: 'ATP-QR-02' },
  { id: 3, name: '믹서기 분쇄날', zone: '전처리실 분쇄기', qrCode: 'ATP-QR-03' },
  { id: 4, name: '조리원 위생 손소독대', zone: '조리실 입구 소독대', qrCode: 'ATP-QR-04' },
];

export interface AppState {
  virtualTimeMinutes: number; // minutes from 00:00, default 8*60+30 = 510 (08:30)
  tasks: CcpTask[];
  records: InspectionRecord[];
  atpCompletedThisWeek: boolean;
  atpLastCompletedDate?: string;
  atpSpots: AtpSpot[];
  activeAlertDismissed: boolean;
}

export function formatMinutesToTime(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getTaskStatus(task: CcpTask, currentMinutes: number): TaskStatus {
  if (task.completedAt) {
    return 'completed';
  }
  const taskMinutes = task.hour * 60 + task.minute;
  if (currentMinutes >= taskMinutes + 30) {
    return 'missed'; // 시간 + 30분이 지나도 안 하면 자동 미체크
  }
  if (currentMinutes >= taskMinutes) {
    return 'current'; // 항목 시간이 되면 지금 강조
  }
  return 'waiting';
}

export function getInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length === 3) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }

  return {
    virtualTimeMinutes: 8 * 60 + 30, // 08:30 시작
    tasks: INITIAL_TASKS,
    records: [],
    atpCompletedThisWeek: false,
    atpSpots: INITIAL_ATP_SPOTS,
    activeAlertDismissed: false,
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function resetState(): AppState {
  const fresh: AppState = {
    virtualTimeMinutes: 8 * 60 + 30,
    tasks: INITIAL_TASKS,
    records: [],
    atpCompletedThisWeek: false,
    atpSpots: INITIAL_ATP_SPOTS,
    activeAlertDismissed: false,
  };
  saveState(fresh);
  return fresh;
}

// 5 Store Branch Dummy Data merged with real current store
export function getBranchData(currentStoreCompletedRate: number, currentStoreMissed: number, currentStoreAnomalies: number): BranchPerformance[] {
  return [
    {
      id: 'store-1',
      name: '강남 본점 (현재 조리실)',
      rate: currentStoreCompletedRate,
      missedCount: currentStoreMissed,
      anomalyCount: currentStoreAnomalies,
      isCurrentStore: true,
    },
    {
      id: 'store-2',
      name: '여의도 금융센터점',
      rate: 100,
      missedCount: 0,
      anomalyCount: 1,
    },
    {
      id: 'store-3',
      name: '판교 테크노점',
      rate: 92,
      missedCount: 0,
      anomalyCount: 0,
    },
    {
      id: 'store-4',
      name: '성수 푸드랩점',
      rate: 75, // 80% 미만 주황
      missedCount: 1,
      anomalyCount: 2,
    },
    {
      id: 'store-5',
      name: '가산 비즈니스점',
      rate: 67, // 80% 미만 주황
      missedCount: 2,
      anomalyCount: 1,
    },
  ];
}
