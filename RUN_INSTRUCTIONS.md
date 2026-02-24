# Инструкция по запуску проекта SearchX

## Подготовка

1. Убедитесь, что у вас установлен Node.js (версия 16 или выше)
2. Установите зависимости проекта:
   ```bash
   cd Search_Content
   npm install
   ```

## Настройка Supabase

1. Создайте аккаунт на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Получите URL и ANON KEY в разделе Project Settings → API
4. Заполните файл `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Создание таблицы избранного

В SQL Editor Supabase выполните:

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

## Создание администратора

Для создания администратора:

**Вариант 1 (через Dashboard):**
1. Перейдите в Authentication → Users
2. Нажмите **Add user**
3. Введите:
   - Email: `user@admin.com`
   - Password: `password`
   - Email confirm: ✅ (отметьте)
4. Нажмите **Create user**

**Вариант 2 (через приложение):**
1. Запустите приложение
2. В окне авторизации введите:
   - Логин/Email: `user`
   - Пароль: `password`
3. Нажмите "Нет аккаунта? Зарегистрироваться"

## Запуск приложения

### Режим разработки:
```bash
npm run dev
```
Приложение будет доступно по адресу http://localhost:5173

### Сборка продакшн версии:
```bash
npm run build
```

## Использование

- Главная страница доступна всем пользователям
- Поисковые компоненты требуют авторизации
- После авторизации становится доступно:
  - Поиск фильмов, музыки, изображений и др.
  - Функция добавления в избранное
  - Страница избранных элементов
  - Профиль пользователя

## Вход в систему

После настройки администратора используйте:
- Логин: `user` (или `user@admin.com`)
- Пароль: `password`