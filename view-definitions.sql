-- View: public.live_performance_shows
-- Drop view if exists
DROP VIEW IF EXISTS public.live_performance_shows;

-- Create view
CREATE OR REPLACE VIEW public.live_performance_shows AS
 SELECT l."liveId" AS "liveId_",
    l."liveName",
    l."latestRecordDate",
    l."showTotalSeatNumber",
    ((l."latestRecordDate" - '6 days'::interval))::date AS start_date,
    ((l."latestRecordDate" + '7 days'::interval))::date AS end_date,
    ps.id,
    ps."recordDate",
    ps."liveId",
    ps."showDateTime",
    ps."cast",
    ps."paidSeatSales",
    ps."paidSeatTot",
    ps."paidSeatVip",
    ps."paidSeatA",
    ps."paidSeatS",
    ps."paidSeatR",
    ps."paidBadSeatA",
    ps."paidBadSeatS",
    ps."paidBadSeatR",
    ps."paidDisableSeat",
    ps."inviteSeatTot",
    ps."inviteSeatVip",
    ps."inviteSeatA",
    ps."inviteSeatS",
    ps."inviteSeatR",
    ps."inviteBadSeatA",
    ps."inviteBadSeatS",
    ps."inviteBadSeatR",
    ps."inviteDisableSeat",
    ps."depositShare",
    ps."paidShare",
    ps."freeShare",
    ps."playUploadId"
   FROM ((live_model l
     LEFT JOIN file_upload_model f ON ((((l."liveId")::text = (f."liveId")::text) AND (f."recordDate" = l."latestRecordDate"))))
     LEFT JOIN play_show_sale_model ps ON (((f.id = ps."playUploadId") AND ((ps."liveId")::text = (l."liveId")::text) AND (((ps."showDateTime")::date >= ((l."latestRecordDate" - '6 days'::interval))::date) AND ((ps."showDateTime")::date <= ((l."latestRecordDate" + '7 days'::interval))::date)))))
  WHERE ((l."isLive" = true) AND (ps.id IS NOT NULL))
  ORDER BY l."liveId", ps."showDateTime";

-- View: public.view_con_all_daily
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_all_daily;

-- Create view
CREATE OR REPLACE VIEW public.view_con_all_daily AS
 SELECT lm."liveId" AS live_id,
    lm."liveName" AS live_name,
    ptsm."salesDate" AS record_date,
    to_char((ptsm."recordDate")::timestamp with time zone, 'YYYY-MM'::text) AS record_month,
    (date_trunc('week'::text, ptsm."salesDate"))::date AS record_week,
    ptsm."paidSeatTot" AS daily_sales_ticket_no,
    ptsm.sales AS daily_sales_amount
   FROM (live_model lm
     JOIN concert_ticket_sale_model ptsm ON ((((lm."liveId")::text = (ptsm."liveId")::text) AND (lm."latestRecordDate" = ptsm."recordDate"))))
  WHERE ((lm.category = '콘서트'::text) AND (lm."isLive" = true))
  ORDER BY lm."liveId", ptsm."recordDate";

-- View: public.view_con_all_overview
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_all_overview;

-- Create view
CREATE OR REPLACE VIEW public.view_con_all_overview AS
 WITH yesterday_data AS (
         SELECT sum(view_con_all_daily.daily_sales_amount) AS yesterday_sales
           FROM view_con_all_daily
          WHERE (view_con_all_daily.record_date = (CURRENT_DATE - '1 day'::interval))
        ), accumulated_data AS (
         SELECT sum(view_con_all_daily.daily_sales_amount) AS accumulated_sales
           FROM view_con_all_daily
        ), weekly_data AS (
         SELECT sum(view_con_all_daily.daily_sales_amount) AS weekly_sales
           FROM view_con_all_daily
          WHERE ((view_con_all_daily.record_date >= (CURRENT_DATE - '7 days'::interval)) AND (view_con_all_daily.record_date <= (CURRENT_DATE - '1 day'::interval)))
        )
 SELECT yesterday_data.yesterday_sales,
    accumulated_data.accumulated_sales,
    weekly_data.weekly_sales,
    (weekly_data.weekly_sales / 7) AS daily_avg_sales
   FROM yesterday_data,
    accumulated_data,
    weekly_data;

-- View: public.view_con_all_weekly
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_all_weekly;

-- Create view
CREATE OR REPLACE VIEW public.view_con_all_weekly AS
 SELECT view_con_all_daily.live_id,
    view_con_all_daily.live_name,
    view_con_all_daily.record_week,
    sum(view_con_all_daily.daily_sales_ticket_no) AS weekly_sales_ticket_no,
    sum(view_con_all_daily.daily_sales_amount) AS weekly_sales_amount,
    weekly_marketing_calendar_model."salesMarketing" AS note_sales_marketing,
    weekly_marketing_calendar_model.promotion AS note_promotion,
    weekly_marketing_calendar_model.etc AS note_etc
   FROM (view_con_all_daily
     JOIN weekly_marketing_calendar_model ON ((((view_con_all_daily.live_id)::text = (weekly_marketing_calendar_model."liveId")::text) AND (view_con_all_daily.record_week = (weekly_marketing_calendar_model."weekStartDate")::date))))
  GROUP BY view_con_all_daily.live_id, view_con_all_daily.live_name, view_con_all_daily.record_week, weekly_marketing_calendar_model."salesMarketing", weekly_marketing_calendar_model.promotion, weekly_marketing_calendar_model.etc
  ORDER BY view_con_all_daily.live_id, view_con_all_daily.record_week;

-- View: public.view_con_bep
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_bep;

