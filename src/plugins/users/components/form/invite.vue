<script setup>
    import PopupLayout from '@layouts/popup/view.vue';
    import BuilderComponent from '@/components/builder/view.vue';

    defineProps({
        callback: {
            type: Function
        },
    });

    const tabs = [
        {
            label: "Create new team",
            title: 'Default',
            components: [
                {
                    type: 'Input',
                    name: 'name',
                    label: 'Name',
                    required: true,
                    width: 12,
                    properties: {
                        placeholder: 'Eg: Dejan Tomic',
                    }
                },
                {
                    type: 'Input',
                    name: 'email',
                    label: 'Email',
                    required: true,
                    width: 12,
                    properties: {
                        placeholder: 'Eg: dejan@Skedi.com',
                        type: 'email'
                    }
                },
                {
                    type: 'Select',
                    name: 'type',
                    label: 'Type',
                    required: true,
                    width: 12,
                    properties: {
                        placeholder: 'Select Type',
                        options: [
                            { label: 'Staff', value: 'staff', description: 'Admin of your organization.' },
                            { label: 'Tenant', value: 'tenant', description: 'A resident who rents a property from the owner or management.' },
                            { label: 'Vendor', value: 'vendor', description: 'A service provider or contractor handling maintenance, repairs, or other property-related services.' },
                            { label: 'Owner', value: 'owner', description: 'The property owner who rents out units and manages tenants and vendors.' },
                            { label: 'Prospect', value: 'prospect', description: 'A potential tenant who has shown interest in renting a property.' }
                        ]
                    }
                }
            ],
        }
    ];
</script>

<template>
    <popup-layout class="h-auto" title="Invite Member">
        <template #content>
            <builder-component type="POST" endpoint="users" :values="() => { return { type: 'staff' }; }" :callback="callback" :tabs="tabs"/>
        </template>
    </popup-layout>
</template>