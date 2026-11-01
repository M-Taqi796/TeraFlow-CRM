import type { MetricsDataMap, TimePeriod } from '../types/metrics.types';

export const TIME_PERIODS: TimePeriod[] = [
  'Daily',
  'This week',
  'This month',
  'This year',
];

export const METRICS_DATA: MetricsDataMap = {
  Daily: {
    newLeads: { value: '14', change: '+5 vs yesterday' },
    callsAttempted: { value: '28', change: '+12% vs yesterday' },
    connectedCalls: { value: '17', change: '60.7% connection rate' },
    chart: { totalCalls: 28, bookedMeetings: 4, conversionRate: '14.3%' },
  },
  'This week': {
    newLeads: { value: '68', change: '+12% vs last week' },
    callsAttempted: { value: '142', change: '+18% vs last week' },
    connectedCalls: { value: '84', change: '59.2% connection rate' },
    chart: { totalCalls: 142, bookedMeetings: 22, conversionRate: '15.5%' },
  },
  'This month': {
    newLeads: { value: '245', change: '+18% vs last month' },
    callsAttempted: { value: '580', change: '+15% vs last month' },
    connectedCalls: { value: '348', change: '60.0% connection rate' },
    chart: { totalCalls: 580, bookedMeetings: 85, conversionRate: '14.7%' },
  },
  'This year': {
    newLeads: { value: '1,840', change: '+34% vs last year' },
    callsAttempted: { value: '4,320', change: '+22% vs last year' },
    connectedCalls: { value: '2,592', change: '60.0% connection rate' },
    chart: { totalCalls: 4320, bookedMeetings: 580, conversionRate: '13.4%' },
  },
};
