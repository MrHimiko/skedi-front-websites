<script setup>
import ButtonComponent from '@form/button/view.vue';
import { PhLink, PhUsers, PhCode, PhPlus, PhDotsThree, PhGearSix } from "@phosphor-icons/vue";
import TeamList from '@user_teams/components/teamList/view.vue';
import TeamCreateForm from '@user_teams/components/form/teamCreate.vue';
import TeamEditForm from '@user_teams/components/form/teamEdit.vue';
import { api } from '@utils/api';
import { popup } from '@utils/popup';
import { UserStore } from '@stores/user';
import { ref, inject } from 'vue';

import { hasAdminAccess, getUserCount, hasSubteams } from '@user_shared/utils/js/organization-structure.js';

// Create a unique symbol for the reload function
const RELOAD_KEY = Symbol('reloadTeams');

const userStore = UserStore();
const refreshKey = ref(0);

const props = defineProps({
    teams: {
        type: Array,
        required: true
    },
    orgId: {
        type: String,
        required: true
    },
    orgSlug: {
        type: String,
        required: true
    },
    orgUsers: {
        type: Array,
        default: () => []
    },
    currentUserId: {
        type: Number,
        required: true
    },
    reloadData: {
        type: Function,
        default: null
    }
});

// Try to inject the reload function from a parent component
const injectedReload = inject(RELOAD_KEY, null);

// Create a function to call the appropriate reload method
function triggerReload() {
    // Increment the refresh key to force this component to re-render
    refreshKey.value++;
    
    // First try to use the prop-based reload function
    if (props.reloadData) {
        props.reloadData();
    } 
    // If no prop-based reload, try to use the injected one
    else if (injectedReload) {
        injectedReload();
    }
}

function getTeamUrl(team) {
    if (!team || !team.slug) return '#';
    return `https://skedi.com/${props.orgSlug}/${team.slug}`;
}
</script>

<template>
    <ul class="teams-list" :key="refreshKey">
        <li v-for="team in teams" :key="team.id" class="team-item">
            <div class="team">
                <div class="top">
                    <h2>{{ team.name }}</h2>
                    <a :href="getTeamUrl(team)" class="team-url">
                        {{ getTeamUrl(team) }}
                    </a>

                    <div class="info">
                        <div class="item">
                            <div class="icon">
                                <PhUsers weight="bold" />
                            </div>
                            <span>{{ getUserCount(team) }}</span>
                        </div>
                    </div>

                    <!-- Display list of users if available -->
                    <div class="list-of-users" v-if="team.users && team.users.length">
                        <div class="user-item" 
                             v-for="user in team.users" 
                             :key="user.id"
                             :class="user.effective_role ? 'role-' + user.effective_role : ''"
                             v-tooltip="{ content: `Role: ${user.effective_role || 'member'}` }">
                            {{ user.name }}
                        </div>
                    </div>
                </div>

                <div class="bottom">
                    <div class="right">
                        <div class="actions">
                            <ButtonComponent
                                v-tooltip="{ content: 'Copy URL' }"
                                as="secondary icon"
                                :iconLeft="{ component: PhLink, weight: 'bold' }"
                            />
                            <ButtonComponent 
                                v-tooltip="{ content: 'Embed on a website' }"
                                as="secondary icon"
                                :iconLeft="{ component: PhCode, weight: 'bold' }"
                            />

                            <button-component v-tooltip="{ content: 'Settings' }" as="secondary icon"
                                :iconLeft="{ component: PhGearSix, weight: 'bold' }" 
                                v-popup="{
                                    component: TeamEditForm,
                                    overlay: { position: 'center' },
                                    properties: {
                                        endpoint: `organizations/${orgId}/teams/${team.id}`,
                                        type: 'PUT',
                                        callback: (event, data, response, success) => {
                                            console.log(response);
                                            popup.close();
                                            triggerReload();
                                        },
                                        class: 'h-auto',
                                        title: `Edit ${team.name}`,
                                        values: () => {return {name: team.name, slug: team.slug, color:team.color} }
                                    }
                                }"
                            />

                            <ButtonComponent v-if="hasAdminAccess(team)"
                                v-tooltip="{ content: 'Create subteam' }"
                                as="secondary icon"
                                :iconLeft="{ component: PhPlus, weight: 'bold' }"
                                v-popup="{
                                    component: TeamCreateForm,
                                    overlay: { position: 'center' },
                                    properties: {
                                        endpoint: `organizations/${orgId}/teams?parent_team_id=${team.id}`,
                                        type: 'POST',
                                        callback: (event, data, response, success) => {
                                            console.log(response);
                                            popup.close();
                                            triggerReload();
                                        },
                                        class: 'h-auto',
                                        title: `Create new subteam of ${team.name}`,
                                    }
                                }"
                            />
                            <ButtonComponent v-if="hasAdminAccess(team)"
                                as="secondary icon"
                                :iconLeft="{ component: PhDotsThree, weight: 'bold' }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recursive rendering of subteams -->
            <div v-if="hasSubteams(team)" class="subteam-wrapper">
                <TeamList
                    :teams="team.teams"
                    :orgSlug="orgSlug"
                    :orgUsers="orgUsers"
                    :orgId="orgId"
                    :currentUserId="currentUserId"
                    :reloadData="triggerReload"
                />
            </div>
        </li>
    </ul>
</template>

<style scoped>
.teams-list {
    list-style-type: none;
    padding-left: 1em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}
</style>