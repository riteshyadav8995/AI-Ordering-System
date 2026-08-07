import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, LogOut, Utensils, Plus, Edit2, Trash2, X, User as UserIcon } from 'lucide-react';
import { BACKEND_URL, apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'history' | 'analytics'
  const { logout, user } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Mains', image: '' });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);

  // Extract unique categories from menuItems or use defaults
  const categories = Array.from(new Set([
    'Starters', 'Mains', 'Sides', 'Beverages', 'Desserts',
    ...menuItems.map(item => item.category)
  ]));

  useEffect(() => {
    // Fetch initial orders
    apiService.getOrders()
      .then(data => setOrders(data))
      .catch(err => console.error("Error fetching orders:", err));

    // Fetch initial menu
    apiService.getMenu()
      .then(data => setMenuItems(data))
      .catch(err => console.error("Error fetching menu:", err));

    // Fetch initial analytics
    apiService.getAnalytics()
      .then(data => setAnalytics(data))
      .catch(err => console.error("Error fetching analytics:", err));

    // Setup Socket.io
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    newSocket.on('handoffRequested', (data) => {
      alert(`⚠️ URGENT: Human Handoff Requested!\nReason: ${data.reason}`);
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

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || ''
    });
    setIsCustomCategory(false);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '', category: 'Starters', image: '' });
    setIsCustomCategory(false);
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
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Preparing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready': return 'bg-green-50 text-green-700 border-green-200';
      case 'Completed': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-white border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-gray-900 font-sans">
      

      {/* TOP NAVBAR */}
      <nav className="w-full z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Neon Bite Logo" className="w-10 h-10 rounded-lg object-cover shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight leading-tight">
              Neon Bite
            </h1>
            <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest leading-none mt-0.5">Admin Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-sm font-medium text-gray-600 hidden md:block">System Live</span>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full backdrop-blur-md">
            <UserIcon size={14} className="text-cyan-400" />
            <span className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-gray-600 hover:text-red-400 transition-colors bg-white hover:bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200 backdrop-blur-md"
          >
            <LogOut size={14} /> 
            <span className="text-sm font-medium hidden sm:block">Log out</span>
          </button>
        </div>
      </nav>

      {/* HEADER SECTION */}
      <header className="relative z-10 px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 bg-white">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
            <ChefHat className="text-cyan-400" size={36} />
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your live orders and restaurant menu</p>
        </div>
        
        {/* TABS */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'orders' ? 'bg-cyan-500 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Live Orders
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'menu' ? 'bg-purple-500 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Menu Manager
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Order History
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'analytics' ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Analytics
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        
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
                  className={`bg-white rounded-3xl border p-6 flex flex-col h-full shadow-sm transition-all hover:shadow-md ${getStatusStyle(order.status)}`}
                >
                  <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                    <div>
                      <h3 className="font-black text-xl text-gray-900">Order #{order._id.slice(-4).toUpperCase()}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
                        <Clock size={12} className="text-cyan-500"/>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                      {order.paymentMethod && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                          {order.paymentMethod} • {order.paymentStatus || 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow mb-6">
                    <ul className="space-y-4">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="flex justify-between font-bold text-gray-800">
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.customizations.map((cust, i) => (
                                <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">{cust}</span>
                              ))}
                            </div>
                          )}
                          {item.notes && (
                            <p className="text-xs text-cyan-700 mt-2 bg-cyan-50 p-1.5 rounded border border-cyan-100">Note: {item.notes}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col gap-3">
                    {order.statusTimestamps && (
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold tracking-wider bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        {order.statusTimestamps.pending && <div className="flex flex-col items-center"><span>Created</span><span className="text-cyan-600">{new Date(order.statusTimestamps.pending).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
                        {order.statusTimestamps.preparing && <div className="flex flex-col items-center"><span>Prep</span><span className="text-cyan-600">{new Date(order.statusTimestamps.preparing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
                        {order.statusTimestamps.ready && <div className="flex flex-col items-center"><span>Ready</span><span className="text-cyan-600">{new Date(order.statusTimestamps.ready).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
                      </div>
                    )}
                    <div className="flex gap-3 w-full">
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => updateStatus(order._id, 'Preparing')}
                          className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all"
                        >
                          Start Preparing
                        </button>
                      )}
                    {order.status === 'Preparing' && (
                      <button 
                        onClick={() => updateStatus(order._id, 'Ready')}
                        className="flex-1 bg-green-50 text-green-700 border border-green-200 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button 
                        onClick={() => updateStatus(order._id, 'Completed')}
                        className="flex-1 bg-gray-100 text-gray-700 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all"
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
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6">
                   <CheckCircle size={48} className="opacity-20" />
                </div>
                <p className="text-2xl font-black text-gray-900 mb-2">No active orders</p>
                <p className="text-gray-600">Waiting for new incoming orders...</p>
              </div>
            )}
          </div>
        )}

        {/* MENU MANAGER TAB */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <Utensils size={24} className="text-purple-500"/> Product Catalog
              </h2>
              <button 
                onClick={() => openNewModal()}
                className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus size={20} /> Add Product
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-5 border-b border-gray-100">Product Name</th>
                    <th className="px-8 py-5 border-b border-gray-100">Category</th>
                    <th className="px-8 py-5 border-b border-gray-100">Price</th>
                    <th className="px-8 py-5 border-b border-gray-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menuItems.map(item => (
                    <tr key={item._id} className="hover:bg-white transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900 text-lg mb-1">{item.name}</div>
                        <div className="text-sm text-gray-600 truncate max-w-sm">{item.description}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-green-600 text-lg">₹{Number(item.price).toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openModal(item)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteMenu(item._id)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
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
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <Clock size={24} className="text-orange-500"/> Order History
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-5 border-b border-gray-100">Order ID</th>
                    <th className="px-8 py-5 border-b border-gray-100">Date & Time</th>
                    <th className="px-8 py-5 border-b border-gray-100">Customer</th>
                    <th className="px-8 py-5 border-b border-gray-100">Total</th>
                    <th className="px-8 py-5 border-b border-gray-100">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-white transition-colors group">
                      <td 
                        className="px-8 py-5 font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer underline decoration-cyan-200 underline-offset-4"
                        onClick={() => setSelectedHistoryOrder(order)}
                      >
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-8 py-5 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-5 text-gray-900">{order.customerName}</td>
                      <td className="px-8 py-5 font-black text-green-600">₹{order.totalAmount.toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
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

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Revenue</div>
                <div className="text-2xl font-black text-gray-900">₹{analytics?.today?.revenue?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Orders</div>
                <div className="text-2xl font-black text-gray-900">{analytics?.today?.orders || 0}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Orders</div>
                <div className="text-2xl font-black text-gray-900">{analytics?.totalOrders || 0}</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-5 border border-red-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="text-red-600 text-xs font-bold uppercase tracking-wider">Missed Calls</div>
                <div className="text-2xl font-black text-red-600">{analytics?.missedCalls?.pendingRecovery || 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Channel Breakdown</h3>
                <div className="space-y-4">
                  {analytics?.channelBreakdown?.map(c => (
                    <div key={c._id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="font-bold text-gray-600 capitalize">{c._id}</span>
                      <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-lg font-black">{c.count}</span>
                    </div>
                  ))}
                  {!analytics?.channelBreakdown?.length && <p className="text-gray-500">No data available.</p>}
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Items</h3>
                <div className="space-y-4">
                  {analytics?.topItems?.map((item, idx) => (
                    <div key={item._id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div className="flex gap-3 items-center">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{idx + 1}</span>
                        <span className="font-bold text-gray-900">{item._id}</span>
                      </div>
                      <span className="text-gray-500">{item.totalQty} ordered</span>
                    </div>
                  ))}
                  {!analytics?.topItems?.length && <p className="text-gray-500">No data available.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-gray-200 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
            >
              <div className="p-8 border-b border-gray-200 flex justify-between items-center bg-white">
                <h3 className="text-2xl font-black text-gray-900">{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSaveMenu} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Description</label>
                  <textarea 
                    required 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-900 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-900 transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-900 font-bold transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Category</label>
                    {isCustomCategory ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          required 
                          placeholder="Type new category"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-900 transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setFormData({...formData, category: 'Starters'});
                          }}
                          className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <select 
                        value={formData.category}
                        onChange={e => {
                          if (e.target.value === '__NEW__') {
                            setIsCustomCategory(true);
                            setFormData({...formData, category: ''});
                          } else {
                            setFormData({...formData, category: e.target.value});
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-900 transition-all appearance-none"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__NEW__" className="font-bold text-cyan-600">+ Add New Category</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="pt-4 flex gap-4 mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-4 rounded-xl border border-gray-200 bg-white font-bold text-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-900 font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                  >
                    {editingItem ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HISTORY ORDER MODAL */}
      <AnimatePresence>
        {selectedHistoryOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedHistoryOrder(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-2xl font-black text-gray-900 mb-6">Order #{selectedHistoryOrder._id.slice(-6).toUpperCase()}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Customer</span>
                  <span className="font-bold text-gray-900">{selectedHistoryOrder.customerName || 'Guest'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Date & Time</span>
                  <span className="font-bold text-gray-900">{new Date(selectedHistoryOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Status</span>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(selectedHistoryOrder.status)}`}>
                    {selectedHistoryOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Payment</span>
                  <span className="font-bold text-gray-900">{selectedHistoryOrder.paymentMethod ? selectedHistoryOrder.paymentMethod.toUpperCase() : 'N/A'} - {selectedHistoryOrder.paymentStatus}</span>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Order Items</h3>
              <ul className="space-y-3 mb-6">
                {selectedHistoryOrder.items.map((item, idx) => (
                  <li key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start">
                    <div>
                      <span className="font-bold text-gray-800">{item.quantity}x {item.name}</span>
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.customizations.map((cust, i) => (
                            <span key={i} className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">{cust}</span>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <p className="text-xs text-cyan-700 mt-2 bg-cyan-50 p-1.5 rounded border border-cyan-100">Note: {item.notes}</p>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl">
                <span className="font-bold uppercase tracking-wider">Total Paid</span>
                <span className="text-2xl font-black text-green-400">₹{selectedHistoryOrder.totalAmount.toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
