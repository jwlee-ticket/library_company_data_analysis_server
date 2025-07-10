import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 주간 마케팅 캘린더 View
 * 주간별 마케팅 활동, 프로모션, 기타 이벤트 계획을 관리
 */
@ViewEntity({
    name: 'view_con_weekly_marketing_calendar',
    synchronize: false,
    materialized: false,
})
export class ViewConWeeklyMarketingCalendar {
    /** 콘서트명 */
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    /** 주간 시작일 (월요일) */
    @ViewColumn({ name: 'week_start_date' })
    weekStartDate: Date;

    /** 주간 종료일 (일요일) */
    @ViewColumn({ name: 'week_end_date' })
    weekEndDate: Date;

    /** 영업/마케팅 활동 내용 (영업팀 마케팅 계획) */
    @ViewColumn({ name: 'sales_marketing' })
    salesMarketing: string;

    /** 프로모션 활동 내용 (할인, 이벤트 등) */
    @ViewColumn({ name: 'promotion' })
    promotion: string;

    /** 기타 특이사항 (공지사항, 메모 등) */
    @ViewColumn({ name: 'etc' })
    etc: string;
}