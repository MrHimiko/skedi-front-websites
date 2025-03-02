<script setup>
    import './style.css'

    defineProps(
    {
        tabs: 
        {
            type: Array,
            required: true
        },
        active: 
        {
            type: String
        },
        as: 
        {
            type: String
        },
        onClick: 
        {
            type: Function
        }
    })
</script>

<template>
    <div :class="['c-tabs', as]">
        <div v-for="(tab, tabIndex) in tabs" :key="tabIndex">
            <router-link v-if="tab.link" :to="tab.link" :class="{ active: active ? active.toLowerCase() === tab.title.toLowerCase() : tab.active }">
                <i v-if="tab.icon">{{ tab.icon }}</i>
                <span class="title">{{ tab.title }}</span>
                <span v-if="tab.count" class="count">{{ tab.count }}</span>
            </router-link>

            <div v-if="!tab.link" :class="{ active: active ? active.toLowerCase() === tab.title.toLowerCase() : tab.active }" @click="$event => onClick($event, tab, tabIndex)">
                <i v-if="tab.icon">{{ tab.icon }}</i>
                <span class="title">{{ tab.title }}</span>
                <span v-if="tab.count" class="count">{{ tab.count }}</span>
            </div>
            
        </div>
    </div>
</template>
