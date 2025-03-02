<script setup>
    import './style.css';

    import PreviewComponent from '@global/preview/view.vue';

    defineProps({
        message: {
            type: String,
        },
        date: {
            type: String,
        },
        self: {
            type: Boolean
        },
        user: {
            type: Object
        }
    });
</script>

<template>
    <div :class="['c-message', (self ? 'self' : '')]">
        <div class="wrapper">
            <div class="user pointer" v-dropdown="{ 
                component: PreviewComponent, 
                properties: { 
                    endpoint: 'account/user',
                    binds: ['id', 'name', 'type'],
                    route: '/notes/:0'
                }
            }">
                <span :class="(user?.name[0] ?? 'G').toLowerCase()">{{ user ? user.initials : 'G'}}</span>
                <div></div>
            </div>

            <div class="message">
                <p class="text-xs text-secondary text-bold">{{ message }}</p>
                <span class="text-xs text-tertiary">{{ date }}</span>
            </div>
        </div>
    </div>
</template>