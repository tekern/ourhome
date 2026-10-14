export type TaskStatus = 'completed' | 'current' | 'waiting' | 'missed';

export type InputMethod = 'BLE' | 'DIRECT' | 'PHOTO';

export interface InspectionRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  time: string; // e.g. "08:32"
  method: InputMethod;
  value: string; // e.g. "3.8℃" or "45 RLU" or "소독 완료"
  passed: boolean;
  photoUrl?: string;
  anomaly?: {
    initialValue: string;
    action: '재가열' | '온도 재조정' | '폐기';
    actionPhotoUrl?: string;
    recheckValue: string;
    recheckPassed: boolean;
  };
}

export interface CcpTask {
  id: string; // 'fridge' | 'freezer' | 'sanitize'
  title: string;
  subtitle: string;
  scheduledTime: string; // "08:30", "11:00", "14:00"
  hour: number;
  minute: number;
  standardDesc: string;
  targetMax?: number; // 5 for fridge, -18 for freezer
  locationName: string;
  qrCodeId: string;
  type: 'temperature' | 'sanitize';
  completedAt?: string;
  completedValue?: string;
  completedMethod?: InputMethod;
  hasAnomaly?: boolean;
}

export interface AtpSpot {
  id: number;
  name: string;
  zone: string;
  qrCode: string;
  rluValue?: number;
  passed?: boolean;
}

export interface BranchPerformance {
  id: string;
  name: string;
  rate: number;
  missedCount: number;
  anomalyCount: number;
  isCurrentStore?: boolean;
}

export type ScreenType =
  | 'HOME'
  | 'QR_SCAN'
  | 'TEMP_MEASURE'
  | 'CORRECTIVE_ACTION'
  | 'SANITIZE'
  | 'ATP'
  | 'ADMIN';
