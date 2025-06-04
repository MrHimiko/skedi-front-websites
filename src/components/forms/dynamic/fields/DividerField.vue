<!-- File: src/components/forms/dynamic/fields/DividerField.vue -->

<script setup>
const props = defineProps({
    field: {
        type: Object,
        required: true
    }
});
</script>

<template>
    <div class="divider-field">
        <hr :class="['divider', field.style || 'solid']" />
    </div>
</template>

<style scoped>
.divider-field {
    width: 100%;
    padding: 12px 0;
}

.divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0;
}

.divider.solid {
    border-top-style: solid;
}

.divider.dashed {
    border-top-style: dashed;
}

.divider.dotted {
    border-top-style: dotted;
}
</style>