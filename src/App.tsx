/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CcpTask,
  InspectionRecord,
  ScreenType,
  InputMethod,
  AtpSpot,
} from './types';
import {
  getInitialState,
  saveState,
  resetState,
  formatMinutesToTime,
  getTaskStatus,
  AppState,
} from './utils/storage';
import { PhoneFrame } from './components/PhoneFrame';
import { TopHeader } from './components/TopHeader';
import { AlertBanner } from './components/AlertBanner';
import { HomeScreen } from './screens/HomeScreen';
import { QrScanScreen } from './screens/QrScanScreen';
import { TempMeasureScreen } from './screens/TempMeasureScreen';
import { CorrectiveActionScreen } from './screens/CorrectiveActionScreen';
import { SanitizeScreen } from './screens/SanitizeScreen';
import { AtpScreen } from './screens/AtpScreen';
import { AdminScreen } from './screens/AdminScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>(getInitialState);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [selectedTask, setSelectedTask] = useState<CcpTask | null>(null);
  const [failedMeasureInfo, setFailedMeasureInfo] = useState<{
    value: string;
    method: InputMethod;
  } | null>(null);

  // Sync to localStorage whenever appState changes
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  const virtualTimeStr = useMemo(
    () => formatMinutesToTime(appState.virtualTimeMinutes),
    [appState.virtualTimeMinutes]
  );

  // Demo: Advance virtual time by 30 minutes
  const handleAdvanceTime = () => {
    setAppState((prev) => ({
      ...prev,
      virtualTimeMinutes: prev.virtualTimeMinutes + 30,
    }));
  };

  // Find urgent task triggering alert banner (current or missed, uncompleted)
  const urgentTaskInfo = useMemo(() => {
    for (const task of appState.tasks) {
      const status = getTaskStatus(task, appState.virtualTimeMinutes);
      if (status === 'current' || status === 'missed') {
        return { task, status };
      }
    }
    return null;
  }, [appState.tasks, appState.virtualTimeMinutes]);

  // Handle task selection -> Navigate to QR Scan
  const handleSelectTask = (task: CcpTask) => {
    setSelectedTask(task);
    setCurrentScreen('QR_SCAN');
  };

  // QR Scan complete -> Navigate to task-specific inspection
  const handleQrScanComplete = () => {
    if (!selectedTask) return;
    if (selectedTask.type === 'temperature') {
      setCurrentScreen('TEMP_MEASURE');
    } else {
      setCurrentScreen('SANITIZE');
    }
  };

  // Temperature measurement pass -> Mark complete & save record
  const handleTempMeasureComplete = (
    value: string,
    method: InputMethod,
    passed: boolean
  ) => {
    if (!selectedTask) return;

    const newRecord: InspectionRecord = {
      id: `REC-${Date.now()}`,
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      time: virtualTimeStr,
      method,
      value,
      passed,
    };

    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              completedAt: virtualTimeStr,
              completedValue: value,
              completedMethod: method,
            }
          : t
      ),
      records: [newRecord, ...prev.records],
    }));

    setCurrentScreen('HOME');
    setSelectedTask(null);
  };

  // Temperature measurement fail -> Navigate to Corrective Action
  const handleTempMeasureFail = (
    measuredValue: string,
    method: InputMethod
  ) => {
    setFailedMeasureInfo({ value: measuredValue, method });
    setCurrentScreen('CORRECTIVE_ACTION');
  };

  // Corrective action resolved -> Mark complete with anomaly record
  const handleResolveAnomaly = (
    action: '재가열' | '온도 재조정' | '폐기',
    recheckValue: string,
    photoUrl?: string
  ) => {
    if (!selectedTask || !failedMeasureInfo) return;

    const newRecord: InspectionRecord = {
      id: `REC-${Date.now()}`,
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      time: virtualTimeStr,
      method: failedMeasureInfo.method,
      value: recheckValue,
      passed: true,
      photoUrl,
      anomaly: {
        initialValue: failedMeasureInfo.value,
        action,
        actionPhotoUrl: photoUrl,
        recheckValue,
        recheckPassed: true,
      },
    };

    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              completedAt: virtualTimeStr,
              completedValue: recheckValue,
              completedMethod: failedMeasureInfo.method,
              hasAnomaly: true,
            }
          : t
      ),
      records: [newRecord, ...prev.records],
    }));

    setCurrentScreen('HOME');
    setSelectedTask(null);
    setFailedMeasureInfo(null);
  };

  // Sanitize task complete -> Mark complete
  const handleSanitizeComplete = (value: string, photoUrl?: string) => {
    if (!selectedTask) return;

    const newRecord: InspectionRecord = {
      id: `REC-${Date.now()}`,
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      time: virtualTimeStr,
      method: 'PHOTO',
      value,
      passed: true,
      photoUrl,
    };

    setAppState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === selectedTask.id
          ? {
              ...t,
              completedAt: virtualTimeStr,
              completedValue: value,
              completedMethod: 'PHOTO',
            }
          : t
      ),
      records: [newRecord, ...prev.records],
    }));

    setCurrentScreen('HOME');
    setSelectedTask(null);
  };

  // ATP Cleanliness completion
  const handleCompleteAtp = (updatedSpots: AtpSpot[]) => {
    const newRecord: InspectionRecord = {
      id: `REC-${Date.now()}`,
      taskId: 'atp-weekly',
      taskTitle: 'ATP 청결도 주간 검증 (4개소)',
      time: virtualTimeStr,
      method: 'BLE',
      value: '4개 지점 전원 적합',
      passed: true,
    };

    setAppState((prev) => ({
      ...prev,
      atpSpots: updatedSpots,
      atpCompletedThisWeek: true,
      records: [newRecord, ...prev.records],
    }));

    setCurrentScreen('HOME');
  };

  // Reset all state for easy demo replay
  const handleResetData = () => {
    const fresh = resetState();
    setAppState(fresh);
    setCurrentScreen('HOME');
    setSelectedTask(null);
    setFailedMeasureInfo(null);
  };

  return (
    <PhoneFrame>
      {/* Top Header with iOS Status Bar & Mode Switch */}
      <TopHeader
        currentScreen={currentScreen}
        virtualTime={virtualTimeStr}
        urgentCount={urgentTaskInfo ? 1 : 0}
        onAdvanceTime={handleAdvanceTime}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onBack={
          currentScreen !== 'HOME' && currentScreen !== 'ADMIN'
            ? () => setCurrentScreen('HOME')
            : undefined
        }
      />

      {/* Prominent Vibration Alert Banner (on Home screen when task is urgent) */}
      {currentScreen === 'HOME' && urgentTaskInfo && (
        <AlertBanner
          urgentTask={urgentTaskInfo}
          onAction={(task) => handleSelectTask(task)}
        />
      )}

      {/* Screen Router */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {currentScreen === 'HOME' && (
          <HomeScreen
            tasks={appState.tasks}
            virtualTimeMinutes={appState.virtualTimeMinutes}
            atpCompletedThisWeek={appState.atpCompletedThisWeek}
            onSelectTask={handleSelectTask}
            onOpenAtp={() => setCurrentScreen('ATP')}
            onOpenAdmin={() => setCurrentScreen('ADMIN')}
          />
        )}

        {currentScreen === 'QR_SCAN' && selectedTask && (
          <QrScanScreen
            task={selectedTask}
            onScanComplete={handleQrScanComplete}
          />
        )}

        {currentScreen === 'TEMP_MEASURE' && selectedTask && (
          <TempMeasureScreen
            task={selectedTask}
            onComplete={handleTempMeasureComplete}
            onFail={handleTempMeasureFail}
          />
        )}

        {currentScreen === 'CORRECTIVE_ACTION' &&
          selectedTask &&
          failedMeasureInfo && (
            <CorrectiveActionScreen
              task={selectedTask}
              failedValue={failedMeasureInfo.value}
              initialMethod={failedMeasureInfo.method}
              onResolveAnomaly={handleResolveAnomaly}
            />
          )}

        {currentScreen === 'SANITIZE' && selectedTask && (
          <SanitizeScreen
            task={selectedTask}
            onComplete={handleSanitizeComplete}
          />
        )}

        {currentScreen === 'ATP' && (
          <AtpScreen
            spots={appState.atpSpots}
            onCompleteAtp={handleCompleteAtp}
          />
        )}

        {currentScreen === 'ADMIN' && (
          <AdminScreen
            tasks={appState.tasks}
            records={appState.records}
            onReturnToHome={() => setCurrentScreen('HOME')}
            onResetData={handleResetData}
          />
        )}
      </main>
    </PhoneFrame>
  );
}