-- Create view
CREATE OR REPLACE VIEW public.view_con_bep AS
 WITH seat_classes AS (
         SELECT t.seat_class,
            t.display_order
           FROM ( VALUES ('VIP'::text,1), ('R'::text,2), ('S'::text,3), ('A'::text,4), ('B'::text,5), ('Total'::text,6)) t(seat_class, display_order)
        ), daily_sales_avg AS (
         SELECT cssm_1."liveId",
            'VIP'::text AS seat_class,
            COALESCE(sum(cssm_1."paidSeatVip"), (0)::bigint) AS total_sold,
            max(
                CASE
                    WHEN (cssm_1."recordDate" > lm_1."saleStartDate") THEN (EXTRACT(day FROM (cssm_1."recordDate" - lm_1."saleStartDate")))::integer
                    ELSE 1
                END) AS days_from_start,
            max(lm_1."latestRecordDate") AS latest_record_date,
            max(lm_1."saleEndDate") AS sale_end_date
           FROM (concert_seat_sale_model cssm_1
             JOIN live_model lm_1 ON (((cssm_1."liveId")::text = (lm_1."liveId")::text)))
          WHERE ((cssm_1."recordDate" >= lm_1."saleStartDate") AND (cssm_1."recordDate" <= lm_1."latestRecordDate"))
          GROUP BY cssm_1."liveId"
        UNION ALL
         SELECT cssm_1."liveId",
            'R'::text AS seat_class,
            COALESCE(sum(cssm_1."paidSeatR"), (0)::bigint) AS total_sold,
            max(
                CASE
                    WHEN (cssm_1."recordDate" > lm_1."saleStartDate") THEN (EXTRACT(day FROM (cssm_1."recordDate" - lm_1."saleStartDate")))::integer
                    ELSE 1
                END) AS days_from_start,
            max(lm_1."latestRecordDate") AS latest_record_date,
            max(lm_1."saleEndDate") AS sale_end_date
           FROM (concert_seat_sale_model cssm_1
             JOIN live_model lm_1 ON (((cssm_1."liveId")::text = (lm_1."liveId")::text)))
          WHERE ((cssm_1."recordDate" >= lm_1."saleStartDate") AND (cssm_1."recordDate" <= lm_1."latestRecordDate"))
          GROUP BY cssm_1."liveId"
        UNION ALL
         SELECT cssm_1."liveId",
            'S'::text AS seat_class,
            COALESCE(sum(cssm_1."paidSeatS"), (0)::bigint) AS total_sold,
            max(
                CASE
                    WHEN (cssm_1."recordDate" > lm_1."saleStartDate") THEN (EXTRACT(day FROM (cssm_1."recordDate" - lm_1."saleStartDate")))::integer
                    ELSE 1
                END) AS days_from_start,
            max(lm_1."latestRecordDate") AS latest_record_date,
            max(lm_1."saleEndDate") AS sale_end_date
           FROM (concert_seat_sale_model cssm_1
             JOIN live_model lm_1 ON (((cssm_1."liveId")::text = (lm_1."liveId")::text)))
          WHERE ((cssm_1."recordDate" >= lm_1."saleStartDate") AND (cssm_1."recordDate" <= lm_1."latestRecordDate"))
          GROUP BY cssm_1."liveId"
        UNION ALL
         SELECT cssm_1."liveId",
            'A'::text AS seat_class,
            COALESCE(sum(cssm_1."paidSeatA"), (0)::bigint) AS total_sold,
            max(
                CASE
                    WHEN (cssm_1."recordDate" > lm_1."saleStartDate") THEN (EXTRACT(day FROM (cssm_1."recordDate" - lm_1."saleStartDate")))::integer
                    ELSE 1
                END) AS days_from_start,
            max(lm_1."latestRecordDate") AS latest_record_date,
            max(lm_1."saleEndDate") AS sale_end_date
           FROM (concert_seat_sale_model cssm_1
             JOIN live_model lm_1 ON (((cssm_1."liveId")::text = (lm_1."liveId")::text)))
          WHERE ((cssm_1."recordDate" >= lm_1."saleStartDate") AND (cssm_1."recordDate" <= lm_1."latestRecordDate"))
          GROUP BY cssm_1."liveId"
        UNION ALL
         SELECT cssm_1."liveId",
            'B'::text AS seat_class,
            COALESCE(sum(cssm_1."paidSeatB"), (0)::bigint) AS total_sold,
            max(
                CASE
                    WHEN (cssm_1."recordDate" > lm_1."saleStartDate") THEN (EXTRACT(day FROM (cssm_1."recordDate" - lm_1."saleStartDate")))::integer
                    ELSE 1
                END) AS days_from_start,
            max(lm_1."latestRecordDate") AS latest_record_date,
            max(lm_1."saleEndDate") AS sale_end_date
           FROM (concert_seat_sale_model cssm_1
             JOIN live_model lm_1 ON (((cssm_1."liveId")::text = (lm_1."liveId")::text)))
          WHERE ((cssm_1."recordDate" >= lm_1."saleStartDate") AND (cssm_1."recordDate" <= lm_1."latestRecordDate"))
          GROUP BY cssm_1."liveId"
        UNION ALL
         SELECT cssm_1."liveId",
            'Total'::text AS seat_class,
            COALESCE(sum(cssm_1."paidSeatTot"), (0)::bigint) AS total_sold,
            max(
                CASE
                    WHEN (cssm_1."recordDate" > lm_1."saleStartDate") THEN (EXTRACT(day FROM (cssm_1."recordDate" - lm_1."saleStartDate")))::integer
                    ELSE 1
                END) AS days_from_start,
            max(lm_1."latestRecordDate") AS latest_record_date,
            max(lm_1."saleEndDate") AS sale_end_date
           FROM (concert_seat_sale_model cssm_1
             JOIN live_model lm_1 ON (((cssm_1."liveId")::text = (lm_1."liveId")::text)))
          WHERE ((cssm_1."recordDate" >= lm_1."saleStartDate") AND (cssm_1."recordDate" <= lm_1."latestRecordDate"))
          GROUP BY cssm_1."liveId"
        )
 SELECT lm."liveId" AS live_id,
    lm."liveName" AS live_name,
    lm."latestRecordDate",
    lm."saleStartDate" AS sales_start_date,
    lm."saleEndDate" AS sales_end_date,
    sc.seat_class,
    sc.display_order AS seatorder,
        CASE
            WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(lm."concertSeatNumberVip", 0)
            WHEN (sc.seat_class = 'R'::text) THEN COALESCE(lm."concertSeatNumberR", 0)
            WHEN (sc.seat_class = 'S'::text) THEN COALESCE(lm."concertSeatNumberS", 0)
            WHEN (sc.seat_class = 'A'::text) THEN COALESCE(lm."concertSeatNumberA", 0)
            WHEN (sc.seat_class = 'B'::text) THEN COALESCE(lm."concertSeatNumberB", 0)
            WHEN (sc.seat_class = 'Total'::text) THEN ((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0))
            ELSE NULL::integer
        END AS total_seats,
        CASE
            WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(cssm."paidSeatVip", 0)
            WHEN (sc.seat_class = 'R'::text) THEN COALESCE(cssm."paidSeatR", 0)
            WHEN (sc.seat_class = 'S'::text) THEN COALESCE(cssm."paidSeatS", 0)
            WHEN (sc.seat_class = 'A'::text) THEN COALESCE(cssm."paidSeatA", 0)
            WHEN (sc.seat_class = 'B'::text) THEN COALESCE(cssm."paidSeatB", 0)
            WHEN (sc.seat_class = 'Total'::text) THEN COALESCE(cssm."paidSeatTot", 0)
            ELSE NULL::integer
        END AS sold_seats,
        CASE
            WHEN (sc.seat_class = 'VIP'::text) THEN (COALESCE(lm."concertSeatNumberVip", 0) - COALESCE(cssm."paidSeatVip", 0))
            WHEN (sc.seat_class = 'R'::text) THEN (COALESCE(lm."concertSeatNumberR", 0) - COALESCE(cssm."paidSeatR", 0))
            WHEN (sc.seat_class = 'S'::text) THEN (COALESCE(lm."concertSeatNumberS", 0) - COALESCE(cssm."paidSeatS", 0))
            WHEN (sc.seat_class = 'A'::text) THEN (COALESCE(lm."concertSeatNumberA", 0) - COALESCE(cssm."paidSeatA", 0))
            WHEN (sc.seat_class = 'B'::text) THEN (COALESCE(lm."concertSeatNumberB", 0) - COALESCE(cssm."paidSeatB", 0))
            WHEN (sc.seat_class = 'Total'::text) THEN (((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0)) - COALESCE(cssm."paidSeatTot", 0))
            ELSE NULL::integer
        END AS remaining_seats,
        CASE
            WHEN (lm."saleEndDate" > lm."latestRecordDate") THEN COALESCE((NULLIF(((dsa.total_sold)::numeric / (NULLIF(dsa.days_from_start, 0))::numeric), (0)::numeric) * ((EXTRACT(day FROM (lm."saleEndDate" - lm."latestRecordDate")))::integer)::numeric), (0)::numeric)
            ELSE (0)::numeric
        END AS est_additional_sales,
    GREATEST((0)::numeric, ((
        CASE
            WHEN (sc.seat_class = 'VIP'::text) THEN (COALESCE(lm."concertSeatNumberVip", 0) - COALESCE(cssm."paidSeatVip", 0))
            WHEN (sc.seat_class = 'R'::text) THEN (COALESCE(lm."concertSeatNumberR", 0) - COALESCE(cssm."paidSeatR", 0))
            WHEN (sc.seat_class = 'S'::text) THEN (COALESCE(lm."concertSeatNumberS", 0) - COALESCE(cssm."paidSeatS", 0))
            WHEN (sc.seat_class = 'A'::text) THEN (COALESCE(lm."concertSeatNumberA", 0) - COALESCE(cssm."paidSeatA", 0))
            WHEN (sc.seat_class = 'B'::text) THEN (COALESCE(lm."concertSeatNumberB", 0) - COALESCE(cssm."paidSeatB", 0))
            WHEN (sc.seat_class = 'Total'::text) THEN (((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0)) - COALESCE(cssm."paidSeatTot", 0))
            ELSE NULL::integer
        END)::numeric -
        CASE
            WHEN (lm."saleEndDate" > lm."latestRecordDate") THEN COALESCE((NULLIF(((dsa.total_sold)::numeric / (NULLIF(dsa.days_from_start, 0))::numeric), (0)::numeric) * ((EXTRACT(day FROM (lm."saleEndDate" - lm."latestRecordDate")))::integer)::numeric), (0)::numeric)
            ELSE (0)::numeric
        END)) AS est_final_remaining,
        CASE
            WHEN (sc.seat_class = 'VIP'::text) THEN (COALESCE((lm."targetShare" * 0.01), (0)::numeric) * (COALESCE(lm."concertSeatNumberVip", 0))::numeric)
            WHEN (sc.seat_class = 'R'::text) THEN (COALESCE((lm."targetShare" * 0.01), (0)::numeric) * (COALESCE(lm."concertSeatNumberR", 0))::numeric)
            WHEN (sc.seat_class = 'S'::text) THEN (COALESCE((lm."targetShare" * 0.01), (0)::numeric) * (COALESCE(lm."concertSeatNumberS", 0))::numeric)
            WHEN (sc.seat_class = 'A'::text) THEN (COALESCE((lm."targetShare" * 0.01), (0)::numeric) * (COALESCE(lm."concertSeatNumberA", 0))::numeric)
            WHEN (sc.seat_class = 'B'::text) THEN (COALESCE((lm."targetShare" * 0.01), (0)::numeric) * (COALESCE(lm."concertSeatNumberB", 0))::numeric)
            WHEN (sc.seat_class = 'Total'::text) THEN (COALESCE((lm."targetShare" * 0.01), (0)::numeric) * (((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0)))::numeric)
            ELSE NULL::numeric
        END AS bep_seats,
        CASE
            WHEN (
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(lm."concertSeatNumberVip", 0)
                WHEN (sc.seat_class = 'R'::text) THEN COALESCE(lm."concertSeatNumberR", 0)
                WHEN (sc.seat_class = 'S'::text) THEN COALESCE(lm."concertSeatNumberS", 0)
                WHEN (sc.seat_class = 'A'::text) THEN COALESCE(lm."concertSeatNumberA", 0)
                WHEN (sc.seat_class = 'B'::text) THEN COALESCE(lm."concertSeatNumberB", 0)
                WHEN (sc.seat_class = 'Total'::text) THEN ((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0))
                ELSE NULL::integer
            END > 0) THEN (((
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(lm."concertSeatNumberVip", 0)
                WHEN (sc.seat_class = 'R'::text) THEN COALESCE(lm."concertSeatNumberR", 0)
                WHEN (sc.seat_class = 'S'::text) THEN COALESCE(lm."concertSeatNumberS", 0)
                WHEN (sc.seat_class = 'A'::text) THEN COALESCE(lm."concertSeatNumberA", 0)
                WHEN (sc.seat_class = 'B'::text) THEN COALESCE(lm."concertSeatNumberB", 0)
                WHEN (sc.seat_class = 'Total'::text) THEN ((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0))
                ELSE NULL::integer
            END)::numeric - GREATEST((0)::numeric, ((
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN (COALESCE(lm."concertSeatNumberVip", 0) - COALESCE(cssm."paidSeatVip", 0))
                WHEN (sc.seat_class = 'R'::text) THEN (COALESCE(lm."concertSeatNumberR", 0) - COALESCE(cssm."paidSeatR", 0))
                WHEN (sc.seat_class = 'S'::text) THEN (COALESCE(lm."concertSeatNumberS", 0) - COALESCE(cssm."paidSeatS", 0))
                WHEN (sc.seat_class = 'A'::text) THEN (COALESCE(lm."concertSeatNumberA", 0) - COALESCE(cssm."paidSeatA", 0))
                WHEN (sc.seat_class = 'B'::text) THEN (COALESCE(lm."concertSeatNumberB", 0) - COALESCE(cssm."paidSeatB", 0))
                WHEN (sc.seat_class = 'Total'::text) THEN (((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0)) - COALESCE(cssm."paidSeatTot", 0))
                ELSE NULL::integer
            END)::numeric -
            CASE
                WHEN (lm."saleEndDate" > lm."latestRecordDate") THEN COALESCE((NULLIF(((dsa.total_sold)::numeric / (NULLIF(dsa.days_from_start, 0))::numeric), (0)::numeric) * ((EXTRACT(day FROM (lm."saleEndDate" - lm."latestRecordDate")))::integer)::numeric), (0)::numeric)
                ELSE (0)::numeric
            END))) / (
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(lm."concertSeatNumberVip", 0)
                WHEN (sc.seat_class = 'R'::text) THEN COALESCE(lm."concertSeatNumberR", 0)
                WHEN (sc.seat_class = 'S'::text) THEN COALESCE(lm."concertSeatNumberS", 0)
                WHEN (sc.seat_class = 'A'::text) THEN COALESCE(lm."concertSeatNumberA", 0)
                WHEN (sc.seat_class = 'B'::text) THEN COALESCE(lm."concertSeatNumberB", 0)
                WHEN (sc.seat_class = 'Total'::text) THEN ((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0))
                ELSE NULL::integer
            END)::numeric)
            ELSE (0)::numeric
        END AS est_sales_ratio,
        CASE
            WHEN (
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(lm."concertSeatNumberVip", 0)
                WHEN (sc.seat_class = 'R'::text) THEN COALESCE(lm."concertSeatNumberR", 0)
                WHEN (sc.seat_class = 'S'::text) THEN COALESCE(lm."concertSeatNumberS", 0)
                WHEN (sc.seat_class = 'A'::text) THEN COALESCE(lm."concertSeatNumberA", 0)
                WHEN (sc.seat_class = 'B'::text) THEN COALESCE(lm."concertSeatNumberB", 0)
                WHEN (sc.seat_class = 'Total'::text) THEN ((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0))
                ELSE NULL::integer
            END > 0) THEN (GREATEST((0)::numeric, ((
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN (COALESCE(lm."concertSeatNumberVip", 0) - COALESCE(cssm."paidSeatVip", 0))
                WHEN (sc.seat_class = 'R'::text) THEN (COALESCE(lm."concertSeatNumberR", 0) - COALESCE(cssm."paidSeatR", 0))
                WHEN (sc.seat_class = 'S'::text) THEN (COALESCE(lm."concertSeatNumberS", 0) - COALESCE(cssm."paidSeatS", 0))
                WHEN (sc.seat_class = 'A'::text) THEN (COALESCE(lm."concertSeatNumberA", 0) - COALESCE(cssm."paidSeatA", 0))
                WHEN (sc.seat_class = 'B'::text) THEN (COALESCE(lm."concertSeatNumberB", 0) - COALESCE(cssm."paidSeatB", 0))
                WHEN (sc.seat_class = 'Total'::text) THEN (((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0)) - COALESCE(cssm."paidSeatTot", 0))
                ELSE NULL::integer
            END)::numeric -
            CASE
                WHEN (lm."saleEndDate" > lm."latestRecordDate") THEN COALESCE((NULLIF(((dsa.total_sold)::numeric / (NULLIF(dsa.days_from_start, 0))::numeric), (0)::numeric) * ((EXTRACT(day FROM (lm."saleEndDate" - lm."latestRecordDate")))::integer)::numeric), (0)::numeric)
                ELSE (0)::numeric
            END)) / (
            CASE
                WHEN (sc.seat_class = 'VIP'::text) THEN COALESCE(lm."concertSeatNumberVip", 0)
                WHEN (sc.seat_class = 'R'::text) THEN COALESCE(lm."concertSeatNumberR", 0)
                WHEN (sc.seat_class = 'S'::text) THEN COALESCE(lm."concertSeatNumberS", 0)
                WHEN (sc.seat_class = 'A'::text) THEN COALESCE(lm."concertSeatNumberA", 0)
                WHEN (sc.seat_class = 'B'::text) THEN COALESCE(lm."concertSeatNumberB", 0)
                WHEN (sc.seat_class = 'Total'::text) THEN ((((COALESCE(lm."concertSeatNumberVip", 0) + COALESCE(lm."concertSeatNumberR", 0)) + COALESCE(lm."concertSeatNumberS", 0)) + COALESCE(lm."concertSeatNumberA", 0)) + COALESCE(lm."concertSeatNumberB", 0))
                ELSE NULL::integer
            END)::numeric)
            ELSE (0)::numeric
        END AS est_remaining_ratio,
    COALESCE((lm."targetShare" * 0.01), (0)::numeric) AS bep_ratio
   FROM (((live_model lm
     CROSS JOIN seat_classes sc)
     LEFT JOIN concert_seat_sale_model cssm ON ((((lm."liveId")::text = (cssm."liveId")::text) AND (lm."latestRecordDate" = cssm."recordDate"))))
     LEFT JOIN daily_sales_avg dsa ON ((((lm."liveId")::text = (dsa."liveId")::text) AND (sc.seat_class = dsa.seat_class))))
  WHERE ((lm."isLive" = true) AND (lm.category = '콘서트'::text))
  ORDER BY lm."liveId", sc.display_order;

