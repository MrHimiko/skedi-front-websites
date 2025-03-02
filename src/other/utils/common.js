import { NotificationsStore } from '@floated/notifications/store'

export const common = 
{
    timeout: null,

    debounce(func, wait) 
    {
        return (...args) => 
        {
            if (this.timeout) 
            {
                clearTimeout(this.timeout)
            }
            
            this.timeout = setTimeout(() => func(...args), wait)
        }
    },

    throttle(func, limit) 
    {
        let lastFunc = null
        let lastRan = null

        return (...args) => 
        {
            const now = Date.now()

            if (!lastRan) 
            {
                func(...args)
                lastRan = now
            } 
            else 
            {
                if (lastFunc) clearTimeout(lastFunc)

                lastFunc = setTimeout(() => 
                {
                    if (now - lastRan >= limit) 
                    {
                        func(...args)
                        lastRan = now
                    }
                    
                }, limit - (now - lastRan))
            }
        }
    },

    notification(message, success = true) 
    {
        NotificationsStore().add(
        {
            icon: 'notifications',
            title: success ? 'Success' : 'Fail',
            description: message,
            color: success ? 'green' : 'orange'
        })
    },

    query(key, type = null) 
    {
        const params = new URLSearchParams(window.location.search)

        try 
        {
            let value = params.get(key)

            if (type && type === 'array') 
            {
                value = JSON.parse(value ? value : '')

                return Array.isArray(value) ? value : []
            }

            return value
        } 
        catch 
        {
            switch(type)
            {
                case 'array':
                    return [];
            }

            return null;
        }
    },

    uuid() 
    {
        const timestamp = Date.now().toString(36); 
        const random = Math.random().toString(36).substring(2, 10);

        return `${timestamp}-${random}`;
    },

    date()
    {
        const now = new Date();
    
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
