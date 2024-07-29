import axios from 'axios';

export function getContests() {
    return axios.get('/api/getContestList');
}

export function getContestPlayers(contestId: number) {
    return axios.get(`/api/getContestPlayerList?contestId=${contestId}`);
}

export function getContestRecords(contestId: number) {
    return axios.get(`/api/getGameRecordListByPage?contestId=${contestId}`);
}

// export function getContestRecords(contestId: number, pageIndex: number, pageSize: number) {
//     return axios.get(`/api/getGameRecordListByPage?contestId=${contestId}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
// }

export function getRecordDetail(uuid: string) {
    return axios.get(`/api/getGameRecordDetail?uuid=${uuid}`);
}