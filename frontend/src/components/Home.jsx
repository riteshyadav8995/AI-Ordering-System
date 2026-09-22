import { Link } from 'react-router-dom';
import { Mic, MessageSquare, ArrowRight, QrCode, ListChecks, Star } from 'lucide-react';
import SiteLayout from './site/SiteLayout';
import { SectionTitle, FaqList, MenuCard } from './site/Blocks';
import useMenu from '../hooks/useMenu';
import useOrderLink from '../hooks/useOrderLink';
import { phrases, faqs } from '../data/siteContent';

const steps = [
  { title: 'Sign in', desc: 'Create an account with your email. It takes a minute.' },
  { title: 'Say or type your order', desc: 'Talk to the assistant like you would at the counter, or type in the chat.' },
  { title: 'Check your cart', desc: 'Items, sizes and extras show up in your cart as you go. Change anything before you confirm.' },
  { title: 'Pay and track', desc: 'Scan the UPI QR to pay, then follow your order until it reaches you.' },
];

function OrderPreview() {
  return (
    <div className="relative">
      <img src="/images/farmhouse.png" alt="Farmhouse pizza" className="w-full aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] object-cover rounded-xl" />
      <div className="absolute left-4 right-4 bottom-4 sm:left-auto sm:w-80 bg-white rounded-lg border border-line p-4 text-sm">
        <div className="flex items-center gap-2 text-xs text-black">
          <Mic size={13} className="text-accent" /> You said
        </div>
        <p className="mt-1.5 text-ink">"One large farmhouse pizza, cheese burst, and a coke."</p>
        <div className="mt-3 pt-3 border-t border-line space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span>1 × Farmhouse Pizza · L, Cheese burst</span><span className="tabular-nums">₹279</span></div>
          <div className="flex justify-between"><span>1 × Coca Cola</span><span className="tabular-nums">₹59</span></div>
          <div className="flex justify-between pt-1.5 font-medium text-ink"><span>Total</span><span className="tabular-nums">₹338</span></div>
        </div>
      </div>
    </div>
  );
}

function MenuPreview() {
  const { items, status } = useMenu();

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
        {[...Array(3)].map((_, i) => <div key={i} className="aspect-[4/3] rounded-lg bg-line animate-pulse" />)}
      </div>
    );
  }
  if (status === 'error' || items.length === 0) {
    return <p className="text-sm text-black">The menu couldn't be loaded right now. Please try again in a moment.</p>;
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
      {items.slice(0, 6).map((item) => <MenuCard key={item._id} item={item} />)}
    </div>
  );
}

export default function Home() {
  const order = useOrderLink();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="px-5 pt-12 md:pt-20 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <h1 className="font-display text-[40px] sm:text-[50px] lg:text-[58px] font-semibold text-ink leading-[1.05]">
              Just say what<br />you're craving.
            </h1>
            <p className="mt-5 text-[17px] text-black leading-relaxed max-w-md">
              Order from Neon Bite by talking or typing. The assistant knows our whole menu and fills your cart as you speak.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={order.to} className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-white text-[15px] font-medium hover:bg-accent-dark transition-colors">
                {order.label} <ArrowRight size={16} />
              </Link>
              <Link to="/menu" className="text-[15px] font-medium text-ink underline underline-offset-4 decoration-line hover:decoration-ink">
                See the menu
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-sm text-black">
              <span className="flex items-center gap-2"><Mic size={16} className="text-accent" /> Voice ordering</span>
              <span className="flex items-center gap-2"><MessageSquare size={16} className="text-accent" /> Chat ordering</span>
            </div>
          </div>
          <OrderPreview />
        </div>
      </section>

      {/* Two ways to order */}
      <section className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <SectionTitle title="Two ways to order" subtitle="Use whichever suits the moment. Both fill the same cart." />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-line p-7">
              <Mic size={22} className="text-accent" />
              <h3 className="mt-4 text-lg font-medium text-ink">Talk</h3>
              <p className="mt-2 text-sm text-black leading-relaxed">
                Tap the mic and order out loud. Ask what's on the menu, pick sizes and extras, and hear the assistant confirm it back to you.
              </p>
            </div>
            <div className="rounded-xl border border-line p-7">
              <MessageSquare size={22} className="text-accent" />
              <h3 className="mt-4 text-lg font-medium text-ink">Type</h3>
              <p className="mt-2 text-sm text-black leading-relaxed">
                In a meeting or on a noisy street? Switch to chat and type your order in your own words. The assistant replies right there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Things you can say */}
      <section className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-12">
          <SectionTitle
            className="mb-0"
            title="No buttons to hunt for"
            subtitle="Say it the way you'd say it to a person at the counter. A few things people ask:"
          />
          <ul className="grid sm:grid-cols-2 gap-3">
            {phrases.map((p) => (
              <li key={p} className="rounded-lg border border-line px-4 py-3.5 text-[15px] text-ink">
                "{p}"
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <SectionTitle title="How it works" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-3xl font-semibold text-accent">{i + 1}</span>
                <h3 className="mt-3 text-base font-medium text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-black leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Menu preview */}
      <section className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <SectionTitle className="mb-0" title="From our kitchen" subtitle="A few favourites. Ask the assistant about any of them." />
            <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark">
              Full menu <ArrowRight size={15} />
            </Link>
          </div>
          <MenuPreview />
        </div>
      </section>

      {/* After you order */}
      <section className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <SectionTitle title="After you order" />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: QrCode, title: 'Pay with UPI', desc: 'A QR code appears once you confirm. Scan it with GPay, PhonePe, Paytm or any UPI app.' },
              { icon: ListChecks, title: 'Follow your order', desc: 'See when the kitchen starts on it and when it is out for delivery, under "My orders".' },
              { icon: Star, title: 'Tell us how it was', desc: 'We send a short feedback link after delivery. We read every one.' },
            ].map((b) => (
              <div key={b.title} className="flex gap-4">
                <b.icon size={22} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-medium text-ink">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-black leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.6fr] gap-12">
          <SectionTitle
            className="mb-0"
            title="Questions"
            subtitle={<>Something else? <Link to="/contact" className="text-accent underline underline-offset-4">Write to us</Link>.</>}
          />
          <FaqList items={faqs} />
        </div>
      </section>

      {/* Closing */}
      <section className="px-5 py-20 border-t border-line">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="font-display text-[30px] md:text-[38px] font-semibold text-ink leading-tight">Hungry? Just ask.</h2>
          <Link to={order.to} className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-white text-[15px] font-medium hover:bg-accent-dark transition-colors">
            {order.label} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
