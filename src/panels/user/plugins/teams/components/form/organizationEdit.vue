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
            components: [
                {
                    label: "Name",
                    type: 'Input',
                    width: 6,
                    name: 'name',
                    properties: {
                        placeholder: 'Organization name'
                    }
                },
                {
                    label: "URL Slug",
                    type: 'Input',
                    width: 6,
                    name: 'slug',
                    properties: {
                        placeholder: 'org-name'
                    }
                }
            ]
        }
    ]
</script>

<template>
    <BuilderPopupComponent :endpoint="endpoint" :type="type" :callback="callback" :values="values" :tabs="tabs"></BuilderPopupComponent>
</template>