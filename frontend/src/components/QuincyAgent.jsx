import React, { useState, useEffect } from 'react';
import { Mic, Image, Info, MessageCircle, Moon, Sun, Code, SendHorizonal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const QuincyAgent = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(Date.now().toString());
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Load saved messages
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save messages when updated
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const sendMessage = async (message) => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, I encountered an error processing your request.';
    }
  };

  const generateImage = async (prompt) => {
    try {
      const response = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImages(prev => [...prev, { prompt, url: data.imageUrl }]);
      return data.imageUrl;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      setIsLoading(true);
      setMessages(prev => [...prev, { type: 'user', content: userInput }]);
      
      // Check if it's an image generation request
      if (userInput.toLowerCase().includes('generate image') || userInput.toLowerCase().includes('create image')) {
        const imageUrl = await generateImage(userInput);
        if (imageUrl) {
          setMessages(prev => [...prev, { 
            type: 'agent', 
            content: 'Here\'s your generated image:',
            image: imageUrl
          }]);
        }
      } else {
        const response = await sendMessage(userInput);
        setMessages(prev => [...prev, { type: 'agent', content: response }]);
      }
      
      setUserInput('');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  // Simple function to format code in messages
  const formatMessage = (content) => {
    if (content.includes('```')) {
      return content.split('```').map((part, index) => {
        if (index % 2 === 1) {
          return (
            <pre key={index} className="bg-gray-800 text-gray-100 p-4 rounded-lg my-2 overflow-x-auto">
              <code>{part}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    return content;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-4`}>
      <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/api/placeholder/64/64"
              alt="Quincy Icon" 
              className="w-16 h-16 rounded-full"
            />
            <CardTitle className="text-2xl font-bold">Quincy The Agent</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="chat">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Image className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="about">
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <div className={`h-96 overflow-y-auto rounded-lg p-4 mb-4 border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2 mb-4 ${
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.type === 'agent' && (
                      <img 
                        src="/api/placeholder/32/32"
                        alt="Quincy"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className={`p-3 rounded-lg max-w-[70%] ${
                      msg.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {formatMessage(msg.content)}
                      {msg.image && (
                        <img src={msg.image} alt="Generated" className="mt-2 rounded-lg max-w-full" />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`flex-1 p-2 border rounded-lg resize-none h-20 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'
                  }`}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    className={`${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </Button>
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "secondary"}
                    disabled={isLoading}
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.length === 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-gray-500">No images generated yet</p>
                  </CardContent>
                </Card>
              ) : (
                generatedImages.map((img, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <img src={img.url} alt={img.prompt} className="w-full rounded-lg" />
                      <p className="mt-2 text-sm text-gray-500">{img.prompt}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">About Quincy</h2>
                <p>
                  Quincy is an AI assistant powered by Claude 3.5 Sonnet, designed to help users with 
                  a wide range of tasks and queries. With advanced natural language processing capabilities,
                  Quincy can engage in meaningful conversations and assist with various complex tasks.
                </p>
                
                <h3 className="text-lg font-semibold mt-4">Features</h3>
                <ul className="space-y-2">
                  <li>• Natural conversation and task assistance</li>
                  <li>• Code generation with syntax highlighting</li>
                  <li>• Image generation capabilities</li>
                  <li>• Dark/light mode support</li>
                  <li>• Message history persistence</li>
                  <li>• Voice input support (coming soon)</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuincyAgent;