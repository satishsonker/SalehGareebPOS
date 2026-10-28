import { getCachedApi } from '../../cache/apiCache';
import { get, post, put, del } from '../../utils/api';

export const createTile = (data) => post('/tile', data);
export const updateTile = (id, data) => put(`/tile/${id}`, data);
export const deleteTile = (id) => del(`/tile/${id}`);

export const getTiles = (pageNo=1,pageSize=100) => {
   return getCachedApi({
          key: `tiles:${pageNo}:${pageSize}`,  
          fetcher: () =>
              get(`/tile?pageNo=${pageNo}&pageSize=${pageSize}`)
      });
};

export const getAccessibleTiles = () => get('/tile/accessible');

export const getUserShopTilePermissions = (userId, shopId) =>
  get(`/admin/users/${userId}/shops/${shopId}/tile-permissions`);

export const updateUserTilePermissions = (data) =>
  put('/admin/users/tile-permissions', data);
