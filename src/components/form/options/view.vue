<script setup lang="ts">
    import './style.css';
    
    import type { PropType } from 'vue';
    import type { DropdownType, PopupType } from '@/types';
    import type { OptionType } from './types';

    defineProps({
        options: {
            type: Array as PropType<OptionType[]>,
            required: true
        }
    });

    defineEmits(['onClick']);
</script>

<template>
    <div class="c-options">
        <div 
            v-for="(option, optionIndex) in options" 
            v-popup="option.popup || null"
            v-clipboard="option.clipboard || null"
            v-print="option.print || null"
            @click="$emit('onClick', $event, option, optionIndex)" 
            :key="optionIndex" 
            class="i-dropdown-close"
        >
            <div class="left">
                <i v-if="option.icon">{{ option.icon }}</i> {{ option.label }}
            </div>
        </div>
    </div>
</template>