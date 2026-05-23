const API_URL = 'http://localhost:5000/api';

let token = localStorage.getItem('token');
let user = null;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const connectionStatus = document.getElementById('connection-status');

async function checkConnection() {
  try {
    const response = await fetch(`${API_URL}/test`);
    const data = await response.json();
    connectionStatus.textContent = 'Connected';
    connectionStatus.className = 'connected';
    return true;
  } catch (error) {
    connectionStatus.textContent = 'Connection error';
    connectionStatus.className = 'error';
    return false;
  }
}

let typingIndicator = null;

function addMessage(text, isUser = false, fromHistory = false) {
  if (!fromHistory && typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  if (typingIndicator) return;
  
  typingIndicator = document.createElement('div');
  typingIndicator.className = 'message bot typing';
  typingIndicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  if (!token) {
    addMessage('Please login first to use the chat!');
    return;
  }

  addMessage(message, true);
  userInput.value = '';
  sendBtn.disabled = true;
  showTypingIndicator();

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    removeTypingIndicator();
    const data = await response.json();
    
    if (response.ok) {
      addMessage(data.response);
    } else {
      addMessage(data.message || 'Something went wrong');
    }
  } catch (error) {
    removeTypingIndicator();
    addMessage('Sorry, something went wrong. Please try again.');
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

async function loadChatHistory() {
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/chat/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      
      chatMessages.innerHTML = '';
      
if (data.chats && data.chats.length > 0) {
        data.chats.forEach(chat => {
          chat.messages.forEach(msg => {
            addMessage(msg.content, msg.role === 'user', true);
          });
        });
      }
    }
  } catch (e) {
    console.log('Could not load chat history');
  }
}

async function init() {
  const connected = await checkConnection();
  
  if (connected && token) {
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        user = data.user;
        await loadChatHistory();
        if (chatMessages.children.length === 0) {
          addMessage(`Welcome back, ${user.name}! How can I help you?`);
        }
        return;
      } else {
        token = null;
        localStorage.removeItem('token');
      }
    } catch (e) {
      token = null;
    }
  }
  
  addMessage('Hello! I\'m your student inquiry assistant. How can I help you today?');
}

init();

window.loginUser = async (name, email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      token = data.token;
      user = data.user;
      localStorage.setItem('token', token);
      return { success: true, user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Connection error' };
  }
};

window.registerUser = async (name, email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      token = data.token;
      user = data.user;
      localStorage.setItem('token', token);
      return { success: true, user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Connection error' };
  }
};

window.getToken = () => token;
window.getUser = () => user;