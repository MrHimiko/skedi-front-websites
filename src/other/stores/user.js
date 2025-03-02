import { defineStore } from 'pinia'

export const UserStore = defineStore('UserStore', 
{
    state: () => 
    ({
        data: {
            organization: {}
        }
    }),

    actions: 
    {
        setData(data) 
        {
            this.data = data;
        },

        clearData() 
        {
            this.data = {
                organization: {}
            };
        },

        getData()
        {
            return this.data;
        },

        isLogged() 
        {
            return !!this.data.id
        },

        getId() 
        {
            return this.data.id
        },

        getName() 
        {
            return this.data.name
        },

        getEmail() 
        {
            return this.data.email
        },

        getOrganizations() 
        {
            return this.data.organizations
        },

        getTeams() 
        {
            return this.data.teams
        },

        getCreated() 
        {
            return this.data.created
        },

        
    }
})
