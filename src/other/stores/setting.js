import { defineStore } from 'pinia'

export const SettingStore = defineStore('settingStore', 
{
    state: () => 
    ({
        settings: []
    }),

    actions: 
    {
        add(id, tab, title, description, icon, config) 
        {
            this.settings.push({id, tab, title, description, icon, config});
        },

        get() 
        {
            return this.settings
        },

        getTabs() 
        {
            const tabs = {}

            this.settings.forEach((setting) => 
            {
                if (!(setting.tab.toLowerCase() in tabs)) 
                {
                    tabs[setting.tab.toLowerCase()] = 
                    {
                        name: setting.tab,
                        count: 0,
                        items: []
                    }
                }

                tabs[setting.tab.toLowerCase()].count++
                tabs[setting.tab.toLowerCase()].items.push(setting)
            })

            return tabs
        },

        getById(id) 
        {
            return this.settings.find((s) => s.id === id)
        },

        getByTab(tab) 
        {
            return this.settings.filter((s) => s.tab.toLowerCase() === tab.toLowerCase())
        },

        count()
        {
            return this.settings.length;
        }
    }
})
