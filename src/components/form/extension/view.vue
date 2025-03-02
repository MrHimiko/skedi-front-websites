<script setup>
    import './style.css';
    
    import ToggleComponent from '@form/toggle/view.vue';

    defineProps({
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
</script>

<template>
    <div class="c-extension transition-border">
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
                <toggle-component as="bg1"></toggle-component>
            </div>
        </div>
    </div>
</template>