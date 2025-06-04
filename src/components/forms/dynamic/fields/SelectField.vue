<!-- File: src/components/forms/dynamic/fields/SelectField.vue -->

<script setup>
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
    }
});

const emit = defineEmits(['update:modelValue']);

function handleChange(value) {
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="select-field">
        <SelectComponent
            :label="field.label + (field.required ? ' *' : '')"
            :value="modelValue"
            :options="field.options || []"
            :placeholder="field.placeholder || 'Select an option'"
            :required="field.required"
            @change="handleChange"
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