-- View: public.view_con_est_profit
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_est_profit;

-- Create view
CREATE OR REPLACE VIEW public.view_con_est_profit AS
 WITH sales_data AS (
         SELECT lm."liveId",
            lm."liveName",
            lm.bep,
            lm."saleEndDate",
            COALESCE(sum(cts.sales), (0)::bigint) AS sales_acc,
            count(DISTINCT cts."salesDate") AS sales_days,
            GREATEST((0)::numeric, EXTRACT(day FROM (lm."saleEndDate" - (CURRENT_DATE)::timestamp without time zone))) AS remaining_days
           FROM ((live_model lm
             LEFT JOIN file_upload_model fum ON ((((lm."liveId")::text = (fum."liveId")::text) AND (fum."recordDate" = lm."latestRecordDate"))))
             LEFT JOIN concert_ticket_sale_model cts ON ((fum.id = cts."concertUploadId")))
          WHERE ((lm."isLive" = true) AND (lm.category = '콘서트'::text))
          GROUP BY lm."liveId", lm."liveName", lm.bep, lm."saleEndDate"
        )
 SELECT sd."liveName" AS live_name,
    sd.bep,
        CASE
            WHEN (sd.sales_days > 0) THEN ((sd.sales_acc)::numeric + (((sd.sales_acc / sd.sales_days))::numeric * sd.remaining_days))
            ELSE (sd.sales_acc)::numeric
        END AS est_sales,
        CASE
            WHEN (sd.sales_days > 0) THEN ((sd.bep)::numeric - ((sd.sales_acc)::numeric + (((sd.sales_acc / sd.sales_days))::numeric * sd.remaining_days)))
            ELSE ((sd.bep - sd.sales_acc))::numeric
        END AS final_profit
   FROM sales_data sd;

-- View: public.view_con_llm_total_sales
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_llm_total_sales;

-- Create view
CREATE OR REPLACE VIEW public.view_con_llm_total_sales AS
 WITH latest_concert_sales AS (
         SELECT lm."liveId",
            cts.sales,
            cts."salesDate"
           FROM ((live_model lm
             JOIN file_upload_model fum ON ((((fum."liveId")::text = (lm."liveId")::text) AND (fum."recordDate" = lm."latestRecordDate"))))
             JOIN concert_ticket_sale_model cts ON ((cts."concertUploadId" = fum.id)))
          WHERE ((lm.category = '콘서트'::text) AND (lm."isLive" = true))
        )
 SELECT COALESCE(sum(
        CASE
            WHEN (date(lcs."salesDate") = (CURRENT_DATE - '1 day'::interval)) THEN lcs.sales
            ELSE 0
        END), (0)::bigint) AS "yesterdaySales",
    COALESCE(sum(lcs.sales), (0)::bigint) AS "totalSales",
    COALESCE(sum(
        CASE
            WHEN ((date(lcs."salesDate") >= (CURRENT_DATE - ('1 day'::interval * ((EXTRACT(dow FROM CURRENT_DATE))::integer)::double precision))) AND (date(lcs."salesDate") <= ((CURRENT_DATE - ('1 day'::interval * ((EXTRACT(dow FROM CURRENT_DATE))::integer)::double precision)) + '4 days'::interval))) THEN lcs.sales
            ELSE 0
        END), (0)::bigint) AS "weeklySales",
    COALESCE((sum(
        CASE
            WHEN ((date(lcs."salesDate") >= (CURRENT_DATE - ('1 day'::interval * ((EXTRACT(dow FROM CURRENT_DATE))::integer)::double precision))) AND (date(lcs."salesDate") <= ((CURRENT_DATE - ('1 day'::interval * ((EXTRACT(dow FROM CURRENT_DATE))::integer)::double precision)) + '4 days'::interval))) THEN lcs.sales
            ELSE 0
        END) / 5), (0)::bigint) AS "weeklyDailyAvg"
   FROM latest_concert_sales lcs;

-- View: public.view_con_target_sales
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_target_sales;

