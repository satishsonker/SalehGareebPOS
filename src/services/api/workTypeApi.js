import { get, post, put, del,apiBasePath  as apiBaseUrl} from '../../utils/api';

export const getWorkTypes= () => {
  return get('/WorkTypes');
};