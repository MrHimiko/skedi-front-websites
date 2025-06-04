<!-- File: src/components/forms/dynamic/fields/EmailField.vue -->

<script setup>
import InputComponent from '@form/input/view.vue';

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

function handleChange(event, value) {
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="email-field">
        <InputComponent
            :label="field.label + (field.required ? ' *' : '')"
            :value="modelValue"
            :placeholder="field.placeholder || 'Enter email address...'"
            :required="field.required"
            type="email"
            @onChange="handleChange"
        />
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.email-field {
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