-- Create view
CREATE OR REPLACE VIEW public.view_con_target_sales AS
 SELECT lm."liveName" AS live_name,
    COALESCE(( SELECT sum(dt.target) AS sum
           FROM daily_target_model dt
          WHERE ((dt."liveId")::text = (lm."liveId")::text)), (0)::bigint) AS target_sales,
    COALESCE(sum(cts.sales), (0)::bigint) AS sales_acc,
        CASE
            WHEN (COALESCE(( SELECT sum(dt.target) AS sum
               FROM daily_target_model dt
              WHERE ((dt."liveId")::text = (lm."liveId")::text)), (0)::bigint) > 0) THEN round(((COALESCE(sum(cts.sales), (0)::bigint))::numeric / (COALESCE(( SELECT sum(dt.target) AS sum
               FROM daily_target_model dt
              WHERE ((dt."liveId")::text = (lm."liveId")::text)), (0)::bigint))::numeric), 2)
            ELSE (0)::numeric
        END AS target_ratio
   FROM ((live_model lm
     LEFT JOIN file_upload_model fum ON ((((lm."liveId")::text = (fum."liveId")::text) AND (fum."recordDate" = lm."latestRecordDate"))))
     LEFT JOIN concert_ticket_sale_model cts ON ((fum.id = cts."concertUploadId")))
  WHERE ((lm."isLive" = true) AND (lm.category = '콘서트'::text))
  GROUP BY lm."liveName", lm."liveId";

-- View: public.view_con_weekly_marketing_calendar
-- Drop view if exists
DROP VIEW IF EXISTS public.view_con_weekly_marketing_calendar;

-- Create view
CREATE OR REPLACE VIEW public.view_con_weekly_marketing_calendar AS
 SELECT lm."liveName" AS live_name,
    wmc."weekStartDate" AS week_start_date,
    wmc."weekEndDate" AS week_end_date,
    wmc."salesMarketing" AS sales_marketing,
    wmc.promotion,
    wmc.etc
   FROM (live_model lm
     JOIN weekly_marketing_calendar_model wmc ON (((wmc."liveId")::text = (lm."liveId")::text)))
  WHERE ((lm."isLive" = true) AND (lm.category = '콘서트'::text) AND ((CURRENT_DATE >= wmc."weekStartDate") AND (CURRENT_DATE <= wmc."weekEndDate")));

-- View: public.view_file_upload_check
-- Drop view if exists
DROP VIEW IF EXISTS public.view_file_upload_check;

-- Create view
CREATE OR REPLACE VIEW public.view_file_upload_check AS
 WITH d AS (
         SELECT ((CURRENT_DATE - ((n.n || ' days'::text))::interval))::date AS date
           FROM generate_series(0, 89) n(n)
        )
 SELECT d.date,
    a."liveId",
    a."liveName",
    b."fileName",
    b."recordDate"
   FROM ((d
     CROSS JOIN live_model a)
     LEFT JOIN file_upload_model b ON ((((a."liveId")::text = (b."liveId")::text) AND (d.date = (b."recordDate")::date))))
  WHERE (a."isLive" = true)
  ORDER BY d.date, a."liveId";

-- View: public.view_llm_play_daily
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_daily;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_daily AS
 SELECT l."liveId" AS "liveId_",
    l."liveName",
    l."latestRecordDate",
    l."showTotalSeatNumber",
    ( SELECT pts.sales
           FROM (file_upload_model fu
             JOIN play_ticket_sale_model pts ON ((fu.id = pts."playUploadId")))
          WHERE (((fu."liveId")::text = (l."liveId")::text) AND (fu."recordDate" = l."latestRecordDate") AND (pts."recordDate" = l."latestRecordDate") AND (pts."salesDate" = l."latestRecordDate"))) AS "티켓판매일매출",
    ((CURRENT_DATE - '2 days'::interval))::date AS start_date,
    ((CURRENT_DATE + '7 days'::interval))::date AS end_date,
    ps.id,
    ps."recordDate",
    ps."liveId",
    ps."showDateTime",
    ps."cast",
    ps."paidSeatSales",
    ps."paidSeatTot",
    ps."paidSeatVip",
    ps."paidSeatA",
    ps."paidSeatS",
    ps."paidSeatR",
    ps."paidBadSeatA",
    ps."paidBadSeatS",
    ps."paidBadSeatR",
    ps."paidDisableSeat",
    ps."inviteSeatTot",
    ps."inviteSeatVip",
    ps."inviteSeatA",
    ps."inviteSeatS",
    ps."inviteSeatR",
    ps."inviteBadSeatA",
    ps."inviteBadSeatS",
    ps."inviteBadSeatR",
    ps."inviteDisableSeat",
    ps."depositShare",
    ps."paidShare",
    ps."freeShare",
    ps."playUploadId"
   FROM ((live_model l
     LEFT JOIN file_upload_model f ON ((((l."liveId")::text = (f."liveId")::text) AND (f."recordDate" = l."latestRecordDate"))))
     LEFT JOIN play_show_sale_model ps ON (((f.id = ps."playUploadId") AND ((ps."liveId")::text = (l."liveId")::text) AND (ps."showDateTime" >= ((((CURRENT_DATE - '2 days'::interval))::date || ' 00:00:00'::text))::timestamp without time zone) AND (ps."showDateTime" <= ((((CURRENT_DATE + '7 days'::interval))::date || ' 23:59:59'::text))::timestamp without time zone))))
  WHERE ((l."isLive" = true) AND (ps.id IS NOT NULL))
  ORDER BY l."liveId", ps."showDateTime";

-- View: public.view_llm_play_daily_a
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_daily_a;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_daily_a AS
 WITH latest_record_sales AS (
         SELECT pts."liveId",
            pts."recordDate",
            max(pts."salesDate") AS max_sales_date
           FROM play_ticket_sale_model pts
          GROUP BY pts."liveId", pts."recordDate"
        ), latest_sales_data AS (
         SELECT pts."liveId",
            pts."recordDate",
            pts.sales AS "latestTicketSales",
            pts."salesDate" AS "latestTicketSalesDate"
           FROM (play_ticket_sale_model pts
             JOIN latest_record_sales lrs ON ((((pts."liveId")::text = (lrs."liveId")::text) AND (pts."recordDate" = lrs."recordDate") AND (pts."salesDate" = lrs.max_sales_date))))
        )
 SELECT lm."liveId",
    lm."liveName",
    lm."latestRecordDate",
    lsd."latestTicketSales",
    lsd."latestTicketSalesDate"
   FROM (live_model lm
     JOIN latest_sales_data lsd ON ((((lsd."liveId")::text = (lm."liveId")::text) AND (lsd."recordDate" = lm."latestRecordDate"))))
  WHERE (lm."isLive" = true)
  ORDER BY lm."liveName";

-- View: public.view_llm_play_daily_b
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_daily_b;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_daily_b AS
 WITH dateranking AS (
         SELECT l.id AS live_id,
            l."liveId" AS live_reference_id,
            l."liveName" AS live_name,
            date(pss."showDateTime") AS sale_date,
            avg((pss."paidShare" + pss."freeShare")) AS daily_share,
            rank() OVER (PARTITION BY l.id ORDER BY (date(pss."showDateTime")) DESC) AS date_rank,
                CASE
                    WHEN (date(pss."showDateTime") <= CURRENT_DATE) THEN 1
                    ELSE 0
                END AS is_past_or_today,
                CASE
                    WHEN (date(pss."showDateTime") = CURRENT_DATE) THEN 1
                    ELSE 0
                END AS is_today
           FROM ((live_model l
             JOIN file_upload_model fum ON ((((fum."liveId")::text = (l."liveId")::text) AND (fum."recordDate" = l."latestRecordDate"))))
             JOIN play_show_sale_model pss ON ((pss."playUploadId" = fum.id)))
          WHERE (l."isLive" = true)
          GROUP BY l.id, l."liveId", l."liveName", (date(pss."showDateTime"))
        ), latestdata AS (
         SELECT dr.live_id,
            dr.live_reference_id,
            dr.live_name,
            dr.sale_date,
            dr.daily_share,
            dr.date_rank,
            dr.is_past_or_today,
            dr.is_today,
            row_number() OVER (PARTITION BY dr.live_id ORDER BY dr.is_today DESC, dr.is_past_or_today DESC, dr.sale_date DESC) AS row_num
           FROM dateranking dr
          WHERE (dr.is_past_or_today = 1)
        ), prevdata AS (
         SELECT ld_1.live_id,
            dr.sale_date AS prev_date,
            dr.daily_share AS prev_share,
            row_number() OVER (PARTITION BY ld_1.live_id ORDER BY dr.sale_date DESC) AS row_num
           FROM (latestdata ld_1
             JOIN dateranking dr ON ((dr.live_id = ld_1.live_id)))
          WHERE ((ld_1.row_num = 1) AND (dr.sale_date < ld_1.sale_date))
        )
 SELECT ld.live_id,
    ld.live_reference_id,
    ld.live_name,
    ld.daily_share AS latest_share,
    ld.sale_date AS latest_date,
    pd.prev_share,
    pd.prev_date,
    (ld.daily_share - pd.prev_share) AS change_share
   FROM (latestdata ld
     LEFT JOIN prevdata pd ON (((pd.live_id = ld.live_id) AND (pd.row_num = 1))))
  WHERE (ld.row_num = 1);

-- View: public.view_llm_play_daily_c
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_daily_c;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_daily_c AS
 SELECT l."liveId",
    l."liveName",
    pss."showDateTime" AS show_date,
    (pss."paidShare" + pss."freeShare") AS share,
    l."showTotalSeatNumber",
    pss."paidSeatTot",
    pss."inviteSeatTot",
    (l."showTotalSeatNumber" - (pss."paidSeatTot" + pss."inviteSeatTot")) AS remaining_seats
   FROM ((live_model l
     JOIN file_upload_model fum ON ((((fum."liveId")::text = (l."liveId")::text) AND (fum."recordDate" = l."latestRecordDate"))))
     JOIN play_show_sale_model pss ON ((pss."playUploadId" = fum.id)))
  WHERE ((l."isLive" = true) AND (date(pss."showDateTime") > CURRENT_DATE) AND (date(pss."showDateTime") <= (CURRENT_DATE + '7 days'::interval)))
  ORDER BY l."liveId", pss."showDateTime";

