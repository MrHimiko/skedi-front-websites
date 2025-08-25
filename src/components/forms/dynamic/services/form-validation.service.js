// File: src/components/forms/dynamic/services/form-validation.service.js

export default {
    // Validate a single field
    validateField(field, value) {
        const errors = [];
        
        console.log(`[FormValidation] Validating field ${field.id || field.name}:`, {
            field: field,
            value: value,
            required: field.required,
            type: field.type
        });
        
        // Required validation
        if (field.required && this.isEmpty(value)) {
            const errorMsg = `${field.label} is required`;
            console.log(`[FormValidation] Required validation failed for ${field.id || field.name}:`, errorMsg);
            errors.push(errorMsg);
            // Return early for required fields to avoid duplicate messages
            return errors;
        }
        
        // Type-specific validation (only if value is not empty)
        if (!this.isEmpty(value)) {
            switch (field.type) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        errors.push('Please enter a valid email address');
                    }
                    break;
                    
                case 'number':
                    if (isNaN(Number(value))) {
                        errors.push('Please enter a valid number');
                    }
                    if (field.min !== undefined && Number(value) < field.min) {
                        errors.push(`Value must be at least ${field.min}`);
                    }
                    if (field.max !== undefined && Number(value) > field.max) {
                        errors.push(`Value must be at most ${field.max}`);
                    }
                    break;
                    
                case 'text':
                    if (field.minLength && value.length < field.minLength) {
                        errors.push(`Must be at least ${field.minLength} characters`);
                    }
                    if (field.maxLength && value.length > field.maxLength) {
                        errors.push(`Must be at most ${field.maxLength} characters`);
                    }
                    if (field.pattern && !new RegExp(field.pattern).test(value)) {
                        errors.push(field.patternMessage || 'Invalid format');
                    }
                    break;
                    
                case 'file':
                    // Handle both single and multiple files
                    const files = Array.isArray(value) ? value : [value];
                    
                    files.forEach(file => {
                        // Check file size
                        if (field.maxFileSize) {
                            const maxSizeBytes = field.maxFileSize * 1024 * 1024;
                            if (file.size > maxSizeBytes) {
                                errors.push(`File size must be less than ${field.maxFileSize}MB`);
                            }
                        }
                        
                        // Check file type
                        if (field.acceptedFileTypes) {
                            const accepted = field.acceptedFileTypes.split(' ');
                            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
                            if (!accepted.includes(fileExt)) {
                                errors.push(`File type must be: ${field.acceptedFileTypes}`);
                            }
                        }
                    });
                    break;
                    
                case 'checkbox':
                    if (field.required && (!value || value.length === 0)) {
                        errors.push('Please select at least one option');
                    }
                    if (field.minSelection && value && value.length < field.minSelection) {
                        errors.push(`Please select at least ${field.minSelection} options`);
                    }
                    if (field.maxSelection && value && value.length > field.maxSelection) {
                        errors.push(`Please select at most ${field.maxSelection} options`);
                    }
                    break;
            }
        }
        
        console.log(`[FormValidation] Field ${field.id || field.name} validation result:`, {
            errors: errors,
            hasErrors: errors.length > 0
        });
        
        return errors;
    },
    
    // Check if value is empty
    isEmpty(value) {
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && Object.keys(value).length === 0) return true;
        return false;
    },
    
    // Validate email format
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Validate entire form
    validateForm(visibleFields, formData) {
        console.log('[FormValidation] validateForm called:', {
            visibleFields: visibleFields.map(f => ({
                id: f.id || f.name,
                type: f.type,
                required: f.required,
                label: f.label
            })),
            formData: formData
        });
        
        const errors = {};
        let hasErrors = false;
        
        visibleFields.forEach(field => {
            // Skip non-input fields
            if (['divider', 'image', 'video', 'step', 'group'].includes(field.type)) {
                return;
            }
            
            const fieldId = field.id || field.name;
            const fieldValue = formData[fieldId];
            
            console.log(`[FormValidation] Processing field ${fieldId}:`, {
                fieldValue: fieldValue,
                field: field
            });
            
            const fieldErrors = this.validateField(field, fieldValue);
            if (fieldErrors.length > 0) {
                errors[fieldId] = fieldErrors;
                hasErrors = true;
                
                console.log(`[FormValidation] Field ${fieldId} has errors:`, fieldErrors);
            }
        });
        
        console.log('[FormValidation] Final validation result:', {
            errors: errors,
            hasErrors: hasErrors
        });
        
        return { errors, hasErrors };
    },
    
    // Validate a single step
    validateStep(stepFields, formData) {
        const errors = {};
        let hasErrors = false;
        
        stepFields.forEach(field => {
            if (['divider', 'image', 'video'].includes(field.type)) {
                return;
            }
            
            const fieldId = field.id || field.name;
            const fieldErrors = this.validateField(field, formData[fieldId]);
            if (fieldErrors.length > 0) {
                errors[fieldId] = fieldErrors;
                hasErrors = true;
            }
        });
        
        return { errors, hasErrors };
    }
};