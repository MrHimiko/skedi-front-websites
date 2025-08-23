<template>
    <div class="tree-view">
        <ul class="tree-list" v-if="teams && teams.length > 0">
            <TreeNode
                v-for="team in teams"
                :key="team.id"
                :team="team"
                :organization-slug="organizationSlug"
                @click="$emit('teamClick', $event)"
            />
        </ul>
    </div>
</template>

<script setup>
const props = defineProps({
    teams: {
        type: Array,
        required: true
    },
    organizationSlug: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['teamClick']);
</script>

<style scoped>
.tree-view {
    width: 100%;
}

.tree-list {
    list-style: none;
    margin: 0;
    padding: 0;
}
</style>