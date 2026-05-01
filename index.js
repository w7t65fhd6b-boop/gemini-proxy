const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Тот самый секретный ключ, который мы спрячем
const SECRET_API_KEY = process.env.GEMINI_API_KEY; 
const TARGET_URL = "https://agent.timeweb.cloud/api/v1/cloud-ai/agents/9e5baebd-45b8-4e14-9500-9dd2aa2d417c/v1/chat/completions";

app.post('/v1/chat', async (req, res) => {
    try {
        // Добавляем проверку, что запрос пришел именно от вашего приложения
        if (req.headers['x-app-token'] !== 'MyUniqueAppToken123') {
            return res.status(403).send('Forbidden');
        }

        const response = await axios.post(TARGET_URL, req.body, {
            headers: {
                'Authorization': `Bearer ${SECRET_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send(error.message);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
