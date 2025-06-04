<!-- File: src/components/forms/dynamic/fields/DynamicField.vue -->

<script setup>
import { computed } from 'vue';

// Import all field components
import TextField from './TextField.vue';
import SelectField from './SelectField.vue';
import RadioField from './RadioField.vue';
import CheckboxField from './CheckboxField.vue';
import TextareaField from './TextareaField.vue';
import DateField from './DateField.vue';
import FileField from './FileField.vue';
import RatingField from './RatingField.vue';
import NumberField from './NumberField.vue';
import EmailField from './EmailField.vue';
import ImageField from './ImageField.vue';
import VideoField from './VideoField.vue';
import DividerField from './DividerField.vue';
import GroupField from './GroupField.vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    modelValue: {
        default: null
    },
    errors: {
        type: Array,
        default: () => []
    },
    formData: {
        type: Object,
        default: () => ({})
    },
    fieldMap: {
        type: Map,
        default: () => new Map()
    }
});

const emit = defineEmits(['update:modelValue']);

// Map field types to components
const fieldComponents = {
    text: TextField,
    email: EmailField,
    number: NumberField,
    select: SelectField,
    radio: RadioField,
    checkbox: CheckboxField,
    textarea: TextareaField,
    date: DateField,
    file: FileField,
    rating: RatingField,
    image: ImageField,
    video: VideoField,
    divider: DividerField,
    group: GroupField
};

// Get the appropriate component for field type
const fieldComponent = computed(() => {
    return fieldComponents[props.field.type] || TextField;
});

// Handle value updates
function updateValue(value) {
    emit('update:modelValue', value);
}

// Column span classes
const colSpanClass = computed(() => {
    const span = props.field.colSpan || 12;
    return `col-span-${span}`;
});
</script>

<template>
    <div 
        :class="[
            'dynamic-field',
            colSpanClass,
            { 'has-errors': errors.length > 0 }
        ]"
    >
        <component
            :is="fieldComponent"
            :field="field"
            :modelValue="modelValue"
            :errors="errors"
            :formData="formData"
            :fieldMap="fieldMap"
            @update:modelValue="updateValue"
        />
    </div>
</template>

<style scoped>
.dynamic-field {
    width: 100%;
}

.col-span-1 { grid-column: span 1 / span 1; }
.col-span-2 { grid-column: span 2 / span 2; }
.col-span-3 { grid-column: span 3 / span 3; }
.col-span-4 { grid-column: span 4 / span 4; }
.col-span-5 { grid-column: span 5 / span 5; }
.col-span-6 { grid-column: span 6 / span 6; }
.col-span-7 { grid-column: span 7 / span 7; }
.col-span-8 { grid-column: span 8 / span 8; }
.col-span-9 { grid-column: span 9 / span 9; }
.col-span-10 { grid-column: span 10 / span 10; }
.col-span-11 { grid-column: span 11 / span 11; }
.col-span-12 { grid-column: span 12 / span 12; }

@media (max-width: 768px) {
    /* On mobile, all fields take full width */
    .col-span-1,
    .col-span-2,
    .col-span-3,
    .col-span-4,
    .col-span-5,
    .col-span-6,
    .col-span-7,
    .col-span-8,
    .col-span-9,
    .col-span-10,
    .col-span-11,
    .col-span-12 {
        grid-column: span 12 / span 12;
    }
}
</style>