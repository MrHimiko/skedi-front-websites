import { defineStore } from 'pinia'

export const SocketStore = defineStore('socketStore', 
{
    state: () => 
    ({
        connections: {}
    }),

    actions: 
    {
        register(connection) 
        {
            this.connections[connection.id] = connection;
        },

        unregister(connection) 
        {
            delete this.connections[connection.id]
        },

        updateRoute(id, route)
        {
            if(id in this.connections)
            {
                this.connections[id].route = route;
            }
        },

        getAll()
        {
            return this.connections;
        },

        getByRoute(route)
        {
            return Object.values(this.connections).filter((item) => item.route === route);
        },

        clear() 
        {
            this.connections = {};
        }
    }
})
