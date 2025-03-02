import { defineStore } from 'pinia';
import type { Notification } from './types';

export const NotificationsStore = defineStore('notificationsStore', {
    state: () => ({
        notifications: [] as Notification[],
    }),

    actions: {
        add(notification: Notification) 
        {
            const id = Date.now() + Math.random();
            const notificationWithId = { ...notification, id };

            this.notifications.push(notificationWithId);

            setTimeout(() => 
            {
                this.notifications = this.notifications.filter(
                    (n: Notification) => n.id !== id
                );
            }, 5000);
        },

        get(): Notification[] 
        {
            return this.notifications;
        }
    },
});
