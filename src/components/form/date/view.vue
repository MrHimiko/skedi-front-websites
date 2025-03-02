<script setup>
    import { ref } from 'vue';

    import DateDropdownComponent from '@form/date/dropdown.vue';
    import InputComponent from '@form/input/view.vue';

    const props = defineProps({
        label: {
            type: String,
        },
        name: {
            type: String,
        },
        required: {
            type: Boolean,
        },
        value: {
            type: String,
        },
        placeholder: {
            type: String,
        },
        mask: {
            type: String,
            default: '##/##/####'
        }
    });

    const refValue = ref(props.value);

    function onChange(date) 
    {
        refValue.value = date;
    }
</script>

<template>
    <div class="c-date pointer">
        <input-component 
            v-dropdown="{ component: DateDropdownComponent, properties: () => { return { value: refValue, onChange } } }"
            :label="label" 
            :name="name" 
            :required="required" 
            :value="refValue" 
            :placeholder="placeholder" 
            :mask="mask"
            iconRight="calendar_month"
        > </input-component>
    </div>
</template>
