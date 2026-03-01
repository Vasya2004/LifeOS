/**
 * Apple HealthKit integration types
 */

// HealthKit quantity types
export type HealthKitQuantityType =
  | 'stepCount'
  | 'distanceWalkingRunning'
  | 'activeEnergyBurned'
  | 'basalEnergyBurned'
  | 'heartRate'
  | 'restingHeartRate'
  | 'walkingHeartRateAverage'
  | 'oxygenSaturation'
  | 'bodyTemperature'
  | 'bloodPressureSystolic'
  | 'bloodPressureDiastolic'
  | 'respiratoryRate'
  | 'height'
  | 'bodyMass'
  | 'bodyMassIndex'
  | 'bodyFatPercentage'
  | 'leanBodyMass'
  | 'waistCircumference'
  | 'flightsClimbed'
  | 'nikeFuel'
  | 'appleExerciseTime'
  | 'appleStandTime'
  | 'environmentalAudioExposure'
  | 'headphoneAudioExposure'
  | 'lowHeartRateEvent'
  | 'highHeartRateEvent'
  | 'irregularHeartRhythmEvent'
  | 'heartRateVariabilitySDNN'
  | 'vo2Max';

// HealthKit category types
export type HealthKitCategoryType =
  | 'sleepAnalysis'
  | 'appleStandHour'
  | 'cervicalMucusQuality'
  | 'ovulationTestResult'
  | 'sexualActivity'
  | 'contraceptive'
  | 'pregnancy'
  | 'lactation'
  | 'environmentalAudioExposureEvent'
  | 'handwashingEvent'
  | 'toothbrushingEvent'
  | 'mindfulSession';

export type HealthKitDataType = HealthKitQuantityType | HealthKitCategoryType;

// Sleep analysis values
export type SleepStage =
  | 'inBed'
  | 'asleepUnspecified'
  | 'asleepCore'
  | 'asleepDeep'
  | 'asleepREM'
  | 'awake';

export interface HealthKitQuantitySample {
  uuid: string;
  quantityType: HealthKitQuantityType;
  value: number;
  unit: string;
  startDate: string;
  endDate: string;
  source: {
    name: string;
    bundleIdentifier: string;
    productType?: string;
  };
  device?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthKitCategorySample {
  uuid: string;
  categoryType: HealthKitCategoryType;
  value: number | string;
  startDate: string;
  endDate: string;
  source: {
    name: string;
    bundleIdentifier: string;
    productType?: string;
  };
  device?: string;
  metadata?: Record<string, unknown>;
}

export interface HealthKitSleepSample extends HealthKitCategorySample {
  categoryType: 'sleepAnalysis';
  sleepStage: SleepStage;
  value: SleepStage;
}

export type HealthKitSample = HealthKitQuantitySample | HealthKitCategorySample;

export interface HealthKitWorkout {
  uuid: string;
  workoutActivityType: string;
  duration: number;
  durationUnit: 'min' | 'hour';
  totalDistance?: {
    quantity: number;
    unit: string;
  };
  totalEnergyBurned?: {
    quantity: number;
    unit: string;
  };
  startDate: string;
  endDate: string;
  source: {
    name: string;
    bundleIdentifier: string;
  };
  metadata?: Record<string, unknown>;
}

export interface DailyHealthSummary {
  date: string;
  stepCount?: number;
  distanceWalkingRunning?: number; // meters
  flightsClimbed?: number;
  activeEnergyBurned?: number; // kcal
  basalEnergyBurned?: number; // kcal
  appleExerciseTime?: number; // minutes
  appleStandTime?: number; // minutes
  heartRate?: {
    average: number;
    min: number;
    max: number;
    resting?: number;
  };
  sleepAnalysis?: {
    inBedMinutes: number;
    asleepMinutes: number;
    deepSleepMinutes?: number;
    remSleepMinutes?: number;
    stages: Array<{
      stage: SleepStage;
      startDate: string;
      endDate: string;
      minutes: number;
    }>;
  };
}

export interface HealthKitSyncConfig {
  dataTypes: HealthKitDataType[];
  syncPeriod: 'day' | 'week' | 'month';
  autoSync: boolean;
  syncInterval: number; // hours
  aggregateDaily: boolean;
  writeBackEnabled: boolean;
}

export interface HealthKitAuthorizationStatus {
  read: Record<HealthKitDataType, 'notDetermined' | 'sharingDenied' | 'sharingAuthorized'>;
  write: Record<HealthKitDataType, 'notDetermined' | 'sharingDenied' | 'sharingAuthorized'>;
}

export const HEALTH_DATA_LABELS: Record<HealthKitDataType, string> = {
  stepCount: 'Шаги',
  distanceWalkingRunning: 'Расстояние',
  activeEnergyBurned: 'Активные калории',
  basalEnergyBurned: 'Базальные калории',
  heartRate: 'Пульс',
  restingHeartRate: 'Пульс в покое',
  walkingHeartRateAverage: 'Средний пульс при ходьбе',
  oxygenSaturation: 'Насыщение кислородом',
  bodyTemperature: 'Температура тела',
  bloodPressureSystolic: 'Систолическое давление',
  bloodPressureDiastolic: 'Диастолическое давление',
  respiratoryRate: 'Частота дыхания',
  height: 'Рост',
  bodyMass: 'Вес',
  bodyMassIndex: 'ИМТ',
  bodyFatPercentage: 'Процент жира',
  leanBodyMass: 'Мышечная масса',
  waistCircumference: 'Обхват талии',
  flightsClimbed: 'Этажи',
  nikeFuel: 'Nike Fuel',
  appleExerciseTime: 'Время тренировок',
  appleStandTime: 'Время стояния',
  environmentalAudioExposure: 'Шум окружающей среды',
  headphoneAudioExposure: 'Громкость наушников',
  lowHeartRateEvent: 'Низкий пульс',
  highHeartRateEvent: 'Высокий пульс',
  irregularHeartRhythmEvent: 'Нерегулярный ритм',
  heartRateVariabilitySDNN: 'Вариабельность пульса',
  vo2Max: 'VO2 Max',
  sleepAnalysis: 'Сон',
  appleStandHour: 'Часы стояния',
  cervicalMucusQuality: 'Цервикальная слизь',
  ovulationTestResult: 'Тест на овуляцию',
  sexualActivity: 'Сексуальная активность',
  contraceptive: 'Контрацепция',
  pregnancy: 'Беременность',
  lactation: 'Лактация',
  environmentalAudioExposureEvent: 'Событие шума',
  handwashingEvent: 'Мытье рук',
  toothbrushingEvent: 'Чистка зубов',
  mindfulSession: 'Осознанность',
};

export const SENSITIVE_HEALTH_TYPES: HealthKitDataType[] = [
  'sexualActivity',
  'contraceptive',
  'pregnancy',
  'lactation',
  'cervicalMucusQuality',
  'ovulationTestResult',
];
