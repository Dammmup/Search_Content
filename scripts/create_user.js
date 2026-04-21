import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Ошибка: VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY не найдены в .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
    const email = 'user@admin.com';
    const password = 'password';

    console.log(`🚀 Попытка регистрации пользователя: ${email}...`);

    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('User already registered')) {
            console.log('✅ Пользователь уже зарегистрирован.');
        } else {
            console.error('❌ Ошибка при регистрации:', error.message);
        }
    } else {
        console.log('✅ Пользователь успешно создан!');
        console.log('📝 Примечание: Если в Supabase включено подтверждение email, проверьте почту или подтвердите вручную в Dashboard.');
    }
}

createUser();
