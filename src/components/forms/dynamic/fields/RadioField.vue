<!-- File: src/components/forms/dynamic/fields/RadioField.vue -->

<script setup>
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
    }
});

const emit = defineEmits(['update:modelValue']);

function handleChange(value) {
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="radio-field">
        <div class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
        </div>
        
        <div class="radio-options">
            <label 
                v-for="option in field.options" 
                :key="option.value"
                class="radio-option"
            >
                <input
                    type="radio"
                    :name="`radio-${field.id}`"
                    :value="option.value"
                    :checked="modelValue === option.value"
                    @change="handleChange(option.value)"
                />
                <span class="radio-label">{{ option.label }}</span>
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
.radio-field {
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

.radio-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.radio-option input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.radio-label {
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