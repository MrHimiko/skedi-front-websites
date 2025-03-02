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
        icon: {
            type: String,
        }
    });
</script>

<template>
    <div class="c-banner animation-background">
        <div class="top">
            <div class="left">
                <div class="title">
                    <img v-if="icon" :src="icon">
                    <h1 class="text-lg">{{ title }}</h1>
                </div>

                <p class="text-secondary" v-if="description">{{ description }}</p>
            </div>

            <div class="right">
                <slot name="right"></slot>
            </div>
        </div>

        <div class="bottom">
            <slot name="bottom"></slot>
        </div>

        <div class="animation-background-div"></div>
    </div>
</template>