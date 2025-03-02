<script setup lang="ts">
    import './style.css';

    defineProps({
        links: {
            type: Array as () => Array<{ text: string; href: string }>,
            required: true,
        },
    });
</script>

<template>
    <div class="c-links">
        <div v-for="(link, index) in links" :key="index">
            <i>link</i>
            <router-link :to="link.href">
                {{ link.text }}
                <div></div>
            </router-link>
            <!-- <span v-if="index < links.length - 1">/</span> -->
        </div>
    </div>
</template>
