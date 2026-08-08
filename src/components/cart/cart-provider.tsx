"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { addCartLine, cartItemCount, cartSubtotal, setLineQuantity, type CartLine } from "@/lib/cart";
import { checkoutAnalyticsEvent, trackAnalyticsEnvelope, trackEvent } from "@/lib/analytics";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  isOpen: boolean;
  addLine: (line: CartLine) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const addLine = useCallback((line: CartLine) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setLines((current) => addCartLine(current, line));
    setIsOpen(true);
    trackEvent("add_to_cart", { item_id: line.productHandle, size: line.size, panel_finish: line.panelFinish, quantity: line.quantity, value: line.unitPrice * line.quantity, currency: "USD" });
  }, []);

  const openCart = useCallback(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsOpen(true);
    trackEvent("view_cart", { item_count: cartItemCount(lines), value: cartSubtotal(lines), currency: "USD" });
  }, [lines]);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ lines, count: cartItemCount(lines), isOpen, addLine, openCart, closeCart }), [addLine, closeCart, isOpen, lines, openCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer lines={lines} setLines={setLines} isOpen={isOpen} closeCart={closeCart} openerRef={openerRef} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

function CartDrawer({ lines, setLines, isOpen, closeCart, openerRef }: { lines: CartLine[]; setLines: React.Dispatch<React.SetStateAction<CartLine[]>>; isOpen: boolean; closeCart: () => void; openerRef: React.RefObject<HTMLElement | null> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [handoffMessage, setHandoffMessage] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
      return;
    }
    if (dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
    document.body.style.overflow = "";
    openerRef.current?.focus();
  }, [isOpen, openerRef]);

  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  const subtotal = cartSubtotal(lines);

  return (
    <dialog ref={dialogRef} className="cart-drawer" aria-labelledby="cart-title" onCancel={(event) => { event.preventDefault(); closeCart(); }} onClick={(event) => { if (event.target === event.currentTarget) closeCart(); }}>
        <div className="cart-drawer__header">
          <div>
            <p className="ui-label">Local prototype cart</p>
            <h2 id="cart-title">Your cart</h2>
          </div>
          <button className="icon-button" ref={closeRef} onClick={closeCart} aria-label="Close cart"><X aria-hidden="true" /></button>
        </div>
        <div className="cart-drawer__body">
          {lines.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart aria-hidden="true" size={30} />
              <h3>No standard products added</h3>
              <p>Purchase-ready previews appear here. Custom work continues through RFQ.</p>
              <Link className="button button--dark" href="/products" onClick={closeCart}>Browse products</Link>
            </div>
          ) : (
            <ul className="cart-lines">
              {lines.map((line) => (
                <li key={line.id} className="cart-line">
                  {line.image ? <Image src={line.image} alt="" width={88} height={88} /> : null}
                  <div className="cart-line__content">
                    <Link href={`/products/${line.productHandle}`} onClick={closeCart}>{line.title}</Link>
                    <p>{line.option}</p>
                    <p className="preview-price">${line.unitPrice.toFixed(2)} preview</p>
                    <div className="quantity-control" aria-label={`Quantity for ${line.title}`}>
                      <button onClick={() => setLines((current) => setLineQuantity(current, line.id, line.quantity - 1))} aria-label="Decrease quantity"><Minus aria-hidden="true" size={14} /></button>
                      <span>{line.quantity}</span>
                      <button onClick={() => setLines((current) => setLineQuantity(current, line.id, line.quantity + 1))} aria-label="Increase quantity"><Plus aria-hidden="true" size={14} /></button>
                      <button className="remove-line" onClick={() => setLines((current) => setLineQuantity(current, line.id, 0))} aria-label={`Remove ${line.title}`}><Trash2 aria-hidden="true" size={15} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {lines.length > 0 ? (
          <div className="cart-drawer__footer">
            <div className="cart-total"><span>Preview subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <p>Pricing, tax, inventory, shipping, and checkout remain disconnected prototype data.</p>
            <button className="button button--green button--full" onClick={() => { trackAnalyticsEnvelope(checkoutAnalyticsEvent({ value: subtotal })); setHandoffMessage("Shopify Checkout will activate after verified catalog and Storefront credentials are connected."); }}>Preview checkout handoff</button>
            {handoffMessage ? <p className="form-message" role="status">{handoffMessage}</p> : null}
          </div>
        ) : null}
    </dialog>
  );
}
