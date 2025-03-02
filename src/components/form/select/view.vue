<script setup>
    import { ref, onMounted, onUnmounted } from 'vue';
    import { fetch } from '@utils/fetch';

    import InputComponent from '@form/input/view.vue';
    import MenusComponent from '@global/menus/view.vue';

    const props = defineProps({
        options: {
            type: Array
        },
        endpoint: {
            type: String
        },
        label: {
            type: String
        },
        name: {
            type: String
        },
        type: {
            type: String,
            default: 'text'
        },
        required: {
            type: Boolean
        },
        value: {
            type: String
        },
        placeholder: {
            type: String
        },
        iconLeft: {
            type: String,
            default: ''
        },
        iconRight: {
            type: String,
            default: 'unfold_more'
        }
    });

    const refValue = ref(props.value);
    const refDisplay = ref(null);

    function onClick(event, item, index)
    {
        refValue.value = item.value;
        refDisplay.value = item.label;
    }

    onMounted(() => 
    {
        if(props.endpoint && props.value)
        {
            refDisplay.value = 'Loading...';

            fetch.one(props.endpoint + '/' + props.value).then((data) => 
            {
                refDisplay.value = (data.name ?? data.title);
            });
        }
        else if(Array.isArray(props.options))
        {
            props.options.forEach((option) => 
            {
                if(option.value == props.value)
                {
                    refDisplay.value = option.label;
                }
            })
        }
    });

    onUnmounted(() => 
    {
        refDisplay.value = null;
    });
</script>

<template>
    <div class="c-select">
        <input-component 
            v-dropdown="{ component: MenusComponent, properties: { onClick, search: true, endpoint, menus: options} }" 
            :label="label" 
            :name="name" 
            :type="type" 
            :required="required" 
            :value="refValue" 
            :placeholder="placeholder" 
            :display="refDisplay"
            :iconLeft="iconLeft" 
            :iconRight="iconRight"
        />
    </div>
</template>
