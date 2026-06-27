import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

const getXsrfToken = () =>
    document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))?.split('=')[1];

export const fetchNotifications = createAsyncThunk(
    'notifications/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/notifications');
            return res.data;
        } catch {
            return rejectWithValue(null);
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    'notifications/markRead',
    async (id, { rejectWithValue }) => {
        try {
            await api.put(`/notifications/${id}/read`, null, {
                headers: { 'X-XSRF-TOKEN': getXsrfToken() },
            });
            return id;
        } catch {
            return rejectWithValue(null);
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    'notifications/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            await api.put('/notifications/read-all', null, {
                headers: { 'X-XSRF-TOKEN': getXsrfToken() },
            });
        } catch {
            return rejectWithValue(null);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteOne',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${id}`, {
                headers: { 'X-XSRF-TOKEN': getXsrfToken() },
            });
            return id;
        } catch {
            return rejectWithValue(null);
        }
    }
);

export const deleteAllNotifications = createAsyncThunk(
    'notifications/deleteAll',
    async (_, { rejectWithValue }) => {
        try {
            await api.delete('/notifications/all', {
                headers: { 'X-XSRF-TOKEN': getXsrfToken() },
            });
        } catch {
            return rejectWithValue(null);
        }
    }
);
