import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChefHat, LogOut, Utensils, Plus, Edit2, Trash2, X, User as UserIcon, MessageCircle, Star } from 'lucide-react';
import { BACKEND_URL, apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'history' | 'analytics' | 'feedbacks'
  const { logout, user } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Mains', image: '' });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  const [liveOrderDetails, setLiveOrderDetails] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Extract unique categories from menuItems or use defaults
  const categories = Array.from(new Set([
    'Starters', 'Mains', 'Sides', 'Beverages', 'Desserts',
    ...menuItems.map(item => item.category)
  ]));

  useEffect(() => {
    fetchData();

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

  const fetchData = async () => {
    try {
      const [ordersData, menuData, analyticsData, feedbackData] = await Promise.all([
        apiService.getOrders(),
        apiService.getMenu(),
        apiService.getAnalytics(),
        apiService.getFeedbacks().catch(() => [])
      ]);
      setOrders(ordersData);
      setMenuItems(menuData);
      setAnalytics(analyticsData);
      setFeedbacks(feedbackData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

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
          <button 
            onClick={() => setActiveTab('feedbacks')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'feedbacks' ? 'bg-cyan-500 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Feedbacks
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <Utensils size={24} className="text-cyan-500"/> Live Orders
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-5 border-b border-gray-100">Customer Name</th>
                    <th className="px-8 py-5 border-b border-gray-100">Order ID</th>
                    <th className="px-8 py-5 border-b border-gray-100">Prepare</th>
                    <th className="px-8 py-5 border-b border-gray-100">Ready</th>
                    <th className="px-8 py-5 border-b border-gray-100">Delivered</th>
                    <th className="px-8 py-5 border-b border-gray-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {orders.filter(o => o.status !== 'Completed').map(order => (
                      <motion.tr 
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-8 py-5 font-bold text-gray-900">
                          {order.customerName || 'Guest'}
                        </td>
                        <td className="px-8 py-5 font-bold text-gray-600">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-8 py-5">
                          <select 
                            className={`px-4 py-2 rounded-xl font-bold text-sm outline-none border ${order.status === 'Pending' ? 'bg-white border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-200 text-blue-600'}`}
                            value={order.status !== 'Pending' ? 'Yes' : 'No'}
                            onChange={(e) => { if(e.target.value === 'Yes') updateStatus(order._id, 'Preparing') }}
                            disabled={order.status !== 'Pending'}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </td>
                        <td className="px-8 py-5">
                          <select 
                            className={`px-4 py-2 rounded-xl font-bold text-sm outline-none border ${order.status === 'Ready' || order.status === 'Completed' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-500'}`}
                            value={order.status === 'Ready' || order.status === 'Completed' ? 'Yes' : 'No'}
                            onChange={(e) => { if(e.target.value === 'Yes') updateStatus(order._id, 'Ready') }}
                            disabled={order.status === 'Ready' || order.status === 'Pending'}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </td>
                        <td className="px-8 py-5">
                          <select 
                            className={`px-4 py-2 rounded-xl font-bold text-sm outline-none border ${order.status === 'Completed' ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-white border-gray-200 text-gray-500'}`}
                            value={order.status === 'Completed' ? 'Yes' : 'No'}
                            onChange={(e) => { if(e.target.value === 'Yes') updateStatus(order._id, 'Completed') }}
                            disabled={order.status !== 'Ready'}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setLiveOrderDetails(order)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {orders.filter(o => o.status !== 'Completed').length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-8 py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="opacity-20" />
                          </div>
                          <p className="text-xl font-black text-gray-900">No active orders</p>
                          <p className="text-sm">Waiting for new incoming orders...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

        {/* FEEDBACKS TAB */}
        {activeTab === 'feedbacks' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                <MessageCircle size={24} className="text-cyan-500"/> Customer Feedbacks
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-8 py-5 border-b border-gray-100">Date</th>
                    <th className="px-8 py-5 border-b border-gray-100">Customer</th>
                    <th className="px-8 py-5 border-b border-gray-100">Rating</th>
                    <th className="px-8 py-5 border-b border-gray-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {feedbacks.map(fb => (
                    <tr key={fb._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-5 text-gray-500 text-sm">{new Date(fb.createdAt).toLocaleString()}</td>
                      <td className="px-8 py-5 font-bold text-gray-900">{fb.customerName}</td>
                      <td className="px-8 py-5">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < fb.rating ? 'fill-yellow-400' : 'text-gray-200 fill-transparent'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => setSelectedFeedback(fb)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                        >
                          Read Feedback
                        </button>
                      </td>
                    </tr>
                  ))}
                  {feedbacks.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center text-gray-500 font-medium">
                        No feedback received yet.
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

      {/* LIVE ORDER DETAILS MODAL */}
      <AnimatePresence>
        {liveOrderDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setLiveOrderDetails(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-2xl font-black text-gray-900 mb-6">Live Order #{liveOrderDetails._id.slice(-6).toUpperCase()}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Customer</span>
                  <span className="font-bold text-gray-900">{liveOrderDetails.customerName || 'Guest'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Time</span>
                  <span className="font-bold text-gray-900">{new Date(liveOrderDetails.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Payment</span>
                  <span className="font-bold text-gray-900">{liveOrderDetails.paymentMethod ? liveOrderDetails.paymentMethod.toUpperCase() : 'N/A'} - {liveOrderDetails.paymentStatus}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-xs block mb-1">Channel</span>
                  <span className="font-bold text-gray-900 capitalize">{liveOrderDetails.channel || 'web'}</span>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Order Items</h3>
              <ul className="space-y-3 mb-6">
                {liveOrderDetails.items.map((item, idx) => (
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
                <span className="font-bold uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-green-400">₹{liveOrderDetails.totalAmount.toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEEDBACK DETAILS MODAL */}
      <AnimatePresence>
        {selectedFeedback && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">{selectedFeedback.customerName}</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="flex justify-center text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={32} className={i < selectedFeedback.rating ? 'fill-yellow-400' : 'text-gray-200 fill-transparent'} />
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Customer Comments</h3>
                <p className="text-gray-900 font-medium italic">"{selectedFeedback.comments || 'No comments provided.'}"</p>
              </div>
              
              {selectedFeedback.orderId && (
                <div className="mt-6 text-center">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Total: <span className="text-gray-900">₹{selectedFeedback.orderId.totalAmount}</span></p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
