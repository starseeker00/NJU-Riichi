const fs = require('fs');
const protobuf = require("protobufjs");
const { createMajsoulConnection } = require("./majsoul");

const pbDef = JSON.parse(fs.readFileSync('data/proto/liqi.json', 'utf8'));
const pb = protobuf.Root.fromJSON(pbDef)
const decoder = pb.nested.lq.Wrapper


// method name
".lq.Lobby.fetchCustomizedContestByContestId"
".lq.Lobby.fetchCustomizedContestGameRecords"
".lq.Lobby.fetchGameRecord"

const fetchContestRecordIds = async (conn, contest_id, lastime = 0) => {
    const contest = await conn.rpcCall(".lq.Lobby.fetchCustomizedContestByContestId",
        {
            contest_id,
            lang: 'chs_t',
        })
    // fs.writeFileSync(`data/Contests/${contest_id}.json`, JSON.stringify(contest, null, 2))
    const unique_id = contest.contest_info.unique_id

    const contest_detail = await conn.rpcCall(".lq.Lobby.enterCustomizedContest",
        {
            unique_id,
            lang: 'chs_t',
        }
    )
    const { contest_name, start_time, finish_time, rank_rule, private_notice } = contest_detail.detail_info

    const sql = `INSERT OR REPLACE INTO Contests (contest_id, name, nickname, start_time, finish_time, rule, description ) VALUES (${unique_id}, '${contest_name}', '${contest_name}', ${start_time}, ${finish_time}, ${rank_rule}, '${private_notice}');`
    fs.writeFileSync(`sql/init-${contest_id}.sql`, sql)

    let uuids = []
    let first_time, last_index;
    while (true) {
        const gameRecords = await conn.rpcCall(".lq.Lobby.fetchCustomizedContestGameRecords",
            {
                unique_id,
                last_index,
            }
        )
        last_index = gameRecords.next_index

        if (!first_time && gameRecords.record_list.length)
            first_time = gameRecords.record_list[0].end_time

        for (const record of gameRecords.record_list) {
            if (record.end_time > lastime) {
                uuids.push(record.uuid)
            } else {
                return { first_time, uuids }
            }
        }
        if (!last_index) {
            return { first_time, uuids }
        }
    }
}

const analyzeGameRecord = async (conn, contest_id, game_uuid, remark) => {
    const game_record = await conn.rpcCall(".lq.Lobby.fetchGameRecord", { game_uuid })
    dump_json_record(game_record, contest_id, game_uuid)
    return decodeGameRecord(conn._codec._wrapper, game_record, schedule, remark)
}

function decodeMessage(decoder, str, methodName) {
    const buf = Buffer.from(str, 'base64');
    const st = buf.findIndex((byte) => byte === 0x0A)
    const msg = decoder.decode(buf.slice(st))

    function lookupMethod(path) {
        if (typeof path === "string") {
            path = path.split(".");
        }
        if (0 === path.length) {
            return null;
        }
        const service = pb.lookupService(path.slice(0, -1));
        if (!service) {
            return null;
        }
        const name = path[path.length - 1];
        return service.methods[name];
    }

    // console.log(msg)
    let typeObj;
    if (msg.name) {
        if (/Lobby/.test(msg.name)) {
            const methodObj = lookupMethod(msg.name);
            const typeName = methodObj.requestType;
            typeObj = methodObj.parent.parent.lookupType(typeName);
        } else {
            typeObj = pb.lookupType(msg.name.split('.'));
        }
    } else if (methodName) {
        const methodObj = lookupMethod(methodName);
        const typeName = methodObj.responseType;
        typeObj = methodObj.parent.parent.lookupType(typeName);
    }

    const res = {
        name: msg.name ? msg.name : methodName,
        data: typeObj ? typeObj.decode(msg.data) : msg.data
    }

    // console.log(res)
    return res
}

