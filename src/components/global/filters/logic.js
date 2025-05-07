import { ref } from 'vue';
import { common } from '@utils/common';
import router from '@/router';

let refFilters = ref([]);

function getFilters(type)
{
    if (type === 'text')
    {
        return [
            { label: 'Equals', value: 'equals' },
            { label: 'NoteEquals', value: 'not_equals' },
            { label: 'Starts With', value: 'starts_with' },
            { label: 'Ends With', value: 'ends_width' },
            { label: 'Contains', value: 'contains' }
        ];
    }
    return [];
}

function getFields(fields)
{
    const array = [];

    if(!Array.isArray(fields))
    {
        return [];
    }

    fields.forEach((field) =>
    {
        array.push({
            type: 'Separator',
            width: 12,
            properties: {
                title: field.name,
                as: 'left'
            }
        });

        if(field.type === 'text')
        {
            array.push({
                type: 'Select',
                name: field.name + '@operator',
                width: 6,
                properties: {
                    value: 'contains',
                    options: getFilters(field.type)
                }
            });

            array.push({
                type: 'Input',
                name: field.name + '@value',
                width: 6,
                properties: {
                    placeholder: 'Value'
                }
            });
        }
        else if(field.type === 'relation')
        {
            array.push({
                type: 'Select',
                name: field.name + '@value',
                width: 12,
                properties: {
                    placeholder: 'Select...',
                    endpoint: field.endpoint
                }
            });
        }
        else if(field.type === 'boolean')
        {
            array.push({
                type: 'Select',
                name: field.name + '@value',
                width: 12,
                properties: {
                    options: [
                        {label: 'Any', value: null},
                        {label: 'Yes', value: 'true'},
                        {label: 'No', value: 'false'}
                    ]
                }
            });
        }
    });

    return array;
}

function getValues()
{
    const values = {};

    refFilters.value?.forEach((filter) => 
    {
        if(filter.value)
        {
            values[filter.field + '@value'] = filter.value;
        }
    });

    return values;
}

async function handleRemove(index, onChange)
{
    refFilters.value.splice(index, 1);

    await router.replace({
        query: {
            ...router.currentRoute.value.query,
            filters: refFilters.value.length ? JSON.stringify(refFilters.value) : undefined
        }
    });

    if(onChange)
    {
        onChange(refFilters.value);
    }
}

async function handleChange(event, data, fields, onChange)
{
    refFilters.value = [];

    fields.forEach((field) => 
    {
        let operator = data[field.name + '@operator'];
        const value = data[field.name + '@value'];

        if(['relation', 'boolean'].includes(field.type))
        {
            operator = 'equals';
        }

        if(!operator || !value)
        {
            return true;
        }

        refFilters.value.push({
            field: field.name,
            operator,
            value
        });
    });

    await router.replace({
        query: {
            ...router.currentRoute.value.query,
            filters: refFilters.value.length ? JSON.stringify(refFilters.value) : undefined
        }
    });

    if(onChange)
    {
        onChange(refFilters.value);
    }
}

async function handleSearch(value, field, onChange)
{
    refFilters.value = refFilters.value.filter((item) => item.field !== 'name');

    if(value)
    {
        refFilters.value.push({
            field,
            operator: 'contains',
            value
        })
    }

    await router.replace({
        query: {
            ...router.currentRoute.value.query,
            filters: refFilters.value.length ? JSON.stringify(refFilters.value) : undefined
        }
    });

    onChange(refFilters.value);
}

export {
    refFilters,
    getFields,
    getValues,
    handleRemove,
    handleChange,
    handleSearch
}