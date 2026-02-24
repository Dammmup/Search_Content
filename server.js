import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/searchcontent';

// === MONGODB MODELS ===

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        default: () => uuidv4()
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('createdAtString').get(function () {
    return this.createdAt.toLocaleDateString();
});

const User = mongoose.model('User', userSchema);

// Favorite Schema
const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['film', 'track', 'image', 'character', 'fact', 'game', 'joke', 'coin'],
        required: true
    },
    externalId: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

favoriteSchema.index({ userId: 1, type: 1, externalId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

// === ROUTES: AUTH ===

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }
        const newUser = new User({ username, password, name: name || username });
        await newUser.save();
        res.status(201).json(newUser.toJSON());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
        }
        user.token = uuidv4();
        await user.save();
        res.json(user.toJSON());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/logout', async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ token });
        if (user) {
            user.token = null;
            await user.save();
        }
        res.json({ message: 'Выход выполнен' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/me', async (req, res) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        const user = await User.findOne({ token }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// === ROUTES: FAVORITES (CRUD) ===

// Получить все избранное пользователя
app.get('/api/favorites', async (req, res) => {
    try {
        const { token } = req.headers;
        const { type } = req.query;

        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const query = { userId: user._id };
        if (type) {
            query.type = type;
        }

        const favorites = await Favorite.find(query).sort({ createdAt: -1 });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Добавить в избранное
app.post('/api/favorites', async (req, res) => {
    try {
        const { token } = req.headers;
        const { type, externalId, data } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверяем, не существует ли уже
        const existing = await Favorite.findOne({
            userId: user._id,
            type,
            externalId: String(externalId)
        });

        if (existing) {
            return res.status(400).json({ message: 'Уже в избранном' });
        }

        const favorite = new Favorite({
            userId: user._id,
            type,
            externalId: String(externalId),
            data
        });

        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить из избранного
app.delete('/api/favorites/:type/:externalId', async (req, res) => {
    try {
        const { token } = req.headers;
        const { type, externalId } = req.params;

        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const result = await Favorite.findOneAndDelete({
            userId: user._id,
            type,
            externalId: String(externalId)
        });

        if (!result) {
            return res.status(404).json({ message: 'Не найдено в избранном' });
        }

        res.json({ message: 'Удалено из избранного' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Проверить, в избранном ли
app.get('/api/favorites/check/:type/:externalId', async (req, res) => {
    try {
        const { token } = req.headers;
        const { type, externalId } = req.params;

        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const favorite = await Favorite.findOne({
            userId: user._id,
            type,
            externalId: String(externalId)
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// === CONNECT TO MONGODB AND START SERVER ===
const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB подключен!');
        console.log(`📦 База: ${MONGODB_URI.split('@')[1] || 'локальная'}`);

        app.listen(PORT, () => {
            console.log(`🚀 Сервер на порту ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Ошибка MongoDB:', error.message);
        console.log('⚠️ Сервер работает без MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Сервер на порту ${PORT} (без БД)`);
        });
    }
};

startServer();
