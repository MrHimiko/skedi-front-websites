<!-- File: src/components/forms/dynamic/fields/CheckboxField.vue -->

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    modelValue: {
        type: Array,
        default: () => []
    },
    errors: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue']);

const selectedValues = ref(props.modelValue || []);

watch(() => props.modelValue, (newValue) => {
    selectedValues.value = newValue || [];
});

function handleChange(optionValue) {
    const index = selectedValues.value.indexOf(optionValue);
    
    if (index > -1) {
        selectedValues.value.splice(index, 1);
    } else {
        selectedValues.value.push(optionValue);
    }
    
    emit('update:modelValue', [...selectedValues.value]);
}

function isChecked(optionValue) {
    return selectedValues.value.includes(optionValue);
}
</script>

<template>
    <div class="checkbox-field">
        <div class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
        </div>
        
        <div class="checkbox-options">
            <label 
                v-for="option in field.options" 
                :key="option.value"
                class="checkbox-option"
            >
                <input
                    type="checkbox"
                    :checked="isChecked(option.value)"
                    @change="handleChange(option.value)"
                />
                <span class="checkbox-label">{{ option.label }}</span>
            </label>
        </div>
        
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.checkbox-field {
    width: 100%;
}

.field-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.required {
    color: var(--red-default);
}

.checkbox-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.checkbox-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-option input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.checkbox-label {
    font-size: 14px;
    color: var(--text-primary);
    user-select: none;
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