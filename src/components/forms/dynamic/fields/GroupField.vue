<script setup>
import { computed, watch } from 'vue';
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

// Debug logging for group field
console.log(`[GroupField] Setup for group ${props.field.id || props.field.name}:`, {
    field: props.field,
    formData: props.formData,
    children: props.field.children
});

// Watch form data changes
watch(() => props.formData, (newFormData) => {
    console.log(`[GroupField] Form data changed for group ${props.field.id || props.field.name}:`, {
        newFormData,
        visibility: props.field.visibility
    });
}, { deep: true });

// Check if group is visible
const isVisible = computed(() => {
    const visible = formConfigService.checkFieldVisibility(props.field, props.formData);
    
    console.log(`[GroupField] Visibility check for ${props.field.id || props.field.name}:`, {
        visible,
        field: props.field,
        formData: props.formData
    });
    
    return visible;
});

// Get child fields
const childFields = computed(() => {
    if (!props.field.children) return [];
    
    const children = props.field.children
        .map(childId => props.fieldMap.get(childId))
        .filter(field => field);
        
    console.log(`[GroupField] Child fields for ${props.field.id || props.field.name}:`, children.map(c => ({
        id: c.id || c.name,
        type: c.type,
        label: c.label
    })));
    
    return children;
});

// Handle child field updates - THIS IS THE KEY FUNCTION
function handleFieldUpdate(fieldId, value) {
    console.log(`[GroupField] Child field update received:`, {
        childFieldId: fieldId,
        value,
        groupId: props.field.id || props.field.name,
        currentFormData: props.formData[fieldId],
        willEmitObject: true
    });
    
    // Groups emit an object with fieldId and value so the parent knows which child field to update
    const updateObject = { fieldId, value };
    
    console.log(`[GroupField] Emitting update object:`, updateObject);
    
    emit('update:modelValue', updateObject);
    
    // Debug: Check if the event was actually emitted
    setTimeout(() => {
        console.log(`[GroupField] After emit - formData check:`, {
            fieldId,
            currentFormData: props.formData[fieldId],
            expectedValue: value
        });
    }, 50);
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
                    :key="childField.id || childField.name"
                    :field="childField"
                    :modelValue="formData[childField.id || childField.name]"
                    :errors="errors[childField.id || childField.name] || []"
                    :formData="formData"
                    :fieldMap="fieldMap"
                    @update:modelValue="(value) => handleFieldUpdate(childField.id || childField.name, value)"
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