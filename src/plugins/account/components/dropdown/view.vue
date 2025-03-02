<script setup>
    import './style.css';

    import MenusComponent from '@global/menus/view.vue';

    const menus = [
        {
            label: 'My Profile',
            link: '/settings'
        },
        {
            label: 'My Organization',
            link: '/settings'
        },
    ]

    defineProps({
        logo: {
            type: String,
            required: true,
        }
    });
</script>

<template>
    <div class="account-c-dropdown" v-dropdown="{ component: MenusComponent, properties: { menus } }">
        <!-- <div class="avatar">
            {{ userStore.getName()[0] }}
            <div class="dot"></div>
        </div> -->
        <i>expand_more</i>
    </div>
</template>