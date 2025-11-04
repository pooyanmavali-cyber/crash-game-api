const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb+srv://pooyanmavalli_db:7CjSh4P8zMsgQpQI@pooyan.sz@yxnh.mongodb.net/crash-game?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// مدل کاربر
const userSchema = new mongoose.Schema({
  username: String,
  balance: { type: Number, default: 1000 }
});
const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: '🚀 Crash Game API Running!' });
});

app.post('/api/game/start', (req, res) => {
  const crashPoint = (Math.random() * 10 + 1).toFixed(2);
  res.json({ crashPoint: parseFloat(crashPoint) });
});

app.post('/api/game/bet', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    let user = await User.findById(userId);
    if (!user) {
      user = new User({ _id: userId, username: User${userId} });
      await user.save();
    }
    
    if (user.balance < amount) {
      return res.json({ success: false, error: 'موجودی کافی نیست' });
    }
    
    user.balance -= amount;
    await user.save();
    
    res.json({ success: true, newBalance: user.balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🎮 Server running on port ' + PORT);
});
