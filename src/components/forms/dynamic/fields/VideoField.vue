<!-- File: src/components/forms/dynamic/fields/VideoField.vue -->

<script setup>
const props = defineProps({
    field: {
        type: Object,
        required: true
    }
});
</script>

<template>
    <div class="video-field">
        <div v-if="field.label" class="field-label">
            {{ field.label }}
        </div>
        
        <div class="video-container">
            <video 
                v-if="field.src" 
                :src="field.src"
                :poster="field.thumbnail"
                :autoplay="field.autoplay"
                controls
                class="field-video"
            >
                Your browser does not support the video tag.
            </video>
            <div v-else class="video-placeholder">
                <i class="material-icons-outlined">videocam</i>
                <span>No video available</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.video-field {
    width: 100%;
}

.field-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
}

.video-container {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--background-1);
}

.field-video {
    width: 100%;
    height: auto;
    display: block;
}

.video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--text-tertiary);
}

.video-placeholder i {
    font-size: 48px;
    margin-bottom: 8px;
}
</style>