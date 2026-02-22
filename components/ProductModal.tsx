"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/data";

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAction: () => void;
    actionText: string;
}

export default function ProductModal({ product, isOpen, onClose, onAction, actionText }: ProductModalProps) {
    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-2xl bg-white rounded-t-md sm:rounded-md overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-1.5 bg-white/50 backdrop-blur-md text-slate-900 hover:bg-slate-100 rounded-md transition-colors shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="overflow-y-auto hide-scrollbar pb-24 sm:pb-0">
                            <div className="relative w-full aspect-square sm:aspect-[16/10] bg-slate-100 shrink-0">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                {product.isBestSeller && (
                                    <div className="absolute top-4 left-4 bg-emerald-800/90 backdrop-blur-md text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-sm z-10 flex items-center gap-1.5 border border-emerald-700/50">
                                        <Star className="w-4 h-4 fill-white" /> Best Seller
                                    </div>
                                )}
                            </div>

                            <div className="p-6 sm:p-8 flex flex-col">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                            {product.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-bold">
                                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                4.9 <span className="font-normal opacity-70">(500+)</span>
                                            </div>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-slate-600 font-medium">{product.category}</span>
                                        </div>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight shrink-0">
                                        ₱{product.price}.00
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Description</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {product.description || "The top choice among all our customers, delicious, authentic and a part of an amazing experience! Hand-crafted with love directly from Ate Ai's Kitchen to your table."}
                                    </p>
                                </div>

                                {product.tags && product.tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {product.tags.map((tag) => (
                                            <span key={tag} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="bg-emerald-50 border border-emerald-100 rounded-md p-4 mt-6 flex items-start gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-md text-emerald-700 shrink-0">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Free Delivery Promo</p>
                                        <p className="text-xs text-slate-600 mt-0.5">Order now to get free delivery across Metro Manila within 45 minutes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Bottom Action Bar */}
                        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-white border-t border-slate-100 sm:relative sm:border-t-0 sm:pt-0 pb-6 rounded-b-md">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={onAction}
                                className="w-full bg-emerald-700 text-white font-bold rounded-lg py-4 shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-3 text-lg"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {actionText}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
