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
                        placeholder: 'Team name'
                    }
                },
                {
                    label: "URL Slug",
                    type: 'Input',
                    width: 6,
                    name: 'slug',
                    properties: {
                        placeholder: 'team-name'
                    }
                },
                {
                    label: "Color",
                    type: 'Color',
                    width: 6,
                    name: 'color',
                    properties: {
                        placeholder: 'Color'
                    }
                }
            ]
        }
    ]
</script>

<template>
    <BuilderPopupComponent :endpoint="endpoint" :type="type" :callback="callback" :values="values" :tabs="tabs"></BuilderPopupComponent>
</template>