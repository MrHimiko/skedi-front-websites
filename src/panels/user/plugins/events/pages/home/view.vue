<script setup>
    import { ref, watch } from 'vue';
    import { useRoute } from 'vue-router'; 
    import {  PhPlus } from "@phosphor-icons/vue";
    import { popup } from '@utils/popup';

    import MainLayout from '@layouts/main/view.vue'
    import HeadingComponent from '@global/heading/view.vue'
    import itemsComponent from '@user_events/components/items/view.vue';

    import Button from '@form/button/view.vue';
    import EventCreateForm from '@user_events/components/form/eventCreate.vue';

    import { UserStore } from '@stores/user'
    const userStore = UserStore();

    import { api } from '@utils/api';
    const eventsPage = ref(0); 
    async function reloadData() {
        try {
            const response = await api.get('account/user');
            if (response.success && response.data) {
                userStore.setData(response.data);
                eventsPage.value++;
            }
        } catch (error) {
            console.error("Failed to reload user data:", error);
        }
    }


</script>

<template>
    <main-layout>
        <template #content>
            
            <div class="container-lg" :key="eventsPage">
                
                <HeadingComponent title="Event types">
                    <template #right >
                        <Button 
                            as="stroke" :iconLeft="{ component: PhPlus, weight: 'bold' }" label="New event type"  
                            v-popup="{
                            component: 
                                EventCreateForm,
                                overlay: { position: 'center' },
                                properties: {
                                    title: 'New event type',
                                    callback: (event, data, response, success) => {
                                        if (success) {
                                            reloadData();
                                            console.log('Event created', response);
                                        }
                                    },
                                }
                            }
                        "/>
                    </template>
                </HeadingComponent>

                <itemsComponent/>

            </div>
        
        </template>
    </main-layout>
</template>