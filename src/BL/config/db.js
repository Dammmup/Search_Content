import mongoose from 'mongoose';

// MongoDB Connection URI
// Замените на вашу строку подключения MongoDB Atlas или локальную
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/searchcontent';

// Параметры подключения
const mongooseOptions = {
    maxPoolSize: 10, // Максимальное количество соединений в пуле
    serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
    socketTimeoutMS: 45000, // Таймаут сокета
};

// Функция подключения к MongoDB
export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        console.log('✅ MongoDB подключен успешно!');
        console.log(`📦 База данных: ${MONGODB_URI.split('@')[1] || 'локальная'}`);
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        // При ошибке подключения продолжаем работать с localStorage
        console.log('⚠️ Используется localStorage как резервное хранилище');
    }
};

// Обработка событий подключения
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB отключен');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Ошибка MongoDB:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('👋 Соединение с MongoDB закрыто');
    process.exit(0);
});

export default mongoose;
