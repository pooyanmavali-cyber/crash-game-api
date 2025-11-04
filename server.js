const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connection String
const MONGODB_URI = "mongodb+srv://pooyanmavalli_db:7CjSh4P8zMsgQpQI@pooyan.sz@yxnh.mongodb.net/crash-game?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// مدل کاربر
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

// مدل بازی
const gameSchema = new mongoose.Schema({
  crashPoint: Number,
  players: [{
    userId: String,
    betAmount: Number,
    cashoutAt: Number,
    win: Boolean
  }],
  status: { type: String, default: 'waiting' }, // waiting, running, ended
  startTime: Date,
  endTime: Date
});
const Game = mongoose.model('Game', gameSchema);

// 📊 API Routes

// شروع بازی جدید
app.post('/api/game/start', async (req, res) => {
  try {
    const crashPoint = (Math.random() * 10 + 1).toFixed(2); // 1.00 تا 11.00
    const game = new Game({
      crashPoint: parseFloat(crashPoint),
      status: 'running',
      startTime: new Date()
    });
    await game.save();
    
    res.json({ 
      success: true, 
      gameId: game._id, 
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
    
    // پیدا کردن کاربر
    let user = await User.findById(userId);
    if (!user) {
      user = new User({ _id: userId, username: User${userId} });
    }
    
    // بررسی موجودی
    if (user.balance < amount) {
      return res.json({ success: false, error: 'موجودی کافی نیست' });
    }
    
    // کسر از موجودی
    user.balance -= amount;
    await user.save();
    
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
    let user = await User.findById(req.params.userId);
    if (!user) {
      user = new User({ 
        _id: req.params.userId, 
        username: User${req.params.userId},
        balance: 1000 
      });
      await user.save();
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Crash Game API Running!',
    endpoints: {
      startGame: 'POST /api/game/start',
      placeBet: 'POST /api/game/bet', 
      getUser: 'GET /api/user/:userId'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🎮 Server running on port ' + PORT);
});
