const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Enable CORS for all routes to allow the frontend to connect
app.use(cors());
// Parse JSON bodies for API requests
app.use(express.json());

// --- API Routes ---

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to ensure the server is running.
 * @access  Public
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    message: 'ALT-AI-MATE server is running smoothly.',
    dbStatus: 'Not Available (using mock data)'
  });
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Public
 */
app.post('/api/projects', (req, res) => {
    const { name, projectType, userId } = req.body;
    console.log('Received new project:', { name, projectType, userId });
    
    if (!name || !projectType) {
      return res.status(400).json({ error: 'Missing required fields: name and projectType' });
    }
    
    const newProject = {
        id: `proj_${Date.now()}`,
        name,
        project_type: projectType,
        user_id: userId || 'anonymous',
        created_at: new Date().toISOString(),
        status: 'Created'
    };
    
    res.status(201).json({ 
        message: 'Project created successfully', 
        project: newProject 
    });
});

/**
 * @route   POST /api/generate-code
 * @desc    Generate code based on project description and type
 * @access  Public
 */
app.post('/api/generate-code', (req, res) => {
    const { prompt, projectType, frontend, backend } = req.body;
    console.log('Generating code for:', { prompt, projectType, frontend, backend });

    if (!prompt || !projectType) {
      return res.status(400).json({ error: 'Missing required fields: prompt and projectType' });
    }

    // Generate code based on project type and description
    let generatedCode = '';
    
    switch (projectType) {
        case 'web':
            if (frontend === 'React') {
                generatedCode = generateReactApp(prompt);
            } else if (frontend === 'Vue') {
                generatedCode = generateVueApp(prompt);
            } else {
                generatedCode = generateReactApp(prompt); // Default to React
            }
            break;
        case 'mobile':
            generatedCode = generateMobileApp(prompt);
            break;
        case 'desktop':
            generatedCode = generateDesktopApp(prompt);
            break;
        case 'game':
            generatedCode = generateGameApp(prompt);
            break;
        case 'ecommerce':
            generatedCode = generateEcommerceApp(prompt);
            break;
        case 'social':
            generatedCode = generateSocialApp(prompt);
            break;
        case 'hardware':
            generatedCode = generateHardwareCode(prompt);
            break;
        default:
            generatedCode = generateReactApp(prompt);
    }
    
    // Simulate processing time
    setTimeout(() => {
        res.status(200).json({ 
            code: generatedCode,
            message: 'Code generated successfully',
            projectType,
            prompt
        });
    }, 1500); // 1.5 second delay to simulate AI processing
});

/**
 * @route   POST /api/ai-chat
 * @desc    Handle AI assistant chat messages
 * @access  Public
 */
app.post('/api/ai-chat', (req, res) => {
    const { message, context } = req.body;
    console.log('AI Chat message:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Missing required field: message' });
    }
    
    // Simulate AI response based on the message
    let aiResponse = '';
    
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('bug')) {
        aiResponse = "I can help you debug that issue. Can you share the specific error message or describe what's not working as expected?";
    } else if (message.toLowerCase().includes('optimize') || message.toLowerCase().includes('performance')) {
        aiResponse = "For performance optimization, I'd recommend checking for unnecessary re-renders, optimizing your API calls, and considering code splitting. What specific performance issues are you experiencing?";
    } else if (message.toLowerCase().includes('deploy') || message.toLowerCase().includes('deployment')) {
        aiResponse = "For deployment, you have several options depending on your project type. For web apps, consider Vercel, Netlify, or AWS. For mobile apps, you'll need to build for the app stores. What type of deployment are you planning?";
    } else if (message.toLowerCase().includes('test') || message.toLowerCase().includes('testing')) {
        aiResponse = "Testing is crucial! I recommend setting up unit tests with Jest, integration tests, and end-to-end tests with tools like Cypress or Playwright. What kind of testing are you looking to implement?";
    } else {
        aiResponse = `That's an interesting question about "${message}". Based on your code context, I'd suggest reviewing the implementation and considering best practices for your specific use case. Could you provide more details about what you're trying to achieve?`;
    }
    
    // Simulate processing time
    setTimeout(() => {
        res.status(200).json({ 
            response: aiResponse,
            timestamp: new Date().toISOString()
        });
    }, 800); // Shorter delay for better UX
});

