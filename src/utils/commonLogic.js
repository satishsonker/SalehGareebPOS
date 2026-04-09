export const commonLogic = {
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  },
  toQueryString: (obj,paramName) => {
    const params = new URLSearchParams();

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if(!paramName){
        params.append(key, String(value));
        } else {
          params.append(`${paramName}.${key}`, String(value));
        }
      }
    });
    return params.toString();
  }
}