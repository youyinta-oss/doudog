import { create } from 'zustand';

interface Mod {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_path: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

interface UserMod extends Mod {
  equipped: boolean;
  purchased_at: string;
}

interface Stats {
  total_users: number;
  total_coins: number;
  total_mods: number;
  today_sales: number;
}

interface AppState {
  stats: Stats | null;
  users: any[];
  mods: Mod[];
  userMods: UserMod[];
  currentUser: any;
  userCoins: number;
  equippedMod: UserMod | null;
  loading: boolean;
  error: string | null;
  setStats: (stats: Stats) => void;
  setUsers: (users: any[]) => void;
  setMods: (mods: Mod[]) => void;
  setUserMods: (mods: UserMod[]) => void;
  setCurrentUser: (user: any) => void;
  setUserCoins: (coins: number) => void;
  setEquippedMod: (mod: UserMod | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUserCoins: (userId: number, amount: number) => void;
  addUserMod: (mod: UserMod) => void;
}

export const useStore = create<AppState>((set) => ({
  stats: null,
  users: [],
  mods: [],
  userMods: [],
  currentUser: null,
  userCoins: 0,
  equippedMod: null,
  loading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setUsers: (users) => set({ users }),
  setMods: (mods) => set({ mods }),
  setUserMods: (mods) => set({ userMods: mods }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserCoins: (coins) => set({ userCoins: coins }),
  setEquippedMod: (mod) => set({ equippedMod: mod }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  updateUserCoins: (userId, amount) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, coins: u.coins + amount } : u
      ),
    })),
  addUserMod: (mod) =>
    set((state) => ({
      userMods: [...state.userMods, mod],
    })),
}));
