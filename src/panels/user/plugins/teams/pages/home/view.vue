<script setup>
    import { ref, watch } from 'vue';
    import { useRoute } from 'vue-router'; 

    import MainLayout from '@layouts/main/view.vue'
    import HeadingComponent from '@global/heading/view.vue'
    import itemsComponent from '@user_teams/components/items/view.vue';

    import Button from '@form/button/view.vue';

    import TeamForm from '@user_teams/components/form/team.vue';

</script>

<template>
    <main-layout>
        <template #content>
            
            <div class="container-lg">
                <HeadingComponent title="Organizaitons & Teams"/>
                <itemsComponent/>
                <Button v-popup="{
                    component: TeamForm,
                    overlay: { position: 'end' },
                    properties: {
                        endpoint: 'team',
                        type: 'POST',
                        callback: (event, data, pesponse, success) =>
                        {
                            console.log(response);
                        },
                        values: () => {return {name: 'dsaas'} }
                    }
                }"/>
                <!-- <itemsComponent/> -->
                

            </div>
        
        </template>
    </main-layout>
</template>