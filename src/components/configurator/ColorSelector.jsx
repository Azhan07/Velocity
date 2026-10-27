import OptionGroup from './OptionGroup';
import { paints } from '../../data/cars';
import { formatPrice } from '../../utils/format';

export default function ColorSelector({ value, onChange, supported }) {
  const selected = paints.find((p) => p.id === value);
  return (
    <>
      <OptionGroup
        title="Paint"
        step="01"
        options={paints}
        value={value}
        onChange={onChange}
        renderSwatch="circle"
        supported={supported}
        unsupportedText="This model has no separate body material, so paint cannot be changed."
      />
      <p className="-mt-4 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-chrome">
        {selected?.price ? `+${formatPrice(selected.price)}` : 'No-cost option'}
      </p>
    </>
  );
}
