type Listener = () => void;

let forceHide = false;
const listeners = new Set<Listener>();

export function getForceHideSiteHeader(): boolean {
  return forceHide;
}

export function setForceHideSiteHeader(next: boolean): void {
  if (forceHide === next) return;
  forceHide = next;
  listeners.forEach((listener) => listener());
}

export function subscribeForceHideSiteHeader(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
