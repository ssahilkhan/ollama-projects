const Chat = require('../models/Chat');

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const ollamaResponse = await callOllama(message);

    const chat = await Chat.findOne({ userId: req.user._id });

    if (chat) {
      chat.messages.push({ role: 'user', content: message });
      chat.messages.push({ role: 'ai', content: ollamaResponse });
      await chat.save();
    } else {
      await Chat.create({
        userId: req.user._id,
        messages: [
          { role: 'user', content: message },
          { role: 'ai', content: ollamaResponse }
        ]
      });
    }

    res.json({
      response: ollamaResponse,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const callOllama = async (prompt) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error('Ollama API request failed');
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    clearTimeout(timeout);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error('Failed to connect to Ollama. Make sure it is running.');
  }
};

const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ createdAt: 1 });

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const testChat = (req, res) => {
  res.json({
    message: 'Chat API is working!',
    usage: 'Send POST request with { message: "your question" }',
    example: {
      url: '/api/chat',
      method: 'POST',
      body: { message: 'Hello, what courses do you offer?' }
    }
  });
};

module.exports = { chat, getChatHistory, testChat };