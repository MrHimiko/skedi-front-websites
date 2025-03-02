<script setup>
    import BuilderPopupComponent from '@/components/builder/popup/view.vue';

    defineProps({
        values: Function,
        endpoint: String,
        type: String,
        callback: Function,
    });

    const tabs = [
        {
            name: '',
            components: [
                {
                    type: 'Input',
                    width: 12,
                    name: 'name',
                    properties: {
                        placeholder: 'dadsa'
                    }
                }
            ]
        }
    ]
</script>

<template>
    <BuilderPopupComponent :endpoint="endpoint" :type="type" :callback="callback" :values="values" :tabs="tabs"></BuilderPopupComponent>
</template>