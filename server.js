const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;
const DATA_FILE = './bamba-data.js';

// მენიუს წამოღება (GET)
app.get('/api/menu', (req, res) => {
  try {
    delete require.cache[require.resolve(DATA_FILE)];
    const data = require(DATA_FILE);
    res.json(data.BMENU || []);
  } catch (err) {
    res.status(500).json({ error: 'ვერ მოიძებნა მენიუ' });
  }
});

// შეტყობინების მიღება (POST)
app.post('/api/messages', (req, res) => {
  console.log('ახალი შეტყობინება:', req.body);
  res.json({ success: true, message: 'შეტყობინება მიღებულია' });
});

app.listen(PORT, () => {
  console.log(`🚀 API სერვერი ჩართულია: http://localhost:${PORT}`);
});