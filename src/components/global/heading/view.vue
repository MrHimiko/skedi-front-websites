<script setup lang="ts">
    import './style.css';

    defineProps({
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String
        },
    });
</script>

<template>
    <div class="c-heading">
        <div class="left">

            <div class="title">
                <h1 class="text-lg">
                    {{ title }}
                </h1>
            </div>

            <p class="text-secondary" v-if="description">{{ description }}</p>
        </div>

        <div class="right">
            <slot name="right"></slot>
        </div>
    </div>
</template>