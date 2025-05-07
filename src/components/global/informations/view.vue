<script setup>
    import './style.css';

    defineProps({
        informations: {
            type: Array ,
            required: true,
        },
        as: {
            type: String
        }
    });
</script>

<template>
    <div :class="['c-informations', as]">
        <div class="row" v-for="(item, index) in informations" :key="index">
            <div class="left">
                <i v-if="item.icon" class="icon">{{ item.icon }}</i>
                <span class="title">{{ item.title }}</span>
            </div>
            <div class="right">
                <span v-if="!$slots[`item-${index}`]" class="value">{{ item.value }}</span>
                <slot :name="`item-${index}`" :item="item" />
            </div>
        </div>
    </div>
</template>
