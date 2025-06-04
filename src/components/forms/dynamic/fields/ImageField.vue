<!-- File: src/components/forms/dynamic/fields/ImageField.vue -->

<script setup>
const props = defineProps({
    field: {
        type: Object,
        required: true
    }
});
</script>

<template>
    <div class="image-field">
        <div v-if="field.label" class="field-label">
            {{ field.label }}
        </div>
        
        <div class="image-container">
            <img 
                v-if="field.src" 
                :src="field.src" 
                :alt="field.alt || field.label || 'Image'"
                class="field-image"
            />
            <div v-else class="image-placeholder">
                <i class="material-icons-outlined">image</i>
                <span>No image available</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.image-field {
    width: 100%;
}

.field-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.image-container {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--background-1);
}

.field-image {
    width: 100%;
    height: auto;
    display: block;
}

.image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--text-tertiary);
}

.image-placeholder i {
    font-size: 48px;
    margin-bottom: 8px;
}
</style>