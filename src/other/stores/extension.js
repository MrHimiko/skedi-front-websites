import { defineStore } from 'pinia'

export const ExtensionStore = defineStore('extensionStore', 
{
    state: () => 
    ({
        extensions: [],
    }),

    actions: 
    {
        get()
        {
            return [...this.extensions].sort((a, b) => a.order - b.order);
        },

        has(id)
        {
            return this.extensions.includes(id);
        },

        add(...ids) 
        {
            ids.forEach((id) => 
            {
                this.extensions.push(id)
            })
        },

        remove(id)
        {
            this.extensions = this.extensions.filter((item) => item !== id);
        }
    }
})
