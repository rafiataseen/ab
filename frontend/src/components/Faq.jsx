import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes — 100% free, no hidden charges and no credit card needed. Just reserve your seat and show up live.",
  },
  {
    q: "Do I need coding experience?",
    a: "No prior AI experience is needed. If you know basic programming concepts like loops and functions in any language, you will follow along comfortably. Beginners are welcome.",
  },
  {
    q: "Will there be a recording?",
    a: "The session is best experienced live, where you can ask questions. Replay details will be shared with registered participants in the WhatsApp community after the workshop.",
  },
  {
    q: "What do I need to join?",
    a: "Just a laptop or phone with a modern browser and a stable internet connection. Everything we use runs online — no heavy installations.",
  },
  {
    q: "Can I invite friends?",
    a: "Yes! After registering you will get a personal referral link. Share it with your batchmates so you can all build together.",
  },
];

export default function Faq() {
  return (
    <section
      data-testid="faq-section"
      className="border-t border-white/5 bg-[#0A1120] px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            FAQ
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Still thinking it over?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <Accordion
            type="single"
            collapsible
            data-testid="faq-accordion"
            className="space-y-3"
          >
            {FAQS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                data-testid={`faq-item-${i}`}
                className="rounded-2xl border border-white/10 bg-[#0C1427] px-5 transition-colors data-[state=open]:border-emerald-500/40 sm:px-6"
              >
                <AccordionTrigger className="py-5 text-left text-sm font-semibold text-slate-100 hover:no-underline sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-400">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
