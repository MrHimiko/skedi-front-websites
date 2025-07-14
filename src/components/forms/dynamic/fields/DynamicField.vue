
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
import GuestRepeaterField from './GuestRepeaterField.vue';

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
    group: GroupField,
    guest_repeater: GuestRepeaterField,
    // Support old naming conventions
    input: TextField,
};

// Get the appropriate component for field type
const fieldComponent = computed(() => {
    // Check for system fields that should use specific components
    if (props.field.name === 'system_contact_name' || (props.field.type === 'text' && props.field.system_field)) {
        return TextField;
    }
    if (props.field.name === 'system_contact_email' || (props.field.type === 'email' && props.field.system_field)) {
        return EmailField;
    }
    if (props.field.name === 'system_contact_guests' || props.field.type === 'guest_repeater') {
        return GuestRepeaterField;
    }
    
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
        :id="`field-${field.id || field.name}`"
    >
        <component
            :is="fieldComponent"
            :field="field"
            :modelValue="modelValue"
            :error="errors[0]"
            @update:modelValue="updateValue"
            v-bind="$attrs"
        />
    </div>
</template>

<style scoped>
.dynamic-field {
    width: 100%;
}

.has-errors {
    position: relative;
}

/* Column span utilities */
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
</style>