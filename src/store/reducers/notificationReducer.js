import { createSlice } from '@reduxjs/toolkit';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '../actions/notificationActions';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items:       [],
        unreadCount: 0,
        loading:     false,
        panelOpen:   false,
    },
    reducers: {
        togglePanel: (state) => { state.panelOpen = !state.panelOpen; },
        closePanel:  (state) => { state.panelOpen = false; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending,  (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading     = false;
                state.items       = action.payload;
                state.unreadCount = action.payload.filter(n => !n.read).length;
            })
            .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })

            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const n = state.items.find(i => i.id === action.payload);
                if (n && !n.read) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
            })

            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.items.forEach(n => { n.read = true; });
                state.unreadCount = 0;
            });
    },
});

export const { togglePanel, closePanel } = notificationSlice.actions;
export default notificationSlice.reducer;
