import { motion } from 'framer-motion';

const ease = [0.77, 0, 0.175, 1];

// The wrapper is what gets observed: an element hidden inside an overflow-hidden mask
// would never count as "in view" on its own, so the parent triggers and children follow.
const wrap = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const eyebrowV = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.6 } } };
const titleV = { hidden: { y: '105%' }, show: { y: 0, transition: { duration: 0.9, ease } } };
const bodyV = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } };

/** Consistent section title: numbered eyebrow + big headline that wipes up into view. */
export default function SectionHeading({ index, eyebrow, title, children, align = 'left', as: Tag = 'h2' }) {
  return (
    <motion.div
      className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
      variants={wrap}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.p
        variants={eyebrowV}
        className="eyebrow mb-5 flex items-center gap-3"
        style={align === 'center' ? { justifyContent: 'center' } : undefined}
      >
        {index && <span className="text-racing">{index}</span>}
        <span className="h-px w-8 bg-white/20" />
        {eyebrow}
      </motion.p>
      <Tag className="overflow-hidden text-3xl font-semibold uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        <motion.span className="block" variants={titleV}>
          {title}
        </motion.span>
      </Tag>
      {children && (
        <motion.div variants={bodyV} className="mt-6 text-base leading-relaxed text-silver sm:text-lg">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