-- View: public.view_llm_play_est_profit
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_est_profit;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_est_profit AS
 WITH performance_stats AS (
         SELECT view_play_all_showtime."liveId_",
            view_play_all_showtime."liveName",
            view_play_all_showtime.bep,
            view_play_all_showtime."latestRecordDate",
                CASE
                    WHEN ((view_play_all_showtime."showDateTime")::date <= (((view_play_all_showtime."latestRecordDate")::date + '1 day'::interval) - '00:00:01'::interval)) THEN 'before_or_on'::text
                    ELSE 'after'::text
                END AS time_period,
            count(*) OVER (PARTITION BY view_play_all_showtime."liveId_",
                CASE
                    WHEN ((view_play_all_showtime."showDateTime")::date <= (((view_play_all_showtime."latestRecordDate")::date + '1 day'::interval) - '00:00:01'::interval)) THEN 'before_or_on'::text
                    ELSE 'after'::text
                END) AS show_count,
            sum(view_play_all_showtime."paidSeatSales") OVER (PARTITION BY view_play_all_showtime."liveId_",
                CASE
                    WHEN ((view_play_all_showtime."showDateTime")::date <= (((view_play_all_showtime."latestRecordDate")::date + '1 day'::interval) - '00:00:01'::interval)) THEN 'before_or_on'::text
                    ELSE 'after'::text
                END) AS total_revenue
           FROM view_play_all_showtime
        )
 SELECT performance_stats."liveId_",
    performance_stats."liveName",
    performance_stats.bep,
        CASE
            WHEN (max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END) > 0) THEN (((max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END) / max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END)) * COALESCE(max(
            CASE
                WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END), (0)::bigint)) + max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END))
            ELSE max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END)
        END AS est_total_revenue,
        CASE
            WHEN (max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END) > 0) THEN ((((max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END) / max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END)) * COALESCE(max(
            CASE
                WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END), (0)::bigint)) + max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END)) - performance_stats.bep)
            ELSE (max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END) - performance_stats.bep)
        END AS est_total_profit,
    performance_stats."latestRecordDate",
    max(
        CASE
            WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
            ELSE NULL::bigint
        END) AS revenue_before_record_date,
    max(
        CASE
            WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
            ELSE NULL::bigint
        END) AS shows_before_record_date,
        CASE
            WHEN (max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END) > 0) THEN (max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END) / max(
            CASE
                WHEN (performance_stats.time_period = 'before_or_on'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END))
            ELSE (0)::bigint
        END AS avg_revenue_per_show_before,
    max(
        CASE
            WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.total_revenue
            ELSE NULL::bigint
        END) AS revenue_after_record_date,
    max(
        CASE
            WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.show_count
            ELSE NULL::bigint
        END) AS shows_after_record_date,
        CASE
            WHEN (max(
            CASE
                WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END) > 0) THEN (max(
            CASE
                WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.total_revenue
                ELSE NULL::bigint
            END) / max(
            CASE
                WHEN (performance_stats.time_period = 'after'::text) THEN performance_stats.show_count
                ELSE NULL::bigint
            END))
            ELSE (0)::bigint
        END AS avg_revenue_per_show_after
   FROM performance_stats
  GROUP BY performance_stats."liveId_", performance_stats."liveName", performance_stats.bep, performance_stats."latestRecordDate"
  ORDER BY performance_stats."liveId_";

-- View: public.view_llm_play_weekly_a
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_weekly_a;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_weekly_a AS
 WITH last_week AS (
         SELECT (date_trunc('week'::text, (CURRENT_DATE - '7 days'::interval)))::date AS week_start,
            ((date_trunc('week'::text, (CURRENT_DATE - '7 days'::interval)) + '6 days'::interval))::date AS week_end
        ), week_before_last AS (
         SELECT (date_trunc('week'::text, (CURRENT_DATE - '14 days'::interval)))::date AS week_start,
            ((date_trunc('week'::text, (CURRENT_DATE - '14 days'::interval)) + '6 days'::interval))::date AS week_end
        ), live_shows AS (
         SELECT l."liveId",
            l."liveName",
            l."targetShare" AS target_share,
            l."latestRecordDate" AS latest_record_date
           FROM live_model l
          WHERE (l."isLive" = true)
        ), last_week_daily_targets AS (
         SELECT dt."liveId",
            sum(dt.target) AS total_target_sales
           FROM (daily_target_model dt
             JOIN last_week lw ON (((dt.date >= lw.week_start) AND (dt.date <= lw.week_end))))
          GROUP BY dt."liveId"
        ), last_week_actual_sales AS (
         SELECT pts."liveId",
            sum(pts.sales) AS total_actual_sales
           FROM (((play_ticket_sale_model pts
             JOIN file_upload_model fu ON ((pts."playUploadId" = fu.id)))
             JOIN live_shows ls_1 ON ((((pts."liveId")::text = (ls_1."liveId")::text) AND (fu."recordDate" = ls_1.latest_record_date))))
             JOIN last_week lw ON (((pts."salesDate" >= lw.week_start) AND (pts."salesDate" <= lw.week_end))))
          GROUP BY pts."liveId"
        ), the_week_before_last_actual_sales AS (
         SELECT pts."liveId",
            sum(pts.sales) AS total_actual_sales
           FROM (((play_ticket_sale_model pts
             JOIN file_upload_model fu ON ((pts."playUploadId" = fu.id)))
             JOIN live_shows ls_1 ON ((((pts."liveId")::text = (ls_1."liveId")::text) AND (fu."recordDate" = ls_1.latest_record_date))))
             JOIN week_before_last wbl ON (((pts."salesDate" >= wbl.week_start) AND (pts."salesDate" <= wbl.week_end))))
          GROUP BY pts."liveId"
        ), last_week_share AS (
         SELECT pss."liveId",
            avg((pss."paidShare" + pss."freeShare")) AS avg_total_share
           FROM (((play_show_sale_model pss
             JOIN file_upload_model fu ON ((pss."playUploadId" = fu.id)))
             JOIN live_shows ls_1 ON ((((pss."liveId")::text = (ls_1."liveId")::text) AND (fu."recordDate" = ls_1.latest_record_date))))
             JOIN last_week lw ON ((((pss."showDateTime")::date >= lw.week_start) AND ((pss."showDateTime")::date <= lw.week_end))))
          GROUP BY pss."liveId"
        )
 SELECT ls."liveId" AS "공연ID",
    ls."liveName" AS "공연명",
    ls.target_share AS "지난주_목표점유율",
    COALESCE(lws.avg_total_share, (0)::numeric) AS "지난주_실제점유율",
    COALESCE(lwdt.total_target_sales, (0)::bigint) AS "지난주_목표매출",
    COALESCE(lwas.total_actual_sales, (0)::bigint) AS "지난주_실제매출",
    COALESCE(twblas.total_actual_sales, (0)::bigint) AS "지지난주_실제매출"
   FROM ((((live_shows ls
     LEFT JOIN last_week_daily_targets lwdt ON (((ls."liveId")::text = (lwdt."liveId")::text)))
     LEFT JOIN last_week_actual_sales lwas ON (((ls."liveId")::text = (lwas."liveId")::text)))
     LEFT JOIN the_week_before_last_actual_sales twblas ON (((ls."liveId")::text = (twblas."liveId")::text)))
     LEFT JOIN last_week_share lws ON (((ls."liveId")::text = (lws."liveId")::text)))
  ORDER BY ls."liveId";

-- View: public.view_llm_play_weekly_b
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_weekly_b;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_weekly_b AS
 WITH last_week AS (
         SELECT (date_trunc('week'::text, (CURRENT_DATE - '7 days'::interval)))::date AS week_start,
            ((date_trunc('week'::text, (CURRENT_DATE - '7 days'::interval)) + '6 days'::interval))::date AS week_end
        ), top_casts AS (
         SELECT pss."liveId",
            lm."liveName",
            pss."cast",
            sum(pss."paidSeatSales") AS total_sales,
            count(*) AS show_count,
            row_number() OVER (PARTITION BY pss."liveId" ORDER BY (sum(pss."paidSeatSales")) DESC) AS rank
           FROM ((play_show_sale_model pss
             JOIN live_model lm ON (((pss."liveId")::text = (lm."liveId")::text)))
             JOIN last_week lw ON ((((pss."showDateTime")::date >= lw.week_start) AND ((pss."showDateTime")::date <= lw.week_end))))
          WHERE (lm."isLive" = true)
          GROUP BY pss."liveId", lm."liveName", pss."cast"
        )
 SELECT top_casts."liveId" AS "공연ID",
    top_casts."liveName" AS "공연명",
    top_casts."cast" AS "캐스트",
    top_casts.total_sales AS "매출액",
    top_casts.show_count AS "공연횟수"
   FROM top_casts
  WHERE (top_casts.rank <= 3)
  ORDER BY top_casts."liveId", top_casts.rank;

-- View: public.view_llm_play_weekly_c
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_weekly_c;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_weekly_c AS
 WITH date_range AS (
         SELECT (date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone))::date AS start_date,
            ((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) + '13 days'::interval))::date AS end_date
        )
 SELECT l."liveId" AS "liveId_",
    l."liveName",
    l.location,
    l."latestRecordDate",
    dr.start_date,
    dr.end_date,
    ps.id AS "showId",
    ps."recordDate",
    ps."showDateTime",
    to_char(ps."showDateTime", 'YYYY-MM-DD HH24:MI'::text) AS "formattedShowTime",
    ps."cast",
    ps."paidSeatSales",
    ps."paidSeatTot",
    ps."inviteSeatTot",
    (ps."paidSeatTot" + ps."inviteSeatTot") AS "totalAttendance",
    ps."paidSeatVip",
    ps."paidSeatA",
    ps."paidSeatS",
    ps."paidSeatR",
    ps."inviteSeatVip",
    ps."inviteSeatA",
    ps."inviteSeatS",
    ps."inviteSeatR",
    ps."depositShare",
    ps."paidShare",
    ps."freeShare",
    f.id AS "fileUploadId",
    f."fileName"
   FROM (((live_model l
     CROSS JOIN date_range dr)
     LEFT JOIN file_upload_model f ON ((((l."liveId")::text = (f."liveId")::text) AND (f."recordDate" = l."latestRecordDate"))))
     LEFT JOIN play_show_sale_model ps ON (((f.id = ps."playUploadId") AND ((ps."liveId")::text = (l."liveId")::text) AND (((ps."showDateTime")::date >= dr.start_date) AND ((ps."showDateTime")::date <= dr.end_date)))))
  WHERE ((l."isLive" = true) AND (ps.id IS NOT NULL))
  ORDER BY l."liveId", ps."showDateTime";

