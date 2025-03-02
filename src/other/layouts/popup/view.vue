<script setup>
    import './style.css'

    defineProps(
    {
        title: 
        {
            type: String,
            required: true
        },
        icon: String
    })
</script>

<template>
    <div class="l-popup">
        <div class="top flex-between gap-xl">
            <div class="flex gap-lg">
                <i v-if="icon">{{ icon }}</i>
                <p class="fw-500">{{ title }}</p>
            </div>
            <i class="action i-popup-close">close</i>
        </div>
        <div class="content scrollbar"><slot name="content"></slot></div>
    </div>
</template>
