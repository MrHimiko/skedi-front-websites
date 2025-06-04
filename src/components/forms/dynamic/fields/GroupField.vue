<!-- File: src/components/forms/dynamic/fields/GroupField.vue -->

<script setup>
import { computed } from 'vue';
import DynamicField from './DynamicField.vue';
import formConfigService from '../services/form-config.service';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    formData: {
        type: Object,
        default: () => ({})
    },
    fieldMap: {
        type: Map,
        default: () => new Map()
    },
    errors: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update:modelValue']);

// Check if group is visible
const isVisible = computed(() => {
    return formConfigService.checkFieldVisibility(props.field, props.formData);
});

// Get child fields
const childFields = computed(() => {
    if (!props.field.children) return [];
    
    return props.field.children
        .map(childId => props.fieldMap.get(childId))
        .filter(field => field);
});

// Handle child field updates
function handleFieldUpdate(fieldId, value) {
    // Groups don't have their own value, they just pass through child updates
    emit('update:modelValue', { fieldId, value });
}
</script>

<template>
    <div v-if="isVisible" class="group-field">
        <div v-if="field.label" class="group-header">
            <h4 class="group-title">{{ field.label }}</h4>
            <p v-if="field.description" class="group-description">
                {{ field.description }}
            </p>
        </div>
        
        <div class="group-content">
            <div class="group-fields-grid">
                <DynamicField
                    v-for="childField in childFields"
                    :key="childField.id"
                    :field="childField"
                    :modelValue="formData[childField.id]"
                    :errors="errors[childField.id] || []"
                    :formData="formData"
                    :fieldMap="fieldMap"
                    @update:modelValue="(value) => handleFieldUpdate(childField.id, value)"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.group-field {
    width: 100%;
    padding: 20px;
    background-color: var(--background-1);
    border-radius: 8px;
    border: 1px solid var(--border);
}

.group-header {
    margin-bottom: 20px;
}

.group-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-primary);
}

.group-description {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
}

.group-content {
    width: 100%;
}

.group-fields-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;
}

@media (max-width: 768px) {
    .group-field {
        padding: 16px;
    }
    
    .group-fields-grid {
        gap: 12px;
    }
}
</style>