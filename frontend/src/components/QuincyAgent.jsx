import React, { useState } from 'react';
import { Mic, Image, Info, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const QuincyAgent = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message) => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
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

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      setIsLoading(true);
      setMessages(prev => [...prev, { type: 'user', content: userInput }]);
      
      const response = await sendMessage(userInput);
      setMessages(prev => [...prev, { type: 'agent', content: response }]);
      
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/api/placeholder/64/64"
              alt="Quincy Icon" 
              className="w-16 h-16 rounded-full"
            />
            <CardTitle className="text-2xl font-bold">Quincy The Agent</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="chat" onClick={() => setActiveTab('chat')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="gallery" onClick={() => setActiveTab('gallery')}>
                <Image className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="about" onClick={() => setActiveTab('about')}>
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <div className="h-96 overflow-y-auto bg-white rounded-lg p-4 mb-4 border">
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
                        : 'bg-gray-100'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-2 border rounded-lg resize-none h-20"
                  placeholder="Type your message here..."
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white"
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

            <TabsContent value="gallery">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-gray-500">No images generated yet</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="about">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">About Quincy</h2>
                <p>
                  Quincy is an AI assistant powered by Claude 3.5 Sonnet, designed to help users with 
                  a wide range of tasks and queries. With advanced natural language processing capabilities,
                  Quincy can engage in meaningful conversations and assist with various complex tasks.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuincyAgent;