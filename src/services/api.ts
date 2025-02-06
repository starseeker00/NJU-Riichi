import axios from 'axios';

export function getContests() {
    return axios.get('/api/getContestList');
}

export function getContestPlayers(contestId: number, schedule: number) {
    return axios.get(`/api/getContestPlayerList?contestId=${contestId}&schedule=${schedule}`);
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

export function getContestTeams(contestId: number) {
    return axios.get(`/api/getContestTeamList?contestId=${contestId}`);
}

export function updateContest(contest_id: number, token: string) {
    return axios.post('/api/updateContest', { contest_id }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}