# SearchX - Универсальный поисковик контента

## Описание
SearchX - это веб-приложение для поиска различных типов контента: фильмов, музыки, изображений, информации о Рике и Морти, интересных фактов о числах, игр, шуток и криптовалют.

## Особенности
- Современный молодежный дизайн с гласмorphism эффектами
- Интеграция с различными API для получения контента
- Система избранного с аутентификацией через Supabase
- Адаптивный интерфейс

## Технологии
- React
- Redux Toolkit
- Ant Design
- Supabase (аутентификация и хранение избранного)
- Vite

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example` и добавьте свои ключи API и параметры Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Запустите приложение:
```bash
npm run dev
```

## Настройка Supabase

1. Зайдите на [supabase.com](https://supabase.com) и создайте новый проект
2. В SQL Editor выполните следующий запрос для создания таблицы избранного:
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

3. Для создания администратора:
   - Перейдите в Authentication → Users
   - Нажмите "Add user"
   - Введите: Email: `user@admin.com`, Password: `password`
   - Отметьте "Email confirm"
   - Нажмите "Create user"

## Использование

- Главная страница и навигация доступны без авторизации
- Для выполнения поиска в любых категориях требуется авторизация
- Модальное окно авторизации появляется при попытке выполнить поиск
- Используйте логин `user` и пароль `password` для входа

## API

Приложение использует следующие API:
- OMDB API (фильмы)
- iTunes Search API (музыка)
- Pexels API (изображения)
- RAWG API (игры)
- JokeAPI (шутки)
- CoinGecko API (криптовалюты)
- Numbers API (факты о числах)
- Rick and Morty API (персонажи)

## Автор
Kilo Code
