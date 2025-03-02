import axios from 'axios'
import { storage } from '@utils/storage'

export const api = 
{
    async send(type, endpoint, query = {}, data = {}, headers = {}) 
    {
        headers['authorization'] = 'Bearer ' + storage.get('token')

        if(type.toLowerCase() === 'put')
        {
            type = 'POST';
            headers['X-HTTP-Method-Override'] = 'PUT'
        }

        try 
        {
            const response = await axios(
            {
                method: type,
                url: '/api/' + endpoint,
                params: query,
                data: data,
                headers: headers,
            })

            if (response.data && response.data.success) 
            {
                return response.data
            } 
            else 
            {
                throw {
                    success: false,
                    message: 'Unexpected response structure.',
                    data: response.data
                }
            }
        } 
        catch (error) 
        {
            if (axios.isAxiosError(error)) 
            {
                if (error.response) 
                {
                    return Promise.reject(
                    {
                        success: false,
                        message: error.response.data?.message || 'Unknown server error.'
                    })
                } 
                else if (error.request) 
                {
                    try 
                    {
                        const responseData = JSON.parse(error.request.response || '{}')

                        return Promise.reject(
                        {
                            success: false,
                            message: responseData?.message || error.message
                        })
                    } 
                    catch 
                    {
                        return Promise.reject(
                        {
                            success: false,
                            message: error.message
                        })
                    }
                }
            }

            return Promise.reject(
            {
                success: false,
                message: error?.message || 'An unknown error occurred.'
            })
        }
    },

    async get(endpoint, query = {}, headers = {}) 
    {
        return this.send('get', endpoint, query, {}, headers)
    },

    async post(endpoint, data = {}, query = {}, headers = {}) 
    {
        return this.send('post', endpoint, query, data, headers)
    },

    async put(endpoint, data = {}, query = {}, headers = {}) 
    {
        return this.send('put', endpoint, query, data, headers)
    },

    async delete(endpoint, query = {}, headers = {}) 
    {
        return this.send('delete', endpoint, query, {}, headers)
    }
}