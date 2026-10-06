import { getCachedApi } from '../../cache/apiCache';
import { get } from '../../utils/api';

export const getTiles = (pageNo=1,pageSize=100) => {
   return getCachedApi({
          key: `tiles:${pageNo}:${pageSize}`,  
          fetcher: () =>
              get(`/tile?pageNo=${pageNo}&pageSize=${pageSize}`)
      });
};