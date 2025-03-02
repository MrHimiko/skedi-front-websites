<script setup>
    import NotificationComponent from '@floated/notifications/view.vue';
    import TippyComponent from '@floated/tippy/view.vue';
</script>

<template>
    <notification-component/>
    <tippy-component/>
    <RouterView />
</template>