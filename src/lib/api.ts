const API_BASE = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getUsers: () => request<any[]>('/admin/users'),
  getUser: (id: number) => request<any>(`/admin/users/${id}`),
  giveCoins: (userId: number, amount: number) =>
    request<any>(`/admin/users/${userId}/give-coins`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  giveMod: (userId: number, modId: number) =>
    request<any>(`/admin/users/${userId}/give-mod`, {
      method: 'POST',
      body: JSON.stringify({ mod_id: modId }),
    }),
  getMods: () => request<any[]>('/admin/mods/admin'),
  createMod: (mod: {
    name: string;
    description: string;
    price: number;
    image_url: string;
    model_path: string;
    category: string;
  }) =>
    request<any>('/admin/mods', {
      method: 'POST',
      body: JSON.stringify(mod),
    }),
  updateMod: (
    id: number,
    mod: {
      name?: string;
      description?: string;
      price?: number;
      image_url?: string;
      model_path?: string;
      category?: string;
      is_active?: boolean;
    }
  ) =>
    request<any>(`/admin/mods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mod),
    }),
  deleteMod: (id: number) =>
    request<any>(`/admin/mods/${id}`, {
      method: 'DELETE',
    }),
};

export const shopApi = {
  getMods: () => request<any[]>('/mods'),
  getMod: (id: number) => request<any>(`/mods/${id}`),
  getUserMods: (identifier: string) =>
    request<any[]>(`/user/${identifier}/mods`),
  getUserCoins: (identifier: string) =>
    request<any>(`/user/${identifier}/coins`),
  buyMod: (identifier: string, modId: number) =>
    request<any>(`/user/${identifier}/buy-mod`, {
      method: 'POST',
      body: JSON.stringify({ mod_id: modId }),
    }),
  equipMod: (identifier: string, modId: number) =>
    request<any>(`/user/${identifier}/equip-mod`, {
      method: 'POST',
      body: JSON.stringify({ mod_id: modId }),
    }),
  getEquippedMod: (identifier: string) =>
    request<any>(`/user/${identifier}/equipped-mod`),
};
