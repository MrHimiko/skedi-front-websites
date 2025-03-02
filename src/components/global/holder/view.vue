<script setup>
    import './style.css';

    defineProps({
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        icon: {
            type: String,
        },
        as: {
            type: String,
        }
    });
</script>

<template>
    <div :class="['c-holder', as]">
        <i v-if="icon">{{ icon }}</i>
        <p class="text-primary text-bold">{{ title }}</p>

        <div v-if="description" class="p-md"></div>
        <p v-if="description" class="text-secondary">{{ description }}</p>

        <slot name="down"></slot>
    </div>
</template>