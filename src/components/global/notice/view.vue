<script setup lang="ts">
    import './style.css';

    defineProps({
        description: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
        },
        as: {
            type: String,
            default: 'info'
        }
    });
</script>

<template>
    <div :class="['c-notice', 'animation-background', as]">
        <i v-if="icon">{{ icon }}</i>
        <p>{{ description }}</p>
        <div class="animation-background-div"></div>
    </div>
</template>