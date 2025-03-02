<script setup>
    import { ref, watch, onMounted, onUnmounted } from 'vue';
    import { getSettings, getTabSettings, getTabs } from './logic.js'
    import { useRoute } from 'vue-router';
    import MainLayout from '@layouts/main/view.vue'

    import HeadingComponent from '@global/heading/view.vue'
    import TabsComponent from '@global/tabs/view.vue'
    import CardComponent from '@global/card/inline/view.vue'

    import BuilderPopupComponent from '@/components/builder/popup/view.vue'

    const route = useRoute();
    const refSettings = ref([]);

    watch(() => route.params.tab, (tab) => 
    {
        refSettings.value = !tab ? getSettings() : getTabSettings(tab);
    });

    onMounted(() => 
    {
        refSettings.value = !route.params.tab ? getSettings() : getTabSettings(route.params.tab);
    });

    onUnmounted(() => 
    {
        refSettings.value = [];
    });
</script>

<template>
    <main-layout>
        <template #top>
            <div class="p-4xl">
                <heading-component title="Settings" description="Check all settings for your acc and organization" icon="settings"/>
            </div>

            <tabs-component style="padding-left: var(--spacing-4xl)" :tabs="getTabs()" :active="route.params.tab ?? 'all'"/>
        </template>

        <template #content>
            <div v-auto-animate="{ duration: 150 }" class="container-md grid grid-2 gap-xl">
                <div v-for="(setting, settingIndex) in refSettings" :key="setting.id">
                    <div v-popup="{ component: BuilderPopupComponent, overlay: { position: 'end' }, properties: { ...setting.config, title: setting.title + ' Settings' } }">
                        <card-component :title="setting.title" :description="setting.description" :icon="setting.icon"></card-component>
                    </div>
                </div>
            </div>
        </template>
    </main-layout>
</template>
