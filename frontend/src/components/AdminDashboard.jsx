import { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, LogOut, Utensils, Plus, Edit2, Trash2, X, User as UserIcon, Star } from 'lucide-react';
import { BACKEND_URL, apiService } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';

const inputClass = 'w-full bg-transparent border border-line px-3.5 py-2.5 rounded-md outline-none focus:border-ink text-ink text-sm transition-colors';
const th = 'px-5 py-3 font-medium';
const td = 'px-5 py-4';

const Panel = ({ title, action, children }) => (
  <div className="border border-line rounded-xl overflow-hidden">
    <div className="px-5 py-4 border-b border-line flex justify-between items-center gap-4">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      {action}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const Stars = ({ rating, size = 15 }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} className={i < rating ? 'text-accent fill-accent' : 'text-line fill-transparent'} />
    ))}
  </div>
);

const Modal = ({ onClose, children, width = 'max-w-2xl' }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40" onClick={onClose}>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      onClick={(e) => e.stopPropagation()}
      className={`bg-cream rounded-xl p-7 w-full ${width} relative max-h-[90vh] overflow-y-auto`}
    >
      <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-black hover:bg-line hover:text-ink transition-colors">
        <X size={17} />
      </button>
      {children}
    </motion.div>
  </div>
);

const OrderDetails = ({ order, title, meta }) => (
  <>
    <h2 className="font-display text-2xl font-semibold text-ink mb-5 pr-8">{title}</h2>
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
      {meta.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-black mb-0.5">{label}</dt>
          <dd className="text-ink">{value}</dd>
        </div>
      ))}
    </dl>
    <ul className="border-t border-line mb-5">
      {order.items.map((item, idx) => (
        <li key={idx} className="py-3 border-b border-line flex justify-between items-start gap-4 text-sm">
          <div>
            <span className="text-ink">{item.quantity} × {item.name}</span>
            {item.customizations?.length > 0 && (
              <div className="text-xs text-black mt-0.5">{item.customizations.join(', ')}</div>
            )}
            {item.notes && <p className="text-xs text-accent-dark mt-1">Note: {item.notes}</p>}
          </div>
          <span className="text-ink tabular-nums">₹{(item.price * item.quantity).toFixed(2)}</span>
        </li>
      ))}
    </ul>
    <div className="flex justify-between items-baseline">
      <span className="font-medium text-ink">Total</span>
      <span className="text-2xl font-semibold text-ink tabular-nums">₹{order.totalAmount.toFixed(2)}</span>
    </div>
  </>
);


