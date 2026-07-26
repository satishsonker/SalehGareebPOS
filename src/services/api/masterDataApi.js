import { get, post, put, del } from '../../utils/api';



// Get all MasterDatas
export const getMasterDatas = (q) => {
  return get(`/MasterData?${q}`);
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
export const updateMasterData = (data) => {
  return put(`/MasterData`, data);
};

// Delete a MasterData
export const deleteMasterData = (id) => {
  return del(`/MasterData/${id}`);
};
export const getMasterDataByType = (type) => {
  return get(`/MasterData/by-type/${type}?pageNo=1&pageSize=100`);
};
export const getMasterDataByTypes = (types) => {
  return get(`/MasterData/by-types?types=${types.join(',')}`);
};

export const getMasterDataTypes = () => {
  return get(`/MasterData/types`);
};
export const searchMasterData = (pageNo,PageSize,query) => {
  return get(`/MasterData/search?pageNo=${pageNo}&pageSize=${PageSize}&q=${query}`);
};

export const getEmirates = () => {
  return get(`/MasterData/by-type/emirate?pageNo=1&pageSize=100`);
};
