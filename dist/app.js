"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// const PORT = process.env.PORT || 3001;
const PORT = 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'https://fascinating-basbousa-450c15.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json());
const BASE_URL = 'https://api.freecurrencyapi.com/v1';
const API_KEY = '4E0VK7BnkdeUuh1vegAt808v2IUjzUR6lxcvBMT2';
// Get available currencies
app.get('/api/currencies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Fetching currencies from:', `${BASE_URL}/currencies`);
        const response = yield axios_1.default.get(`${BASE_URL}/currencies`, {
            params: { apikey: API_KEY },
            timeout: 5000
        });
        console.log('Full API response:', response.data);
        if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.data)) {
            throw new Error('Invalid API response structure');
        }
        const currencies = Object.values(response.data.data);
        console.log('Currencies found:', currencies.length);
        res.json({
            success: true,
            data: currencies
        });
    }
    catch (error) {
        const err = error;
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
}));
app.post('/api/convert', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, amount } = req.body;
    if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    try {
        const response = yield axios_1.default.get(`${BASE_URL}/latest`, {
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
    }
    catch (error) {
        console.error('Error converting currency:', error);
        res.status(500).json({ error: 'Failed to convert currency' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
