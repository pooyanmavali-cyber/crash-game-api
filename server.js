const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection - اگر خطا داد، بدون دیتابیس کار میکنه
let isDBConnected = false;

const MONGODB_URI = "mongodb+srv://pooyanmavalli_db:7CjSh4P8zMsgQpQI@pooyan.sz@yxnh.mongodb.net/crash-game?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    isDBConnected = true;
  })
  .catch(err => {
    console.log('⚠️  MongoDB not connected, using memory storage');
    console.log('Error:', err.message);
  });

// مدل کاربر (اگر دیتابیس وصل نباشه، از memory استفاده میشه)
const userSchema = new mongoose.Schema({
  username: String,
  balance: { type: Number, default: 1000 },
  bets: [{
    amount: Number,
    multiplier: Number,
    win: Boolean,
    date: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

// ذخیره موقت در memory اگر دیتابیس وصل نباشه
let memoryUsers = {};
let activeGames = {};

// 📊 API Routes

// شروع بازی جدید
app.post('/api/game/start', async (req, res) => {
  try {
    const crashPoint = (Math.random() * 10 + 1).toFixed(2); // 1.00 تا 11.00
    const gameId = Date.now().toString();
    
    const game = {
      gameId: gameId,
      crashPoint: parseFloat(crashPoint),
      status: 'running',
      startTime: new Date(),
      players: []
    };
    
    activeGames[gameId] = game;
    
    res.json({ 
      success: true, 
      gameId: gameId, 
      crashPoint: game.crashPoint 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ثبت شرط
app.post('/api/game/bet', async (req, res) => {
  try {
    const { userId, amount, gameId } = req.body;
    
    if (!userId || !amount) {
      return res.json({ success: false, error: 'اطلاعات ناقص' });
    }
    
    let user;
    if (isDBConnected) {
      user = await User.findById(userId);
      if (!user) {
        user = new User({ _id: userId, username: `User${userId}`, balance: 1000 });
        await user.save();
      }
    } else {
      // استفاده از memory
      if (!memoryUsers[userId]) {
        memoryUsers[userId] = {
          _id: userId,
          username: `User${userId}`,
          balance: 1000,
          bets: []
        };
      }
      user = memoryUsers[userId];
    }
    
    // بررسی موجودی
    if (user.balance < amount) {
      return res.json({ success: false, error: 'موجودی کافی نیست' });
    }
    
    // کسر از موجودی
    user.balance -= amount;
    
    // ذخیره شرط
    const bet = {
      amount: amount,
      multiplier: 0,
      win: false,
      date: new Date()
    };
    
    if (isDBConnected) {
      user.bets.push(bet);
      await user.save();
    } else {
      user.bets.push(bet);
    }
    
    res.json({ 
      success: true, 
      newBalance: user.balance,
      message: 'شرط ثبت شد'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// دریافت اطلاعات کاربر
app.get('/api/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    let user;
    if (isDBConnected) {
      user = await User.findById(userId);
      if (!user) {
        user = new User({ 
          _id: userId, 
          username: `User${userId}`,
          balance: 1000 
        });
        await user.save();
      }
    } else {
      // استفاده از memory
      if (!memoryUsers[userId]) {
        memoryUsers[userId] = {
          _id: userId,
          username: `User${userId}`,
          balance: 1000,
          bets: []
        };
      }
      user = memoryUsers[userId];
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// تست تولید نقطه crash
app.get('/api/game/crash-point', (req, res) => {
  const crashPoint = (Math.random() * 10 + 1).toFixed(2);
  res.json({
    success: true,
    crashPoint: parseFloat(crashPoint),
    timestamp: new Date().toISOString()
  });
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Crash Game API Running!',
    database: isDBConnected ? 'Connected' : 'Memory Only',
    endpoints: {
      startGame: 'POST /api/game/start',
      placeBet: 'POST /api/game/bet',
      getUser: 'GET /api/user/:userId',
      testCrash: 'GET /api/game/crash-point'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🎮 Crash Game Server running on port ' + PORT);
  console.log('📊 Database status:', isDBConnected ? 'Connected' : 'Memory Only');
});
