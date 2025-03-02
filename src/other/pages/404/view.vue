<script setup>
    import MainLayout from '@layouts/main/view.vue'
</script>

<template>
    <main-layout :sidebar="false">
        <template #content>
            <div style="height: 100vh" class="flex flex-center">
                <div>
                    <h1>Not Found</h1>
                    <div class="p-md"></div>
                    <p>Page you are looking haven't been built yet. Go to <router-link to="/">homepage</router-link>.</p>
                </div>
            </div>
        </template>
    </main-layout>
</template>