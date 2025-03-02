<script setup>
    import { ref, watch } from 'vue';
    import { Chrome } from '@ckpack/vue-color';

    const props = defineProps({
        
        value: {
            type: String
        },
        onChange: {
            type: Function,
        }
    });
    
    const color = ref({ rgba: props.value });

    watch(color, (newColor) => 
    {
        props.onChange(newColor);
    });
</script>

<template>
    <div class="c-color-dropdown">
        <Chrome v-model="color"/>
    </div>
</template>