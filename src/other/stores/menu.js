import { defineStore } from 'pinia'

export const MenuStore = defineStore('menuStore', 
{
    state: () => 
    ({
        menus: {},
    }),

    actions: 
    {
        get(group)
        {
            if(!(group in this.menus))
            {
                return [];
            }

            return [...this.menus[group]].sort((a, b) => a.order - b.order);
        },

        getSorted(group)
        {
            const menus = this.get(group);
            const sorted = {};

            menus.forEach((menu) => 
            {
                if(!menu.sort || !('sort' in menu))
                {
                    menu.sort = 'main';
                }

                if(!(menu.sort in sorted))
                {
                    sorted[menu.sort] = {
                        name: menu.sort,
                        menus: []
                    }
                }

                sorted[menu.sort].menus.push(menu);
            });

            return sorted;
        },

        add(group, label, icon, link, order = 0, sort = null) 
        {
            if(!(group in this.menus))
            {
                this.menus[group] = [];
            }

            const menu = {label, icon, link, order, sort, children: []};

            this.menus[group].push(menu)

            return (callback) => 
            {
                callback((label, icon, link) => 
                {
                    menu.children.push({label, icon, link});
                });
            }
        }
    }
})
