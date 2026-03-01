/**
 * HealthKit on the Web (iOS 17.4+) - Limited support
 * Fallback to manual import for older devices
 */

import { HealthKitDataType, HealthKitSample, DailyHealthSummary, HealthKitSleepSample, SleepStage } from './types';

// HealthKit Web API is only available on iOS 17.4+ Safari
interface HealthKitWebAPI {
  requestAuthorization: (readTypes: string[], writeTypes: string[]) => Promise<boolean>;
  queryQuantitySamples: (options: {
    quantityType: string;
    startDate: Date;
    endDate: Date;
    ascending?: boolean;
    limit?: number;
  }) => Promise<Array<{
    quantity: number;
    startDate: Date;
    endDate: Date;
    uuid: string;
    source?: string;
  }>>;
  queryCategorySamples: (options: {
    categoryType: string;
    startDate: Date;
    endDate: Date;
    ascending?: boolean;
    limit?: number;
  }) => Promise<Array<{
    value: number | string;
    startDate: Date;
    endDate: Date;
    uuid: string;
    source?: string;
  }>>;
}

declare global {
  interface Window {
    healthKit?: HealthKitWebAPI;
    webkit?: {
      messageHandlers?: {
        healthKit?: {
          postMessage: (message: unknown) => void;
        };
      };
    };
  }
}

/**
 * Check if HealthKit Web API is available
 */
export function isHealthKitWebAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  
  // Check iOS version 17.4+
  const match = userAgent.match(/OS (\d+)_(\d+)/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    if (major > 17 || (major === 17 && minor >= 4)) {
      return isIOS && isSafari && !!window.healthKit;
    }
  }
  
  return false;
}

/**
 * Request HealthKit authorization
 */
export async function requestHealthKitAuthorization(
  readTypes: HealthKitDataType[],
  writeTypes: HealthKitDataType[] = []
): Promise<boolean> {
  if (!isHealthKitWebAvailable()) {
    throw new Error('HealthKit Web API not available');
  }

  try {
    const granted = await window.healthKit!.requestAuthorization(
      readTypes.map(mapToHealthKitIdentifier),
      writeTypes.map(mapToHealthKitIdentifier)
    );
    return granted;
  } catch (error) {
    console.error('[AppleHealth] Authorization failed:', error);
    return false;
  }
}

/**
 * Query quantity samples (steps, distance, etc.)
 */
export async function queryQuantitySamples(
  quantityType: HealthKitDataType,
  startDate: Date,
  endDate: Date,
  limit?: number
): Promise<HealthKitSample[]> {
  if (!isHealthKitWebAvailable()) {
    throw new Error('HealthKit Web API not available');
  }

  const samples = await window.healthKit!.queryQuantitySamples({
    quantityType: mapToHealthKitIdentifier(quantityType),
    startDate,
    endDate,
    ascending: false,
    limit,
  });

  return samples.map(sample => ({
    uuid: sample.uuid,
    quantityType: quantityType as string,
    value: sample.quantity,
    unit: getUnitForType(quantityType),
    startDate: sample.startDate.toISOString(),
    endDate: sample.endDate.toISOString(),
    source: {
      name: sample.source || 'Unknown',
      bundleIdentifier: 'unknown',
    },
  }));
}

/**
 * Query sleep samples
 */
export async function querySleepSamples(
  startDate: Date,
  endDate: Date
): Promise<HealthKitSleepSample[]> {
  if (!isHealthKitWebAvailable()) {
    throw new Error('HealthKit Web API not available');
  }

  const samples = await window.healthKit!.queryCategorySamples({
    categoryType: 'HKCategoryTypeIdentifierSleepAnalysis',
    startDate,
    endDate,
    ascending: true,
  });

  return samples.map(sample => {
    const sleepStage = mapSleepValueToStage(sample.value);
    return {
      uuid: sample.uuid,
      categoryType: 'sleepAnalysis',
      value: sleepStage,
      sleepStage,
      startDate: sample.startDate.toISOString(),
      endDate: sample.endDate.toISOString(),
      source: {
        name: sample.source || 'Unknown',
        bundleIdentifier: 'unknown',
      },
    };
  });
}

