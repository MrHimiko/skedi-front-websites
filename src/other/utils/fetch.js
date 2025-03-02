import { api } from '@utils/api'
import { common } from '@utils/common'

export const fetch = 
{
    async one(endpoint) 
    {
        return new Promise((resolve, reject) => 
        {
            api.get(endpoint, { limit: 1, page: 1 }, {})
                .then((response) => 
                {
                    if (response.data && typeof response.data === 'object') 
                    {
                        resolve(response.data)
                    } 
                    else 
                    {
                        resolve(null)
                    }
                })
                .catch((response) => 
                {
                    reject(response.message)

                    common.notification(response.message, false)
                })
        })
    },

    async many(endpoint, limit = null, page = null, filters = null, sort = 'created-desc') 
    {
        try 
        {
            const urlParams = new URLSearchParams(window.location.search)

            limit = limit !== null ? limit : (urlParams.get('limit') ? parseInt(urlParams.get('limit'), 10) : 100)
            page = page !== null ? page : (urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1)
            filters = filters !== null ? filters : common.query('filters', 'array')
            sort = sort !== 'created-desc' ? sort : (urlParams.get('sort') || 'created-desc')

            const params = 
            {
                limit,
                page,
                filters: Array.isArray(filters) && filters.length ? JSON.stringify(filters) : null,
                sort
            }

            const response = await api.get(endpoint, params)

            if (Array.isArray(response.data)) 
            {
                return response.data
            } 
            else 
            {
                return []
            }
        } 
        catch (error) 
        {
            common.notification(error?.message || 'An error occurred', false)

            throw new Error(error?.message || 'An error occurred while fetching data')
        }
    },

    async total(endpoint, filters = null) 
    {
        try 
        {
            const params = 
            {
                filters: Array.isArray(filters) && filters.length ? JSON.stringify(filters) : null,
            }

            const response = await api.get(endpoint + '/total', params)

            if (typeof response.data === 'number') 
            {
                return response.data
            } 
            else 
            {
                return 0;
            }
        } 
        catch (error) 
        {
            common.notification(error?.message || 'An error occurred', false)

            throw new Error(error?.message || 'An error occurred while fetching data')
        }
    },

    async summary(endpoint, filters = [], group = 'month', limit = 12) 
    {
        try 
        {
            const params = 
            {
                filters: Array.isArray(filters) && filters.length ? JSON.stringify(filters) : null,
                group,
                limit
            }

            const response = await api.get(endpoint + '/summary', params)

            if (Array.isArray(response.data)) 
            {
                return response.data
            } 
            else 
            {
                return [];
            }
        } 
        catch (error) 
        {
            common.notification(error?.message || 'An error occurred', false)

            throw new Error(error?.message || 'An error occurred while fetching data')
        }
    }
}
