import { storage } from '@utils/storage'
import { api } from '@utils/api'
import { UserStore } from '@stores/user';
import { ExtensionStore } from '@stores/extension';

export default class 
{
    constructor() 
    {   
        this.token =  storage.get('token');
    }

    async perform(callback) 
    {
        if(!this.token)
        {
            return callback(null);
        }

        const response = await api.get('account/user');

        if(!response.success)
        {
            storage.set('token', null, true);
            return callback(null);
        }

        const userStore = UserStore();

        userStore.setData(response.data);

        callback(response.data);
    }
}