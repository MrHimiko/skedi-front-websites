<script setup>
    import './style.css';
    import { ref, watch } from 'vue';
    import VueDatePicker from "@vuepic/vue-datepicker";
    import "@vuepic/vue-datepicker/dist/main.css";

    const props = defineProps({
        value: {
            type: [String, Date],
            default: ''
        },
        onChange: {
            type: Function,
            required: true
        }
    });

    const formatTokens = {
        'dd': (date) => date.getDate().toString().padStart(2, '0'),
        'mm': (date) => (date.getMonth() + 1).toString().padStart(2, '0'),
        'yyyy': (date) => date.getFullYear().toString(),
        'HH': (date) => date.getHours().toString().padStart(2, '0'),
        'mi': (date) => date.getMinutes().toString().padStart(2, '0'),
        'ss': (date) => date.getSeconds().toString().padStart(2, '0')
    };

    const parseDate = (dateString) => 
    {
        if (!dateString) return new Date();
        
        const parts = dateString.split(/[\/-\s:]/);

        if (parts.length >= 3) 
        {
            let [day, month, year, hours = 0, minutes = 0, seconds = 0] = parts.map(Number);
            return new Date(year, month - 1, day, hours, minutes, seconds);
        }

        return new Date(dateString);
    };

    const formatDate = (date) => 
    {
        return 'dd/mm/yyyy HH:mi:ss'.replace(/dd|mm|yyyy|HH|mi|ss/g, match => formatTokens[match](date));
    };

    const date = ref(parseDate(props.value));

    watch(
        () => props.value,
        (newValue) => {
            date.value = parseDate(newValue);
        },
        { immediate: true }
    );

    watch(date, (newDate) => 
    {
        if(newDate instanceof Date && !isNaN(newDate)) 
        {
            props.onChange(formatDate(newDate));
        }
    });
</script>

<template>
    <div class="c-date-dropdown">
        <VueDatePicker inline auto-apply dark v-model="date" enable-time-picker />
    </div>
</template>
