import { Link } from 'react-router-dom';
import SiteLayout from './site/SiteLayout';
import { PageHeader } from './site/Blocks';
import useOrderLink from '../hooks/useOrderLink';

export default function About() {
  const order = useOrderLink();

  return (
    <SiteLayout>
      <PageHeader title="About Neon Bite" />

      <section className="px-5 py-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <img src="/images/paneer_tikka.png" alt="Paneer tikka pizza" className="w-full aspect-[4/3] object-cover rounded-xl" />
          <div className="text-[16px] text-black leading-relaxed space-y-5 max-w-lg">
            <p>
              Neon Bite is a small kitchen in Hyderabad making pizzas, burgers, salads and sides.
            </p>
            <p>
              We wanted ordering to feel like talking to someone at the counter, not like filling in a form. So we built an assistant that knows our menu, and you can simply tell it what you want.
            </p>
            <p>
              You can speak to it or type to it. It asks about size, crust or spice level when it needs to, reads your order back, and sends it to our kitchen once you've paid.
            </p>
            <p>
              If something isn't right, tell us. There's a feedback link with every delivered order, and we read all of them.
            </p>
            <div className="pt-3 flex flex-wrap gap-4 items-center">
              <Link to={order.to} className="px-5 py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors">
                {order.label}
              </Link>
              <Link to="/contact" className="text-sm font-medium text-ink underline underline-offset-4 decoration-line hover:decoration-ink">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
