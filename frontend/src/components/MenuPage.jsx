import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';
import SiteLayout from './site/SiteLayout';
import { PageHeader, MenuCard } from './site/Blocks';
import useMenu from '../hooks/useMenu';
import useOrderLink from '../hooks/useOrderLink';

export default function MenuPage() {
  const { items, status } = useMenu();
  const [category, setCategory] = useState('All');
  const order = useOrderLink();

  const categories = ['All', ...new Set(items.map((i) => i.category))];
  const shown = category === 'All' ? items : items.filter((i) => i.category === category);

  return (
    <SiteLayout>
      <PageHeader title="Menu" subtitle="Everything below can be ordered by voice or chat. Sizes, crusts and extras can be picked while you order." />

      <section className="px-5 py-12">
        <div className="max-w-6xl mx-auto">
          {status === 'ready' && categories.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    c === category ? 'border-ink bg-ink text-cream' : 'border-line text-black hover:border-neutral-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {status === 'loading' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-line animate-pulse" />)}
            </div>
          )}

          {status === 'error' && (
            <p className="text-sm text-black">The menu couldn't be loaded right now. Please try again in a moment.</p>
          )}

          {status === 'ready' && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {shown.map((item) => (
                <div key={item._id}>
                  <MenuCard item={item} />
                  {item.customizations?.length > 0 && (
                    <p className="mt-2 text-xs text-black">
                      Options: {item.customizations.map((c) => c.name).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 py-14 border-t border-line">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <p className="flex items-center gap-3 text-[15px] text-ink">
            <Mic size={18} className="text-accent" /> Found something you like? Just tell the assistant.
          </p>
          <Link to={order.to} className="self-start sm:self-auto px-5 py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors">
            {order.label}
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
