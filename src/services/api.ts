import axios from 'axios';

// axios.defaults.transformResponse = [function (data) {
//     try {
//         return JSON.parse(data);
//     } catch (e) {
//         return data;
//     }
// }];

// 统一设置请求头
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token') || ''}`;

export function getContests() {
    return axios.get('/api/contest/getContestList');
}

export function getContestPlayers(contestId: number, schedule: number) {
    return axios.get(`/api/contest/getContestPlayerList?contestId=${contestId}&schedule=${schedule}`);
}

export function getContestRecords(contestId: number) {
    return axios.get(`/api/contest/getGameRecordListByPage?contestId=${contestId}`);
}

// export function getContestRecords(contestId: number, pageIndex: number, pageSize: number) {
//     return axios.get(`/api/contest/getGameRecordListByPage?contestId=${contestId}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
// }

export function getRecordDetail(uuid: string) {
    return axios.get(`/api/contest/getGameRecordDetail?uuid=${uuid}`);
}

export function getContestTeams(contestId: number) {
    return axios.get(`/api/contest/getContestTeamList?contestId=${contestId}`);
}

export function updateContest(contest_id: number) {
    return axios.post('/api/contest/updateContest', { contest_id });
}

export function getLatestNotice() {
    return axios.get('/api/common/getLatestNotice');
}

export function fetchContestInfo(form: any) {
    return axios.post(`/api/contest/fetchContestInfo`, form);
}

export function addOrUpdateContest(form: any) {
    return axios.post(`/api/contest/addOrUpdateContest`, form);
}