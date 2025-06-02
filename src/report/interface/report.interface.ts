// slack.interfaces.ts
export interface DailyPerformanceReport {
    reportDate: string;
    day: string;
    lastUpdates: ShowUpdateInfo[];
    salesInfo: ShowSalesInfo[];
    occupancyChanges: ShowOccupancyChangeInfo[];
    upcomingSchedules: ShowScheduleInfo[];
}

export interface ShowUpdateInfo {
    name: string;
    lastUpdateDate: string;
}

export interface ShowSalesInfo {
    name: string;
    sales: number;
    date: string;
}

export interface ShowOccupancyChangeInfo {
    name: string;
    change: number;
}

export interface ShowScheduleInfo {
    name: string;
    schedules: Array<{
        date: string;
        day: string;
        time: string;
        occupancyRate: number;
        remainingSeats: number;
    }>;
}