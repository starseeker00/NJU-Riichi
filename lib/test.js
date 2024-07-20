const { MajsoulProtoCodec } = require("./majsoul");
const protobuf = require("protobufjs");
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
".lq.Lobby.readGameRecord"
".lq.GameDetailRecords"
".lq.RecordNewRound"

const base64ToHex = (base64) => {
    const buffer = Buffer.from(base64, 'base64');
    return buffer.toString('hex');
}

function getGameData() {
    const data = fs.readFileSync(`lib/data/fetchGameRecord.json`, 'utf8');
    const game = JSON.parse(data);
    const hexData = base64ToHex(game.data)
    fs.writeFileSync('lib/data/hexData.txt', hexData, 'hex');
}

// getGameData()

const pb = protobuf.Root.fromJSON(pbDef)
const decoder = pb.nested.lq.Wrapper
const decodeMessage = (str, methodName, filename) => {
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
        console.log(path)
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
    }
    if (methodName) {
        const methodObj = lookupMethod(methodName);
        const typeName = methodObj.responseType;
        typeObj = methodObj.parent.parent.lookupType(typeName);
    }
    const res = {
        name: msg.name,
        data: typeObj ? typeObj.decode(msg.data) : msg.data
    }
    console.log(res)
    if (filename) fs.writeFileSync(`lib/data/${filename}.json`, JSON.stringify(res.data, null, 2));

}
// const data = fs.readFileSync(`lib/data/fetchGameRecord.json`, 'utf8');
// const game = JSON.parse(data);
// decodeMessage(game.data,'','GameDetailRecords')
// decodeMessage(
//     'ChIubHEuUmVjb3JkTmV3Um91bmQS0AUIABAAGAAqDKjDAajDAajDAajDATAAOgI1bToCNXo6AjZwOgI2czoCOHM6Ajd6OgIzcDoCNXo6AjRzOgIyczoCOXA6AjN6OgI4bToCNnBCAjZtQgI4c0ICN3pCAjltQgIxcEICNHBCAjJtQgI0ekICNXNCAjdwQgI0ekICOG1CAjdwSgI3bUoCNnpKAjZzSgIybUoCOHBKAjVwSgI4c0oCMW1KAjRwSgIzbUoCMG1KAjNzSgI0elICMXpSAjF6UgI3elICMXNSAjNwUgIycFICMXNSAjFtUgIyc1ICM3NSAjF6UgI0elICNG1iDQgAEgIIASCgnAEowD5ykAI1bTV6NnA2czZtOHM3ejltN202ejZzMm0xejF6N3oxczhzN3ozcDV6MXA0cDJtNHo4cDVwOHMxbTNwMnAxczFtNHMyczlwM3o1czdwNHo4bTRwM20wbTNzMnMzczF6NHo4bTdwNHo0bTZwNHM1czV6NHM3czZ6OXM4cDdzMno2cDFtN201czltNXA3bTNzOHM0cDVtMnA3cDdtOXA1bTJ6OW0xczRzMXA0cDltOG0ybThwMno5czNtOHAycDJwN3o5czFzM3A4bTdzMno2ejlwOXAzcDNtNnozczF6OXM1cDZtN3A0bTJzMHM2czRtNnMwcDRtM3oxcDFwMm02cDZtM20xbTN6MnM2bTdzM3o1enhFggECMnOKAQIIAIoBAggBigECCAKKAQIIA7IBQDA5NjM3OTA3OTEyY2EyYzMxNTEzNjQyMGI3NjJkMzMyMzUzNmE3ODE2MmUzYzQ0ZDQwMWUwYTQ2Yzk1N2MxZGbCAUBkMGU0NDlhZjRlMmI5MWVhMmY4NjY4NDI4YzVlZDM0MDVkZGJhODEzZjUwNGU5ZTJmNDBlYTYwZmI0MTYzZmE3ygEgb2pIWTlrTkZENkJkbjV1R3JyNFlWdkJwYnRmcDZFZHA',
//     '',
//     'RecordNewRound'
// )

// decodeMessage(
//     "ChAubHEuUmVjb3JkTm9UaWxlEpABCAASAhgAEgIYABICGAASTBgBIgIxbSICM20iAjdtIgI4bSICOW0iAjFwIgIycCICM3AiAjVwIgI1cCICMnMiAjNzIgI0cyoUCgIybRABGAAgASgoMAA4AEACSB4aMBIMiKQBwIYCkLIB+KABGiCY+P////////8BmPj/////////AZj4/////////wG4FyAA"
// )

const f = fs.readFileSync('lib/data/GameDetailRecords.json', 'utf8')
console.time('decode')
JSON.parse(f).actions.forEach((act) => {
    if(act.result) decodeMessage(act.result)
})
console.timeEnd('decode')


// 读取result或者user_input 2选1
// result是`.lq.RecordDiscardTile`的is_liqi代表是否立直，user_input的operations.type===7代表立直
// 每一局的开始要读到`.lq.RecordNewRound`，也就是base64编码后的`ChIubHEuUmVjb3JkTm`
// 效率很快，可以解析所有result，分析一个牌谱大概3s左右
