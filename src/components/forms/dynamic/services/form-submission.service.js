// File: src/components/forms/dynamic/services/form-submission.service.js

import { api } from '@utils/api';

export default {
    // Format form data for submission
    formatFormData(formData, fields, includeMetadata = true) {
        const formatted = {};
        
        fields.forEach(field => {
            if (formData[field.id] !== undefined && formData[field.id] !== null) {
                if (includeMetadata) {
                    formatted[field.id] = {
                        type: field.type,
                        label: field.label,
                        value: formData[field.id]
                    };
                } else {
                    formatted[field.id] = formData[field.id];
                }
            }
        });
        
        return formatted;
    },
    
    // Prepare form data for API submission
    prepareSubmissionData(formData, fields, formConfig) {
        const submissionData = {
            form_id: formConfig.id,
            form_name: formConfig.name,
            fields: {},
            submitted_at: new Date().toISOString()
        };
        
        // Process each field
        fields.forEach(field => {
            const fieldId = field.id || field.name;
            if (fieldId && formData[fieldId] !== undefined && formData[fieldId] !== null) {
                // For guest repeater, ensure it's an array
                if (field.type === 'guest_repeater') {
                    submissionData.fields[fieldId] = Array.isArray(formData[fieldId]) 
                        ? formData[fieldId] 
                        : [];
                } else {
                    submissionData.fields[fieldId] = formData[fieldId];
                }
            }
        });
        
        // Add any additional metadata
        if (formConfig.settings && formConfig.settings.includeUserAgent) {
            submissionData.user_agent = navigator.userAgent;
        }
        
        return submissionData;
    },
    
    // Submit form data to API
    async submitForm(apiEndpoint, submissionData) {
        try {
            const response = await api.post(apiEndpoint, submissionData);
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to submit form');
            }
            
            return response;
        } catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    },
    
    // Handle file uploads
    async uploadFiles(files, uploadEndpoint) {
        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await api.post(uploadEndpoint, formData, {}, {
                    'Content-Type': 'multipart/form-data'
                });
                
                return {
                    success: true,
                    file: file.name,
                    url: response.data.url
                };
            } catch (error) {
                return {
                    success: false,
                    file: file.name,
                    error: error.message
                };
            }
        });
        
        return Promise.all(uploadPromises);
    },
    
    // Save form progress (for auto-save feature)
    async saveProgress(formId, formData) {
        const savedData = {
            form_id: formId,
            data: formData,
            saved_at: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem(`form_progress_${formId}`, JSON.stringify(savedData));
        
        return savedData;
    },
    
    // Load saved form progress
    loadProgress(formId) {
        const saved = localStorage.getItem(`form_progress_${formId}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading saved progress:', e);
                return null;
            }
        }
        return null;
    },
    
    // Clear saved progress
    clearProgress(formId) {
        localStorage.removeItem(`form_progress_${formId}`);
    }
};