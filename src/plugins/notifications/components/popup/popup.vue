<script setup>
    import OptionsComponent from '@form/options/view.vue';
    import PopupLayout from '@layouts/popup/view.vue';

    import ItemsComponent from '@notifications/components/items/view.vue';

    function options()
    {
        return [
            {label: 'All'},
            {label: 'Notes'}
        ]
    }
</script>

<template>
    <popup-layout icon="notifications" title="Notifications">
        <template #content>
            <options-component :options="options()"></options-component>

            <div class="p-xl"></div>
            <items-component endpoint="activity/logs"></items-component>
        </template>
    </popup-layout>
</template>
