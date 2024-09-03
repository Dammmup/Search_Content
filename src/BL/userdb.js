import { v4 as uuidv4 } from 'uuid';

export const accounts = [
  { username: 'user', password: 'password', name: 'User', createdAt: "2012-12-12" },
  { username: 'Damir', password: 'lolzik2281337', name: 'Damir', createdAt: "1987-12-23" },
];

export const getAccounts = () => {
  const savedAccounts = localStorage.getItem('accounts');
  return savedAccounts ? JSON.parse(savedAccounts) : accounts;
};

export const saveAccounts = (newAccounts) => {
  localStorage.setItem('accounts', JSON.stringify(newAccounts));
};

export const addUser = (newAccount) => {
  const existingAccounts = getAccounts();
  newAccount.createdAt = new Date().toISOString(); // Добавление даты создания в ISO формате
  newAccount.token = uuidv4(); // Генерация токена при добавлении нового аккаунта
  existingAccounts.push(newAccount);
  saveAccounts(existingAccounts);
};

export const getCurrentUser = () => {
  const userToken = localStorage.getItem('userToken');
  console.log(userToken);
  if (!userToken) return null;

  const accounts = getAccounts();
  console.log(accounts);
  const currentUser = accounts.find(account => account.token === userToken);
  console.log(currentUser);
  if (currentUser && currentUser.createdAt) {
    // Преобразование даты в строку
    const createdAtString = new Date(currentUser.createdAt).toLocaleDateString();
    console.log(createdAtString);
    return { ...currentUser, createdAtString };
  }

  return currentUser;
};


export const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('username');
};
