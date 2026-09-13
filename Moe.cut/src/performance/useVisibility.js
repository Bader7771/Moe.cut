import { useEffect, useState } from 'react';
import { observeActivity } from './visibility';

export function useVisibility(ref, rootMargin = '0px') {
  const [visible, setVisible] = useState(false);
  useEffect(() => ref.current ? observeActivity(ref.current, setVisible, rootMargin) : undefined, [ref, rootMargin]);
  return visible;
}
