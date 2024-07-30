
export default {
	async fetch(request, env) {
		const db = env.DB;
		const { pathname, searchParams } = new URL(request.url);

		if (pathname.startsWith('/api/')) {
			let data = {};
			switch (pathname) {
				case '/api/getContestList': {
					data = await getContestList(db);
					break;
				}
				case '/api/getLatestRecordTime': {
					const contestId = Number(searchParams.get('contestId') || 1);
					data = await getLatestRecordTime(db, contestId);
					break;
				}
				case '/api/getGameRecordListByPage': {
					// const pageIndex = Number(searchParams.get('pageIndex') || 1);
					// const pageSize = Number(searchParams.get('pageSize') || 10);
					const contestId = Number(searchParams.get('contestId') || 1);
					data = await getGameRecordListByPage(db, contestId);
					break;
				}
				case '/api/getGameRecordDetail': {
					const uuid = searchParams.get('uuid') || '';
					data = await getGameRecordDetail(db, uuid);
					break;
				}
				case '/api/getContestPlayerList': {
					const contestId = Number(searchParams.get('contestId') || 1);
					data = await getContestPlayerList(db, contestId);
					break;
				}
			}

			return new Response(JSON.stringify(data), {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Content-Type": "application/json",
				}
			});

		}
		// Otherwise, serve the static assets.
		// Without this, the Worker will error and no assets will be served.
		return env.ASSETS.fetch(request);
	}
}

async function getContestList(db) {
	const records = await db.prepare("SELECT * FROM Contests").all();
	return records.results;
}

async function getLatestRecordTime(db, contestId) {
	const records = await db.prepare("SELECT MAX(finish_time) as latest_time FROM GameRecords WHERE contest_id = ?")
		.bind(contestId)
		.first();
	return records?.latest_time || 0;
}

async function getGameRecordListByPage(db, contestId) {
	const records = await db.prepare("\
SELECT * \
FROM GameRecords, \
(SELECT uuid, group_concat(tags) as tags, \
  json_group_array( \
   json_object( \
    'user_id', user_id, \
    'username', username, \
    'seat', seat, \
    'rank', rank, \
    'score', score, \
	'accuracy', accuracy\
   ) \
  ) AS data \
 FROM RecordDetail \
 GROUP BY uuid \
) as rd \
WHERE GameRecords.uuid=rd.uuid AND GameRecords.contest_id = ? \
ORDER BY GameRecords.end_time DESC \
")
		.bind(contestId)
		.all();
	return records.results;
}

async function getGameRecordDetail(db, uuid) {
	const records = await db.prepare("\
SELECT * \
FROM GameRecords, RecordDetail \
WHERE GameRecords.uuid = RecordDetail.uuid AND GameRecords.uuid = ?\
")
		.bind(uuid)
		.all();
	return records.results
}

async function getContestPlayerList(db, contestId) {
	const records = await db.prepare("\
SELECT \
 user_id, username, \
 ROUND(sum(accuracy)/1000., 1) as ttl_accuracy, \
 count(*) as ttl_match, \
 ROUND(AVG(rank),2) as avg_rank, \
 sum(dadian)/sum(hule) as avg_dadian, \
 ROUND(100.*sum(hule)/sum(matchs), 2) as pct_hu, \
 ROUND(100.*sum(zimo)/sum(hule), 2) as pct_zimo, \
 ROUND(100.*sum(chong)/sum(matchs), 2) as pct_chong, \
 ROUND(100.*sum(lizhi)/sum(matchs), 2) as pct_lizhi, \
 ROUND(100.*sum(fulu)/sum(matchs), 2) as pct_fulu, \
 ROUND(100.*sum(zhuili)/sum(lizhi), 2) as pct_zhuili, \
 ROUND(100.*sum(zhenli)/sum(lizhi), 2) as pct_zhenli, \
 ROUND(100.*sum(ura)/sum(lizhi), 2) as pct_ura, \
 ROUND(100.*sum(dama)/sum(hule), 2) as pct_dama, \
 ROUND(100.*sum(houfu)/sum(fulu), 2) as pct_houfu, \
 ROUND(100.*sum(zhenting)/sum(hule), 2) as pct_zhenting \
FROM GameRecords, RecordDetail \
WHERE GameRecords.uuid = RecordDetail.uuid AND GameRecords.contest_id = ? \
GROUP BY RecordDetail.user_id, RecordDetail.username \
ORDER BY ttl_accuracy DESC \
")
		.bind(contestId)
		.all();
	return records.results;
}