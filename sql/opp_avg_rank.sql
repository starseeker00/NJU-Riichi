SELECT uid,
    name,
    round(1.* sum(rank_sum) / sum(rank_count), 2) AS opp_avg_rank
FROM (
        SELECT r1.user_id uid,
            r1.username name,
            r2.user_id opp_uid,
            r2.username opp_name
        FROM RecordDetail r1,
            RecordDetail r2
        WHERE r1.uuid = r2.uuid
            AND name <> opp_name
        GROUP BY uid,
            name,
            opp_uid,
            opp_name
    ) AS t1
    JOIN (
        SELECT user_id,
            sum(rank) AS rank_sum,
            count(rank) AS rank_count
        FROM RecordDetail
        GROUP BY user_id
    ) AS t2 ON t1.opp_uid = t2.user_id
GROUP BY uid,
    name
