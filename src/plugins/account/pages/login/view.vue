<script setup>
    import MainLayout from '@account/layouts/main/view.vue';
    import LoginComponent from '@account/components/login/view.vue';
</script>

<template>
    <main-layout>
        <template #content>
            <login-component />
        </template>
    </main-layout>
</template>
