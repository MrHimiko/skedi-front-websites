<script setup lang="ts">
    import './style.css';

    defineProps({
        position: {
            type: String,
            default: 'center'
        },
        opacity: {
            type: Number,
            default: 40
        },
    });
</script>

<template>
    <div :class="['c-overlay', position]" :style="'background-color: rgb(0 0 0 / '+opacity+'%)'">
        <slot name="content"></slot>
    </div>
</template>