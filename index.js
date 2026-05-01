const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

// ТВОЙ НОВЫЙ ЭНДПОИНТ ДЛЯ GOOGLE GEMINI
app.post('/v1/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        // Берем последнее сообщение из массива (формат Gemini отличается от OpenAI/Timeweb)
        const lastMessage = messages[messages.length - 1].content;

        const API_KEY = process.env.GEMINI_API_KEY; // Убедись, что в Timeweb переменная называется так

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [{
                    parts: [{ text: lastMessage }]
                }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        // Форматируем ответ, чтобы iOS приложение его поняло
        const aiText = response.data.candidates[0].content.parts[0].text;
        
        res.json({
            choices: [{
                message: {
                    content: aiText
                }
            }]
        });

    } catch (error) {
        console.error('Ошибка Google API:', error.response?.data || error.message);
        res.status(500).json({ error: 'Proxy server error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
