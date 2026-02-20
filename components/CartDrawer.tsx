"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, MapPin, CreditCard, Banknote, Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/data";

export interface CartItem extends Product {
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onPlaceOrder: () => void;
}

export default function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    onUpdateQuantity,
    onPlaceOrder,
}: CartDrawerProps) {
    const [isLocationPinned, setIsLocationPinned] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string>("cod");
    const [showSuccess, setShowSuccess] = useState(false);

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handlePlaceOrder = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onPlaceOrder();
        }, 3000);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-emerald-50 flex items-center justify-between bg-white shrink-0">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your Cart</h2>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" strokeWidth={1.5} />
                            </motion.button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-8">
                            {/* Cart Items */}
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBagIcon className="w-10 h-10 text-emerald-200" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Your cart is empty</h3>
                                    <p className="text-slate-500 mt-1 text-sm">Add some delicious kakanin to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-50">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 leading-tight">{item.name}</h4>
                                                    <div className="text-emerald-700 font-bold text-sm mt-1">₱{item.price * item.quantity}</div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" strokeWidth={2} />
                                                    </button>
                                                    <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Checkout Form */}
                            {cartItems.length > 0 && (
                                <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-lg font-bold tracking-tight text-slate-900">Order Details</h3>

                                    <div className="space-y-4">
                                        {/* Date Picker (Simulated) */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Pickup/Delivery Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value="Oct 24, 2024"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 font-medium cursor-pointer hover:bg-slate-100 transition-colors outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                            <p className="text-xs text-amber-600 mt-1.5 ml-1 font-medium">*Requires 3 days advance notice</p>
                                        </div>

                                        {/* Location Pin */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Drop-off Location</label>
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setIsLocationPinned(!isLocationPinned)}
                                                className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-colors ${isLocationPinned
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <MapPin className={`w-5 h-5 ${isLocationPinned ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={1.5} />
                                                    <span className="font-medium">
                                                        {isLocationPinned ? "Santa Cruz, Laguna" : "Tap to set location"}
                                                    </span>
                                                </div>
                                                {isLocationPinned && <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />}
                                            </motion.button>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Payment Method</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSelectedPayment("cod")}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedPayment === "cod"
                                                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20"
                                                        : "border-slate-200 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPayment === "cod" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                        <Banknote className="w-4 h-4" strokeWidth={1.5} />
                                                    </div>
                                                    <span className={`font-medium text-sm ${selectedPayment === "cod" ? "text-emerald-900" : "text-slate-700"}`}>Cash</span>
                                                </motion.button>

                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSelectedPayment("online")}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedPayment === "online"
                                                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20"
                                                        : "border-slate-200 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPayment === "online" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                                                        <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                                                    </div>
                                                    <span className={`font-medium text-sm ${selectedPayment === "online" ? "text-emerald-900" : "text-slate-700"}`}>GCash / Maya</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with sticky CTA */}
                        {cartItems.length > 0 && (
                            <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] shrink-0 z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="text-xl font-bold text-slate-900">₱{totalAmount}</span>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-emerald-700 text-white font-semibold rounded-full py-4 shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-lg"
                                >
                                    Place Order - ₱{totalAmount}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-emerald-900/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm mx-4 text-center"
                        >
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600" strokeWidth={2} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Order Placed!</h2>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Thank you! Ate Ai is now preparing your delicious kakanin.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Simple fallback icon
function ShoppingBagIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth || "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}
