import React from 'react';
import { X, Sparkles, Send, Bot, User, HelpCircle, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function AiAssistant({ isOpen, onClose, products, onSelectProduct }: AiAssistantProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaste! 🙏 I am your BuyNow Nepal Smart Shopping Assistant. I am here to help you compare premium electronics, search for clothes, calculate Nepal shipping charges, or solve billing issues. What are you looking to buy today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim()) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: rawText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      // POST request to server-side Gemini proxy endpoint!
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: rawText,
          productsContext: products.map(p => ({
            name: p.name,
            price: p.price,
            stock: p.stock,
            colors: p.colors,
            rating: p.rating,
            category: p.category
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Connection boundary error');
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Gemini call error falling back to mock logic', error);
      
      // Smart Fallback offline assistant if server is booting or API is pending
      const normalized = rawText.toLowerCase();
      let fallbackReply = "I understand. BuyNow Nepal offers genuine electronics (iPhone 16 Pro, Galaxy S25, Sony Alpha Camera) and high-quality streetwear with secure eSewa/Khalti keys. Could you clarify your needs?";
      
      if (normalized.includes('shipping') || normalized.includes('delivery') || normalized.includes('charge')) {
        fallbackReply = "BuyNow Nepal shipping rates: Kathmandu Valley is NPR 100, Major Cities across Nepal is NPR 150, and Remote Areas is NPR 250. Express Delivery adds NPR 300. Orders above NPR 5,000 qualify for FREE shipping completely!";
      } else if (normalized.includes('iphone') || normalized.includes('apple') || normalized.includes('samsung') || normalized.includes('mobile') || normalized.includes('phone')) {
        fallbackReply = "We stock the Apple iPhone 16 Pro (NPR 189,999 with Titanium designs) and Samsung Galaxy S25 Ultra (NPR 174,999 with Galaxy AI). Both are genuine and have full warranties and are eligible for immediate free delivery!";
      } else if (normalized.includes('esewa') || normalized.includes('khalti') || normalized.includes('payment') || normalized.includes('pay') || normalized.includes('ime')) {
        fallbackReply = "You can pay securely via eSewa (Merchant: BUYNOWNP), Khalti (Demo public keys configured), IME Pay (BNIME001), bank transfer (Nabil/SBI), and Cash on Delivery. In checkout step 3, our secure portal guides you through mock OTP verification!";
      } else if (normalized.includes('office') || normalized.includes('location') || normalized.includes('address') || normalized.includes('where')) {
        fallbackReply = "Our Head Office is corporate situated at New Baneshwor, Kathmandu (Latitude 27.6947, Longitude 85.3420) and we hold a key eastern branch office in Birtamode, Jhapa. We ship to all 77 districts!";
      } else if (normalized.includes('reviews') || normalized.includes('testimonial') || normalized.includes('rating')) {
        fallbackReply = "We have over 100,000+ satisfied clients and average rating of 4.8/5. People like Suman Rai (Birtamode), Pratiksha (Kathmandu), and Nisha (Chitwan) highly praise our fast delivery and payments flexibility.";
      }

      const botMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'What are the shipping charges for Pokhara?',
    'Compare iPhone 16 Pro and Galaxy S25 Ultra',
    'How can I pay via Khalti or eSewa?',
    'Where is BuyNow Nepal head office located?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col text-left border-l border-gray-150 animate-in slide-in-from-right duration-250"
          id="ai-assistant-drawer"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-200 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-white block leading-none">BuyNow AI Advisor</h2>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                  ● Genuine Store Assistant Live
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-gray-800 hover:bg-gray-750 hover:text-white rounded-full text-gray-450 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 border border-blue-200">
                    <Bot size={14} />
                  </div>
                )}
                
                <div
                  className={`p-3 max-w-[85%] rounded-xl font-medium ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-60 block mt-1.5 text-right font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 shrink-0 border border-orange-200">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="g-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-gray-100 text-gray-500 rounded-xl rounded-tl-none border border-gray-200 flex items-center gap-1.5 font-bold">
                  <Loader2 size={13} className="animate-spin" />
                  <span>AI is thinking and comparing...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested FAQs prompts */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-150 bg-gray-50 text-left space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <HelpCircle size={12} /> Click to ask instantly
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="bg-white border border-gray-250 text-gray-700 hover:border-blue-600 transition-colors px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input dispatcher */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about iPhone reviews, Baneshwor head office, etc..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={isLoading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                id="ai-assistant-input"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                id="send-ai-msg"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
