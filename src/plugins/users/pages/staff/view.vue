<script setup>
    import { ref, watch, onMounted, onUnmounted } from 'vue';
    import { fetch } from '@utils/fetch';

    import MainLayout from '@layouts/main/view.vue'

    import HeadingComponent from '@global/heading/view.vue'
    import TabsComponent from '@global/tabs/view.vue'
    import CardComponent from '@global/card/inline/view.vue'
    import TableComponent from '@global/table/view.vue'
    import ButtonComponent from '@form/button/view.vue'

    import BuilderPopupComponent from '@/components/builder/popup/view.vue'

    import InviteFormComponent from '@users/components/form/invite.vue';

    import ConfirmComponent from '@floated/confirm/view.vue';

    const refUsers = ref([]);

    onMounted(async () => 
    {
        refUsers.value = await fetch.many('users', 100, 1, [{
            field: 'type',
            operator: 'equals',
            value: 'staff'
        }]);
    });

    onUnmounted(() => 
    {
        refUsers.value = [];
    });

    function onDelete(event, data, response, success)
    {
        if(success)
        {
            refUsers.value = refUsers.value.filter(user => user.id !== response.data.id);
        }
    }
</script>

<template>
    <main-layout>
        <template #content>
            <heading-component title="Staff" description="Mange your organization members (staff)." icon="group"/>
        </template>

        <template #bottom>
            <table-component 
                as="full"
                :headings="['Name', 'Email', 'Status', 'Date', '']"
                :keys="['name', 'email', 'password', 'updated', 'actions']"
                :values="refUsers"
            >
                <template #cell="{cell, key, row}">
                    <div v-if="key === 'name'">
                        <div class="flex gap-lg">
                            <div class="user">
                                <span :class="cell[0].toLowerCase()">{{row.initials}}</span>
                            </div>
                            <b>{{ cell }}</b>
                        </div>
                  
                    </div>


                    <div v-if="key === 'password'">
                        <div class="flex gap-md">
                            <span v-if="!cell" class="tag orange">Pending</span>
                            <span v-if="cell" class="tag green">Active</span>
                        </div>
                    </div>

                    <div v-if="key === 'actions'">
                        <div class="flex gap-lg">
                            <i v-tooltip="{content: 'Edit staff member'}" class="action">edit</i>
                            <i v-tooltip="{content: 'Remove staff member'}" class="action red" v-popup="{
                                component: ConfirmComponent,
                                properties: {
                                    description: `Are you sure you want to staff member '${row.name}'`,
                                    as: 'red',
                                    endpoint: 'users/' + row.id,
                                    type: 'DELETE',
                                    callback: onDelete
                                }
                            }">delete</i>
                        </div>
                    </div>
                </template>
            </table-component>
        </template>
    </main-layout>
</template>
