<script setup>
    import PopupLayout from '@layouts/popup/view.vue';
    import CommentsComponent from '@activity/components/comments/view.vue';

    defineProps({
        endpoint: String,
        callback: Function,
    });
</script>

<template>
    <popup-layout title="Comments">
        <template #content>
            <comments-component :endpoint="endpoint" :callback="callback"></comments-component>
        </template>
    </popup-layout>
</template>