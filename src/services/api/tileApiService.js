import { get } from '../../utils/api';

export const getTiles = () => {
  return get(`/tile?pageNo=${1}&pageSize=${100}`);
};