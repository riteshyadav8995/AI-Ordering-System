import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export function SectionTitle({ title, subtitle, className = '' }) {
  return (
    <div className={`max-w-xl mb-10 ${className}`}>
      <h2 className="font-display text-[28px] md:text-[34px] font-semibold text-ink leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-[15px] text-black leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <section className="px-5 pt-16 pb-10 border-b border-line">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-[36px] md:text-[46px] font-semibold text-ink leading-[1.1]">{title}</h1>
        {subtitle && <p className="mt-3 text-base text-black max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}

export function FaqList({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="border-t border-line">
      {items.map((f, i) => (
        <div key={f.q} className="border-b border-line">
          <button
            className="w-full flex items-center justify-between gap-6 py-5 text-left"
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
          >
            <span className="text-[15px] font-medium text-ink">{f.q}</span>
            {open === i ? <Minus size={16} className="shrink-0 text-black" /> : <Plus size={16} className="shrink-0 text-black" />}
          </button>
          {open === i && <p className="pb-5 pr-10 text-sm text-black leading-relaxed">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export function MenuCard({ item }) {
  return (
    <div className="group">
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-line">
        {item.image && (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium text-ink">{item.name}</h3>
        <span className="text-[15px] text-ink tabular-nums">₹{item.price}</span>
      </div>
      {item.description && <p className="mt-1 text-[13px] text-black leading-relaxed line-clamp-2">{item.description}</p>}
    </div>
  );
}
