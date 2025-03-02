<script setup lang="ts">
import { PropType } from 'vue';
import PopupLayout from '@layouts/popup/view.vue';
import ButtonComponent from '@form/button/view.vue';

import { form } from '@utils/form';
import type { FormCallbackType } from '@/types';

defineProps({
    description: {
        type: String,
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    callback: {
        type: Function as PropType<FormCallbackType>,
        required: true
    },
    as: {
        type: String,
        required: true
    }
});

function onSubmit(event: Event, type: string, endpoint: string, callback: FormCallbackType)
{
    if (type && endpoint)
    {   
        form.toAPI(event, type, endpoint, callback);
    }   
    else if(callback)
    {
        form.getData(event, callback);
    }
}
</script>

<template>
<popup-layout class="h-auto" title="Confirm">
    <template #content>
        <p class="text-secondary" style="max-width: 360px">{{ description }}</p>

        <div class="p-xl"></div>

        <form @submit.prevent="(event) => onSubmit(event, type, endpoint, callback)">
            <div class="actions grid grid-2 gap-2xl">
                <div>
                    <div class="c-button tertiary i-popup-close pointer">Close</div>
                </div>
                <div>
                    <button-component :as="as" type="submit" label="Confirm"></button-component>
                </div>
            </div>
        </form>
    </template>
</popup-layout>
</template>
