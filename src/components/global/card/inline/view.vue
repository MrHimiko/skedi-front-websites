<script setup lang="ts">
    import './style.css';

    defineProps({
        title: {
            type: String,
            required: true
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
    <div class="c-card-inline transition-border">
        <div class="left">
            <div class="icon">
                <i class="icon-xl" v-if="icon">{{ icon }}</i>
            </div>
            <div class="content">
                <h2 class="text-base text-primary">{{ title }}</h2>
                <p class="text-secondary ellipsis ellipsis-2" v-if="description">{{ description }}</p>
            </div>
        </div>

        <div class="right">
            <i>chevron_right</i>
        </div>
    </div>
</template>