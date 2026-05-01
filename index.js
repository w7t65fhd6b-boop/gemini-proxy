const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

// ТВОЙ НОВЫЙ ЭНДПОИНТ ДЛЯ GOOGLE GEMINI
app.post('/v1/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const lastMessage = messages[messages.length - 1].content;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
            {
                contents: [{
                    parts: [{ text: lastMessage }]
                }]
            }
        );

        const aiText = response.data.candidates[0].content.parts[0].text;
        
        // ВОТ ТУТ ИСПРАВЛЕНИЕ: Добавляем "role" и структуру как у OpenAI
        res.json({
            choices: [{
                message: {
                    role: "assistant", // Теперь iOS найдет этот ключ
                    content: aiText
                },
                finish_reason: "stop",
                index: 0
            }]
        });

    } catch (error) {
        console.error('Ошибка:', error.response?.data || error.message);
        res.status(500).json({ error: 'Proxy server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
