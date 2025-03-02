import { defineStore } from 'pinia'

export const ComponentStore = defineStore('componentStore', 
{
    state: () => 
    ({
        components: [],
    }),

    actions: 
    {
        get(group) 
        {
            if(!(group in this.components))
            {
                return [];
            }
            
            return [...this.components[group]].sort((a, b) => a.order - b.order);
        },

        add(group, component, properties = {}, order = 0) 
        {
            if(!(group in this.components))
            {
                this.components[group] = [];
            }

            this.components[group].push({ component, properties, order })
        }
    }
})