// Code generation functions
function generateReactApp(prompt) {
  return `import React, { useState, useEffect } from 'react';
import './App.css';

// Generated based on: ${prompt}
function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(['Item 1', 'Item 2', 'Item 3']);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Your App</h1>
        <p>Built based on: ${prompt}</p>
      </header>
      <main>
        <section className="features">
          <h2>Features</h2>
          <ul>
            {data.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="actions">
          <button onClick={() => alert('Feature coming soon!')}>
            Get Started
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;`;
}

function generateVueApp(prompt) {
  return `<template>
  <div id="app">
    <header>
      <h1>Welcome to Your Vue App</h1>
      <p>Built based on: ${prompt}</p>
    </header>
    <main>
      <section class="features">
        <h2>Features</h2>
        <ul>
          <li v-for="(item, index) in data" :key="index">{{ item }}</li>
        </ul>
      </section>
      <section class="actions">
        <button @click="handleClick">Get Started</button>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      data: ['Item 1', 'Item 2', 'Item 3'],
      loading: false
    }
  },
  methods: {
    handleClick() {
      alert('Feature coming soon!');
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>`;
}

function generateMobileApp(prompt) {
  return `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Generated based on: ${prompt}
const App = () => {
  const handlePress = () => {
    alert('Feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Mobile App</Text>
        <Text style={styles.subtitle}>Built based on: ${prompt}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Features</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;`;
}

function generateDesktopApp(prompt) {
  return `import React, { useState } from 'react';
import './App.css';

// Generated based on: ${prompt}
function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="desktop-app">
      <div className="titlebar">
        <div className="titlebar-buttons">
          <div className="button close"></div>
          <div className="button minimize"></div>
          <div className="button maximize"></div>
        </div>
        <div className="titlebar-title">Your Desktop App</div>
      </div>
      
      <div className="app-content">
        <nav className="sidebar">
          <button 
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
        
        <main className="main-content">
          {activeTab === 'home' && (
            <div>
              <h1>Welcome to Your Desktop App</h1>
              <p>Built based on: ${prompt}</p>
              <button onClick={() => alert('Feature coming soon!')}>
                Get Started
              </button>
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <h1>Settings</h1>
              <p>Configure your application here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;`;
}

function generateGameApp(prompt) {
  return `import React, { useState, useEffect, useCallback } from 'react';
import './Game.css';

// Generated based on: ${prompt}
function Game() {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 });

  const handleKeyPress = useCallback((event) => {
    if (!gameStarted) return;
    
    const { key } = event;
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch(key) {
        case 'ArrowUp':
          newY = Math.max(0, prev.y - 10);
          break;
        case 'ArrowDown':
          newY = Math.min(90, prev.y + 10);
          break;
        case 'ArrowLeft':
          newX = Math.max(0, prev.x - 10);
          break;
        case 'ArrowRight':
          newX = Math.min(90, prev.x + 10);
          break;
      }
      
      return { x: newX, y: newY };
    });
  }, [gameStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Your Game</h1>
        <p>Built based on: ${prompt}</p>
        <div className="score">Score: {score}</div>
      </div>
      
      <div className="game-area">
        {!gameStarted ? (
          <div className="start-screen">
            <button onClick={startGame}>Start Game</button>
            <p>Use arrow keys to move</p>
          </div>
        ) : (
          <div className="game-world">
            <div 
              className="player"
              style={{
                left: \`\${playerPosition.x}%\`,
                top: \`\${playerPosition.y}%\`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;`;
}

