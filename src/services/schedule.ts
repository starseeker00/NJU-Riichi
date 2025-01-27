import axios from 'axios';

export function getSchedule(contest_id: number) {
    return axios.get('/api/schedule/get?contestId=' + contest_id);
}

export function addSchedule(data: any) {
    return axios.post('/api/schedule/add', data);
}

export function updateSchedule(data: any) {
    return axios.post('/api/schedule/update', data);
}

export function deleteSchedule(id: number) {
    return axios.post('/api/schedule/delete?id=' + id);
}