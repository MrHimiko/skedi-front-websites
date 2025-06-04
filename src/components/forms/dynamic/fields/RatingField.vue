<!-- File: src/components/forms/dynamic/fields/RatingField.vue -->

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    modelValue: {
        type: Number,
        default: 0
    },
    errors: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue']);

const rating = ref(props.modelValue || 0);
const hoveredRating = ref(0);
const maxRating = props.field.maxRating || 5;

watch(() => props.modelValue, (newValue) => {
    rating.value = newValue || 0;
});

function setRating(value) {
    rating.value = value;
    emit('update:modelValue', value);
}

function setHoveredRating(value) {
    hoveredRating.value = value;
}

function clearHoveredRating() {
    hoveredRating.value = 0;
}
</script>

<template>
    <div class="rating-field">
        <div class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
        </div>
        
        <div class="rating-stars" @mouseleave="clearHoveredRating">
            <button
                v-for="star in maxRating"
                :key="star"
                type="button"
                class="star-button"
                :class="{ 
                    'filled': star <= (hoveredRating || rating),
                    'hovered': star <= hoveredRating
                }"
                @click="setRating(star)"
                @mouseenter="setHoveredRating(star)"
            >
                <i class="material-icons-outlined">
                    {{ star <= (hoveredRating || rating) ? 'star' : 'star_border' }}
                </i>
            </button>
        </div>
        
        <div v-if="rating > 0" class="rating-value">
            {{ rating }} out of {{ maxRating }}
        </div>
        
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.rating-field {
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

.rating-stars {
    display: flex;
    gap: 4px;
    align-items: center;
}

.star-button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--text-tertiary);
    transition: color 0.2s;
}

.star-button.filled {
    color: #f59e0b;
}

.star-button.hovered {
    color: #f59e0b;
}

.star-button i {
    font-size: 24px;
}

.rating-value {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-tertiary);
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