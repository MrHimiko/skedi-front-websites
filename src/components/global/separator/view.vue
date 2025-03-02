<script setup lang="ts">
    import './style.css';

    defineProps({
        title: {
            type: String,
        },
        as: {
            type: String
        }
    });
</script>

<template>
    <div :class="['c-separator', as]">
        <p v-if="title">{{ title }}</p>
        <div></div>
    </div>
</template>