/**
 * Get daily summary for date range
 */
export async function getDailySummaries(
  startDate: Date,
  endDate: Date
): Promise<DailyHealthSummary[]> {
  if (!isHealthKitWebAvailable()) {
    throw new Error('HealthKit Web API not available');
  }

  const summaries: DailyHealthSummary[] = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const summary: DailyHealthSummary = {
      date: dayStart.toISOString().split('T')[0],
    };

    try {
      // Steps
      const steps = await window.healthKit!.queryQuantitySamples({
        quantityType: 'HKQuantityTypeIdentifierStepCount',
        startDate: dayStart,
        endDate: dayEnd,
      });
      if (steps.length > 0) {
        summary.stepCount = steps.reduce((sum, s) => sum + s.quantity, 0);
      }

      // Distance
      const distance = await window.healthKit!.queryQuantitySamples({
        quantityType: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
        startDate: dayStart,
        endDate: dayEnd,
      });
      if (distance.length > 0) {
        summary.distanceWalkingRunning = distance.reduce((sum, s) => sum + s.quantity, 0);
      }

      // Active energy
      const activeEnergy = await window.healthKit!.queryQuantitySamples({
        quantityType: 'HKQuantityTypeIdentifierActiveEnergyBurned',
        startDate: dayStart,
        endDate: dayEnd,
      });
      if (activeEnergy.length > 0) {
        summary.activeEnergyBurned = activeEnergy.reduce((sum, s) => sum + s.quantity, 0);
      }

      // Sleep
      const sleepSamples = await querySleepSamples(dayStart, dayEnd);
      if (sleepSamples.length > 0) {
        summary.sleepAnalysis = calculateSleepStats(sleepSamples);
      }

      summaries.push(summary);
    } catch (error) {
      console.error(`[AppleHealth] Failed to get summary for ${summary.date}:`, error);
    }
  }

  return summaries;
}

/**
 * Map HealthKit data type to identifier
 */
function mapToHealthKitIdentifier(type: HealthKitDataType): string {
  const mapping: Record<HealthKitDataType, string> = {
    stepCount: 'HKQuantityTypeIdentifierStepCount',
    distanceWalkingRunning: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
    activeEnergyBurned: 'HKQuantityTypeIdentifierActiveEnergyBurned',
    basalEnergyBurned: 'HKQuantityTypeIdentifierBasalEnergyBurned',
    heartRate: 'HKQuantityTypeIdentifierHeartRate',
    restingHeartRate: 'HKQuantityTypeIdentifierRestingHeartRate',
    walkingHeartRateAverage: 'HKQuantityTypeIdentifierWalkingHeartRateAverage',
    oxygenSaturation: 'HKQuantityTypeIdentifierOxygenSaturation',
    bodyTemperature: 'HKQuantityTypeIdentifierBodyTemperature',
    bloodPressureSystolic: 'HKQuantityTypeIdentifierBloodPressureSystolic',
    bloodPressureDiastolic: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
    respiratoryRate: 'HKQuantityTypeIdentifierRespiratoryRate',
    height: 'HKQuantityTypeIdentifierHeight',
    bodyMass: 'HKQuantityTypeIdentifierBodyMass',
    bodyMassIndex: 'HKQuantityTypeIdentifierBodyMassIndex',
    bodyFatPercentage: 'HKQuantityTypeIdentifierBodyFatPercentage',
    leanBodyMass: 'HKQuantityTypeIdentifierLeanBodyMass',
    waistCircumference: 'HKQuantityTypeIdentifierWaistCircumference',
    flightsClimbed: 'HKQuantityTypeIdentifierFlightsClimbed',
    nikeFuel: 'HKQuantityTypeIdentifierNikeFuel',
    appleExerciseTime: 'HKQuantityTypeIdentifierAppleExerciseTime',
    appleStandTime: 'HKQuantityTypeIdentifierAppleStandTime',
    environmentalAudioExposure: 'HKQuantityTypeIdentifierEnvironmentalAudioExposure',
    headphoneAudioExposure: 'HKQuantityTypeIdentifierHeadphoneAudioExposure',
    lowHeartRateEvent: 'HKQuantityTypeIdentifierLowHeartRateEvent',
    highHeartRateEvent: 'HKQuantityTypeIdentifierHighHeartRateEvent',
    irregularHeartRhythmEvent: 'HKQuantityTypeIdentifierIrregularHeartRhythmEvent',
    heartRateVariabilitySDNN: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    vo2Max: 'HKQuantityTypeIdentifierVO2Max',
    sleepAnalysis: 'HKCategoryTypeIdentifierSleepAnalysis',
    appleStandHour: 'HKCategoryTypeIdentifierAppleStandHour',
    cervicalMucusQuality: 'HKCategoryTypeIdentifierCervicalMucusQuality',
    ovulationTestResult: 'HKCategoryTypeIdentifierOvulationTestResult',
    sexualActivity: 'HKCategoryTypeIdentifierSexualActivity',
    contraceptive: 'HKCategoryTypeIdentifierContraceptive',
    pregnancy: 'HKCategoryTypeIdentifierPregnancy',
    lactation: 'HKCategoryTypeIdentifierLactation',
    environmentalAudioExposureEvent: 'HKCategoryTypeIdentifierEnvironmentalAudioExposureEvent',
    handwashingEvent: 'HKCategoryTypeIdentifierHandwashingEvent',
    toothbrushingEvent: 'HKCategoryTypeIdentifierToothbrushingEvent',
    mindfulSession: 'HKCategoryTypeIdentifierMindfulSession',
  };

  return mapping[type];
}

