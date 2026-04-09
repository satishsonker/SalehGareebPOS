import { del, apiRequest } from '../../utils/api';

// Upload a single image file
// module: e.g. 'shops', 'users', 'products'
export const uploadMedia = async (file, module = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('module', module);
  return apiRequest('/media/upload', {
    method: 'POST',
    body: formData,
  });
};

// Delete a media file by its ID
export const deleteMedia = (id) => {
  return del(`/media/${id}`);
};
