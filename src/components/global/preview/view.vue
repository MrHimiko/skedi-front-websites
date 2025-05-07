<script setup>
    import './style.css';

    import { ref, onMounted, onUnmounted } from 'vue';
    import { fetch } from '@utils/fetch';

    import ButtonComponent from '@form/button/view.vue';

    const resource = ref(null);

    const props = defineProps({
        endpoint: String,
        binds: Array,
        route: String
    });

    onMounted(() => 
    {
        fetch.one(props.endpoint).then((data) => 
        {
            resource.value = data;
        })
    });

    onUnmounted(() =>
    {
        resource.value = null;
    });
</script>

<template>
    <div class="c-preview animation-background">
        <div class="top">
            <p v-if="resource">{{ resource[binds[1]] }}</p>
            <p v-if="resource" class="tag bg3">{{ resource[binds[2]] }}</p>
            <p v-if="!resource">Loading...</p>
        </div>

        <div class="bottom">
            <router-link to="">
                <button-component label="View"></button-component>
            </router-link>
        </div>
        <div class="animation-background-div"></div>
    </div>
</template>