const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
// Use environment variable for MongoDB URI (set in Render or locally)
// Example: mongodb+srv://adika713:8h3L3KmeZU8GdUEw@rubensnake.3w8astm.mongodb.net/?retryWrites=true&w=majority&appName=Rubensnake
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Leaderboard schema
const leaderboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  difficulty: { type: String, required: true }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// GET leaderboard by difficulty
app.get('/leaderboard/:difficulty', async (req, res) => {
  try {
    const { difficulty } = req.params;
    const scores = await Leaderboard.find({ difficulty })
      .sort({ score: -1 })
      .limit(10);
    res.json(scores);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new score
app.post('/leaderboard', async (req, res) => {
  try {
    const { name, score, difficulty } = req.body;
    if (!name || !score || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await Leaderboard.findOne({ name, difficulty });
    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        await existing.save();
      }
    } else {
      const newScore = new Leaderboard({ name, score, difficulty });
      await newScore.save();
    }
    res.status(200).json({ message: 'Score updated' });
  } catch (err) {
    console.error('Error updating leaderboard:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});