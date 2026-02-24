import { v4 as uuidv4 } from 'uuid';

// Флаг использования MongoDB
let isMongoConnected = false;

// Попытка импортировать MongoDB (фронтенд не имеет доступа к mongoose напрямую)
// В реальном приложении это будет работать через API
// Для демонстрации пока используем localStorage

// === ЛОКАЛЬНОЕ ХРАНИЛИще (fallback) ===
const defaultAccounts = [
  { username: 'user', password: 'password', name: 'User', createdAt: "2012-12-12", token: uuidv4() },
  { username: 'Damir', password: 'lolzik2281337', name: 'Damir', createdAt: "1987-12-23", token: uuidv4() },
];

// Экспорт для совместимости с AuthModal
export const accounts = defaultAccounts;

export const getAccounts = () => {
  const savedAccounts = localStorage.getItem('accounts');
  if (!savedAccounts) {
    // Инициализация с дефолтными аккаунтами
    localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }
  return JSON.parse(savedAccounts);
};

export const saveAccounts = (newAccounts) => {
  localStorage.setItem('accounts', JSON.stringify(newAccounts));
};

export const addUser = (newAccount) => {
  const existingAccounts = getAccounts();
  newAccount.createdAt = new Date().toISOString();
  newAccount.token = uuidv4();
  existingAccounts.push(newAccount);
  saveAccounts(existingAccounts);
};

export const getCurrentUser = () => {
  const userToken = localStorage.getItem('userToken');
  if (!userToken) return null;

  const accounts = getAccounts();
  const currentUser = accounts.find(account => account.token === userToken);

  if (currentUser && currentUser.createdAt) {
    const createdAtString = new Date(currentUser.createdAt).toLocaleDateString();
    return { ...currentUser, createdAtString };
  }

  return currentUser;
};

export const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('username');
};

// === MONGODB ФУНКЦИИ (для серверной части) ===
// Эти функции будут использоваться при подключении к MongoDB

export const initMongoDB = async () => {
  try {
    // Динамический импорт mongoose на клиенте не работает
    // Для полноценной работы нужен бэкенд
    console.log('MongoDB требует серверную часть для работы');
    console.log('Пока используется localStorage');
    return false;
  } catch (error) {
    console.error('Ошибка инициализации MongoDB:', error);
    return false;
  }
};

// Функция для проверки статуса подключения
export const isDBConnected = () => isMongoConnected;

// Экспорт строки подключения для справки
export const MONGODB_URI_EXAMPLE = `
# Строка подключения MongoDB Atlas:
mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority

# Или локальная база данных:
mongodb://localhost:27017/searchcontent

# Для использования нужно:
# 1. Создать серверную часть (Express + MongoDB)
# 2. Добавить API эндпоинты
# 3. Подключить фронтенд к API
`;
