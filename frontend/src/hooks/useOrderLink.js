import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Where the main "order" button should send the current visitor.
export default function useOrderLink() {
  const { user } = useContext(AuthContext);
  if (!user) return { to: '/register', label: 'Start ordering' };
  if (user.role === 'admin') return { to: '/admin', label: 'Dashboard' };
  return { to: '/order', label: 'Order now' };
}
