<script setup>
    import PopupLayout from '@layouts/popup/view.vue';
    import BuilderComponent from '@/components/builder/view.vue';

    const props = defineProps({
        values: {
            type: Function
        },
        title: {
            type: String,
            required: true
        },
        endpoint: {
            type: String
        },
        type: {
            type: String
        },
        callback: {
            type: Function
        },
        tabs: {
            type: Array,
            required: true,
        },
    });
</script>

<template>
    <popup-layout :class="class" :title="title">
        <template #content>
            <builder-component :callback="callback" :values="values" :title="title" :endpoint="endpoint" :type="type" :tabs="tabs" />
        </template>
    </popup-layout>
</template>