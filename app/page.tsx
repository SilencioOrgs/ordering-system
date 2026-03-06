"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LandingView from "@/components/LandingView";
import DashboardView from "@/components/DashboardView";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/data";

type CheckoutCustomQuote = {
  id: string;
  title: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  quotedTotal: number;
  deliveryDate: string | null;
  notes: string | null;
};

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { cartItems, cartCount, addToCart, updateQuantity, clearCart } = useCart(user);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shouldRedirectToOrders, setShouldRedirectToOrders] = useState(false);
  const [customQuoteForCheckout, setCustomQuoteForCheckout] = useState<CheckoutCustomQuote | null>(null);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handlePlaceOrder = () => {
    clearCart();
    setCustomQuoteForCheckout(null);
    setIsCartOpen(false);
    setShouldRedirectToOrders(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-slate-900 bg-[#FDFBF7] min-h-screen">
      <AnimatePresence mode="wait">
        {!user ? (
          <LandingView key="landing" />
        ) : (
          <DashboardView
            key="dashboard"
            user={user}
            cartCount={cartCount}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onAddToCart={handleAddToCart}
            onCheckoutCustomQuote={(quote) => {
              setCustomQuoteForCheckout(quote);
              setIsCartOpen(true);
            }}
            onLogout={signOut}
            shouldRedirectToOrders={shouldRedirectToOrders}
            onRedirectHandled={() => setShouldRedirectToOrders(false)}
          />
        )}
      </AnimatePresence>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems.map((item) => ({
          ...item,
          id: item.product_id,
        }))}
        onUpdateQuantity={(productId, delta) => {
          const cartItem = cartItems.find((i) => i.product_id === productId);
          if (cartItem) updateQuantity(cartItem.id, delta);
        }}
        customQuoteCheckout={customQuoteForCheckout}
        onClearCustomQuote={() => setCustomQuoteForCheckout(null)}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
}
