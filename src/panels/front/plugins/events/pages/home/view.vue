<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
console.log('Route params:', route.params);
console.log('Current route path:', route.path);
console.log('Current route name:', route.name);
</script>

<template>
    <iframe src="https://skedi.divhunt.website/" class="fullscreen-iframe"></iframe>
</template>

<style scoped>
.fullscreen-iframe {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border: none;
    margin: 0;
    padding: 0;
    z-index: 1000;
}
</style>