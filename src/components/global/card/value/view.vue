<script setup lang="ts">
    import './style.css';

    defineProps({
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
        },
        value: {
            type: [String, Array],
            required: true
        },
        name: {
            type: String
        },
        link: {
            type: String
        },
        onReorder: {
            type: String
        }
    });
</script>

<template>
    <div class="c-card-value transition-border">
        <div class="top flex gap-lg">
            <i v-if="icon">{{ icon }}</i>
            <i v-if="onReorder" class="action i-sortable-handle">drag_indicator</i>
            {{ title }}
        </div>

        <div class="bottom flex-between">
            <div class="left">
                <div v-if="Array.isArray(value)" class="flex gap-xl">
                    <b v-for="item in value" class="tag bg3">{{ item }}</b>
                </div>
                <div v-else>
                    <b class="tag bg3">{{ value }}</b>
                </div>

                <p class="text-secondary" v-if="name">{{ name }}</p>
            </div>
            <div v-if="link" class="right">
                <router-link class="text-primary text-bold" v-if="link" :to="link">
                    View 
                    <i>call_made</i>
                </router-link>
            </div>
        </div>
    </div>
</template>