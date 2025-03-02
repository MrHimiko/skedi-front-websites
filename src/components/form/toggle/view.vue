<script setup lang="ts">
import './style.css';

defineProps({
    label: {
        type: String,
    },
    name: {
        type: String,
    },
    required: {
        type: Boolean,
    },
    value: {
        type: Boolean,
        default: false,
    },
    iconOn: {
        type: String,
    },
    iconOff: {
        type: String,
    },
    as: {
        type: String
    },
});

const emit = defineEmits(['update:value']);

function change($event: Event) {
    const target = $event.target as HTMLInputElement;
    emit('update:value', target.checked);
}
</script>

<template>
    <div :class="['c-toggle', as]">
        <div v-if="required || label" class="flex-between">
            <label v-if="label">{{ label }}</label>
            <span class="text-xs text-secondary" v-if="required">Required</span>
        </div>
        <label class="holder">
            <input 
                type="checkbox" 
                :name="name" 
                :checked="value" 
                @change="change"
            />
            <div>
                <i v-if="iconOff" class="icon-off">{{ iconOff }}</i>
                <i v-if="iconOn" class="icon-on">{{ iconOn }}</i>
                <span class="slider"></span>
            </div>
        </label>
    </div>
</template>
