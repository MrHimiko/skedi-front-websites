<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
console.log('Route params:', route.params);
console.log('Current route path:', route.path);
console.log('Current route name:', route.name);
</script>

<template>
    <div class="event-page">
        <h1>Homepage</h1>
    </div>
</template>