function decodeGameRecord(decoder, game, schedule, remark) {
    const head = game.head
    const basic = {
        uuid: head.uuid,
        schedule,
        remark,
        contest_id: head.config.meta.contest_uid,
        end_time: head.end_time,
        ju_list: [''],
    }

    const game_detail = decodeMessage(decoder, game.data).data

    let result = Array.from({ length: 4 }, (_, idx) => ({
        uuid: head.uuid,
        user_id: head.accounts[idx].account_id,
        username: head.accounts[idx].nickname,
        seat: idx,
        score: head.result.players.find((player) => player.seat === idx).part_point_1,
        accuracy: head.result.players.find((player) => player.seat === idx).total_point,
        rank: head.result.players.findIndex((player) => player.seat === idx) + 1,
        lizhi: 0,
        zhuili: 0,
        zhenli: 0,
        ura: 0,
        fulu: 0,
        hule: 0,
        zimo: 0,
        zhenting: 0,
        dadian: 0,
        dama: 0,
        houfu: 0,
        chong: 0,
        score_list: [],
        tags: new Set(),
    }))

    let current_seat = 0
    let liqi = false
    let fulu = [false, false, false, false]
    let houfu = [false, false, false, false]
    let zhenting = [false, false, false, false]

    function processData(res) {
        switch (res.name) {
            case '.lq.RecordNewRound': {
                const score = res.data.scores
                for (let i = 0; i < 4; i++) {
                    result[i].score_list.push(score[i])
                }

                const chang = res.data.chang === 0 ? '东' : '南'
                const ju = res.data.ju + 1
                const ben = res.data.ben
                basic.ju_list.push(`${chang}${ju}局${ben}本场`)
                break
            }
            case ".lq.RecordChiPengGang": {
                const seat = res.data.seat
                // type==0是吃，1是碰，2是杠
                fulu[seat] = true
                break
            }
            case ".lq.RecordDiscardTile": {
                const seat = res.data.seat
                zhenting[seat] = res.data.zhenting[seat]

                if (res.data.is_liqi || res.data.is_wliqi) {
                    result[seat].lizhi += 1
                    if (res.data.is_wliqi) {
                        result[seat].tags.add('w立直')
                    }

                    if (liqi) {
                        result[seat].zhuili += 1
                    }
                    if (zhenting[seat]) {
                        result[seat].zhenli += 1
                    }
                    liqi = true
                }

                if (res.data.tingpais.length) {
                    houfu[seat] = fulu[seat] && !res.data.tingpais.every((ting) => (ting.haveyi))
                }

                current_seat = seat
                break
            }
            case ".lq.RecordHule": {
                for (const info of res.data.hules) {
                    const hu_seat = info.seat

                    result[hu_seat].hule += 1
                    result[hu_seat].dadian += info.dadian

                    if (!info.liqi && info.ming.every((ming) => ming.startsWith('angang'))) {
                        result[hu_seat].dama += 1
                    }
                    if (houfu[hu_seat]) {
                        result[hu_seat].houfu += 1
                    }
                    if (info.zimo) {
                        result[hu_seat].zimo += 1
                        if (zhenting[hu_seat]) {
                            result[hu_seat].zhenting += 1
                        }
                    }
                    if (!info.zimo) {
                        result[current_seat].chong += 1
                    }

                    // fans:
                    // 1: 门清
                    // 2: 立直
                    // 4: 岭上开花
                    // 13: 一杯口
                    // 14: 平和
                    // 30: 一发
                    // 31: 宝牌
                    // 32: 赤宝牌
                    // 33: 里宝牌
                    if (info.liqi) {
                        const ippatsu = info.fans.some((fan) => fan.id === 30)
                        const ura = info.fans.find((fan) => fan.id === 33)?.val

                        if (ura) {
                            result[hu_seat].ura += 1
                        }

                        if (ippatsu && info.zimo && ura >= 3) {
                            result[hu_seat].tags.add('立一摸里三')
                        } else {
                            if (ippatsu && info.zimo) {
                                result[hu_seat].tags.add('立一摸')
                            }
                            if (ura >= 3) {
                                result[hu_seat].tags.add('里三')
                            }
                        }
                    }
                    if (info.fans.some((fan) => fan.id === 4)) {
                        result[hu_seat].tags.add('岭上开花')
                    }
                    if (info.yiman) {
                        result[hu_seat].tags.add('役满')
                    }
                    if (info.ming.length === 4) {
                        result[hu_seat].tags.add('大吊车')
                    }
                }
                roundEnd()
                break
            }
            case '.lq.RecordNoTile': {
                roundEnd()
                break
            }
        }

        function roundEnd() {
            liqi = false
            for (let i = 0; i < 4; i++) {
                if (fulu[i]) {
                    result[i].fulu += 1
                    fulu[i] = false
                }
            }
        }
    }

    // console.time('decode')
    game_detail.actions.forEach((act) => {
        if (act.result) {
            const res = decodeMessage(decoder, act.result)
            processData(res)
        }
    })
    // console.timeEnd('decode')

    for (const player of result) {
        player.score_list.push(player.score)
        if (player.hule === 0) {
            player.tags.add('烧鸡')
        }
    }

    // console.log(result)
    return { basic, result }
}

