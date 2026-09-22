import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { Mic, Loader2, Utensils, CheckCircle, Check, Volume2, QrCode, CreditCard, ShieldCheck, LogOut, ShoppingCart, Info, User as UserIcon, X, Clock, Send } from 'lucide-react';
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
  const [chatSessionId] = useState(() => `web_text_${Math.random().toString(36).substring(7)}`);
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

  const statuses = ['Pending', 'Preparing', 'Ready', 'Completed'];
  const hasCart = liveCart && liveCart.items.length > 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream text-black">

      {/* TOP NAVBAR */}
      <nav className="w-full z-50 border-b border-line bg-cream px-5 md:px-8 h-16 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-display text-xl font-semibold text-ink">Neon Bite</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-1 text-sm">
            {[['menu', 'New order'], ['history', 'My orders']].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === tab ? 'bg-ink text-cream' : 'text-black hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="hidden lg:flex items-center gap-2 text-sm text-black">
            <UserIcon size={15} /> {user?.firstName} {user?.lastName}
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-black hover:text-accent transition-colors">
            <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL: ASSISTANT */}
        <div className="w-full md:w-[300px] lg:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-line flex flex-col items-center py-8 px-5 md:h-full overflow-y-auto hide-scrollbar">
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            {isRecording && <span className="absolute inset-2 rounded-full bg-accent/15 animate-ping" />}
            <button
              onClick={isRecording ? stopSession : startSession}
              disabled={isConnecting}
              aria-label={isRecording ? 'Stop listening' : 'Start voice order'}
              className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-colors
                ${isRecording ? 'bg-accent text-white' : 'bg-cream border-2 border-ink text-ink hover:bg-accent-soft'}
                ${isConnecting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
              `}
            >
              {isRecording ? (
                <div className="flex items-center gap-1.5 h-10">
                  {[1.5, 1.2, 1.8, 1.4, 1.6].map((d, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: ['25%', '85%', '35%', '70%', '25%'] }}
                      transition={{ duration: d, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                      className="w-1.5 rounded-full bg-white"
                    />
                  ))}
                </div>
              ) : isConnecting ? (
                <Loader2 className="animate-spin" size={30} />
              ) : (
                <Mic size={34} />
              )}
            </button>
          </div>

          <p className="text-sm text-black mb-6">
            {isConnecting ? 'Connecting…' : isRecording ? 'Listening… tap to stop' : 'Tap to speak'}
          </p>

          <div className="w-full border border-line rounded-lg p-4 mb-3">
            <div className="flex items-center gap-2 mb-2.5 text-xs text-black">
              <Volume2 size={13} className="text-accent" /> Conversation
            </div>
            <div className="text-sm text-ink leading-relaxed min-h-[60px] max-h-[180px] overflow-y-auto hide-scrollbar">
              {chatHistory.length > 0 ? (
                <div className="space-y-2">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`px-3 py-1.5 rounded-lg inline-block ${msg.role === 'user' ? 'bg-ink text-cream' : 'bg-accent-soft text-ink'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-black">{transcript || 'Say something, or type your order below.'}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSendText} className="w-full flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your order…"
              className="flex-1 min-w-0 bg-transparent border border-line rounded-md px-3.5 py-2.5 text-sm text-ink placeholder-neutral-400 outline-none focus:border-ink transition-colors"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !textInput.trim()}
              aria-label="Send"
              className="bg-accent hover:bg-accent-dark text-white rounded-md px-3.5 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              {isSending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </form>

          <p className="mt-4 text-xs text-black leading-relaxed">
            The assistant knows everything on the menu. Ask for sizes, extras or changes in your own words.
          </p>
        </div>

        {/* CENTER PANEL: MENU / ORDERS / CHECKOUT */}
        <div className="flex-1 flex flex-col px-5 py-8 md:px-10 md:py-10 h-full overflow-y-auto hide-scrollbar">
          {paymentAction ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-md border border-line rounded-xl p-8 flex flex-col items-center">
                <div className="w-full flex justify-between items-baseline mb-6 pb-5 border-b border-line">
                  <h2 className="font-display text-2xl font-semibold text-ink flex items-center gap-2">
                    <ShieldCheck className="text-accent" size={22} /> Checkout
                  </h2>
                  <span className="text-2xl font-semibold text-ink tabular-nums">₹{paymentAction.paymentDetails.amount.toFixed(2)}</span>
                </div>

                {paymentAction.paymentDetails.method === 'upi' ? (
                  <div className="flex flex-col items-center bg-white border border-line p-6 rounded-lg mb-6">
                    <QrCode size={150} className="text-ink mb-3" />
                    <p className="text-sm font-medium text-ink">Scan to pay via UPI</p>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-3 border border-line p-3.5 rounded-md">
                      <CreditCard className="text-black" size={20} />
                      <input type="text" placeholder="Card Number" className="bg-transparent outline-none text-ink w-full" readOnly value="**** **** **** 4242" />
                    </div>
                    <div className="flex gap-3">
                      <input type="text" placeholder="MM/YY" className="bg-transparent border border-line p-3.5 rounded-md outline-none text-ink w-1/2" readOnly value="12/26" />
                      <input type="text" placeholder="CVV" className="bg-transparent border border-line p-3.5 rounded-md outline-none text-ink w-1/2" readOnly value="***" />
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePaymentSuccess}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? <Loader2 className="animate-spin" size={20} /> : 'Simulate payment success'}
                </button>
              </div>
            </div>
          ) : orderPlaced ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <CheckCircle size={52} className="text-accent mb-5" />
              <h2 className="font-display text-3xl font-semibold text-ink mb-3">Order confirmed</h2>
              <p className="text-black mb-8 max-w-sm leading-relaxed">Thanks! The kitchen has your order and is getting started on it.</p>
              <button
                onClick={() => { setOrderPlaced(false); stopSession(); setLiveCart(null); setActiveTab('history'); apiService.getMyOrders().then(setMyOrders); }}
                className="px-6 py-3 bg-ink text-cream font-medium rounded-md hover:bg-neutral-800 transition-colors"
              >
                Track order
              </button>
            </div>
          ) : activeTab === 'history' ? (
            <div className="w-full max-w-3xl mx-auto pb-16">
              <div className="mb-8 pb-5 border-b border-line">
                <h1 className="font-display text-[32px] font-semibold text-ink leading-tight">My orders</h1>
                <p className="mt-1.5 text-black">Follow your current order and see what you've had before.</p>
              </div>

              {myOrders.length === 0 ? (
                <div className="py-16 text-center border border-line rounded-xl">
                  <Clock size={36} className="mx-auto mb-3 text-neutral-300" />
                  <p className="font-medium text-ink mb-1">No orders yet</p>
                  <p className="text-sm text-black">Your orders will show up here once you place one.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {myOrders.map(order => {
                    const currentIndex = statuses.indexOf(order.status);
                    const isActive = order.status !== 'Completed' && order.status !== 'Cancelled';
                    return (
                      <div key={order._id} className={`border rounded-xl p-6 ${isActive ? 'border-accent/50' : 'border-line'}`}>
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-5 pb-5 border-b border-line">
                          <div>
                            <h3 className="font-medium text-ink flex items-center gap-2">
                              Order #{order._id.slice(-6).toUpperCase()}
                              {isActive && <span className="text-[11px] font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full">{order.status}</span>}
                            </h3>
                            <p className="text-sm text-black mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-lg font-semibold text-ink tabular-nums">₹{order.totalAmount.toFixed(2)}</span>
                            <span className="text-xs text-black uppercase">{order.paymentMethod} · {order.paymentStatus}</span>
                          </div>
                        </div>

                        <ul className="mb-6 space-y-1.5 text-sm">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span className="text-ink">{item.quantity} × {item.name}</span>
                              <span className="text-black tabular-nums">₹{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Status tracker */}
                        <div className="relative">
                          <div className="absolute top-[11px] left-3 right-3 h-0.5 bg-line">
                            <div
                              className="h-full bg-accent transition-all duration-700"
                              style={{ width: `${Math.max(0, currentIndex) / (statuses.length - 1) * 100}%` }}
                            />
                          </div>
                          <div className="relative flex justify-between">
                            {statuses.map((step, idx) => {
                              const done = idx <= currentIndex;
                              const ts = order.statusTimestamps?.[step.toLowerCase()];
                              return (
                                <div key={step} className={`flex flex-col gap-1.5 ${idx === 0 ? 'items-start' : idx === statuses.length - 1 ? 'items-end' : 'items-center'}`}>
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${done ? 'bg-accent text-white' : 'bg-cream border-2 border-line'}`}>
                                    {done && <Check size={13} />}
                                  </span>
                                  <span className={`text-xs ${done ? 'text-ink font-medium' : 'text-neutral-400'}`}>{step}</span>
                                  {ts && (
                                    <span className="text-[11px] text-black -mt-1">
                                      {new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {step !== 'Pending' && order.statusTimestamps.pending && (
                                        <> (+{Math.max(0, Math.floor((new Date(ts) - new Date(order.statusTimestamps.pending)) / 60000))}m)</>
                                      )}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display text-[32px] font-semibold text-ink leading-tight">Menu</h1>
                <p className="mt-1.5 text-black">Tap an item to see its options, then just ask for it.</p>
              </div>

              {menuItems.length === 0 ? (
                <div className="py-20 text-center text-black">
                  <Loader2 size={32} className="mx-auto mb-3 animate-spin text-neutral-400" />
                  <p className="text-sm">Loading the menu…</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8 pb-16">
                  {menuItems.map(item => (
                    <button key={item._id} onClick={() => setSelectedItem(item)} className="group text-left">
                      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-line">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Utensils className="text-neutral-400" size={36} /></div>
                        )}
                      </div>
                      <div className="mt-3 flex items-baseline justify-between gap-3">
                        <h3 className="text-[15px] font-medium text-ink">{item.name}</h3>
                        <span className="text-[15px] text-ink tabular-nums">₹{item.price}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-black">{item.category}</p>
                      {item.description && <p className="mt-1 text-[13px] text-black leading-relaxed line-clamp-2">{item.description}</p>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT PANEL: LIVE CART */}
        <div className="hidden md:flex w-[300px] lg:w-[320px] shrink-0 border-l border-line p-6 h-full flex-col">
          <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2 pb-4 mb-5 border-b border-line">
            <ShoppingCart className="text-accent" size={19} /> Your cart
          </h2>

          {!hasCart ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
              <ShoppingCart size={40} className="text-neutral-300 mb-3" />
              <p className="font-medium text-ink">Your cart is empty</p>
              <p className="text-sm text-black mt-1.5 leading-relaxed">Tell the assistant what you'd like and it will show up here.</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                <AnimatePresence>
                  {liveCart.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-between items-start gap-3 py-3 border-b border-line text-sm"
                    >
                      <div>
                        <div className="text-ink font-medium leading-snug">{item.name}</div>
                        <div className="text-xs text-black mt-0.5">Qty {item.quantity}</div>
                      </div>
                      <span className="text-ink tabular-nums">₹{item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-5 mt-4 border-t border-line">
                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-ink font-medium">Total</span>
                  <span className="text-2xl font-semibold text-ink tabular-nums">₹{liveCart.totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleMakePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-accent text-white font-medium rounded-md hover:bg-accent-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isProcessingPayment ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                  {isProcessingPayment ? 'Processing…' : 'Pay now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile cart bar */}
      {hasCart && !paymentAction && !orderPlaced && (
        <div className="md:hidden border-t border-line bg-cream px-5 py-3 flex items-center justify-between gap-4">
          <div className="text-sm">
            <div className="text-black">{liveCart.items.reduce((n, i) => n + i.quantity, 0)} items</div>
            <div className="font-semibold text-ink tabular-nums">₹{liveCart.totalAmount.toFixed(2)}</div>
          </div>
          <button
            onClick={handleMakePayment}
            disabled={isProcessingPayment}
            className="px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-md disabled:opacity-60"
          >
            {isProcessingPayment ? 'Processing…' : 'Pay now'}
          </button>
        </div>
      )}

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-cream rounded-xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-cream text-ink hover:bg-line transition-colors"
              >
                <X size={17} />
              </button>

              <div className="w-full md:w-1/2 h-56 md:h-auto bg-line shrink-0">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Utensils className="text-neutral-400" size={48} /></div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-7 flex flex-col overflow-y-auto">
                <span className="text-xs text-black mb-1">{selectedItem.category}</span>
                <h2 className="font-display text-2xl font-semibold text-ink leading-tight">{selectedItem.name}</h2>
                <div className="text-lg text-ink mt-1 mb-4 tabular-nums">₹{selectedItem.price.toFixed(2)}</div>
                {selectedItem.description && <p className="text-sm text-black leading-relaxed mb-6">{selectedItem.description}</p>}

                {selectedItem.customizations?.length > 0 && (
                  <div className="mt-auto">
                    <h4 className="text-sm font-medium text-ink mb-3 flex items-center gap-2">
                      <Info size={14} className="text-accent" /> Options you can ask for
                    </h4>
                    <div className="space-y-3">
                      {selectedItem.customizations.map((cust, i) => (
                        <div key={i}>
                          <span className="text-xs text-black block mb-1.5">{cust.name}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cust.options.map((opt, j) => (
                              <span key={j} className="text-xs border border-line text-black px-2 py-1 rounded">{opt}</span>
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
