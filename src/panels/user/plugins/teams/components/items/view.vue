<script setup>
import './style.css';
import { ref, onMounted, toRaw, computed } from 'vue';
import { fetch } from '@utils/fetch';
import { api } from '@utils/api';
import { PhGearSix, PhPlus, PhCode, PhLink, PhUsers, PhDotsThree } from "@phosphor-icons/vue";
import ButtonComponent from '@form/button/view.vue';
import BuilderPopupComponent from '@/components/builder/popup/view.vue';
import TeamList from '@user_teams/components/teamList/view.vue';
import { UserStore } from '@stores/user';

const userStore = UserStore();
const currentUserId = userStore.getId();
const organizations = ref([]);

// Create team tree structure
function createTeamTree(teams, parentId = null) {
  return teams
    .filter(team => {
      // Safe access for proxy objects with null checks
      if (!team || !team.entity) return false;
      
      // Handle the case where parent_team_id might be undefined or null
      if (parentId === null) {
        return !team.entity.parent_team_id; // Top level teams have no parent
      }
      
      return team.entity.parent_team_id === parentId;
    })
    .map(team => {
      // Safely access team data with null checks
      const teamData = team.entity || {};
      
      // Create the team structure with nested teams array instead of children
      return {
        // Copy all properties from the team entity
        ...teamData,
        role: team.role || 'member',
        effective_role: team.role || 'member',
        // Rename the 'children' concept to 'teams' as per the requested structure
        teams: createTeamTree(teams, teamData.id)
      };
    });
}

// Merge organizations and teams into a hierarchical structure
function mergeOrganizationsAndTeams() {
  // Get the data and unwrap proxies with toRaw
  const teams = toRaw(userStore.getTeams() || []);
  const orgs = toRaw(userStore.getOrganizations() || []);
  
  console.log("Teams from store (unwrapped):", teams);
  console.log("Organizations from store (unwrapped):", orgs);
  
  // Create organizations with nested team structure
  const enhancedOrgs = orgs.map(org => {
    // Make sure to use safe access with optional chaining for proxy objects
    const orgId = org.entity?.id;
    console.log("Processing organization ID:", orgId);
    
    // Find all teams for this organization, and handle possible proxy objects
    const orgTeams = teams.filter(team => {
      // Safe access with null checks for proxy objects
      if (!team || !team.entity || !team.entity.organization_id) return false;
      return team.entity.organization_id === orgId;
    });
    
    console.log(`Teams for org ${orgId}:`, orgTeams);
    
    // Create the team tree for this organization (only top-level teams)
    const topLevelTeams = createTeamTree(orgTeams, null);
    
    // Return organization with all its data and the nested teams structure
    return {
      // Include all properties from org.entity with safe access
      ...(org.entity || {}),
      // Override/add specific properties as needed
      id: orgId,
      name: org.entity?.name || 'Unnamed Organization',
      slug: org.entity?.slug || 'unnamed-org',
      users: org.entity?.users || [],
      // Use the teams array with nested structure as requested
      teams: topLevelTeams
    };
  });
  
  return enhancedOrgs;
}

function createTeam(organizationId) {
  // Implement team creation logic
  console.log("Creating new team for organization:", organizationId);
  // You would typically open a form/modal here or navigate to a team creation page
}

// Debug function to log and unwrap proxies
function logObject(label, obj) {
  try {
    const unwrapped = toRaw(obj);
    console.log(label, JSON.parse(JSON.stringify(unwrapped)));
  } catch (e) {
    console.log(`Error logging ${label}:`, e);
    console.log(`Original ${label}:`, obj);
  }
}

onMounted(() => {
  // Log the raw data from the store for debugging
  const rawTeams = toRaw(userStore.getTeams());
  const rawOrgs = toRaw(userStore.getOrganizations());
  
  logObject("Raw teams from store", rawTeams);
  logObject("Raw organizations from store", rawOrgs);
  
  // Process the data from the store into our hierarchical structure
  organizations.value = mergeOrganizationsAndTeams();
  logObject("Merged organizations with team trees", organizations.value);
  
  // If organizations are empty but we have data in the store, try to debug
  if (organizations.value.length === 0) {
    if ((rawTeams && rawTeams.length) || (rawOrgs && rawOrgs.length)) {
      console.log("No organizations processed but store has data.");
      
      // Try a direct approach if the regular method fails
      if (rawOrgs && rawOrgs.length) {
        organizations.value = rawOrgs.map(org => {
          const entity = org.entity || {};
          return {
            ...entity,
            id: entity.id,
            name: entity.name || 'Unknown',
            slug: entity.slug || 'unknown',
            teams: []  // Initialize empty teams array
          };
        });
        
        // Log the attempt
        logObject("Direct organization mapping result", organizations.value);
      }
    }
  }
});
</script>

<template>
    <div class="teams-c-items">
        <div v-for="org in organizations" :key="org.id" class="teams-c-item">
            <div class="head">
                <div class="left">
                    <div class="org-name">
                        <div class="logo">
                            <span>{{ org.name ? org.name.charAt(0).toUpperCase() : 'O' }}</span>
                        </div>
                        <p>
                            {{ org.name }}
                            <span>{{ org.teams ? org.teams.length : 0 }}</span>
                        </p>
                    </div>
                </div>

                <div class="right">
                    <a :href="'https://skedi.com/' + org.slug" class="blue-link">
                        {{ 'https://skedi.com/' + org.slug }}
                    </a>
                    <div class="separator"></div>
                    <div class="actions">
                        <button-component v-tooltip="{ content: 'Copy URL' }" as="tertiary icon"
                            :iconLeft="{ component: PhLink, weight: 'bold' }" />
                        <button-component v-tooltip="{ content: 'Embed on a website' }" as="tertiary icon"
                            :iconLeft="{ component: PhCode, weight: 'bold' }" />
                        <button-component v-if="org.users.some(user => user.id === currentUserId && user.effective_role === 'admin')" v-tooltip="{ content: 'Settings' }" as="tertiary icon"
                            :iconLeft="{ component: PhGearSix, weight: 'bold' }" />

                        <div v-if="org.users.some(user => user.id === currentUserId && user.effective_role === 'admin')">
                            <div v-popup="{ component: BuilderPopupComponent, overlay: { position: 'center center' }, properties: { title: 'Create new team', class: 'h-auto' } }">
                                <button-component v-tooltip="{ content: 'Create new team' }" as="tertiary icon"
                                    :iconLeft="{ component: PhPlus, weight: 'bold' }" @click="createTeam(org.id)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Display organization users -->
            <div class="org-users">
                <div style="display: flex; align-items: center; gap:10px; font-weight: 500;">
                    <PhUsers weight="bold" />
                    <span>{{ org.users.length }} Members:</span>
                </div>

                <ul>
                    <li v-for="user in org.users" :key="user.id">
                        {{ user.name }} ({{ user.effective_role }})
                    </li>
                </ul>
            </div>

            <!-- Pass org users and current user ID down to all teams using the teams array -->
            <TeamList
                v-if="org.teams && org.teams.length"
                :teams="org.teams"
                :orgSlug="org.slug"
                :orgUsers="org.users"
                :currentUserId="currentUserId"
            />
        </div>
    </div>
</template>

<style scoped>
.org-users {
    margin-top: 10px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 8px;
    background: white;
    border: 1px solid var(--brand-blue);
}

.org-users ul {
    list-style: none;
    padding: 0;
    margin: 5px 0 0;
}

.org-users li {
    font-size: 14px;
    margin: 2px 0;
}
</style>