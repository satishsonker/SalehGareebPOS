import { get, post, put, del } from '../../utils/api';



// Get all MasterDatas
export const getMasterDatas = (pageNo = 1, pageSize = 10) => {
  return get(`/MasterData?pageNo=${pageNo}&pageSize=${pageSize}`);
};

// Get MasterData by ID
export const getMasterDataById = (id) => {
  return get(`/MasterData/${id}`);
};

// Create a new MasterData
export const createMasterData = (data) => {
  return post('/masterData', data);
};

// Update a MasterData
export const updateMasterData = (id, data) => {
  return put(`/MasterData/${id}`, data);
};

// Delete a MasterData
export const deleteMasterData = (id) => {
  return del(`/MasterData/${id}`);
};
export const getByType = (type) => {
  return get(`/MasterData/by-type/${type}`);
};
export const getByTypes = (types) => {
  return get(`/MasterData/by-types?types=${types.join(',')}`);
};

export const getMasterDataTypes = () => {
  return get(`/MasterData/types`);
};
export const searchMasterData = (pageNo,PageSize,query) => {
  return get(`/MasterData/search?pageNo=${pageNo}&pageSize=${PageSize}&q=${query}`);
};
