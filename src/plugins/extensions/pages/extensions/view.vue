<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import { fetch } from '@utils/fetch';

    import MainLayout from '@layouts/main/view.vue';
    import HeadingComponent from '@global/heading/view.vue';
    import ExtensionComponent from '@extensions/components/card/view.vue';

    const props = defineProps({
        panel: {
            type: String,
            required: true
        }
    });

    const refExtensions = ref([]);

    onMounted(async () => 
    {
        refExtensions.value = await fetch.many('extensions', 100, 1, [
            {field: 'panel', operator: 'equals', value: props.panel}
        ]);
    });

    onUnmounted(() => 
    {
        refExtensions.value = [];
    });
</script>

<template>
    <main-layout>
        <template #content>
            <div class="container-lg">
                <heading-component title="Extensions" description="Manage and configure extensions with ease. Enable or disable them instantly as needed." icon="extension"/>

                <div class="p-2xl"></div>
                <div class="stroke"></div>
                <div class="p-2xl"></div>

                <div class="grid grid-3 gap-xl">
                    <extension-component v-for="extension in refExtensions" :id="extension.id" :name="extension.name" :description="extension.description" :icon="extension.icon" :price="extension.price"></extension-component>
                </div>
            </div>
        </template>
    </main-layout>
</template>