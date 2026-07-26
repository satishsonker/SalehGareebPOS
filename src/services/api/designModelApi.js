import { get, post, put, del } from '../../utils/api';

export const getDesignModels = (pageNo = 1, pageSize = 10) =>
  get(`/designmodels?pageNo=${pageNo}&pageSize=${pageSize}`);

export const getDesignModelById = (id) => get(`/designmodels/${id}`);

export const searchDesignModels = (q, pageNo = 1, pageSize = 10) =>
  get(`/designmodels/search?q=${encodeURIComponent(q)}&pageNo=${pageNo}&pageSize=${pageSize}`);

export const createDesignModel = (data) => post('/designmodels', data);

export const updateDesignModel = (id, data) => put(`/designmodels/${id}`, data);

export const deleteDesignModel = (id) => del(`/designmodels/${id}`);

// Media
export const attachMedia = (id, mediaId) => post(`/designmodels/${id}/media/${mediaId}`);

export const detachMedia = (id, mediaId) => del(`/designmodels/${id}/media/${mediaId}`);

// Order Prices
export const attachOrderPrice = (id, orderPriceId) => post(`/designmodels/${id}/order-price/${orderPriceId}`);

export const detachOrderPrice = (id, orderPriceId) => del(`/designmodels/${id}/order-price/${orderPriceId}`);
