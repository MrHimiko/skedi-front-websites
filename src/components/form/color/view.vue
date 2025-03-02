<script setup>
    import './style.css';

    import { ref } from 'vue';

    import ColorDropdownComponent from '@form/color/dropdown.vue';
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
    });

    const refValue = ref(props.value);

    function onChange(color) 
    {
        refValue.value = 'rgba($r, $g, $b, 1)'.replace('$r', color.rgba.r).replace('$g', color.rgba.g).replace('$b', color.rgba.b);
    }
</script>

<template>
    <div class="c-color pointer">
        <input-component 
            v-dropdown="{ component: ColorDropdownComponent, properties: { value: refValue, onChange }}"
            :label="label" 
            :name="name" 
            :required="required" 
            :value="refValue" 
            :placeholder="placeholder" 
            :disabled="true"
            iconRight="palette"
        >
            <template #left>
                <div class="display">
                    <div class="color" :style="'background:' + refValue"></div>
                    {{ refValue }}
                </div>
            </template>
        </input-component>
    </div>
</template>