-- View: public.view_llm_play_weekly_d
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_weekly_d;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_weekly_d AS
 WITH date_info AS (
         SELECT (date_trunc('week'::text, (CURRENT_DATE - '7 days'::interval)))::date AS prev_week_start,
            ((date_trunc('week'::text, (CURRENT_DATE - '7 days'::interval)) + '6 days'::interval))::date AS prev_week_end,
            (date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone))::date AS current_week_start,
            ((date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone) + '6 days'::interval))::date AS current_week_end,
            (date_trunc('week'::text, (CURRENT_DATE + '7 days'::interval)))::date AS next_week_start,
            ((date_trunc('week'::text, (CURRENT_DATE + '7 days'::interval)) + '6 days'::interval))::date AS next_week_end
        )
 SELECT l."liveId" AS "공연ID",
    l."liveName" AS "공연명",
        CASE
            WHEN ((w."weekStartDate" >= d.prev_week_start) AND (w."weekStartDate" <= d.prev_week_end)) THEN '전주'::text
            WHEN ((w."weekStartDate" >= d.current_week_start) AND (w."weekStartDate" <= d.current_week_end)) THEN '금주'::text
            WHEN ((w."weekStartDate" >= d.next_week_start) AND (w."weekStartDate" <= d.next_week_end)) THEN '차주'::text
            ELSE NULL::text
        END AS "주차구별",
    w."weekNumber",
    w."weekStartDate",
    w."weekEndDate",
    w."salesMarketing",
    w.promotion,
    w.etc
   FROM ((live_model l
     CROSS JOIN date_info d)
     LEFT JOIN weekly_marketing_calendar_model w ON ((((l."liveId")::text = (w."liveId")::text) AND (((w."weekStartDate" >= d.prev_week_start) AND (w."weekStartDate" <= d.prev_week_end)) OR ((w."weekStartDate" >= d.current_week_start) AND (w."weekStartDate" <= d.current_week_end)) OR ((w."weekStartDate" >= d.next_week_start) AND (w."weekStartDate" <= d.next_week_end))))))
  WHERE (l."isLive" = true)
  ORDER BY l."liveId", w."weekStartDate";

-- View: public.view_llm_play_weekly_paidshare
-- Drop view if exists
DROP VIEW IF EXISTS public.view_llm_play_weekly_paidshare;

-- Create view
CREATE OR REPLACE VIEW public.view_llm_play_weekly_paidshare AS
 WITH performance_dates AS (
         SELECT DISTINCT view_play_all_showtime."liveId_",
            view_play_all_showtime."liveName",
            min((view_play_all_showtime."showDateTime")::date) AS performance_start_date,
            max((view_play_all_showtime."showDateTime")::date) AS performance_end_date
           FROM view_play_all_showtime
          GROUP BY view_play_all_showtime."liveId_", view_play_all_showtime."liveName"
        ), weeks_range AS (
         SELECT pd."liveId_",
            pd."liveName",
            week_date.week_start AS week_start_date,
            (week_date.week_start + '6 days'::interval) AS week_end_date
           FROM (performance_dates pd
             CROSS JOIN LATERAL ( SELECT generate_series(((date_trunc('week'::text, (pd.performance_start_date)::timestamp with time zone))::date)::timestamp with time zone, ((date_trunc('week'::text, (pd.performance_end_date)::timestamp with time zone))::date)::timestamp with time zone, '7 days'::interval) AS week_start) week_date)
        ), weekly_paidshare AS (
         SELECT wr."liveId_",
            wr."liveName",
            wr.week_start_date,
            wr.week_end_date,
            avg(vp."paidShare") AS avg_paidshare,
            count(vp."showDateTime") AS show_count
           FROM (weeks_range wr
             LEFT JOIN view_play_all_showtime vp ON ((((vp."liveId_")::text = (wr."liveId_")::text) AND (((vp."showDateTime")::date >= wr.week_start_date) AND ((vp."showDateTime")::date <= wr.week_end_date)))))
          GROUP BY wr."liveId_", wr."liveName", wr.week_start_date, wr.week_end_date
        )
 SELECT weekly_paidshare."liveId_" AS "공연 ID",
    weekly_paidshare."liveName" AS "공연명",
    to_char(weekly_paidshare.week_start_date, 'YYYY-MM-DD'::text) AS "주 시작일",
    to_char(weekly_paidshare.week_end_date, 'YYYY-MM-DD'::text) AS "주 종료일",
    round(weekly_paidshare.avg_paidshare, 4) AS "유료 객석 점유율(%)",
    weekly_paidshare.show_count AS "해당 주 공연 횟수"
   FROM weekly_paidshare
  WHERE (weekly_paidshare.show_count > 0)
  ORDER BY weekly_paidshare."liveId_", weekly_paidshare.week_start_date;

-- View: public.view_play_all_showtime
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_all_showtime;

-- Create view
CREATE OR REPLACE VIEW public.view_play_all_showtime AS
 SELECT l."liveId" AS "liveId_",
    l."liveName",
    l."latestRecordDate",
    l.bep,
    ps.id,
    ps."recordDate",
    ps."liveId",
    ps."showDateTime",
    ps."cast",
    ps."paidSeatSales",
    ps."paidSeatTot",
    ps."paidSeatVip",
    ps."paidSeatA",
    ps."paidSeatS",
    ps."paidSeatR",
    ps."paidBadSeatA",
    ps."paidBadSeatS",
    ps."paidBadSeatR",
    ps."paidDisableSeat",
    ps."inviteSeatTot",
    ps."inviteSeatVip",
    ps."inviteSeatA",
    ps."inviteSeatS",
    ps."inviteSeatR",
    ps."inviteBadSeatA",
    ps."inviteBadSeatS",
    ps."inviteBadSeatR",
    ps."inviteDisableSeat",
    ps."depositShare",
    ps."paidShare",
    ps."freeShare",
    ps."playUploadId"
   FROM ((live_model l
     LEFT JOIN file_upload_model f ON ((((l."liveId")::text = (f."liveId")::text) AND (f."recordDate" = l."latestRecordDate"))))
     LEFT JOIN play_show_sale_model ps ON (((f.id = ps."playUploadId") AND ((ps."liveId")::text = (l."liveId")::text))))
  WHERE ((l."isLive" = true) AND (ps.id IS NOT NULL))
  ORDER BY l."liveId", ps."showDateTime";

-- View: public.view_play_monthly_all
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_monthly_all;

-- Create view
CREATE OR REPLACE VIEW public.view_play_monthly_all AS
 WITH months AS (
         SELECT to_char((CURRENT_DATE - ('1 mon'::interval * (generate_series(0, 12))::double precision)), 'YYYY-MM'::text) AS month_str
          ORDER BY (to_char((CURRENT_DATE - ('1 mon'::interval * (generate_series(0, 12))::double precision)), 'YYYY-MM'::text)) DESC
        ), monthly_sales AS (
         SELECT to_char(ptsm."salesDate", 'YYYY-MM'::text) AS month_str,
            sum(ptsm.sales) AS total_revenue
           FROM (play_ticket_sale_model ptsm
             JOIN live_model lm ON ((((ptsm."liveId")::text = (lm."liveId")::text) AND (ptsm."recordDate" = lm."latestRecordDate"))))
          WHERE ((ptsm."salesDate" >= ((CURRENT_DATE - '1 year 1 mon'::interval))::date) AND (lm.category <> '콘서트'::text))
          GROUP BY (to_char(ptsm."salesDate", 'YYYY-MM'::text))
        )
 SELECT m.month_str,
    COALESCE(current_month.total_revenue, (0)::bigint) AS total_revenue,
    (COALESCE(current_month.total_revenue, (0)::bigint) - COALESCE(prev_month.total_revenue, (0)::bigint)) AS absolute_change,
        CASE
            WHEN (COALESCE(prev_month.total_revenue, (0)::bigint) = 0) THEN NULL::numeric
            ELSE round((((COALESCE(current_month.total_revenue, (0)::bigint) - COALESCE(prev_month.total_revenue, (0)::bigint)))::numeric / (prev_month.total_revenue)::numeric), 2)
        END AS percentage_change,
    mem.etc AS note
   FROM (((months m
     LEFT JOIN monthly_sales current_month ON ((m.month_str = current_month.month_str)))
     LEFT JOIN monthly_sales prev_month ON ((prev_month.month_str = to_char((to_date(m.month_str, 'YYYY-MM'::text) - '1 mon'::interval), 'YYYY-MM'::text))))
     LEFT JOIN monthly_etc_model mem ON (((EXTRACT(year FROM to_date(m.month_str, 'YYYY-MM'::text)) = (mem.year)::numeric) AND (EXTRACT(month FROM to_date(m.month_str, 'YYYY-MM'::text)) = (mem.month)::numeric))))
  WHERE ((m.month_str <= to_char((CURRENT_DATE)::timestamp with time zone, 'YYYY-MM'::text)) AND (m.month_str >= to_char((((CURRENT_DATE - '1 year'::interval))::date)::timestamp with time zone, 'YYYY-MM'::text)))
  ORDER BY m.month_str DESC;

-- View: public.view_play_monthly_respective
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_monthly_respective;

