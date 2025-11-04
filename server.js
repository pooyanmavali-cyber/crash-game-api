const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connection String - بعداً تکمیل می‌کنیم
const MONGODB_URI = "mongodb+srv://pooyanmavalli_db:7CjSh4P8zMsgQpQI@pooyan.sz@yxnh.mongodb.net/?appName=pooyan";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Crash Game API Running!',
    status: 'Active',
    game: 'Ready for development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🎮 Server running on port ${PORT});
});