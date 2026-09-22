import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

// Loads the public menu for the marketing pages.
export default function useMenu() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    apiService
      .getMenu()
      .then((data) => {
        if (cancelled) return;
        setItems(data.filter((i) => i.available !== false));
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, status };
}