function generateEcommerceApp(prompt) {
  return `import React, { useState } from 'react';
import './Ecommerce.css';

// Generated based on: ${prompt}
function EcommerceApp() {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Product 1', price: 29.99, image: '/api/placeholder/200/200' },
    { id: 2, name: 'Product 2', price: 39.99, image: '/api/placeholder/200/200' },
    { id: 3, name: 'Product 3', price: 19.99, image: '/api/placeholder/200/200' },
  ]);

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0).toFixed(2);
  };

  return (
    <div className="ecommerce-app">
      <header className="header">
        <h1>Your E-commerce Store</h1>
        <p>Built based on: ${prompt}</p>
        <div className="cart-info">
          Cart ({cart.length}) - $\{getTotalPrice()}
        </div>
      </header>

      <main className="main-content">
        <section className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">$\{product.price}</p>
              <button onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default EcommerceApp;`;
}

function generateSocialApp(prompt) {
  return `import React, { useState } from 'react';
import './Social.css';

// Generated based on: ${prompt}
function SocialApp() {
  const [posts, setPosts] = useState([
    { id: 1, user: 'John Doe', content: 'Hello world!', likes: 5, timestamp: '2 hours ago' },
    { id: 2, user: 'Jane Smith', content: 'Beautiful sunset today!', likes: 12, timestamp: '4 hours ago' },
  ]);
  const [newPost, setNewPost] = useState('');

  const addPost = () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        user: 'You',
        content: newPost,
        likes: 0,
        timestamp: 'Just now'
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const likePost = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="social-app">
      <header className="header">
        <h1>Your Social Platform</h1>
        <p>Built based on: ${prompt}</p>
      </header>

      <main className="main-content">
        <section className="post-composer">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
          />
          <button onClick={addPost}>Post</button>
        </section>

        <section className="posts-feed">
          {posts.map(post => (
            <div key={post.id} className="post">
              <div className="post-header">
                <strong>{post.user}</strong>
                <span className="timestamp">{post.timestamp}</span>
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button onClick={() => likePost(post.id)}>
                  ❤️ {post.likes}
                </button>
                <button>💬 Comment</button>
                <button>🔄 Share</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default SocialApp;`;
}

function generateHardwareCode(prompt) {
  return `// Arduino Code Generated based on: ${prompt}
// Hardware IoT Project

#include <WiFi.h>
#include <DHT.h>

// Pin definitions
#define DHT_PIN 2
#define LED_PIN 13
#define BUTTON_PIN 7

// DHT sensor setup
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// WiFi credentials (replace with your own)
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

// Variables
float temperature = 0;
float humidity = 0;
bool ledState = false;
unsigned long lastReading = 0;
const unsigned long readingInterval = 2000; // 2 seconds

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  Serial.println("Hardware project initialized!");
  Serial.println("Based on: ${prompt}");
}

void loop() {
  // Read sensor data every 2 seconds
  if (millis() - lastReading >= readingInterval) {
    readSensorData();
    lastReading = millis();
  }
  
  // Check button press
  if (digitalRead(BUTTON_PIN) == LOW) {
    toggleLED();
    delay(200); // Debounce
  }
  
  // Send data to server (placeholder)
  sendDataToServer();
  
  delay(100);
}

void readSensorData() {
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C, Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
}

void toggleLED() {
  ledState = !ledState;
  digitalWrite(LED_PIN, ledState);
  Serial.print("LED turned ");
  Serial.println(ledState ? "ON" : "OFF");
}

void sendDataToServer() {
  // Placeholder for sending data to your server
  // You can implement HTTP requests here
  
  if (WiFi.status() == WL_CONNECTED) {
    // Example: Send temperature and humidity to your API
    // HTTPClient http;
    // http.begin("http://your-server.com/api/sensor-data");
    // http.addHeader("Content-Type", "application/json");
    // String payload = "{\\"temperature\\":" + String(temperature) + ",\\"humidity\\":" + String(humidity) + "}";
    // int httpResponseCode = http.POST(payload);
    // http.end();
  }
}`;
}

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`🚀 ALT-AI-MATE backend server is listening at http://localhost:${port}`);
});