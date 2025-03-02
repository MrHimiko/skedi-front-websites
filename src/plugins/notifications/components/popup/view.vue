<script setup>
    import PopupComponent from './popup.vue';
</script>

<template>
    <div class="notifications-c-popup">
        <i class="action" v-popup="{
            component: PopupComponent,
            overlay: {
                position: 'end'
            }
        }">notifications</i>
    </div>
</template>