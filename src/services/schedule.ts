import axios from 'axios';

export function getSchedule(contest_id: number) {
    return axios.get('/api/schedule/get?contestId=' + contest_id);
}

export async function addSchedule(data: any, token: string) {
    return axios.post('/api/schedule/add', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function updateSchedule(data: any, token: string) {
    return axios.post('/api/schedule/update', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function deleteSchedule(id: number, token: string) {
    return axios.post('/api/schedule/delete?id=' + id, null, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}