function load_json_record(contest_id, uuid) {
    return JSON.parse(fs.readFileSync(`data/GameRecord/${contest_id}/${uuid}.json`, 'utf8'));
}

function dump_json_record(record, contest_id, uuid) {
    fs.writeFileSync(`data/GameRecord/${contest_id}/${uuid}.json`, JSON.stringify(record, null, 2));
}

function toGameRecordSql(basic) {
    const { uuid, schedule, remark, contest_id, end_time, ju_list } = basic

    const sql = `INSERT OR REPLACE INTO GameRecords (uuid,${schedule ? ' schedule,' : ''}${remark ? ' remark,' : ''} contest_id, end_time, ju_list) VALUES ('${uuid}',` +
        (schedule ? ` ${schedule},` : '') +
        (remark ? ` '${remark}',` : '') +
        ` ${contest_id}, ${end_time}, '${ju_list.join(',')}');`
    // console.log(sql)
    return sql
}

function toRecordDetailSql(result) {
    const sqls = []
    for (const player of result) {
        const { uuid, user_id, username, seat, score, accuracy, rank, lizhi, zhuili, zhenli, ura, fulu, hule, zimo, zhenting, dadian, dama, houfu, chong, score_list, tags } = player

        const sql = `INSERT OR REPLACE INTO RecordDetail (uuid, user_id, username, seat, score, accuracy, rank, lizhi, zhuili, zhenli, ura, fulu, hule, zimo, zhenting, dadian, dama, houfu, chong, matchs, score_list, tags) VALUES ('${uuid}', ${user_id}, '${username}', ${seat}, ${score}, ${accuracy}, ${rank}, ${lizhi}, ${zhuili}, ${zhenli}, ${ura}, ${fulu}, ${hule}, ${zimo}, ${zhenting}, ${dadian}, ${dama}, ${houfu}, ${chong}, ${score_list.length}, '${score_list.join(',')}', '${Array.from(tags).join(',')}');`
        // console.log(sql)
        sqls.push(sql)
    }
    return sqls
}

