<script setup>
    import './style.css';

    defineProps({
        user: Object,
        resource: String,
        changes: Array,
        type: String,
        action: String,
        time: String,
        as: String,
    });
</script>

<template>
    <div :class="['activity-c-log', as]">
        <div class="line"></div>
        <div class="left">
            <div class="user">
                <span :class="user.name[0].toLowerCase()" v-if="user">{{ user.name[0] || 'G' }}</span>
            </div>
        </div>

        <div class="right">
            <div class="flex gap-md text-secondary">
                <span class="text-bold user-text">{{ user?.name || 'Guest' }}</span>

                <span v-if="action === 'update'" class="text-tertiary">
                    <span class="tag orange">updated</span> 
                    {{ type }} "{{ resource }}"
                </span>

                <span v-if="action === 'create'" class="text-tertiary">
                    <span class="tag green">created</span>
                    {{ type }} "{{ resource }}"
                </span>

                <span v-if="action === 'delete'" class="text-tertiary">
                    <span class="tag red">deleted</span> 
                    {{ type }} "{{ resource }}"
                </span>
            </div>

            <div class="p-xs"></div>

            <div class="flex gap-md text-tertiary text-xs">
                <i>access_time</i> {{ time }}
            </div>

            <div v-if="action === 'update'">
                <div class="p-md"></div>

                <div class="flex gap-xl">
                    <div class="tag bg3" v-for="change in changes">
                        {{ change }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
