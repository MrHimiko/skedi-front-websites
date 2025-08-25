<script setup>
import { watch, onMounted } from 'vue';
import SelectComponent from '@form/select/view.vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    modelValue: {
        type: String,
        default: ''
    },
    errors: {
        type: Array,
        default: () => []
    },
    formData: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update:modelValue']);

const fieldId = props.field.id || props.field.name;

// Debug logging for select field
console.log(`[SelectField] Setup for field ${fieldId}:`, {
    field: props.field,
    fieldId: fieldId,
    modelValue: props.modelValue,
    options: props.field.options,
    errors: props.errors,
    formDataValue: props.formData[fieldId]
});

onMounted(() => {
    console.log(`[SelectField] Mounted field ${fieldId}:`, {
        modelValue: props.modelValue,
        formDataValue: props.formData[fieldId],
        allFormData: props.formData
    });
});

// Watch for modelValue changes from parent
watch(() => props.modelValue, (newValue, oldValue) => {
    console.log(`[SelectField] modelValue changed from parent for ${fieldId}:`, {
        oldValue,
        newValue,
        formDataValue: props.formData[fieldId]
    });
});

// Watch form data changes
watch(() => props.formData[fieldId], (newValue, oldValue) => {
    console.log(`[SelectField] formData value changed for ${fieldId}:`, {
        oldValue,
        newValue,
        modelValue: props.modelValue
    });
});

function handleChange(event, value) {
    console.log(`[SelectField] handleChange called for field ${fieldId}:`, {
        event,
        oldValue: props.modelValue,
        newValue: value,
        formDataBefore: props.formData[fieldId],
        allFormData: props.formData
    });
    
    emit('update:modelValue', value);
    
    // Log after emit
    setTimeout(() => {
        console.log(`[SelectField] After emit for ${fieldId}:`, {
            modelValue: props.modelValue,
            formDataValue: props.formData[fieldId]
        });
    }, 10);
}

function handleInput(event, value) {
    console.log(`[SelectField] handleInput called for field ${fieldId}:`, {
        event,
        oldValue: props.modelValue,
        newValue: value
    });
    
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="select-field">
        <div class="debug-info" style="font-size: 10px; color: #666; margin-bottom: 5px;">
            Field: {{ fieldId }} | ModelValue: {{ modelValue }} | FormData: {{ formData[fieldId] }}
        </div>
        
        <SelectComponent
            :label="field.label + (field.required ? ' *' : '')"
            :value="modelValue"
            :options="field.options || []"
            :placeholder="field.placeholder || 'Select an option'"
            :required="field.required"
            @change="handleChange"
            @onInput="handleInput"
            @onChange="handleChange"
            @update:modelValue="(value) => emit('update:modelValue', value)"
        />
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.select-field {
    width: 100%;
}

.field-errors {
    margin-top: 4px;
}

.error-message {
    color: var(--red-default);
    font-size: 12px;
    display: block;
}
</style>