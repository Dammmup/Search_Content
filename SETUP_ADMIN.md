# Создание администратора

## Инструкция

### Шаг 1: Создайте таблицу favorites в Supabase

1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Выполните следующий SQL:

```sql
-- Создание таблицы favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  external_id TEXT NOT NULL,
  category TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, external_id, category)
);

-- Включение RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Политика для чтения
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Политика для добавления
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политика для удаления
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);
```

### Шаг 2: Создайте администратора

**Вариант А (через Dashboard):**
1. Перейдите в **Authentication** → **Users**
2. Нажмите **Add user**
3. Заполните:
   - Email: `user@admin.com`
   - Password: `password`
   - Email confirm: ✅ (отметьте)
4. Нажмите **Create user**

**Вариант Б (через приложение):**
1. Запустите приложение
2. В окне авторизации введите:
   - Логин/Email: `user`
   - Пароль: `password`
3. Нажмите "Нет аккаунта? Зарегистрироваться"
4. Если пользователь уже существует, просто войдите

---

**Как это работает:**
- При вводе логина "user" система автоматически преобразует его в "user@admin.com"
- Это позволяет использовать простой логин вместо полного email