export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
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

  useEffect(() => {
    fetchData();

    // Setup Socket.io
    const newSocket = io(BACKEND_URL);

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
      case 'Pending': return 'text-black border-black';
      case 'Preparing': return 'bg-neutral-100 text-black border-neutral-300';
      case 'Ready': return 'bg-black text-white border-black';
      case 'Completed': return 'text-neutral-500 border-line';
      default: return 'text-ink border-line';
    }
  };

  const tabs = [
    ['orders', 'Live orders'],
    ['menu', 'Menu'],
    ['history', 'Order history'],
    ['analytics', 'Analytics'],
    ['feedbacks', 'Feedback'],
  ];

  // The one action a kitchen takes next for each status.
  const nextStep = {
    Pending: { label: 'Start preparing', status: 'Preparing' },
    Preparing: { label: 'Mark ready', status: 'Ready' },
    Ready: { label: 'Mark delivered', status: 'Completed' },
  };

  const liveOrders = orders.filter(o => o.status !== 'Completed');
  const avgRating = feedbacks.length ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '–';

  return (
    <div className="min-h-screen bg-cream flex flex-col text-black">

      {/* TOP NAVBAR */}
      <nav className="w-full border-b border-line px-5 md:px-8 h-16 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-display text-xl font-semibold text-ink">Neon Bite</span>
          <span className="hidden sm:inline text-xs text-black border border-line rounded px-1.5 py-0.5">Admin</span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <span className="flex items-center gap-2 text-black">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span className="hidden md:inline">Receiving orders</span>
          </span>
          <span className="hidden md:flex items-center gap-2 text-black">
            <UserIcon size={15} /> {user?.firstName} {user?.lastName}
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 text-black hover:text-accent transition-colors">
            <LogOut size={15} /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>

      {/* HEADER + TABS */}
      <header className="px-5 md:px-8 pt-8 border-b border-line">
        <h1 className="font-display text-[32px] font-semibold text-ink leading-tight">Kitchen</h1>
        <p className="text-black mt-1">Live orders, menu and customer feedback.</p>
        <div className="flex gap-6 mt-6 overflow-x-auto hide-scrollbar text-sm">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 -mb-px border-b-2 whitespace-nowrap transition-colors ${
                activeTab === key ? 'border-accent text-ink font-medium' : 'border-transparent text-black hover:text-ink'
              }`}
            >
              {label}
              {key === 'orders' && liveOrders.length > 0 && (
                <span className="ml-1.5 text-xs bg-accent text-white rounded-full px-1.5 py-0.5">{liveOrders.length}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-5 md:px-8 py-8">

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <Panel title="Live orders">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-black border-b border-line">
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Items</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Next step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <AnimatePresence>
                  {liveOrders.map(order => (
                    <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td className={td}>
                        <button onClick={() => setLiveOrderDetails(order)} className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                          #{order._id.slice(-6).toUpperCase()}
                        </button>
                        <div className="text-xs text-black mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className={`${td} text-ink`}>{order.customerName || 'Guest'}</td>
                      <td className={`${td} text-black max-w-xs`}>
                        <span className="line-clamp-2">{order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</span>
                      </td>
                      <td className={td}>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusStyle(order.status)}`}>{order.status}</span>
                      </td>
                      <td className={`${td} text-right`}>
                        {nextStep[order.status] && (
                          <button
                            onClick={() => updateStatus(order._id, nextStep[order.status].status)}
                            className="px-3.5 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-dark transition-colors whitespace-nowrap"
                          >
                            {nextStep[order.status].label}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {liveOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <CheckCircle size={30} className="mx-auto mb-3 text-neutral-300" />
                      <p className="font-medium text-ink">No active orders</p>
                      <p className="text-sm text-black mt-1">New orders will appear here as they come in.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Panel>
        )}

        {/* MENU MANAGER TAB */}
        {activeTab === 'menu' && (
          <Panel
            title="Menu"
            action={
              <button onClick={openNewModal} className="px-3.5 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors flex items-center gap-1.5">
                <Plus size={16} /> Add item
              </button>
            }
          >
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-black border-b border-line">
                <tr>
                  <th className={th}>Item</th>
                  <th className={th}>Category</th>
                  <th className={th}>Price</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {menuItems.map(item => (
                  <tr key={item._id}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-line overflow-hidden shrink-0">
                          {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Utensils size={18} className="m-auto mt-3 text-neutral-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink">{item.name}</div>
                          <div className="text-xs text-black truncate max-w-xs">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-black`}>{item.category}</td>
                    <td className={`${td} text-ink tabular-nums`}>₹{Number(item.price).toFixed(2)}</td>
                    <td className={td}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(item)} aria-label="Edit" className="p-2 text-black hover:text-ink hover:bg-line rounded-md transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMenu(item._id)} aria-label="Delete" className="p-2 text-black hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-16 text-center text-black">No menu items yet. Click "Add item" to create one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Panel>
        )}

        {/* ORDER HISTORY TAB */}
        {activeTab === 'history' && (
          <Panel title="Order history">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-black border-b border-line">
                <tr>
                  <th className={th}>Order</th>
                  <th className={th}>Date & time</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Total</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className={td}>
                      <button onClick={() => setSelectedHistoryOrder(order)} className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                        #{order._id.slice(-6).toUpperCase()}
                      </button>
                    </td>
                    <td className={`${td} text-black`}>{new Date(order.createdAt).toLocaleString()}</td>
                    <td className={`${td} text-ink`}>{order.customerName}</td>
                    <td className={`${td} text-ink tabular-nums`}>₹{order.totalAmount.toFixed(2)}</td>
                    <td className={td}>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusStyle(order.status)}`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center text-black">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Panel>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-line rounded-xl divide-x divide-y lg:divide-y-0 divide-line overflow-hidden">
              {[
                ["Today's revenue", `₹${analytics?.today?.revenue?.toFixed(2) || '0.00'}`],
                ["Today's orders", analytics?.today?.orders || 0],
                ['Total orders', analytics?.totalOrders || 0],
                ['Average rating', avgRating],
              ].map(([label, value]) => (
                <div key={label} className="p-5">
                  <div className="text-xs text-black">{label}</div>
                  <div className="mt-1.5 text-2xl font-semibold text-ink tabular-nums">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-line rounded-xl p-6">
                <h3 className="font-display text-lg font-semibold text-ink mb-4">Top selling items</h3>
                <ol className="divide-y divide-line">
                  {analytics?.topItems?.map((item, idx) => (
                    <li key={item._id} className="flex justify-between items-center py-3 text-sm">
                      <span className="flex gap-3 items-center">
                        <span className="w-5 text-neutral-400 tabular-nums">{idx + 1}</span>
                        <span className="text-ink">{item._id}</span>
                      </span>
                      <span className="text-black">{item.totalQty} ordered</span>
                    </li>
                  ))}
                </ol>
                {!analytics?.topItems?.length && <p className="text-sm text-black">No data yet.</p>}
              </div>

              <div className="border border-line rounded-xl p-6">
                <h3 className="font-display text-lg font-semibold text-ink mb-4">Orders by channel</h3>
                <ul className="divide-y divide-line">
                  {analytics?.channelBreakdown?.map(c => (
                    <li key={c._id} className="flex justify-between items-center py-3 text-sm">
                      <span className="text-ink capitalize">{c._id}</span>
                      <span className="text-black tabular-nums">{c.count}</span>
                    </li>
                  ))}
                </ul>
                {!analytics?.channelBreakdown?.length && <p className="text-sm text-black">No data yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACKS TAB */}
        {activeTab === 'feedbacks' && (
          <Panel title="Customer feedback">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-black border-b border-line">
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Rating</th>
                  <th className={th}>Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {feedbacks.map(fb => (
                  <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="cursor-pointer hover:bg-accent-soft/40 transition-colors">
                    <td className={`${td} text-black whitespace-nowrap`}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                    <td className={`${td} text-ink`}>{fb.customerName}</td>
                    <td className={td}><Stars rating={fb.rating} /></td>
                    <td className={`${td} text-black max-w-sm`}><span className="line-clamp-1">{fb.comments || '—'}</span></td>
                  </tr>
                ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-16 text-center text-black">No feedback yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Panel>
        )}

      </main>

      {/* ADD / EDIT MENU ITEM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)} width="max-w-lg">
            <h3 className="font-display text-2xl font-semibold text-ink mb-6">{editingItem ? 'Edit item' : 'Add item'}</h3>
            <form onSubmit={handleSaveMenu} className="space-y-4">
              <label className="block text-sm text-black">Name
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`${inputClass} mt-1.5`} />
              </label>
              <label className="block text-sm text-black">Description
                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClass} mt-1.5 resize-none`} />
              </label>
              <label className="block text-sm text-black">Image URL
                <input type="text" placeholder="/images/burger.png" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className={`${inputClass} mt-1.5`} />
              </label>
              <div className="flex gap-4">
                <label className="flex-1 block text-sm text-black">Price (₹)
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={`${inputClass} mt-1.5`} />
                </label>
                <div className="flex-1 text-sm text-black">
                  Category
                  {isCustomCategory ? (
                    <div className="flex gap-2 mt-1.5">
                      <input type="text" required placeholder="New category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass} />
                      <button type="button" onClick={() => { setIsCustomCategory(false); setFormData({...formData, category: 'Starters'}); }} aria-label="Cancel new category" className="px-2.5 text-black hover:text-ink">
                        <X size={16} />
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
                      className={`${inputClass} mt-1.5`}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      <option value="__NEW__">+ New category</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-md border border-line text-ink text-sm font-medium hover:border-ink transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors">
                  {editingItem ? 'Save changes' : 'Add item'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* HISTORY ORDER MODAL */}
      <AnimatePresence>
        {selectedHistoryOrder && (
          <Modal onClose={() => setSelectedHistoryOrder(null)}>
            <OrderDetails
              order={selectedHistoryOrder}
              title={`Order #${selectedHistoryOrder._id.slice(-6).toUpperCase()}`}
              meta={[
                ['Customer', selectedHistoryOrder.customerName || 'Guest'],
                ['Date & time', new Date(selectedHistoryOrder.createdAt).toLocaleString()],
                ['Status', selectedHistoryOrder.status],
                ['Payment', `${selectedHistoryOrder.paymentMethod ? selectedHistoryOrder.paymentMethod.toUpperCase() : 'N/A'} · ${selectedHistoryOrder.paymentStatus}`],
              ]}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* LIVE ORDER DETAILS MODAL */}
      <AnimatePresence>
        {liveOrderDetails && (
          <Modal onClose={() => setLiveOrderDetails(null)}>
            <OrderDetails
              order={liveOrderDetails}
              title={`Order #${liveOrderDetails._id.slice(-6).toUpperCase()}`}
              meta={[
                ['Customer', liveOrderDetails.customerName || 'Guest'],
                ['Time', new Date(liveOrderDetails.createdAt).toLocaleTimeString()],
                ['Payment', `${liveOrderDetails.paymentMethod ? liveOrderDetails.paymentMethod.toUpperCase() : 'N/A'} · ${liveOrderDetails.paymentStatus}`],
                ['Channel', <span key="c" className="capitalize">{liveOrderDetails.channel || 'web'}</span>],
              ]}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* FEEDBACK DETAILS MODAL */}
      <AnimatePresence>
        {selectedFeedback && (
          <Modal onClose={() => setSelectedFeedback(null)} width="max-w-md">
            <h2 className="font-display text-2xl font-semibold text-ink pr-8">{selectedFeedback.customerName}</h2>
            <p className="text-sm text-black mt-1">{new Date(selectedFeedback.createdAt).toLocaleString()}</p>
            <div className="my-5"><Stars rating={selectedFeedback.rating} size={22} /></div>
            <p className="text-ink leading-relaxed border-l-2 border-accent pl-4">
              {selectedFeedback.comments || 'No comments provided.'}
            </p>
            {selectedFeedback.orderId && (
              <p className="mt-6 text-sm text-black">Order total: <span className="text-ink">₹{selectedFeedback.orderId.totalAmount}</span></p>
            )}
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
}
