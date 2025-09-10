import axios from 'axios';

export function getSchedule(contest_id: number) {
    return axios.get('/api/schedule/get?contestId=' + contest_id);
}

export async function addSchedule(data: any) {
    return axios.post('/api/schedule/add', data);
}

export async function updateSchedule(data: any) {
    return axios.post('/api/schedule/update', data);
}

export async function deleteSchedule(id: number) {
    return axios.post('/api/schedule/delete?id=' + id, null, );
}