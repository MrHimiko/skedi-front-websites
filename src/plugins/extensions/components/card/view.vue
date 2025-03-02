<script setup>
    import './style.css';
    
    import ButtonComponent from '@form/button/view.vue';
    import ConfirmComponent from '@floated/confirm/view.vue'

    import { ExtensionStore } from '@stores/extension';

    const extensionStore = ExtensionStore();

    defineProps({
        id: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        price: {
            type: Number
        },
        icon: {
            type: String,
        }
    });

    function callback(event, data, response, success)
    {
        if(success)
        {
            setTimeout(() => 
            {
                window.location.reload();
            }, 1000)
        }
    }
</script>

<template>
    <div class="extensions-c-card transition-border">
        <div class="top flex gap-lg text-bold text-primary text-lg">
            <i class="icon-xl" v-if="icon">{{ icon }}</i>
            {{ name }}
        </div>

        <div class="bottom">
            <div class="p-lg"></div>
            <p class="text-secondary ellipsis ellipsis-5" v-if="description">{{ description }}</p>

            <div class="p-lg"></div>
            <div class="stroke"></div>
            <div class="p-lg"></div>
            
            <div class="info flex-between">
                <span class="tag">${{ price / 100 }} / month</span>
                <div v-if="!extensionStore.has(id)">
                    <button-component as="green mini" label="Enable" v-popup="{
                        component: ConfirmComponent,
                        properties: {
                            as: 'green',
                            description: `Are you sure you want to enable extension '${name}'. Additional charges may apply.`,
                            endpoint: 'extensions/' + id,
                            type: 'POST',
                            callback
                        }
                    }"/>
                </div>

                <div v-if="extensionStore.has(id)">
                    <button-component as="red mini" label="Disable" v-popup="{
                        component: ConfirmComponent,
                        properties: {
                            as: 'red',
                            description: `Are you sure you want to disable extension '${name}'.`,
                            endpoint: 'extensions/' + id,
                            type: 'DELETE',
                            callback
                        }
                    }"/>
                </div>
            </div>
        </div>
    </div>
</template>