<!-- File: src/components/forms/dynamic/fields/FileField.vue -->

<script setup>
import { ref } from 'vue';

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
    }
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const selectedFiles = ref([]);

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    if (props.field.multiple) {
        selectedFiles.value = files;
        emit('update:modelValue', files);
    } else {
        selectedFiles.value = files.slice(0, 1);
        emit('update:modelValue', files[0]);
    }
}

function removeFile(index) {
    selectedFiles.value.splice(index, 1);
    
    if (props.field.multiple) {
        emit('update:modelValue', [...selectedFiles.value]);
    } else {
        emit('update:modelValue', null);
    }
    
    // Clear the file input
    if (fileInput.value) {
        fileInput.value.value = '';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<template>
    <div class="file-field">
        <div class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
        </div>
        
        <div class="file-input-wrapper">
            <input
                ref="fileInput"
                type="file"
                :accept="field.acceptedFileTypes"
                :multiple="field.multiple"
                @change="handleFileSelect"
                class="file-input"
            />
            
            <button type="button" class="file-button" @click="fileInput.click()">
                <i class="material-icons-outlined">upload_file</i>
                <span>Choose {{ field.multiple ? 'Files' : 'File' }}</span>
            </button>
            
            <div v-if="field.maxFileSize" class="file-hint">
                Max file size: {{ field.maxFileSize }}MB
            </div>
        </div>
        
        <div v-if="selectedFiles.length > 0" class="selected-files">
            <div 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="file-item"
            >
                <div class="file-info">
                    <i class="material-icons-outlined">description</i>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                </div>
                <button 
                    type="button" 
                    class="remove-file"
                    @click="removeFile(index)"
                >
                    <i class="material-icons-outlined">close</i>
                </button>
            </div>
        </div>
        
        <div v-if="errors.length > 0" class="field-errors">
            <span v-for="(error, index) in errors" :key="index" class="error-message">
                {{ error }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.file-field {
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

.file-input-wrapper {
    position: relative;
}

.file-input {
    display: none;
}

.file-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background-color: var(--background-1);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.file-button:hover {
    background-color: var(--background-2);
}

.file-button i {
    font-size: 20px;
}

.file-hint {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-tertiary);
}

.selected-files {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: var(--background-1);
    border: 1px solid var(--border);
    border-radius: 4px;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
}

.file-info i {
    font-size: 20px;
    color: var(--text-tertiary);
}

.file-name {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-size {
    font-size: 12px;
    color: var(--text-tertiary);
}

.remove-file {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-file:hover {
    color: var(--red-default);
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