async function onlineUpdate(contest_id, schedule, remark) {
    const conn = await createMajsoulConnection()

    if (!fs.existsSync(`data/GameRecord/${contest_id}/lastime.txt`)) {
        fs.mkdirSync(`data/GameRecord/${contest_id}`, { recursive: true })
        fs.writeFileSync(`data/GameRecord/${contest_id}/lastime.txt`, '0')
    }
    const lastime = fs.readFileSync(`data/GameRecord/${contest_id}/lastime.txt`, 'utf8')
    console.log('last time update: ', new Date(lastime * 1000))
    const { first_time, uuids } = await fetchContestRecordIds(conn, contest_id, lastime)
    console.log('get uuids:', uuids.length)
    // console.log(uuids)

    let sqls = [`\n-- till ${first_time} (${new Date(first_time * 1000)})`];
    let index = 0;
    let updating = false;

    const intervalId = setInterval(async () => {
        if (index >= uuids.length) {
            clearInterval(intervalId);
            fs.appendFileSync(`sql/update-${contest_id}.sql`, sqls.join('\n'));
            fs.writeFileSync(`sql/update.sql`, sqls.join('\n'));
            fs.writeFileSync(`data/GameRecord/${contest_id}/lastime.txt`, String(first_time));
            console.log('done: ', new Date(first_time * 1000));
            conn.close()
            return;
        }
        if (!updating) {
            updating = true;
            const game_uuid = uuids[index];
            console.log(`[${index + 1}/${uuids.length}] ${game_uuid}`);
            const { basic, result } = await analyzeGameRecord(conn, contest_id, game_uuid, schedule, remark);
            sqls.push(toGameRecordSql(basic));
            sqls.push(...toRecordDetailSql(result));
            index++;
            updating = false;
        }
    }, 500);
}

function analyzeGameRecordFromFiles(contest_id, schedule) {
    const uuids = fs.readdirSync(`data/GameRecord/${contest_id}`)

    let sqls = [`-- refresh on ${new Date()}`]
    for (const uuid of uuids) {
        if (uuid.endsWith('.json')) {
            const game = load_json_record(contest_id, uuid.replace('.json', ''))
            const { basic, result } = decodeGameRecord(decoder, game, schedule)
            sqls.push(toGameRecordSql(basic))
            sqls.push(...toRecordDetailSql(result))
        }
    }
    fs.writeFileSync(`sql/update-${contest_id}.sql`, sqls.join('\n'))
    fs.writeFileSync(`sql/update.sql`, sqls.join('\n'))
}

// const contest_id = 971695
const contest_id = 253826
onlineUpdate(contest_id, 2, '32进16')
// analyzeGameRecordFromFiles(contest_id)

// const res = decodeMessage(decoder,
//     "AwwDCgASlgQSgwQIuKL0BxCvpzsaIOesrDEy5bGKTkpV6bq75bCG6IGU6LWb6K6t57uD5Zy6IAIo7rA1MMubtLQGOLCwtLQGQIX90LYGSABQAVraAQgCMtEBCAUQFBgDIAEoqMMBMLDqATgBQABI6AdQrAJY6Adg3AtouBdwAXgAgAEBiAEBkAEAmAEBoAEBqAEBsAEBuAEBwAEByAEA0AEA2AEB4AEB6AEB8AEB+AEBgAIBiAKowwGQAgWYAvv//////////wGgAvH//////////wGoAgGwAgC4AgDAAgDIAgHQAgDYAgDgAgDoAgDwAgD4AgCAAwCIAwCQAwCYAwCgAwCoAwCwAwDgAwDwAwD4AwCABACIBACQBACYBACgBACoBACwBAC4BABCAggAYsYB5pys5q+U6LWb5Zy65piv56ysMTLlsYpOSlXpurvlsIbogZTotZso5Liq5Lq66LWbKeOAkOiuree7g+eUqOOAkeavlOi1m+Wcuu+8jOS7heeUqOS6juaooeaLn+avlOi1m+OAggror7flkITkvY3nvqTlj4vlj4LkuI7mr5TotZvml7bms6jmhI/kuI3opoHlnKjmraTov5vooYzmr5TotZvlh4blpIfvvIzku6XlhY3plJnov4fmraPlvI/mr5TotZvvvIEKaACIAbCwtLQGkAGF/dC2BpgBAqABARoICAEQABgAKAAgASgAMAA="
//     , ".lq.Lobby.enterCustomizedContest")
// console.log(res)
// const { basic, result } = decodeGameRecord(decoder, load_json_record(253826, '240810-c242f796-8d8d-4dde-ab7a-cfae2b845518'))
// console.log(basic, result)