<script setup>
    import MainLayout from '@layouts/main/view.vue';

    import HeadingComponent from '@global/heading/view.vue';
    import LinksComponent from '@global/links/view.vue';
</script>

<template>
    <main-layout>
        <template #content>
            <heading-component title="Billing" description="Manage your organization plan & billing."/>

            <div class="p-xl"></div>
                
            <h1>Here comes the billing :)</h1>
            
        </template>
    </main-layout>
</template>