const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/v1/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        // 1. Ищем системный промт (Лизу) в массиве от iPhone
        const systemMsg = messages.find(m => m.role === 'system');
        const systemInstruction = systemMsg ? systemMsg.content : "You are a helpful assistant.";

        // 2. Преобразуем остальные сообщения (историю) для Gemini
        const history = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        // 3. Отправляем запрос в Gemini (Обновили модель на стабильную gemini-1.5-flash)
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: history
            }
        );

        // Печатаем ответ в логи Timeweb для контроля
        console.log("Ответ от Google:", JSON.stringify(response.data));

        // 4. Безопасно вытаскиваем текст ответа (используем опциональную цепочку ?.)
        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            // Если текст не пришел (например, сработал фильтр безопасности Google)
            console.error("Google вернул пустой ответ или заблокировал контент:", response.data);
            return res.status(500).json({ error: 'Google returned empty response or filtered content' });
        }

        // 5. Возвращаем ответ в формате OpenAI для твоего Swift-кода
        res.json({
            choices: [{
                message: {
                    role: "assistant",
                    content: aiText
                },
                finish_reason: "stop",
                index: 0
            }]
        });

    } catch (error) {
        console.error('Ошибка:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Proxy Error', 
            details: error.response?.data || error.message 
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
