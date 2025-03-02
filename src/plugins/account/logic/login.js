import { storage } from '@utils/storage'
import { api } from '@utils/api'
import { UserStore } from '@account/stores/user'

function getToken() 
{
    return storage.get('account.token')
}

function setToken(token) 
{
    storage.set('account.token', token, true)
}

function logged() 
{
    const userStore = UserStore()

    return userStore.isLogged()
}

function session() 
{
    return new Promise((resolve, reject) => 
    {
        const userStore = UserStore()
        const token = getToken();
        
        if (!token) 
        {
            return reject()
        }

        api.get('account/user').then((response) => 
        {
            userStore.setData(response.data)
            resolve(response.data)
        })
        .catch(() => 
        {
            reject()
        })
    })
}

export 
{
    getToken,
    setToken,
    logged,
    session
}
