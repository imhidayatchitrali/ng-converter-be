import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Type for CORS origin callback
type CorsCallback = (error: Error | null, allow?: boolean) => void;

// Configure CORS with proper typing
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: CorsCallback) => {
    const allowedOrigins = [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'https://fascinating-basbousa-450c15.netlify.app',
      'https://ng-converter-be-production.up.railway.app'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware to set headers manually as fallback
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

const BASE_URL = 'https://api.freecurrencyapi.com/v1';

// API endpoints
app.get('/api/currencies', async (req: Request, res: Response) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error('API_KEY not configured');
    }

    const response = await axios.get(`${BASE_URL}/currencies`, {
      params: { apikey: process.env.API_KEY },
      timeout: 5000 // 5 second timeout
    });

    if (!response.data?.data) {
      throw new Error('Invalid API response structure');
    }

    res.json({
      success: true,
      data: Object.values(response.data.data)
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('API Error:', {
      message: err.message,
      stack: err.stack,
      apiKey: process.env.API_KEY ? 'exists' : 'missing'
    });

    res.status(500).json({
      success: false,
      error: 'Currency service unavailable',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
app.post('/api/convert', async (req: Request, res: Response) => {
  const { from, to, amount } = req.body;

  if (!from || !to || !amount) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters'
    });
  }

  try {
    const response = await axios.get(`${BASE_URL}/latest`, {
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
  } catch (error: unknown) {
    const err = error as AxiosError;
    console.error('Error converting currency:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to convert currency',
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});