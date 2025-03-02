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
            field: 'password',
            operator: 'empty',
            value: true
        }]);
    });

    onUnmounted(() => 
    {
        refUsers.value = [];
    });

    function onInvite(event, data, response, success)
    {
        if(success)
        {
            refUsers.value.push(response.data);
        }
    }

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
            <heading-component title="Invite" description="Invite new members to your organization." icon="group_add">

                <template #right>
                    <button-component 
                        v-popup="{ component: InviteFormComponent, properties: { callback: onInvite } }" 
                        iconLeft="add" 
                        label="Invite Member"
                    />
                </template>

            </heading-component>
        </template>

        <template #bottom>
            <table-component 
                as="full"
                empty="No active invitations were found."
                :headings="['Name', 'Email', 'Type', 'Invitation', 'Date', 'Action']"
                :keys="['name', 'email', 'type', 'password', 'updated', 'resend']"
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

                    <div v-if="key === 'type'">
                        <span class="tag bg3">{{ cell }}</span>
                    </div>

                    <div v-if="key === 'password'">
                        <div class="flex gap-md">
                            <span class="tag green">Sent</span>
                            <span class="tag orange">Pending</span>
                        </div>
                    </div>

                    <div v-if="key === 'resend'">
                        <div class="flex gap-lg">
                            <i v-tooltip="{content: 'Resend Email'}" class="action">send</i>
                            <i v-tooltip="{content: 'Cancel Invitation'}" class="action red" v-popup="{
                                component: ConfirmComponent,
                                properties: {
                                    description: `Are you sure you want cancel inviation of member '${row.name}'`,
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
