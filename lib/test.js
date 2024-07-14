const { MajsoulProtoCodec } = require("./majsoul");
const fs = require('fs');

const pbVersion = "v0.11.48.w";
const pbDef = JSON.parse(fs.readFileSync('lib/proto/liqi.json', 'utf8'));

const proto = new MajsoulProtoCodec(pbDef, pbVersion);

const checkRequest = (methodName, payload) => {
    const req = proto.encodeRequest({ methodName, payload });
    console.log(`Request: ${methodName} ${JSON.stringify(payload)}`);
    console.log(`Encoded: ${req.toString('hex').match(/.{1,4}/g).join(' ')}`);
}

const decodeBuffer = (buf, methodName = '', filename = '') => {
    buf = Buffer.from(buf.replace(/\s/g, ''), 'hex');
    const res = proto.decodeMessage(buf, methodName)
    console.log(!methodName ? res : res.payload);
    if (filename) fs.writeFileSync(`lib/data/${filename}.json`, JSON.stringify(res.payload, null, 2));
}

const extractData = (filename) => {
    const data = fs.readFileSync(`lib/data/${filename}.json`, 'utf8');
    const obj = JSON.parse(data);
    const filtered = obj.record_list.map((record) => {
        const score = record.accounts
            .map((account) => {
                return {
                    nickname: account.nickname,
                    seat: account.seat,
                    point: record.result.players
                        .find((player) => player.seat === account.seat)
                        .part_point_1
                }
            })
        return {
            key: record.uuid,
            time: record.end_time,
            score,
        };
    });
    console.log(filtered.length)
    console.log(filtered.slice(0, 30))
    fs.writeFileSync(`lib/data/${filename}_filtered.json`, JSON.stringify(filtered, null, 2));
}

// method name
".lq.Lobby.heatbeat"
".lq.Lobby.fetchCustomizedContestOnlineInfo"
".lq.Lobby.fetchCustomizedContestList"
".lq.Lobby.fetchClientValue"
".lq.Lobby.fetchInfo"
".lq.Lobby.fetchGameRecordList"
".lq.Lobby.fetchCustomizedContestGameRecords"
".lq.Lobby.fetchGameRecord"


// decodeBuffer(
//     "",
//     ".lq.Lobby.fetchGameRecord",
//     "fetchGameRecord"
// )

extractData("fetchCustomizedContestGameRecords")