import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Mic, Loader2, Utensils, CheckCircle, Volume2, QrCode, CreditCard, ShieldCheck, LogOut, ShoppingCart, Info, User as UserIcon, X, Clock, MessageCircle } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';
import { BACKEND_URL, apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

export default function CustomerInterface() {
  const {
    isRecording,
    isConnecting,
    transcript,
    orderPlaced,
    paymentAction,
    setPaymentAction,
    setOrderPlaced,
    startSession,
    stopSession,
    setTranscript
  } = useGemini();

  const { logout, user } = useContext(AuthContext);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Menu and Cart state
  const [menuItems, setMenuItems] = useState([]);
  const [liveCart, setLiveCart] = useState(null);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);

  const [myOrders, setMyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'history'

  // Text Bot State
  const [textInput, setTextInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatSessionId] = useState(`web_text_${Math.random().toString(36).substring(7)}`);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    apiService.getMenu()
      .then(data => setMenuItems(data))
      .catch(err => console.error("Error fetching menu:", err));
      
    if (user) {
      apiService.getMyOrders()
        .then(data => setMyOrders(data))
        .catch(err => console.error("Error fetching my orders:", err));
    }

    const socket = io(BACKEND_URL);
    socket.on('cartUpdated', (cartData) => {
      setLiveCart(cartData);
    });
    
    socket.on('orderUpdated', (updatedOrder) => {
      setMyOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => socket.close();
  }, [user]);

  const handleSendText = async (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;
    
    const userMsg = textInput;
    setTextInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);
    
    try {
      const res = await apiService.sendTextChat(chatSessionId, userMsg);
      if (res.text) {
        setChatHistory(prev => [...prev, { role: 'bot', text: res.text }]);
        setTranscript(res.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsProcessingPayment(true);
    try {
      await fetch(`${BACKEND_URL}/api/orders/${paymentAction.paymentDetails.orderId}/pay`, { method: 'POST' });
      
      setPaymentAction(null);
      setOrderPlaced(true);
      setLiveCart(null);

      const successMsg = "Thank you for your order, your order will arrive very soon.";
      setTranscript(successMsg);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(successMsg);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Female') || v.name.includes('Google')));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch(err) {
      console.error(err);
      alert("Payment failed simulation error.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMakePayment = async () => {
    if (!liveCart || liveCart.items.length === 0) return;
    setIsProcessingPayment(true);
    try {
      const orderData = {
        items: liveCart.items,
        totalAmount: liveCart.totalAmount,
        customerName: user ? `${user.firstName} ${user.lastName}`.trim() : "Voice Customer",
        user: user ? user._id : undefined,
        status: 'Pending',
        paymentMethod: 'upi',
        paymentStatus: 'Paid'
      };
      
      await apiService.createOrder(orderData);
      
      setOrderPlaced(true);
      setLiveCart(null);
      
      const successMsg = "Your payment was successful! Your order will arrive very soon.";
      setTranscript(successMsg);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(successMsg);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-') && (v.name.includes('Female') || v.name.includes('Google')));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to place order.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-gray-50">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 transition-all duration-1000 ${isRecording ? 'bg-gradient-to-r from-cyan-500 to-blue-500 scale-110' : 'bg-gradient-to-r from-blue-900 to-purple-900 scale-100'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-30 transition-all duration-1000 delay-100 ${isRecording ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110' : 'bg-gradient-to-r from-gray-800 to-gray-200 scale-100'}`}></div>
      </div>

      {/* TOP NAVBAR */}
      <nav className="w-full z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Neon Bite Logo" className="w-10 h-10 rounded-lg object-cover shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight leading-tight">
              Neon Bite
            </h1>
            <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest leading-none mt-0.5">AI-Powered Food Delivery</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 bg-white border border-gray-200 px-6 py-2 rounded-full backdrop-blur-md">
            <button onClick={() => setActiveTab('menu')} className={`font-bold transition-all text-sm ${activeTab === 'menu' ? 'text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-gray-600 hover:text-gray-900'}`}>New Order</button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button onClick={() => setActiveTab('history')} className={`font-bold transition-all text-sm ${activeTab === 'history' ? 'text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-gray-600 hover:text-gray-900'}`}>My Orders</button>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full backdrop-blur-md">
            <UserIcon size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors bg-white hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 backdrop-blur-md"
          >
            <LogOut size={16} /> 
            <span className="text-sm font-medium hidden sm:block">Log out</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        
        {/* LEFT PANEL: AI ASSISTANT */}
        <div className="w-full md:w-1/4 border-r border-gray-200 bg-white/40 backdrop-blur-sm flex flex-col items-center py-10 px-6 h-full overflow-y-auto hide-scrollbar shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20">
          <div className="relative w-48 h-48 flex items-center justify-center mb-10 mt-6">
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 blur-xl opacity-50 animate-pulse"
                />
              )}
            </AnimatePresence>
            
            <button 
              onClick={isRecording ? stopSession : startSession}
              disabled={isConnecting}
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden shadow-2xl
                ${isRecording 
                  ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.5)]' 
                  : 'bg-white border border-gray-200 hover:bg-gray-100 backdrop-blur-xl hover:scale-105'
                }
                ${isConnecting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
              `}
            >
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-80">
                   <motion.div animate={{ height: ["20%", "70%", "30%", "80%", "20%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 rounded-full bg-cyan-400"></motion.div>
                   <motion.div animate={{ height: ["40%", "90%", "20%", "60%", "40%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className="w-1.5 rounded-full bg-blue-400"></motion.div>
                   <motion.div animate={{ height: ["30%", "60%", "90%", "40%", "30%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1.5 rounded-full bg-purple-400"></motion.div>
                   <motion.div animate={{ height: ["60%", "20%", "70%", "90%", "60%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="w-1.5 rounded-full bg-pink-400"></motion.div>
                   <motion.div animate={{ height: ["20%", "80%", "40%", "60%", "20%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1.5 rounded-full bg-cyan-400"></motion.div>
                </div>
              )}
              <div className={`relative z-20 transition-all duration-300 ${isRecording ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                {isConnecting ? <Loader2 className="text-gray-900 animate-spin" size={32} /> : <Mic className="text-gray-900" size={36} />}
              </div>
            </button>
          </div>

          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-8">
            {isConnecting ? "Connecting..." : isRecording ? "Listening..." : "Tap to speak"}
          </p>

          <motion.div 
            layout
            className={`w-full bg-white border border-gray-200 rounded-2xl p-5 transition-all duration-300 ${isRecording ? 'opacity-100' : 'opacity-60'} mb-4`}
          >
            <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
              <Volume2 size={14} className="text-cyan-400" />
              <span className="text-gray-600 text-xs font-medium uppercase tracking-wider">AI Transcript</span>
            </div>
            <div className="text-gray-900 text-sm font-medium leading-relaxed min-h-[60px] max-h-[150px] overflow-y-auto hide-scrollbar italic">
              {chatHistory.length > 0 ? (
                <div className="space-y-2">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`px-3 py-1.5 rounded-2xl inline-block ${msg.role === 'user' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>"{transcript || 'Say something or type below...'}"</p>
              )}
            </div>
          </motion.div>

          <form onSubmit={handleSendText} className="w-full flex gap-2">
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your order..." 
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              disabled={isSending}
            />
            <button 
              type="submit" 
              disabled={isSending || !textInput.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
            </button>
          </form>

          <div className="mt-4 flex items-start gap-2 text-gray-500 text-xs">
             <Info size={14} className="shrink-0 mt-0.5" />
             <p>Our AI is fully aware of the menu items shown on the right. Just ask it what you want!</p>
          </div>
        </div>

        {/* CENTER PANEL: MAIN MENU OR OVERLAYS */}
        <div className="flex-1 flex flex-col p-8 lg:p-12 h-full overflow-y-auto hide-scrollbar z-10">
          {paymentAction ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-white backdrop-blur-3xl border border-blue-500/30 p-10 rounded-[2.5rem] flex flex-col items-center shadow-2xl"
              >
                <div className="w-full flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <ShieldCheck className="text-blue-400" size={32}/> Secure Checkout
                  </h2>
                  <span className="text-3xl font-black text-green-400">₹{paymentAction.paymentDetails.amount.toFixed(2)}</span>
                </div>

                {paymentAction.paymentDetails.method === 'upi' ? (
                  <div className="flex flex-col items-center bg-white p-8 rounded-2xl mb-8 w-full max-w-xs">
                    <QrCode size={160} className="text-black mb-4" />
                    <p className="text-black font-bold text-lg">Scan to Pay via UPI</p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-3 bg-gray-50 p-5 rounded-xl border border-gray-200">
                      <CreditCard className="text-gray-600" size={24} />
                      <input type="text" placeholder="Card Number" className="bg-transparent outline-none text-gray-900 w-full text-lg" readOnly value="**** **** **** 4242" />
                    </div>
                    <div className="flex gap-4">
                       <input type="text" placeholder="MM/YY" className="bg-gray-50 p-5 rounded-xl border border-gray-200 outline-none text-gray-900 w-1/2 text-lg" readOnly value="12/26" />
                       <input type="text" placeholder="CVV" className="bg-gray-50 p-5 rounded-xl border border-gray-200 outline-none text-gray-900 w-1/2 text-lg" readOnly value="***" />
                    </div>
                  </div>
                )}

                <button 
                  onClick={handlePaymentSuccess}
                  disabled={isProcessingPayment}
                  className="w-full py-5 bg-blue-600 text-gray-900 text-lg font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
                >
                  {isProcessingPayment ? <Loader2 className="animate-spin" size={24} /> : "Simulate Payment Success"}
                </button>
              </motion.div>
            </div>
          ) : orderPlaced ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-white backdrop-blur-3xl border border-green-500/30 p-12 rounded-[3rem] flex flex-col items-center shadow-2xl text-center"
              >
                <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
                  <CheckCircle size={64} className="text-green-400 relative z-10" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
                <p className="text-gray-600 text-lg mb-10 leading-relaxed">Your voice order was successfully processed and the kitchen is on it.</p>
                <button 
                  onClick={() => { setOrderPlaced(false); stopSession(); setLiveCart(null); setActiveTab('history'); apiService.getMyOrders().then(setMyOrders); }}
                  className="px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-200 transition-colors shadow-xl hover:-translate-y-1 transform duration-200"
                >
                  Track Order
                </button>
              </motion.div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="w-full max-w-4xl mx-auto pb-20">
              <div className="mb-8 pb-4 border-b border-gray-200">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Orders</h1>
                <p className="text-gray-600 text-lg">Track your active orders in real-time and view your past history.</p>
              </div>
              
              <div className="space-y-6">
                {myOrders.length === 0 ? (
                  <div className="py-20 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
                    <Clock size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-xl font-bold text-gray-900 mb-2">No orders yet</p>
                    <p>When you place an order, you can track it here.</p>
                  </div>
                ) : (
                  myOrders.map(order => (
                    <motion.div 
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden"
                    >
                      {/* Active Order Glowing Border */}
                      {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                        <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-3xl pointer-events-none animate-pulse"></div>
                      )}
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            Order #{order._id.slice(-6).toUpperCase()}
                            {order.status === 'Ready' && <span className="ml-2 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-black text-green-400">₹{order.totalAmount.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{order.paymentMethod} • {order.paymentStatus}</span>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h4 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">Items Ordered</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="bg-gray-100 p-3 rounded-xl flex justify-between">
                              <span className="font-bold text-gray-800">{item.quantity}x {item.name}</span>
                              <span className="text-gray-600">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Tracker */}
                      <div className="bg-white/60 rounded-2xl p-6 border border-gray-100 relative">
                        <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-100 -translate-y-1/2 z-0 hidden sm:block">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-1000"
                            style={{
                              width: order.status === 'Completed' ? '100%' : order.status === 'Ready' ? '66.66%' : order.status === 'Preparing' ? '33.33%' : '0%'
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between relative z-10">
                          {['Pending', 'Preparing', 'Ready', 'Completed'].map((step, idx) => {
                            const statuses = ['Pending', 'Preparing', 'Ready', 'Completed'];
                            const currentIndex = statuses.indexOf(order.status);
                            const isCompleted = idx <= currentIndex;
                            const isCurrent = idx === currentIndex && order.status !== 'Completed';
                            
                            return (
                              <div key={step} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl
                                  ${isCurrent ? 'bg-cyan-500 text-gray-900 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : isCompleted ? 'bg-green-500 text-gray-900' : 'bg-gray-100 text-gray-500'}
                                `}>
                                  {isCompleted && !isCurrent ? <CheckCircle size={20} /> : <Clock size={20} />}
                                </div>
                                <div className="text-center">
                                  <span className={`block text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                                    {step}
                                  </span>
                                  {order.statusTimestamps && order.statusTimestamps[step.toLowerCase()] && (
                                    <span className="block text-[10px] text-gray-500 font-medium mt-1">
                                      {new Date(order.statusTimestamps[step.toLowerCase()]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {step !== 'Pending' && order.statusTimestamps.pending && (
                                        <span className="text-cyan-400/70 ml-1">
                                          ( +{Math.max(0, Math.floor((new Date(order.statusTimestamps[step.toLowerCase()]) - new Date(order.statusTimestamps.pending)) / 60000))}m )
                                        </span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 pb-4">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Our Menu</h1>
                <p className="text-gray-600 text-lg">Delicious food ready to be ordered by voice.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {menuItems.map(item => (
                  <div 
                    key={item._id} 
                    onClick={() => setSelectedItem(item)}
                    className="bg-white border border-gray-200 rounded-3xl overflow-hidden hover:bg-gray-100 transition-all hover:-translate-y-2 group cursor-pointer shadow-lg flex flex-col"
                  >
                    <div className="h-48 w-full relative overflow-hidden bg-white/60">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="text-gray-900/20" size={48} />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200">
                        <span className="text-green-400 font-bold">₹{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                        {item.category}
                      </span>
                      <h3 className="text-gray-900 text-lg font-bold mb-2 leading-tight">{item.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mt-auto">{item.description}</p>
                    </div>
                  </div>
                ))}
                {menuItems.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-500">
                    <Loader2 size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
                    <p>Loading the menu...</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT PANEL: LIVE CART */}
        <div className="w-full md:w-1/4 border-l border-gray-200 bg-white/40 backdrop-blur-sm p-6 h-full flex flex-col hidden md:flex shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
          <div className="border-b border-gray-200 pb-4 mb-6 mt-4">
             <h2 className="text-gray-900 text-xl font-bold flex items-center gap-2">
               <ShoppingCart className="text-cyan-400" size={20}/> Live Cart
             </h2>
          </div>
          
          {!liveCart || liveCart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center">
              <ShoppingCart size={64} className="opacity-10 mb-4" />
              <p className="font-medium text-gray-600">Your cart is empty.</p>
              <p className="text-sm mt-2 opacity-75">Tell the AI what you'd like to order, and watch it appear here!</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar pb-6">
                <AnimatePresence>
                  {liveCart.items.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-lg relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <h4 className="text-gray-900 font-bold mb-1 leading-tight pr-4">{item.name}</h4>
                          <span className="text-gray-600 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-gray-900 font-bold">₹{item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="mt-auto pt-6 border-t border-gray-200 bg-white/60 -mx-6 px-6 -mb-6 pb-8 rounded-t-3xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium text-sm">Subtotal</span>
                  <span className="text-gray-900">₹{liveCart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-900 font-bold text-lg">Total</span>
                  <span className="text-3xl font-black text-green-400">₹{liveCart.totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleMakePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-gray-900 font-bold rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                  {isProcessingPayment ? "Processing..." : "Make Payment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-900 hover:bg-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-white">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Utensils className="text-gray-900/20" size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#111] hidden md:block" />
              </div>

              <div className="w-full md:w-1/2 p-8 flex flex-col">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  {selectedItem.category}
                </span>
                <h2 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{selectedItem.name}</h2>
                <div className="text-2xl font-black text-green-400 mb-6">₹{selectedItem.price.toFixed(2)}</div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-8">
                  {selectedItem.description}
                </p>

                {selectedItem.customizations && selectedItem.customizations.length > 0 && (
                  <div className="mt-auto">
                    <h4 className="text-gray-900 font-bold text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Info size={14} className="text-cyan-400"/> Ask AI to Customize
                    </h4>
                    <div className="flex flex-col gap-3">
                      {selectedItem.customizations.map((cust, i) => (
                        <div key={i} className="bg-white border border-gray-100 p-3 rounded-xl">
                          <span className="text-xs text-gray-600 font-bold block mb-1">{cust.name}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cust.options.map((opt, j) => (
                              <span key={j} className="text-[10px] bg-gray-100 text-gray-300 px-2 py-1 rounded-md">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
