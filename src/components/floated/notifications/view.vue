<script setup lang="ts">
    import './style.css';

    import { NotificationsStore } from '@floated/notifications/store';

    const notificationsStore = NotificationsStore();
</script>

<template>
    <div class="c-notifications">
        <div v-auto-animate>
            <div v-for="(notification, index) in notificationsStore.get()" :key="index" :class="notification.color">
                <div v-if="notification.icon" class="left">
                    <i>{{ notification.icon }}</i>
                </div>
                <div class="right">
                    <span> {{ notification.title }} </span>
                    <p class="text-xs text-secondary">{{ notification.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>