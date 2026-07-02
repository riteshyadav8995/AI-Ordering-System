import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, LogOut, Utensils, Plus, Edit2, Trash2, X, User as UserIcon } from 'lucide-react';
import { BACKEND_URL, apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const { logout, user } = useContext(AuthContext);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Mains', image: '' });

  useEffect(() => {
    // Fetch initial orders
    apiService.getOrders()
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));

    // Fetch initial menu
    apiService.getMenu()
      .then(data => setMenuItems(data))
      .catch(err => console.error("Error fetching menu:", err));

    // Setup Socket.io
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => newSocket.close();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiService.updateOrderStatus(id, status);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, description: item.description, price: item.price, category: item.category, image: item.image || '' });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', category: 'Mains', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updated = await apiService.updateMenuItem(editingItem._id, formData);
        setMenuItems(prev => prev.map(item => item._id === updated._id ? updated : item));
      } else {
        const created = await apiService.createMenuItem(formData);
        setMenuItems(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving menu item:", err);
      alert("Failed to save menu item");
    }
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await apiService.deleteMenuItem(id);
        setMenuItems(prev => prev.filter(item => item._id !== id));
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Failed to delete item");
      }
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      case 'Preparing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      case 'Ready': return 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]';
      case 'Completed': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return 'bg-white/5 border-white/10 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden text-white font-sans">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-20 bg-gradient-to-r from-blue-900 to-purple-900"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-20 bg-gradient-to-r from-gray-800 to-black"></div>
      </div>

      {/* TOP NAVBAR */}
      <nav className="w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="AuraVoice Logo" className="w-10 h-10 rounded-lg object-cover shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight leading-tight">
              AuraVoice
            </h1>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest leading-none mt-0.5">Admin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-sm font-medium text-gray-300 hidden md:block">System Live</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
            <UserIcon size={14} className="text-cyan-400" />
            <span className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</span>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
          >
            <LogOut size={14} /> 
            <span className="text-sm font-medium hidden sm:block">Log out</span>
          </button>
        </div>
      </nav>

      {/* HEADER SECTION */}
      <header className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 bg-black/20">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tight">
            <ChefHat className="text-cyan-400" size={36} />
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Manage your live orders and restaurant menu</p>
        </div>
        
        {/* TABS */}
        <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'orders' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Live Orders
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'menu' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Menu Manager
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Order History
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10 hide-scrollbar">
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {orders.filter(o => o.status !== 'Completed').map(order => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white/5 backdrop-blur-xl rounded-3xl border p-6 flex flex-col h-full transition-all ${getStatusStyle(order.status)}`}
                >
                  <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-black text-xl text-white">Order #{order._id.slice(-4).toUpperCase()}</h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-2">
                        <Clock size={12} className="text-cyan-400"/>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.status)} border-none bg-white/10`}>
                        {order.status}
                      </span>
                      {order.paymentMethod && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {order.paymentMethod} • {order.paymentStatus || 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow mb-6">
                    <ul className="space-y-4">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <div className="flex justify-between font-bold text-gray-200">
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.customizations.map((cust, i) => (
                                <span key={i} className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded uppercase tracking-wider">{cust}</span>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-cyan-400 mt-2 bg-cyan-400/10 p-1.5 rounded">Note: {item.notes}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-3">
                    {order.statusTimestamps && (
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold tracking-wider bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                        {order.statusTimestamps.pending && <div className="flex flex-col items-center"><span>Created</span><span className="text-cyan-400">{new Date(order.statusTimestamps.pending).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
                        {order.statusTimestamps.preparing && <div className="flex flex-col items-center"><span>Prep</span><span className="text-cyan-400">{new Date(order.statusTimestamps.preparing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
                        {order.statusTimestamps.ready && <div className="flex flex-col items-center"><span>Ready</span><span className="text-cyan-400">{new Date(order.statusTimestamps.ready).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
                      </div>
                    )}
                    <div className="flex gap-3 w-full">
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => updateStatus(order._id, 'Preparing')}
                          className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all"
                        >
                          Start Preparing
                        </button>
                      )}
                    {order.status === 'Preparing' && (
                      <button 
                        onClick={() => updateStatus(order._id, 'Ready')}
                        className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button 
                        onClick={() => updateStatus(order._id, 'Completed')}
                        className="flex-1 bg-white/10 text-gray-300 border border-white/20 py-3 rounded-xl font-bold hover:bg-white hover:text-black transition-all"
                      >
                        Complete Order
                      </button>
                    )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {orders.filter(o => o.status !== 'Completed').length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-500">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                   <CheckCircle size={48} className="opacity-20" />
                </div>
                <p className="text-2xl font-black text-white mb-2">No active orders</p>
                <p className="text-gray-400">Waiting for new incoming orders...</p>
              </div>
            )}
          </div>
        )}

        {/* MENU MANAGER TAB */}
        {activeTab === 'menu' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Utensils size={24} className="text-purple-400"/> Product Catalog
              </h2>
              <button 
                onClick={() => openModal()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                <Plus size={20} /> Add Product
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-gray-400 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-5 border-b border-white/10">Product Name</th>
                    <th className="px-8 py-5 border-b border-white/10">Category</th>
                    <th className="px-8 py-5 border-b border-white/10">Price</th>
                    <th className="px-8 py-5 border-b border-white/10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {menuItems.map(item => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-white text-lg mb-1">{item.name}</div>
                        <div className="text-sm text-gray-400 truncate max-w-sm">{item.description}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-white/10 text-cyan-400 rounded-md text-xs font-bold uppercase tracking-wider border border-white/5">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-green-400 text-lg">₹{Number(item.price).toFixed(2)}</td>
                      <td className="px-8 py-5 flex justify-end gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-2.5 text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 hover:text-blue-300 rounded-xl transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteMenu(item._id)} className="p-2.5 text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300 rounded-xl transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {menuItems.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-gray-500 font-medium">
                        No menu items found. Click "Add Product" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDER HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Clock size={24} className="text-orange-400"/> Order History
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 text-gray-400 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-5 border-b border-white/10">Order ID</th>
                    <th className="px-8 py-5 border-b border-white/10">Date & Time</th>
                    <th className="px-8 py-5 border-b border-white/10">Customer</th>
                    <th className="px-8 py-5 border-b border-white/10">Total</th>
                    <th className="px-8 py-5 border-b border-white/10">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5 font-bold text-white">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-5 text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-5 text-white">{order.customerName}</td>
                      <td className="px-8 py-5 font-black text-green-400">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.status)} border-none bg-white/10`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-500 font-medium">
                        No orders found in history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-2xl font-black text-white">{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveMenu} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                  <textarea 
                    required 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white font-bold transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white transition-all appearance-none"
                    >
                      <option value="Starters">Starters</option>
                      <option value="Mains">Mains</option>
                      <option value="Sides">Sides</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-4 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-4 rounded-xl border border-white/10 bg-white/5 font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                  >
                    {editingItem ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
