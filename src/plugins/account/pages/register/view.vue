<script setup>
    import MainLayout from '@account/layouts/main/view.vue';
    import RegisterComponent from '@account/components/register/view.vue';
</script>

<template>
    <main-layout>
        <template #content>
            <register-component />
        </template>
    </main-layout>
</template>
