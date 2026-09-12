export const hives: any[] = [];

export const temperatureHistory = [
  { time: '00:00', value: 32.4 }, { time: '02:00', value: 32.1 },
  { time: '04:00', value: 31.8 }, { time: '06:00', value: 32.6 },
  { time: '08:00', value: 33.4 }, { time: '10:00', value: 34.0 },
  { time: '12:00', value: 34.8 }, { time: '14:00', value: 35.0 },
  { time: '16:00', value: 34.6 }, { time: '18:00', value: 34.2 },
  { time: '20:00', value: 33.8 }, { time: '22:00', value: 33.2 },
  { time: 'Now', value: 34.2 },
];

export const humidityHistory = [
  { time: '00:00', value: 58 }, { time: '02:00', value: 57 },
  { time: '04:00', value: 58 }, { time: '06:00', value: 60 },
  { time: '08:00', value: 62 }, { time: '10:00', value: 63 },
  { time: '12:00', value: 64 }, { time: '14:00', value: 63 },
  { time: '16:00', value: 62 }, { time: '18:00', value: 61 },
  { time: '20:00', value: 60 }, { time: '22:00', value: 59 },
  { time: 'Now', value: 62 },
];

export const weightHistory = [
  { date: 'Mon', value: 41.2 }, { date: 'Tue', value: 41.7 },
  { date: 'Wed', value: 42.0 }, { date: 'Thu', value: 42.4 },
  { date: 'Fri', value: 42.5 }, { date: 'Sat', value: 42.6 },
  { date: 'Sun', value: 42.8 },
];

export const activityHistory = [
  { time: '06:00', value: 22 }, { time: '07:00', value: 45 },
  { time: '08:00', value: 68 }, { time: '09:00', value: 82 },
  { time: '10:00', value: 87 }, { time: '11:00', value: 91 },
  { time: '12:00', value: 88 }, { time: '13:00', value: 85 },
  { time: '14:00', value: 79 }, { time: '15:00', value: 72 },
  { time: '16:00', value: 65 }, { time: '17:00', value: 48 },
  { time: '18:00', value: 28 },
];

export const pressureHistory = [
  { time: '00:00', value: 1010 }, { time: '04:00', value: 1009 },
  { time: '08:00', value: 1008 }, { time: '12:00', value: 1008 },
  { time: '16:00', value: 1007 }, { time: '20:00', value: 1008 },
  { time: 'Now', value: 1008 },
];

export const buzzingHistory = [
  { time: '00:00', value: 42 }, { time: '02:00', value: 38 },
  { time: '04:00', value: 36 }, { time: '06:00', value: 50 },
  { time: '08:00', value: 58 }, { time: '10:00', value: 62 },
  { time: '12:00', value: 67 }, { time: '14:00', value: 64 },
  { time: '16:00', value: 60 }, { time: '18:00', value: 55 },
  { time: '20:00', value: 48 }, { time: '22:00', value: 44 },
  { time: 'Now', value: 67 },
];

export const vibrationHistory = [
  { time: '00:00', value: 0.08 }, { time: '04:00', value: 0.07 },
  { time: '08:00', value: 0.10 }, { time: '12:00', value: 0.12 },
  { time: '16:00', value: 0.13 }, { time: '20:00', value: 0.11 },
  { time: 'Now', value: 0.13 },
];

export const weeklyTemperature = Array.from({ length: 28 }, (_, i) => ({
  date: `Day ${i + 1}`,
  avg: 33.2 + Math.sin(i * 0.4) * 1.2,
  min: 30.8 + Math.sin(i * 0.4) * 0.8,
  max: 35.4 + Math.sin(i * 0.3) * 1.4,
}));

export const weeklyWeight = Array.from({ length: 28 }, (_, i) => ({
  date: `Day ${i + 1}`,
  value: 40.0 + i * 0.1 + Math.sin(i * 0.5) * 0.3,
}));

export const alerts: any[] = [];
