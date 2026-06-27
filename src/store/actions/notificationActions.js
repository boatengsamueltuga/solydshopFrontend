import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

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
            await api.put(`/notifications/${id}/read`);
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
            await api.put('/notifications/read-all');
        } catch {
            return rejectWithValue(null);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteOne',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${id}`);
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
            await api.delete('/notifications/all');
        } catch {
            return rejectWithValue(null);
        }
    }
);
