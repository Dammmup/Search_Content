import { supabase, isSupabaseConfigured } from './supabase';

// === AUTH с Supabase ===
export const authAPI = {
    // Регистрация через Supabase Auth
    register: async (login, password) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase не настроен');
        }
        const { data, error } = await supabase.auth.signUp({ email: login, password });
        if (error) throw error;
        return data;
    },

    // Вход через Supabase Auth
    login: async (login, password) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase не настроен');
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: login, password });
        if (error) throw error;
        return data;
    },

    // Выход
    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Получить текущего пользователя
    getUser: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        } catch (error) {
            if (error?.message?.includes('Failed to fetch')) {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userLogin');
                localStorage.removeItem('userId');
            }
            throw error;
        }
    },

    // Подписаться на изменения auth
    onAuthChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// === FAVORITES с Supabase ===
export const favoritesAPI = {
    // Получить все избранное пользователя
    getAll: async (userId, type = null) => {
        if (!isSupabaseConfigured()) {
            return [];
        }

        let query = supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // Лента активности сообщества (последние 50 добавлений)
    getCommunityFeed: async (limit = 50) => {
        if (!isSupabaseConfigured()) {
            return [];
        }

        // Получаем последние добавления из favorites, а также username пользователя
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                *,
                users (
                    username
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[favorites.getCommunityFeed] Ошибка:', error.message);
            throw error;
        }

        return data || [];
    },

    // Добавить в избранное
    add: async (userId, type, externalId, data) => {
        if (!isSupabaseConfigured()) {
            return { data: null, error: 'Supabase не настроен' };
        }

        const { data: existing, error: checkError } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('type', type)
            .eq('external_id', String(externalId))
            .maybeSingle();

        if (checkError) {
            console.error('[favorites.add] Ошибка проверки:', checkError.message, checkError.details, checkError.hint, checkError.code);
            return { data: null, error: checkError.message };
        }

        if (existing) {
            return { data: null, error: 'Уже в избранном' };
        }

        const { data: result, error } = await supabase
            .from('favorites')
            .insert({
                user_id: userId,
                type,
                external_id: String(externalId),
                data
            })
            .select()
            .single();

        if (error) {
            console.error('[favorites.add] Ошибка вставки:', error.message, error.details, error.hint, error.code);
        }

        return { data: result, error: error?.message || null };
    },

    // Удалить из избранного
    remove: async (userId, type, externalId) => {
        if (!isSupabaseConfigured()) {
            return { data: null, error: 'Supabase не настроен' };
        }

        const { data, error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('type', type)
            .eq('external_id', String(externalId))
            .select();

        return { data, error };
    },

    // Проверить статус избранного
    check: async (userId, type, externalId) => {
        if (!isSupabaseConfigured()) {
            return { isFavorite: false };
        }

        const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('type', type)
            .eq('external_id', String(externalId))
            .maybeSingle();

        return { isFavorite: !!data };
    }
};

// === USERS таблица ===
export const usersAPI = {
    // Создать или обновить профиль пользователя
    upsertProfile: async (userId, username) => {
        if (!isSupabaseConfigured()) {
            return { data: null };
        }

        const { data, error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                username,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .select()
            .single();

        return { data, error };
    },

    // Получить профиль пользователя
    getProfile: async (userId) => {
        if (!isSupabaseConfigured()) {
            return null;
        }

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        return data;
    }
};

export default supabase;
