const ITEMS = [
  "IIT Bombay",
  "NIT Trichy",
  "VIT Vellore",
  "Anna University",
  "BITS Pilani",
  "SRM",
  "RVCE",
  "Manipal",
  "DTU",
  "JNTU Hyderabad",
  "PSG Tech",
  "Amrita",
  "IIIT Hyderabad",
  "NIT Warangal",
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      data-testid="campus-marquee"
      className="overflow-hidden border-y border-white/10 bg-[#0A1120] py-4"
      aria-label="Students from campuses across India are joining"
    >
      <div className="marquee-track flex w-max items-center">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center whitespace-nowrap text-sm font-medium text-slate-400"
          >
            <span className="px-5">{item}</span>
            <span className="text-emerald-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
