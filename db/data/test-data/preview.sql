\c nc_news_test;


    SELECT
      c.article_id,
      c.votes,
      c.created_at,
      c.author,
      c.body,
      c.comment_id
    FROM
      comments c
    WHERE
      c.article_id = 1
    ORDER BY
      c.created_at




-- SELECT 
--     a.article_id,
--     CASE 
--         WHEN COUNT(c.comment_id) > 0 THEN 'Has Comments'
--         ELSE 'No Comments'
--     END AS comment_status
-- FROM 
--     articles a
-- LEFT JOIN 
--     comments c
-- ON 
--     a.article_id = c.article_id
-- WHERE 
--     a.article_id = 2
-- GROUP BY 
--     a.article_id;



--   SELECT
--     a.author,
--     a.title,
--     a.article_id,
--     a.topic,
--     a.created_at,
--     a.votes,
--     a.article_img_url,
--     COUNT(c.comment_id) AS comment_count
-- FROM
--     articles a
-- LEFT JOIN
--     comments c
-- ON
--     a.article_id = c.article_id
-- GROUP BY
--     a.article_id
-- ORDER BY
--     a.created_at DESC;