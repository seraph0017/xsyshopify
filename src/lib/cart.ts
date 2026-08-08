export type CartLine = {
  id: string;
  productHandle: string;
  title: string;
  option: string;
  size: string;
  panelFinish: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  const cents = lines.reduce((total, line) => total + Math.round(line.unitPrice * 100) * line.quantity, 0);
  return cents / 100;
}

export function setLineQuantity(lines: CartLine[], id: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((line) => line.id !== id);
  return lines.map((line) => line.id === id ? { ...line, quantity } : line);
}

export function addCartLine(lines: CartLine[], incoming: CartLine): CartLine[] {
  const existing = lines.find((line) => line.id === incoming.id);
  if (!existing) return [...lines, incoming];
  return lines.map((line) => line.id === incoming.id ? { ...line, quantity: line.quantity + incoming.quantity } : line);
}
