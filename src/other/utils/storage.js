export const storage = 
{
    storage: new Map(),

    set(key, value, persist = true) 
    {
        if (persist) 
        {
            localStorage.setItem(key, JSON.stringify(value))
        } 
        else 
        {
            this.storage.set(key, value)
        }
    },

    get(key) 
    {
        if (this.storage.has(key)) 
        {
            return this.storage.get(key)
        }

        const value = localStorage.getItem(key)

        return value ? JSON.parse(value) : null
    },

    remove(key) 
    {
        if (this.storage.has(key)) 
        {
            this.storage.delete(key)
        }

        localStorage.removeItem(key)
    },

    clear() 
    {
        this.storage.clear()
        localStorage.clear()
    }
}
