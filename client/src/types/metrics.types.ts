export type TimePeriod = 'Daily' | 'This week' | 'This month' | 'This year';

export interface MetricData {
  value: string;
  change: string;
}

export interface ChartData {
  totalCalls: number;
  bookedMeetings: number;
  conversionRate: string;
}

export interface PeriodMetrics {
  newLeads: MetricData;
  callsAttempted: MetricData;
  connectedCalls: MetricData;
  chart: ChartData;
}

export type MetricsDataMap = Record<TimePeriod, PeriodMetrics>;
