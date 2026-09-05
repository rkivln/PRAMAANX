import { useQueryClient } from '@tanstack/react-query';

export function useApi() {
  const queryClient = useQueryClient();

  const getAccessToken = () => {
    return localStorage.getItem('pramaanx_access_token');
  };

  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  return {
    queryClient,
    getAccessToken,
    getAuthHeaders,
  };
}
