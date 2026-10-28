import { get, put, del } from '../../utils/api';
import { getCachedApi } from '../../cache/apiCache';

export const getWorkTypes = (
    pageNo = 1,
    pageSize = 100
) => {
    return getCachedApi({
        key: `workType-all:${pageNo}:${pageSize}`,
        fetcher: () => get('/WorkTypes'),
        expiration: 60 * 60 * 1000 // 1 hour
    });
};

export const getWorkTypeDescriptions = () => get('/WorkTypes/work_type_description');
export const getWorkTypeDescriptionsFresh = getWorkTypeDescriptions;

export const addWorkTypeDescription = data => put('/WorkTypes/work_type_description', data);
export const updateWorkTypeDescription = (id, data) => put(`/WorkTypes/work_type_description/${id}`, data);
export const deleteWorkTypeDescription = id => del(`/WorkTypes/work_type_description/${id}`);
