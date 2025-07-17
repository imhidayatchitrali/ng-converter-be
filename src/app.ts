import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
dotenv.config();

app.use(express.json());


// Get available currencies
app.get('/api/currencies', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/currencies`, {
      params: {
        apikey: process.env.API_KEY
      }
    });

    res.json({
      success: true,
      data: Object.values(response.data.data)
    });

  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});



app.post('/api/convert', async (req, res) => {
  const { from, to, amount } = req.body;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await axios.get(`${process.env.BASE_URL}/latest`, {
      params: {
        apikey: process.env.API_KEY,
        base_currency: from,
        currencies: to
      }
    });

    const rate = response.data.data[to];
    const result = parseFloat(amount) * rate;

    res.json({
      success: true,
      data: {
        from,
        to,
        amount: parseFloat(amount),
        rate,
        convertedAmount: result
      }
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});