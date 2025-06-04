<!-- File: src/components/forms/dynamic/fields/TextareaField.vue -->

<script setup>
import TextareaComponent from '@form/textarea/view.vue';

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

function handleInput(value) {
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="textarea-field">
        <TextareaComponent
            :label="field.label + (field.required ? ' *' : '')"
            :value="modelValue"
            :placeholder="field.placeholder || 'Enter text...'"
            :required="field.required"
            @onInput="handleInput"
        />
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.textarea-field {
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