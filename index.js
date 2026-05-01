const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Порт Timeweb выдает автоматически через переменную окружения PORT
const PORT = process.env.PORT || 8080;

app.post('/v1/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        const response = await axios.post(
            `https://agent.timeweb.cloud/api/v1/agents/${process.env.AGENT_ID}/chat/completions`,
            {
                messages: messages,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.TIMEWEB_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Proxy server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
