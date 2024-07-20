import axios from 'axios';

export function getEvents() {
    return axios.get('/api/events/');
}

export function getPlayers(eventId: number) {
    return axios.get(`/api/events/${eventId}/players`);
}

export function getRecords(eventId: number) {
    return axios.get(`/api/events/${eventId}/records`);
}
