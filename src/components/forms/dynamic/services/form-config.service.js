// File: src/components/forms/dynamic/services/form-config.service.js

import { api } from '@utils/api';

export default {
    // Fetch form configuration from any API endpoint
    async getFormConfig(apiEndpoint) {
        try {
            const response = await api.get(apiEndpoint);
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch form configuration');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching form config:', error);
            throw error;
        }
    },
    
    // Process form fields into a structured format
    processFormFields(fields) {
        const fieldMap = new Map();
        const rootFields = [];
        const steps = [];
        
        // First pass: create field map
        fields.forEach(field => {
            // Ensure all fields have an id
            if (!field.id && field.name) {
                field.id = field.name;
            }
            
            if (field.id) {
                fieldMap.set(field.id, field);
            }
        });
        
        // Second pass: organize fields
        fields.forEach(field => {
            if (field.type === 'step') {
                steps.push(field);
            } else if (!this.isChildField(field, fields)) {
                rootFields.push(field);
            }
        });
        
        return {
            fieldMap,
            rootFields,
            steps,
            hasSteps: steps.length > 0
        };
    },
    
    // Check if a field is a child of another field
    isChildField(field, allFields) {
        return allFields.some(f => 
            f.children && f.children.includes(field.id)
        );
    },
    
    // Get fields for a specific step
    getStepFields(step, fieldMap) {
        if (!step.children) return [];
        
        return step.children
            .map(childId => fieldMap.get(childId))
            .filter(field => field);
    },
    
    // Check field visibility based on conditions
    checkFieldVisibility(field, formData) {
        if (!field.visibility) return true;
        
        const { logic, conditions } = field.visibility;
        
        if (!conditions || conditions.length === 0) return true;
        
        const results = conditions.map(condition => {
            const fieldValue = formData[condition.field];
            
            switch (condition.operator) {
                case 'equals':
                    return fieldValue === condition.value;
                case 'not_equals':
                    return fieldValue !== condition.value;
                case 'contains':
                    return fieldValue && fieldValue.includes(condition.value);
                case 'greater_than':
                    return Number(fieldValue) > Number(condition.value);
                case 'less_than':
                    return Number(fieldValue) < Number(condition.value);
                case 'is_empty':
                    return !fieldValue || fieldValue.length === 0;
                case 'is_not_empty':
                    return fieldValue && fieldValue.length > 0;
                default:
                    return true;
            }
        });
        
        return logic === 'all' 
            ? results.every(r => r) 
            : results.some(r => r);
    },
    
    // Get all visible fields (for validation)
    getVisibleFields(fields, formData, fieldMap) {
        const visibleFields = [];
        
        const checkField = (field) => {
            if (this.checkFieldVisibility(field, formData)) {
                visibleFields.push(field);
                
                // Check children if it's a group
                if (field.type === 'group' && field.children) {
                    field.children.forEach(childId => {
                        const childField = fieldMap.get(childId);
                        if (childField) {
                            checkField(childField);
                        }
                    });
                }
            }
        };
        
        fields.forEach(field => checkField(field));
        
        return visibleFields;
    }
};