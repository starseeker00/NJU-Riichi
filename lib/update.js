const fs = require('fs');
const protobuf = require("protobufjs");
const { createMajsoulConnection } = require("./majsoul");

const pbDef = JSON.parse(fs.readFileSync('data/proto/liqi.json', 'utf8'));
const pb = protobuf.Root.fromJSON(pbDef)
const decoder = pb.nested.lq.Wrapper


// method name
".lq.Lobby.fetchCustomizedContestByContestId"
".lq.Lobby.enterCustomizedContest"
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
    // fs.writeFileSync(`data/Contests/${contest_id}_detail.json`, JSON.stringify(contest_detail, null, 2))
    const { contest_name, start_time, finish_time, rank_rule, private_notice } = contest_detail.detail_info
    const game_mode = contest_detail.detail_info.game_mode.mode

    const sql = `INSERT OR REPLACE INTO Contests (contest_id, name, nickname, start_time, finish_time, game_mode, rule, description ) VALUES (${unique_id}, '${contest_name}', '${contest_name}', ${start_time}, ${finish_time}, ${game_mode}, ${rank_rule}, '${private_notice}');`
    fs.writeFileSync(`sql/init-${contest_id}.sql`, sql)

    let uuids = []
    let first_time = 0, last_index;
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

const fetchGameRecord = async (conn, contest_id, game_uuid) => {
    const game_record = await conn.rpcCall(".lq.Lobby.fetchGameRecord", {
        game_uuid,
        client_version_string: conn.clientVersionString
    })
    dump_json_record(game_record, contest_id, game_uuid)
    return game_record
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

    // console.log(msg.name)
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
    if (game.error) {
        console.error(game.error)
        throw new Error('game record error')
    }

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
    const players_count = head.accounts.length
    const all_seat = head.config.mode.mode > 10 ? 3 : 4 // 三麻mode=12，四麻mode=2

    let result = Array.from({ length: players_count }, (_, idx) => ({
        uuid: head.uuid,
        user_id: head.accounts[idx].account_id,
        username: head.accounts[idx].nickname,
        seat: head.accounts[idx].seat || 0,
        score: head.result.players.find((player) => player.seat === (head.accounts[idx].seat || 0)).part_point_1,
        accuracy: head.result.players.find((player) => player.seat === (head.accounts[idx].seat || 0)).total_point,
        rank: head.result.players.findIndex((player) => player.seat === (head.accounts[idx].seat || 0)) + 1,
        lizhi: 0,
        zhuili: 0,
        zhenli: 0,
        ura: 0,
        fulu: 0,
        hule: 0,
        zimo: 0,
        zhenting: 0,
        dadian: 0,
        lizhihu: 0,
        fuluhu: 0,
        dama: 0,
        houfu: 0,
        chong: 0,
        score_list: [],
        tags: new Set(),
    }))

    const seated = result.map((player) => player.seat)
    for (let i = 0; i < all_seat; i++) {
        if (seated.includes(i)) continue
        result.push({
            uuid: head.uuid,
            user_id: 0,
            username: '电脑',
            seat: i,
            score: head.result.players.find((player) => player.seat === i).part_point_1,
            accuracy: head.result.players.find((player) => player.seat === i).total_point,
            rank: head.result.players.findIndex((player) => player.seat === i) + 1,
            lizhi: 0,
            zhuili: 0,
            zhenli: 0,
            ura: 0,
            fulu: 0,
            hule: 0,
            zimo: 0,
            zhenting: 0,
            dadian: 0,
            lizhihu: 0,
            fuluhu: 0,
            dama: 0,
            houfu: 0,
            chong: 0,
            score_list: [],
            tags: new Set(),
        })
    }

    result = result.sort((a, b) => a.seat - b.seat)

    let current_seat = 0
    let liqi = false
    let fulu = [false, false, false, false]
    let houfu = [false, false, false, false]
    let zhenting = [false, false, false, false]

    function processData(res) {
        switch (res.name) {
            case '.lq.RecordNewRound': {
                const score = res.data.scores
                for (let i = 0; i < all_seat; i++) {
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
                let chong = 0
                for (const info of res.data.hules) {
                    const hu_seat = info.seat

                    result[hu_seat].hule += 1
                    result[hu_seat].dadian += info.dadian

                    if (info.liqi) {
                        result[hu_seat].lizhihu += 1
                    } else if (fulu[hu_seat]) {
                        result[hu_seat].fuluhu += 1
                    } else {
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
                    if (!info.zimo) { chong++ }

                    const titleNames = ['',
                        '满贯', '跳满', '倍满', '三倍满', '役满',
                        '两倍役满', '三倍役满', '四倍役满', '五倍役满', '六倍役满',
                        '累计役满'
                    ]
                    const fanNames = ['', '门清', '立直', '枪杠', '岭上开花',
                        '海底摸月', '河底捞鱼', '白', '发', '中',
                        '自风', '场风', '断幺', '一杯口', '平和',
                        '混全', '一气', '三色同顺', 'w立直', '三同刻',
                        '三杠子', '对对和', '三暗刻', '小三元', '混老头',
                        '七对子', '纯全', '混一色', '两杯口', '清一色',
                        '一发', '宝牌', '赤宝牌', '里宝牌', '拔北宝牌',
                        '', '', '大三元', '四暗刻', '',
                        '', '清老头', '国士无双', '小四喜', '',
                        '九莲宝灯', '', '', '四暗刻单骑', '国士十三面',
                    ]
                    let critical = 0
                    if (info.title_id >= 3) {
                        critical = info.fans.filter((fan) => (fan.val > 1 && fan.id <= 30) || fan.id > 34).sort((a, b) => b.val - a.val)?.[0]?.id || 0
                        const doras = info.fans.filter((fan) => fan.id >= 31 && fan.id <= 34).map((fan) => fan.val).reduce((a, b) => a + b, 0)
                        const criticalName = critical
                            ? fanNames[critical] || `未知役${critical}`
                            : `Dora${doras}`
                        result[hu_seat].tags.add(`${titleNames[info.title_id] || `未知id${info.title_id}`}: ${criticalName}`);
                    }

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
                    // if (info.yiman) {
                    //     result[hu_seat].tags.add('役满')
                    // }
                    if (info.ming.length === 4) {
                        result[hu_seat].tags.add('大吊车')
                    }
                    const record = [3, 4, 5, 6, 18, 19, 20, 22, 23, 24, 26, 28, 29]
                    record.forEach((id) => {
                        if (id !== critical && info.fans.some((fan) => fan.id === id)) {
                            result[hu_seat].tags.add(fanNames[id])
                        }
                    })
                }
                if (chong) {
                    result[current_seat].chong += 1
                    if (chong > 1) {
                        result[current_seat].tags.add('一炮多响')
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
            for (let i = 0; i < all_seat; i++) {
                if (fulu[i]) {
                    result[i].fulu += 1
                    fulu[i] = false
                }
            }
        }
    }

    // console.time('decode')
    game_detail.actions.forEach((act) => {
        if (act.result && act.result.length) {
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
        const { uuid, user_id, username, seat, score, accuracy, rank, lizhi, zhuili, zhenli, ura, fulu, hule, zimo, zhenting, dadian, lizhihu, fuluhu, dama, houfu, chong, score_list, tags } = player

        const sql = `INSERT OR REPLACE INTO RecordDetail (uuid, user_id, username, seat, score, accuracy, rank, lizhi, zhuili, zhenli, ura, fulu, hule, zimo, zhenting, dadian, lizhihu, fuluhu, dama, houfu, chong, matchs, score_list, tags) VALUES ('${uuid}', ${user_id}, '${username}', ${seat}, ${score}, ${accuracy}, ${rank}, ${lizhi}, ${zhuili}, ${zhenli}, ${ura}, ${fulu}, ${hule}, ${zimo}, ${zhenting}, ${dadian}, ${lizhihu}, ${fuluhu}, ${dama}, ${houfu}, ${chong}, ${score_list.length}, '${score_list.join(',')}', '${Array.from(tags).join(',')}');`
        // console.log(sql)
        sqls.push(sql)
    }
    return sqls
}

function getDirectoryPath(contest_id) {
    const dirPath = `data/GameRecord/${contest_id}`;
    const filePath = `${dirPath}/lastime.txt`;

    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(filePath, '0');
    }

    return {
        dirPath,
        filePath,
    };
}

async function fetchAndAnalyzeGameRecord(conn, contest_id, scheduleMap) {
    console.log(`fetchAndAnalyzeGameRecord ${contest_id}`)

    const { filePath } = getDirectoryPath(contest_id);
    const lastime = parseInt(fs.readFileSync(filePath, 'utf8'));
    console.log('last time update: ', new Date(lastime * 1000).toLocaleString())

    const { first_time, uuids } = await fetchContestRecordIds(conn, contest_id, lastime)
    console.log('get uuids:', uuids.length)
    // console.log(uuids)

    return new Promise((resolve) => {
        let sqls = [`\n-- till ${first_time} (${new Date(first_time * 1000).toLocaleString()})`];
        let index = 0;
        let updating = false;

        const intervalId = setInterval(async () => {
            if (index >= uuids.length) {
                clearInterval(intervalId);
                fs.appendFileSync(`sql/update-${contest_id}.sql`, sqls.join('\n'));
                fs.writeFileSync(filePath, String(first_time));
                console.log('done: ', new Date(first_time * 1000).toLocaleString());
                resolve(sqls);
                return;
            }
            if (!updating) {
                updating = true;
                const game_uuid = uuids[index];
                console.log(`[${index + 1}/${uuids.length}] ${game_uuid}`);
                const game_record = await fetchGameRecord(conn, contest_id, game_uuid);
                const { schedule, remark } = scheduleMap(game_uuid)
                const { basic, result } = decodeGameRecord(conn._codec._wrapper, game_record, schedule, remark)
                sqls.push(toGameRecordSql(basic));
                sqls.push(...toRecordDetailSql(result));
                index++;
                updating = false;
            }
        }, 500);
    });
}

function analyzeGameRecordFromFiles(contest_id, scheduleMap) {
    console.log(`analyzeGameRecordFromFiles ${contest_id}`)

    const { dirPath } = getDirectoryPath(contest_id);
    const files = fs.readdirSync(dirPath);

    let sqls = [`-- refresh on ${new Date().toLocaleString()}`]
    for (const file of files) {
        if (file.endsWith('.json')) {
            const uuid = file.replace('.json', '')
            const game = load_json_record(contest_id, uuid)
            const { schedule, remark } = scheduleMap(uuid)
            const { basic, result } = decodeGameRecord(decoder, game, schedule, remark)
            sqls.push(toGameRecordSql(basic))
            sqls.push(...toRecordDetailSql(result))
        }
    }
    fs.writeFileSync(`sql/update-${contest_id}.sql`, sqls.join('\n'))
    return sqls
}

// const contest_list = [971695, 253826, 280319, 130289, 942116]
const watch_list = [130289, 942116, 908924, 337814]

const schedule_971695 = (uuid) => {
    return { schedule: 1, remark: '自由匹配' }
}

const schedule_253826 = (uuid) => {
    if (uuid.substring(0, 6) < '240812') return { schedule: 1, remark: '' }
    if (uuid.substring(0, 6) < '240814') return { schedule: 2, remark: '32进16' }
    if (uuid.substring(0, 6) < '240816') return { schedule: 2, remark: '16进8' }
    if (uuid.substring(0, 6) < '240817') return { schedule: 2, remark: '半决赛' }
}

const schedule_280319 = (uuid) => {
    if (uuid.substring(0, 6) < '240816') return { schedule: 0, remark: '' }
    if (uuid.substring(0, 6) < '240820') return { schedule: 1, remark: '初赛' }
    if (uuid.substring(0, 6) < '240822') return { schedule: 2, remark: '复赛' }
    if (uuid.substring(0, 6) < '240824') return { schedule: 2, remark: '决赛' }
}

const schedule_130289 = (uuid) => {
    return { schedule: 1, remark: 'DUEL!!' }
}

const schedule_942116 = (uuid) => {
    return { schedule: 1, remark: 'Aschente!!' }
}

const schedule_908924 = (uuid) => {
    // if (uuid.substring(0, 6) < '241013') return { schedule: 0, remark: '' }
    // return { schedule: 1, remark: '正赛' }
    if (uuid.substring(0, 6) < '241116') return { schedule: -1, remark: '' }
    return { schedule: 1, remark: '训练赛' }
}

const schedule_337814 = (uuid) => {
    if (uuid.substring(0, 6) < '241117') return { schedule: -1, remark: '' }
    return { schedule: 1, remark: '常规赛' }
}

const schedule_map = {
    971695: schedule_971695,
    253826: schedule_253826,
    280319: schedule_280319,
    130289: schedule_130289,
    942116: schedule_942116,
    908924: schedule_908924,
    337814: schedule_337814,
}

async function update(watch_list, online = true) {
    const conn = online && await createMajsoulConnection()

    const process = [];
    for (const contest_id of watch_list) {
        console.log(`==================== ${contest_id} ====================`)
        if (online) {
            process.push(await fetchAndAnalyzeGameRecord(conn, contest_id, schedule_map[contest_id]));
        } else {
            process.push(analyzeGameRecordFromFiles(contest_id, schedule_map[contest_id]));
        }
    }

    // console.log(process)
    Promise.all(process).then((values) => {
        online && conn.close()

        const sqls = []
        values.forEach((contest_sql) => {
            sqls.push(...contest_sql)
        })
        fs.writeFileSync(`sql/update.sql`, sqls.join('\n'))
    })
}
// update(watch_list, true)
update([337814], true)

// const res = decodeMessage(decoder,
// "AjIAChkubHEuTG9iYnkuZmV0Y2hHYW1lUmVjb3JkEjoKKzI0MDgyMS00M2UwYjFmMi0xN2I0LTQ4YzctODc2ZS02OWYzNWI2YjdlZjYSC3dlYi0wLjExLjY4"
//     , ".lq.Lobby.enterCustomizedContest")
// console.log(res)
// const { basic, result } = decodeGameRecord(decoder, load_json_record(130289, '240919-8ccf978a-4efc-4dbe-8e00-78374d652bcb'))
// console.log(basic, result)