-- Create view
CREATE OR REPLACE VIEW public.view_play_monthly_respective AS
 WITH monthly_sales AS (
         SELECT to_char(ptsm."salesDate", 'YYYY-MM'::text) AS month,
            lm."liveName" AS performance_name,
            lm."liveId",
            sum(ptsm.sales) AS total_revenue
           FROM (play_ticket_sale_model ptsm
             JOIN live_model lm ON ((((ptsm."liveId")::text = (lm."liveId")::text) AND (ptsm."recordDate" = lm."latestRecordDate"))))
          WHERE ((ptsm."salesDate" >= ((CURRENT_DATE - '1 year 1 mon'::interval))::date) AND (lm."isLive" = true) AND (lm.category <> '콘서트'::text))
          GROUP BY (to_char(ptsm."salesDate", 'YYYY-MM'::text)), lm."liveName", lm."liveId"
        )
 SELECT current_month.month,
    current_month.performance_name,
    current_month.total_revenue,
    (current_month.total_revenue - COALESCE(prev_month.total_revenue, (0)::bigint)) AS absolute_change,
        CASE
            WHEN (COALESCE(prev_month.total_revenue, (0)::bigint) = 0) THEN NULL::numeric
            ELSE round((((current_month.total_revenue - COALESCE(prev_month.total_revenue, (0)::bigint)))::numeric / (prev_month.total_revenue)::numeric), 2)
        END AS percentage_change
   FROM (monthly_sales current_month
     LEFT JOIN monthly_sales prev_month ON ((((current_month."liveId")::text = (prev_month."liveId")::text) AND (prev_month.month = to_char((to_date(current_month.month, 'YYYY-MM'::text) - '1 mon'::interval), 'YYYY-MM'::text)))))
  WHERE (current_month.month >= to_char((((CURRENT_DATE - '1 year'::interval))::date)::timestamp with time zone, 'YYYY-MM'::text))
  ORDER BY current_month.month DESC, current_month.performance_name;

-- View: public.view_play_overall_revenue_analysis
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_overall_revenue_analysis;

-- Create view
CREATE OR REPLACE VIEW public.view_play_overall_revenue_analysis AS
 WITH latest_targets AS (
         SELECT dt."liveId",
            max(dt.target) AS latest_target
           FROM (daily_target_model dt
             JOIN live_model l_1 ON (((l_1."liveId")::text = (dt."liveId")::text)))
          WHERE (dt.date = l_1."latestRecordDate")
          GROUP BY dt."liveId"
        ), total_targets AS (
         SELECT dt."liveId",
            sum(dt.target) AS sum_target
           FROM daily_target_model dt
          GROUP BY dt."liveId"
        ), latest_files AS (
         SELECT f."liveId",
            max(f.id) AS latest_file_id
           FROM (file_upload_model f
             JOIN live_model l_1 ON (((f."liveId")::text = (l_1."liveId")::text)))
          WHERE (f."recordDate" = l_1."latestRecordDate")
          GROUP BY f."liveId"
        ), latest_sales AS (
         SELECT p."liveId",
            sum(p.sales) AS total_sales
           FROM (play_ticket_sale_model p
             JOIN latest_files lf ON ((p."playUploadId" = lf.latest_file_id)))
          GROUP BY p."liveId"
        ), latest_day_sales AS (
         SELECT p."liveId",
            sum(p.sales) AS latest_day_total
           FROM ((play_ticket_sale_model p
             JOIN latest_files lf ON ((p."playUploadId" = lf.latest_file_id)))
             JOIN live_model l_1 ON (((p."liveId")::text = (l_1."liveId")::text)))
          WHERE (p."salesDate" = l_1."latestRecordDate")
          GROUP BY p."liveId"
        )
 SELECT l."liveId",
    l."liveName",
    l.category,
    COALESCE(ls.total_sales, (0)::bigint) AS total_sales,
    COALESCE(tt.sum_target, (0)::bigint) AS total_target,
        CASE
            WHEN (COALESCE(tt.sum_target, (0)::bigint) = 0) THEN NULL::numeric
            ELSE round(((COALESCE(ls.total_sales, (0)::bigint))::numeric / (COALESCE(tt.sum_target, (0)::bigint))::numeric), 4)
        END AS total_sales_target_ratio,
    COALESCE(lds.latest_day_total, (0)::bigint) AS latest_day_sales,
    COALESCE(lt.latest_target, 0) AS latest_day_target,
        CASE
            WHEN (COALESCE(lt.latest_target, 0) = 0) THEN NULL::numeric
            ELSE round(((COALESCE(lds.latest_day_total, (0)::bigint))::numeric / (COALESCE(lt.latest_target, 0))::numeric), 4)
        END AS latest_day_sales_target_ratio,
    l."latestRecordDate"
   FROM ((((live_model l
     LEFT JOIN latest_targets lt ON (((l."liveId")::text = (lt."liveId")::text)))
     LEFT JOIN total_targets tt ON (((l."liveId")::text = (tt."liveId")::text)))
     LEFT JOIN latest_sales ls ON (((l."liveId")::text = (ls."liveId")::text)))
     LEFT JOIN latest_day_sales lds ON (((l."liveId")::text = (lds."liveId")::text)))
  WHERE ((l."isLive" = true) AND (l.category <> '콘서트'::text))
  ORDER BY l."liveId";

-- View: public.view_play_overall_revenue_analysis_by_category
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_overall_revenue_analysis_by_category;

-- Create view
CREATE OR REPLACE VIEW public.view_play_overall_revenue_analysis_by_category AS
 WITH category_stats AS (
         SELECT v.category,
            sum(v.total_sales) AS sum_total_sales,
            sum(v.total_target) AS sum_total_target,
            sum(v.latest_day_sales) AS sum_latest_day_sales,
            sum(v.latest_day_target) AS sum_latest_day_target
           FROM view_play_overall_revenue_analysis v
          GROUP BY v.category
        ), total_stats AS (
         SELECT '총합'::text AS category,
            sum(v.total_sales) AS sum_total_sales,
            sum(v.total_target) AS sum_total_target,
            sum(v.latest_day_sales) AS sum_latest_day_sales,
            sum(v.latest_day_target) AS sum_latest_day_target
           FROM view_play_overall_revenue_analysis v
        ), combined_stats AS (
         SELECT cs.category,
            cs.sum_total_sales AS total_sales,
            cs.sum_total_target AS total_target,
                CASE
                    WHEN (cs.sum_total_target = (0)::numeric) THEN NULL::numeric
                    ELSE round((cs.sum_total_sales / cs.sum_total_target), 4)
                END AS total_sales_target_ratio,
            cs.sum_latest_day_sales AS latest_day_sales,
            cs.sum_latest_day_target AS latest_day_target,
                CASE
                    WHEN (cs.sum_latest_day_target = 0) THEN NULL::numeric
                    ELSE round((cs.sum_latest_day_sales / (cs.sum_latest_day_target)::numeric), 4)
                END AS latest_day_sales_target_ratio,
            0 AS sort_order
           FROM category_stats cs
        UNION ALL
         SELECT ts.category,
            ts.sum_total_sales AS total_sales,
            ts.sum_total_target AS total_target,
                CASE
                    WHEN (ts.sum_total_target = (0)::numeric) THEN NULL::numeric
                    ELSE round((ts.sum_total_sales / ts.sum_total_target), 4)
                END AS total_sales_target_ratio,
            ts.sum_latest_day_sales AS latest_day_sales,
            ts.sum_latest_day_target AS latest_day_target,
                CASE
                    WHEN (ts.sum_latest_day_target = 0) THEN NULL::numeric
                    ELSE round((ts.sum_latest_day_sales / (ts.sum_latest_day_target)::numeric), 4)
                END AS latest_day_sales_target_ratio,
            1 AS sort_order
           FROM total_stats ts
        )
 SELECT combined_stats.category,
    combined_stats.total_sales,
    combined_stats.total_target,
    combined_stats.total_sales_target_ratio,
    combined_stats.latest_day_sales,
    combined_stats.latest_day_target,
    combined_stats.latest_day_sales_target_ratio
   FROM combined_stats
  ORDER BY combined_stats.sort_order, combined_stats.category;

-- View: public.view_play_overall_share
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_overall_share;

-- Create view
CREATE OR REPLACE VIEW public.view_play_overall_share AS
 SELECT a."liveId",
    a."liveName",
    a."targetShare",
    round(avg(b."depositShare"), 1) AS depositshare,
    round(avg(b."paidShare"), 1) AS paidshare,
    (round(avg(b."paidShare"), 1) - round(avg(b."depositShare"), 1)) AS nodepositshare
   FROM (live_model a
     LEFT JOIN play_show_sale_model b ON (((a."latestRecordDate" = b."recordDate") AND ((a."liveId")::text = (b."liveId")::text))))
  WHERE ((a."isLive" = true) AND (a.category <> '콘서트'::text))
  GROUP BY a."liveId", a."liveName", a."targetShare";

-- View: public.view_play_overall_share_future
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_overall_share_future;

-- Create view
CREATE OR REPLACE VIEW public.view_play_overall_share_future AS
 SELECT a."liveId",
    a."liveName",
    a."targetShare",
    avg(b."depositShare") AS avg_share
   FROM (live_model a
     LEFT JOIN play_show_sale_model b ON (((a."latestRecordDate" = b."recordDate") AND ((a."liveId")::text = (b."liveId")::text))))
  WHERE ((b."showDateTime" >= (a."latestRecordDate" + '1 day'::interval)) AND (a."isLive" = true) AND (a.category <> '콘서트'::text))
  GROUP BY a."liveId", a."liveName", a."targetShare";

-- View: public.view_play_overall_share_past
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_overall_share_past;

