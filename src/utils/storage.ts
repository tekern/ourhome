import { CcpTask, InspectionRecord, TaskStatus, BranchPerformance, AtpSpot } from '../types';

const STORAGE_KEY = 's_hygiene_state_clean_v1';

export const INITIAL_TASKS: CcpTask[] = [
  {
    id: 'fridge',
    title: '냉장고 온도 점검',
    subtitle: '1구역 메인 냉장고',
    scheduledTime: '08:30',
    hour: 8,
    minute: 30,
    standardDesc: '5℃ 이하면 적합',
    targetMax: 5.0,
    locationName: '조리실 냉장고 앞',
    qrCodeId: 'FRIDGE-01',
    type: 'temperature',
  },
  {
    id: 'freezer',
    title: '냉동고 온도 점검',
    subtitle: '2구역 워크인 냉동고',
    scheduledTime: '11:00',
    hour: 11,
    minute: 0,
    standardDesc: '-18℃ 이하면 적합',
    targetMax: -18.0,
    locationName: '조리실 냉동고 앞',
    qrCodeId: 'FREEZER-01',
    type: 'temperature',
  },
  {
    id: 'sanitize',
    title: '조리도구 소독하기',
    subtitle: '채소·조리기구 소독과 헹굼',
    scheduledTime: '14:00',
    hour: 14,
    minute: 0,
    standardDesc: '소독액에 5분 담그고, 흐르는 물로 헹궈요',
    locationName: '세척 싱크대 앞',
    qrCodeId: 'SANITIZE-01',
    type: 'sanitize',
  },
];

export const INITIAL_ATP_SPOTS: AtpSpot[] = [
  { id: 1, name: '칼·도마 세트', zone: '조리대 A구역', qrCode: 'ATP-01' },
  { id: 2, name: '대형 배식대 트레이', zone: '배식라인 중앙', qrCode: 'ATP-02' },
  { id: 3, name: '믹서기 분쇄날', zone: '전처리실 분쇄기', qrCode: 'ATP-03' },
  { id: 4, name: '조리원 위생 손소독대', zone: '조리실 입구 소독대', qrCode: 'ATP-04' },
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
  // Clear legacy caches across all past versions
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('s_hygiene_state_') || key.includes('s_hygiene')) && key !== STORAGE_KEY) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  }

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

  const fresh: AppState = {
    virtualTimeMinutes: 8 * 60 + 30, // 08:30 시작
    tasks: INITIAL_TASKS,
    records: [],
    atpCompletedThisWeek: false,
    atpSpots: INITIAL_ATP_SPOTS,
    activeAlertDismissed: true, // 스크린샷 촬영을 위해 초기 홈 화면이 바로 보이도록 설정
  };
  saveState(fresh);
  return fresh;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function resetState(): AppState {
  // Clear old storage keys
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  const fresh: AppState = {
    virtualTimeMinutes: 8 * 60 + 30,
    tasks: INITIAL_TASKS,
    records: [],
    atpCompletedThisWeek: false,
    atpSpots: INITIAL_ATP_SPOTS,
    activeAlertDismissed: true,
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
