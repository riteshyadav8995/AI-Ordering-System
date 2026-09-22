import { useState } from 'react';
import SiteLayout from './site/SiteLayout';
import { PageHeader } from './site/Blocks';

const inputClass =
  'mt-1.5 w-full bg-transparent border border-line text-ink text-[15px] px-3.5 py-2.5 rounded-md outline-none focus:border-ink transition-colors placeholder-neutral-400';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', orderId: '', message: '' });
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // There is no contact endpoint on the backend yet, so this opens the user's mail client with the message filled in.
  const handleSubmit = (e) => {
    e.preventDefault();
    const body = `${form.message}\n\nName: ${form.name}\nEmail: ${form.email}${form.orderId ? `\nOrder ID: ${form.orderId}` : ''}`;
    window.location.href = `mailto:support@neonbite.com?subject=${encodeURIComponent(`Message from ${form.name}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <SiteLayout>
      <PageHeader title="Contact" subtitle="A question about an order, or just want to say something? We usually reply the same day." />

      <section className="px-5 py-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.6fr] gap-12">
          <dl className="space-y-6 text-[15px]">
            <div>
              <dt className="text-sm text-black">Email</dt>
              <dd className="mt-1 text-ink">support@neonbite.com</dd>
            </div>
            <div>
              <dt className="text-sm text-black">Phone</dt>
              <dd className="mt-1 text-ink">+91 95138 86363</dd>
            </div>
            <div>
              <dt className="text-sm text-black">Kitchen</dt>
              <dd className="mt-1 text-ink">Hyderabad, Telangana</dd>
            </div>
          </dl>

          {sent ? (
            <div className="border border-line rounded-xl p-8">
              <h2 className="font-display text-2xl font-semibold text-ink">Thanks, {form.name.split(' ')[0]}.</h2>
              <p className="mt-2 text-[15px] text-black">Your email app should have opened with your message. Send it from there and we'll get back to you.</p>
              <button onClick={() => setSent(false)} className="mt-5 text-sm font-medium text-accent">Edit message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-5">
              <label className="text-sm text-black">Name
                <input required value={form.name} onChange={update('name')} className={inputClass} />
              </label>
              <label className="text-sm text-black">Email
                <input required type="email" value={form.email} onChange={update('email')} className={inputClass} />
              </label>
              <label className="sm:col-span-2 text-sm text-black">Order ID <span className="text-neutral-400">(optional)</span>
                <input value={form.orderId} onChange={update('orderId')} className={inputClass} />
              </label>
              <label className="sm:col-span-2 text-sm text-black">Message
                <textarea required rows={5} value={form.message} onChange={update('message')} className={`${inputClass} resize-none`} />
              </label>
              <button type="submit" className="sm:col-span-2 justify-self-start px-6 py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors">
                Send message
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
