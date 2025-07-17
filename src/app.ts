import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();
const PORT = 3001;

app.use(cors({
origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'https://fascinating-basbousa-450c15.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const BASE_URL = 'https://api.freecurrencyapi.com/v1'
const API_KEY = '4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2'


// Get available currencies
app.get('/api/currencies', async (req, res) => {
  try {
    console.log('Fetching currencies from:', `${BASE_URL}/currencies`);
    const response = await axios.get(`${BASE_URL}/currencies`, {
      params: { apikey: API_KEY },
      timeout: 5000
    });

    console.log('Full API response:', response.data);
    
    if (!response.data?.data) {
      throw new Error('Invalid API response structure');
    }

    const currencies = Object.values(response.data.data);
    console.log('Currencies found:', currencies.length);
    
    res.json({
      success: true,
      data: currencies
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Full error details:', {
      message: err.message,
      stack: err.stack,
      apiKey: API_KEY ? 'configured' : 'missing'
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch currencies',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


app.post('/api/convert', async (req, res) => {
  const { from, to, amount } = req.body;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await axios.get(`${BASE_URL}/latest`, {
      params: {
        apikey: API_KEY,
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