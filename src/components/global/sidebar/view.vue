<script setup>
    import './style.css'
    import { ref } from 'vue'

    import scheme from '@/other/logic/scheme'

    import { useRoute } from 'vue-router'

    import { storage } from '@utils/storage' 

    import { MenuStore } from '@stores/menu'
    import { UserStore } from '@stores/user'

    import ToggleComponent from '@form/toggle/view.vue'

    const menuStore = MenuStore()
    const userStore = UserStore()

    const route = useRoute()

    const minimized = ref(storage.get('sidebar.minimized'))
    const parent = ref(storage.get('sidebar.parent', false))

    if (parent.value) 
    {
        minimized.value = 'minimized'
    }

    function toggle() 
    {
        minimized.value = minimized.value === 'minimized' ? '' : 'minimized'

        if (minimized.value !== 'minimized') 
        {
            parent.value = null   
        }

        storage.set('sidebar', minimized.value)
    }

    function openChildren(menu) 
    {
        if (!menu.children?.length) 
        {
            return
        }   

        if (parent.value === menu) 
        {
            storage.set('sidebar.parent', null, false)

            minimized.value = storage.get('sidebar.minimized')
            parent.value = null
        } 
        else 
        {
            storage.set('sidebar.parent', menu, false)

            minimized.value = 'minimized'
            parent.value = menu
        }
    }

    function closeChildren() 
    {
        storage.set('sidebar.parent', null, false)
        
        minimized.value = storage.get('sidebar.minimized')
        parent.value = null
    }

    function toggleScheme(value) 
    {
        new scheme().set(value ? 'dark' : 'light')
    }
</script>

<template>
    <div :class="['c-sidebar', minimized, (parent ? 'children' : '')]">
        <div class="left">
            <div class="top">
                <div class="switcher">
                    <div v-if="!minimized" class="name text-tx text-bold">
                        <div class="logo"></div>
                    </div>

                    <i @click="toggle" class="action">menu_open</i>
                </div>

                <div class="menus">
                    <div @click="openChildren(menu)" v-for="(menu, index) in menuStore.get('sidebar:top')" :key="index">
                        <div :class="parent === menu ? 'active' : ''" :key="minimized" v-tooltip="minimized ? {content: menu.label, options: { placement: 'right' }} : null">
                            <div>
                                <i v-if="menu.icon">{{ menu.icon }}</i>
                                <span class="ellipsis ellipsis-1" v-if="!minimized"> {{ menu.label }} </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="bottom">
                <div v-if="!minimized" class="separator">
                    <p>Others</p>
                </div>

                <div class="menus">
                    <div v-for="(menu, index) in menuStore.get('sidebar:bottom')" :key="index">
                        <router-link :to="menu.link" :class="route.path.startsWith(menu.link) && menu.link.length > 1 ? 'active' : ''" :key="minimized" v-tooltip="minimized ? { content: menu.label, options: { placement: 'right' }} : null">
                            <div>
                                <i v-if="menu.icon">{{ menu.icon }}</i>
                                <span class="ellipsis ellipsis-1" v-if="!minimized"> {{ menu.label }} </span>
                            </div>
                        </router-link>
                    </div>
                </div>

            </div>
        </div>

        
    </div>
</template>
