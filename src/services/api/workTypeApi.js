import { get} from '../../utils/api';
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

export const getWorkTypeDescriptions = (
    pageNo = 1,
    pageSize = 100
) => {
    return getCachedApi({
        key: `workTypedescription-all:${pageNo}:${pageSize}`,
        fetcher: () => get('/WorkTypes/work_type_description'),
        expiration: 60 * 60 * 1000 // 1 hour
    });
};