-- Create view
CREATE OR REPLACE VIEW public.view_play_overall_share_past AS
 SELECT a."liveId",
    a."liveName",
    a."targetShare",
    avg(b."depositShare") AS avg_share
   FROM (live_model a
     LEFT JOIN play_show_sale_model b ON (((a."latestRecordDate" = b."recordDate") AND ((a."liveId")::text = (b."liveId")::text))))
  WHERE ((b."showDateTime" < (a."latestRecordDate" + '1 day'::interval)) AND (a."isLive" = true) AND (a.category <> '콘서트'::text))
  GROUP BY a."liveId", a."liveName", a."targetShare";

-- View: public.view_play_revenue_by_cast
-- Drop view if exists
DROP VIEW IF EXISTS public.view_play_revenue_by_cast;

-- Create view
CREATE OR REPLACE VIEW public.view_play_revenue_by_cast AS
 SELECT a."liveId",
    b."liveName",
    a."cast",
    sum(a."paidSeatSales") AS totalpaidseatsales,
    count(*) AS showcount
   FROM (play_show_sale_model a
     JOIN live_model b ON ((((a."liveId")::text = (b."liveId")::text) AND (a."recordDate" = b."latestRecordDate"))))
  WHERE (b.category <> '콘서트'::text)
  GROUP BY a."liveId", b."liveName", a."cast"
  ORDER BY (sum(a."paidSeatSales")) DESC;

-- View: public.view_respective_overall_data
-- Drop view if exists
DROP VIEW IF EXISTS public.view_respective_overall_data;

-- Create view
CREATE OR REPLACE VIEW public.view_respective_overall_data AS
 SELECT a."liveId",
    a."liveName",
    a."latestRecordDate" AS "recordDate",
    b."salesDate",
    ((b."salesDate" - ((((EXTRACT(dow FROM b."salesDate"))::integer - 1))::double precision * '1 day'::interval)))::date AS week_start_date,
    b.sales,
    sum(b.sales) OVER (PARTITION BY a."liveId" ORDER BY b."salesDate" ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "accTicketSales",
    c.target,
    sum(c.target) OVER (PARTITION BY a."liveId" ORDER BY b."salesDate" ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "accTarget"
   FROM ((live_model a
     LEFT JOIN play_ticket_sale_model b ON ((((a."liveId")::text = (b."liveId")::text) AND (a."latestRecordDate" = b."recordDate"))))
     LEFT JOIN daily_target_model c ON ((((b."liveId")::text = (c."liveId")::text) AND (b."salesDate" = c.date))))
  WHERE ((a."isLive" = true) AND (a.category <> '콘서트'::text))
  ORDER BY a."liveId", b."salesDate";

-- View: public.view_respective_weekly_data
-- Drop view if exists
DROP VIEW IF EXISTS public.view_respective_weekly_data;

-- Create view
CREATE OR REPLACE VIEW public.view_respective_weekly_data AS
 SELECT a."liveId",
    a."liveName",
        CASE
            WHEN (EXTRACT(dow FROM b."salesDate") = (0)::numeric) THEN ((b."salesDate" - ((6)::double precision * '1 day'::interval)))::date
            ELSE ((b."salesDate" - (((EXTRACT(dow FROM b."salesDate") - (1)::numeric))::double precision * '1 day'::interval)))::date
        END AS week_start_date,
    sum(b.sales) AS weekly_sales,
    sum(c.target) AS weekly_target_sales,
        CASE
            WHEN (sum(c.target) > 0) THEN (((sum(b.sales))::numeric / (sum(c.target))::numeric))::numeric(10,4)
            ELSE NULL::numeric
        END AS weekly_achievement_rate,
    d."salesMarketing",
    d.promotion,
    d.etc
   FROM (((live_model a
     LEFT JOIN play_ticket_sale_model b ON ((((a."liveId")::text = (b."liveId")::text) AND (a."latestRecordDate" = b."recordDate"))))
     LEFT JOIN daily_target_model c ON ((((b."liveId")::text = (c."liveId")::text) AND (b."salesDate" = c.date))))
     LEFT JOIN weekly_marketing_calendar_model d ON ((((a."liveId")::text = (d."liveId")::text) AND (
        CASE
            WHEN (EXTRACT(dow FROM b."salesDate") = (0)::numeric) THEN ((b."salesDate" - ((6)::double precision * '1 day'::interval)))::date
            ELSE ((b."salesDate" - (((EXTRACT(dow FROM b."salesDate") - (1)::numeric))::double precision * '1 day'::interval)))::date
        END =
        CASE
            WHEN (EXTRACT(dow FROM d."weekStartDate") = (0)::numeric) THEN ((d."weekStartDate" - ((6)::double precision * '1 day'::interval)))::date
            ELSE ((d."weekStartDate" - (((EXTRACT(dow FROM d."weekStartDate") - (1)::numeric))::double precision * '1 day'::interval)))::date
        END))))
  WHERE ((a."isLive" = true) AND (a.category <> '콘서트'::text))
  GROUP BY a."liveId", a."liveName",
        CASE
            WHEN (EXTRACT(dow FROM b."salesDate") = (0)::numeric) THEN ((b."salesDate" - ((6)::double precision * '1 day'::interval)))::date
            ELSE ((b."salesDate" - (((EXTRACT(dow FROM b."salesDate") - (1)::numeric))::double precision * '1 day'::interval)))::date
        END, d."salesMarketing", d.promotion, d.etc
  ORDER BY a."liveId",
        CASE
            WHEN (EXTRACT(dow FROM b."salesDate") = (0)::numeric) THEN ((b."salesDate" - ((6)::double precision * '1 day'::interval)))::date
            ELSE ((b."salesDate" - (((EXTRACT(dow FROM b."salesDate") - (1)::numeric))::double precision * '1 day'::interval)))::date
        END;

-- View: public.view_showdateinfo_over_recorddate
-- Drop view if exists
DROP VIEW IF EXISTS public.view_showdateinfo_over_recorddate;

-- Create view
CREATE OR REPLACE VIEW public.view_showdateinfo_over_recorddate AS
 SELECT a."liveId",
    a."liveName",
    p."recordDate",
    p."showDateTime",
    date(p."showDateTime") AS showdate,
    p."paidSeatTot" AS total_ticket_no,
    p."paidShare" AS paid_rate,
    p."paidSeatSales" AS total_ticket_amount,
        CASE
            WHEN (p."paidSeatTot" = 0) THEN (0)::numeric
            ELSE round(((p."paidSeatSales")::numeric / (p."paidSeatTot")::numeric), 1)
        END AS avg_ticket_price
   FROM (live_model a
     LEFT JOIN play_show_sale_model p ON ((((a."liveId")::text = (p."liveId")::text) AND (a."latestRecordDate" = p."recordDate"))))
  WHERE (a."isLive" = true)
  ORDER BY a."liveId", p."showDateTime";

-- View: public.view_target_sales
-- Drop view if exists
DROP VIEW IF EXISTS public.view_target_sales;

-- Create view
CREATE OR REPLACE VIEW public.view_target_sales AS
 WITH target_sales AS (
         SELECT dt."liveId",
            sum(dt.target) AS total_target_sales
           FROM daily_target_model dt
          GROUP BY dt."liveId"
        )
 SELECT l."liveId",
    l."liveName",
    COALESCE(ts.total_target_sales, (0)::bigint) AS total_target_sales
   FROM (live_model l
     LEFT JOIN target_sales ts ON (((l."liveId")::text = (ts."liveId")::text)))
  WHERE (l."isLive" = true)
  ORDER BY l."liveId";

-- View: public.view_weekinfo_over_recorddate
-- Drop view if exists
DROP VIEW IF EXISTS public.view_weekinfo_over_recorddate;

-- Create view
CREATE OR REPLACE VIEW public.view_weekinfo_over_recorddate AS
 SELECT a."liveId",
    a."liveName",
    a."showTotalSeatNumber",
    (date_trunc('week'::text, p."showDateTime"))::date AS weekly,
    p."recordDate",
    count(p."showDateTime") AS weekly_no_of_show,
    (a."showTotalSeatNumber" * count(p."showDateTime")) AS weekly_max_sell_seat,
    avg(p."paidShare") AS paid_rate,
    sum(p."paidSeatTot") AS total_ticket_no,
    sum(p."paidSeatSales") AS total_ticket_amount,
    avg(
        CASE
            WHEN (p."paidSeatTot" = 0) THEN (0)::numeric
            ELSE round(((p."paidSeatSales")::numeric / (p."paidSeatTot")::numeric), 1)
        END) AS avg_ticket_price
   FROM (live_model a
     LEFT JOIN play_show_sale_model p ON ((((a."liveId")::text = (p."liveId")::text) AND (p."recordDate" = a."latestRecordDate"))))
  WHERE ((a."isLive" = true) AND (a.category <> '콘서트'::text))
  GROUP BY a."liveId", a."liveName", a."showTotalSeatNumber", ((date_trunc('week'::text, p."showDateTime"))::date), p."recordDate"
  ORDER BY a."liveId", ((date_trunc('week'::text, p."showDateTime"))::date);

-- View: public.view_weekinfo_over_recorddate_overall
-- Drop view if exists
DROP VIEW IF EXISTS public.view_weekinfo_over_recorddate_overall;

-- Create view
CREATE OR REPLACE VIEW public.view_weekinfo_over_recorddate_overall AS
 SELECT view_weekinfo_over_recorddate.weekly,
    view_weekinfo_over_recorddate."recordDate",
    sum(view_weekinfo_over_recorddate.weekly_max_sell_seat) AS weekly_max_sell_seat,
    sum(view_weekinfo_over_recorddate.total_ticket_no) AS total_ticket_no
   FROM view_weekinfo_over_recorddate
  GROUP BY view_weekinfo_over_recorddate.weekly, view_weekinfo_over_recorddate."recordDate"
  ORDER BY view_weekinfo_over_recorddate.weekly, view_weekinfo_over_recorddate."recordDate";