/**
 * Get unit for quantity type
 */
function getUnitForType(type: HealthKitDataType): string {
  const units: Partial<Record<HealthKitDataType, string>> = {
    stepCount: 'count',
    distanceWalkingRunning: 'm',
    activeEnergyBurned: 'kcal',
    basalEnergyBurned: 'kcal',
    heartRate: 'count/min',
    restingHeartRate: 'count/min',
    oxygenSaturation: '%',
    bodyTemperature: 'degC',
    bloodPressureSystolic: 'mmHg',
    bloodPressureDiastolic: 'mmHg',
    respiratoryRate: 'count/min',
    height: 'cm',
    bodyMass: 'kg',
    flightsClimbed: 'count',
    appleExerciseTime: 'min',
    appleStandTime: 'min',
  };

  return units[type] || 'unit';
}

/**
 * Map sleep value to stage
 */
function mapSleepValueToStage(value: number | string): SleepStage {
  const mapping: Record<number, SleepStage> = {
    0: 'inBed',
    1: 'asleepUnspecified',
    2: 'asleepCore',
    3: 'asleepDeep',
    4: 'asleepREM',
    5: 'awake',
  };

  if (typeof value === 'string') {
    return value as SleepStage;
  }

  return mapping[value] || 'asleepUnspecified';
}

/**
 * Calculate sleep statistics from samples
 */
function calculateSleepStats(samples: HealthKitSleepSample[]): DailyHealthSummary['sleepAnalysis'] {
  let inBedMinutes = 0;
  let asleepMinutes = 0;
  let deepSleepMinutes = 0;
  let remSleepMinutes = 0;

  const stages: DailyHealthSummary['sleepAnalysis']['stages'] = [];

  for (const sample of samples) {
    const minutes = Math.round(
      (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime()) / (1000 * 60)
    );

    stages.push({
      stage: sample.sleepStage,
      startDate: sample.startDate,
      endDate: sample.endDate,
      minutes,
    });

    inBedMinutes += minutes;

    if (sample.sleepStage.startsWith('asleep')) {
      asleepMinutes += minutes;
    }
    if (sample.sleepStage === 'asleepDeep') {
      deepSleepMinutes += minutes;
    }
    if (sample.sleepStage === 'asleepREM') {
      remSleepMinutes += minutes;
    }
  }

  return {
    inBedMinutes,
    asleepMinutes,
    deepSleepMinutes,
    remSleepMinutes,
    stages,
  };
}
