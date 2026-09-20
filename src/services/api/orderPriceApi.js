import { get, post, put, del } from '../../utils/api';
import { getCachedApi } from '../../cache/apiCache';
export const getOrderPrices = (pageNo = 1, pageSize = 100) => {
  return get(`/orderprices?pageNo=${pageNo}&pageSize=${pageSize}`)
};

export const getOrderPriceById = (id) => get(`/orderprices/${id}`);

export const createOrderPrice = (data) => post('/orderprices', data);

export const updateOrderPrice = (id, data) => put(`/orderprices/${id}`, data);

export const deleteOrderPrice = (id) => del(`/orderprices/${id}`);
export const getCachedOrderPrices = (
    pageNo = 1,
    pageSize = 100
) => {
    return getCachedApi({
        key: `order-prices:${pageNo}:${pageSize}`,

        fetcher: () =>
            get(
                `/orderprices?pageNo=${pageNo}&pageSize=${pageSize}`
            ),

        expiration: 60 * 60 * 1000 // 1 hour
    });
};
