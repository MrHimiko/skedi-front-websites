<script setup>
    import './style.css';

    import { ref, onMounted, onUnmounted } from 'vue';
    import { fetch } from '@utils/fetch';

    import InputComponent from '@form/input/view.vue';

    const props = defineProps({
        menus: {
            type: Array
        },
        endpoint: {
            type: String
        },
        title: {
            type: String
        },
        onClick: {
            type: Function
        }
    });

    const refMenus = ref(Array.isArray(props.menus) ? props.menus : []);

    onMounted(() => 
    {
        if(!props.endpoint)
        {
            return;
        }

        refMenus.value.push({label: 'Loading...', value: null});

        fetch.many(props.endpoint, 100, 1, []).then((data) => 
        {
            refMenus.value = [];
            
            data.forEach((item) => 
            {
                refMenus.value.push({label: (item.name ?? item.title), value: item.id});
            })    
        });
    });

    onUnmounted(() => 
    {
        refMenus.value = ref(Array.isArray(props.menus) ? props.menus : []);
    });
</script>

<template>
    <div class="c-menus scrollbar">
        <div v-if="refMenus.length > 10" class="p-xl search">
            <input-component as="bg1" placeholder="Search..."></input-component>
        </div>

        <h1 v-if="title">{{ title }}</h1>

        <div class="group">
            <div class="menus">
                <!-- <router-link v-for="(menu, index) in menus" :key="index" :to="menu.link">
                    <div class="left">
                        <img v-if="menu.icon" :src="menu.icon"> {{ menu.label }}
                    </div>
                </router-link> -->

                <div class="i-dropdown-close"
                    v-for="(menu, menuIndex) in refMenus" 
                    v-popup="menu.popup || null"
                    v-clipboard="menu.clipboard || null"
                    v-print="menu.print || null"
                    @click="$event => {
                        menu.onClick && menu.onClick($event, menu, menuIndex);
                        onClick && onClick($event, menu, menuIndex);
                    }"
                    :key="menuIndex" 
                    
                >
                    <div class="left">
                        <div>
                            <i v-if="menu.icon">{{ menu.icon }}</i> {{ menu.label }}
                        </div>
                        <p v-if="menu.description">{{ menu.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>