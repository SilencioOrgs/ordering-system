"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Leaf } from "lucide-react";
import Image from "next/image";
import { products, categories, Product } from "@/lib/data";

interface DashboardViewProps {
    cartCount: number;
    onOpenCart: () => void;
    onAddToCart: (product: Product) => void;
}

export default function DashboardView({ cartCount, onOpenCart, onAddToCart }: DashboardViewProps) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showToast, setShowToast] = useState(false);

    const filteredProducts = products.filter((p) => {
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = (product: Product) => {
        onAddToCart(product);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#FDFBF7] pb-24"
        >
            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 50, x: "-50%" }}
                        className="fixed bottom-8 left-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg shadow-slate-900/20 font-medium flex items-center gap-2"
                    >
                        <Leaf className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                        Added to your cart!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dashboard Navbar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-6">
                    <div className="flex items-center gap-2 shrink-0 hidden md:flex">
                        <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">
                            Kitchen
                        </span>
                    </div>

                    <div className="flex-1 max-w-xl relative mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for delicacy..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-100 rounded-full w-full py-3 pl-12 pr-6 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:bg-white transition-all placeholder:text-slate-500 font-medium"
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onOpenCart}
                        className="relative w-12 h-12 bg-white rounded-full border border-emerald-100 flex items-center justify-center shrink-0 hover:bg-emerald-50 transition-colors"
                    >
                        <ShoppingBag className="w-6 h-6 text-slate-900" strokeWidth={1.5} />
                        {cartCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm"
                            >
                                {cartCount}
                            </motion.div>
                        )}
                    </motion.button>
                </div>
            </header>

            {/* Categories Bar */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex overflow-x-auto pb-4 -mb-4 gap-3 hide-scrollbar">
                    {categories.map((category) => (
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`whitespace-nowrap rounded-full px-6 py-2.5 font-semibold text-sm transition-colors border ${activeCategory === category
                                    ? "bg-emerald-700 text-white border-emerald-700"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50"
                                }`}
                        >
                            {category}
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Product Grid */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Menu</h2>
                    <p className="text-slate-500 mt-2 text-lg">Delicious, authentic goodness in every bite</p>
                </div>

                {filteredProducts.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {filteredProducts.map((product) => (
                            <motion.div
                                variants={itemVariants}
                                key={product.id}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all group flex flex-col"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.isBestSeller && (
                                        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            Best Seller
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight line-clamp-2">
                                            {product.name}
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-3">{product.description}</p>

                                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
                                        <div className="text-emerald-700 font-bold text-lg">
                                            <span className="text-sm font-semibold opacity-80 mr-1">₱</span>
                                            {product.price}
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleAddToCart(product)}
                                            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-colors"
                                            title="Add to Cart"
                                        >
                                            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-emerald-200" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No delights found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your search or category filter.</p>
                    </div>
                )}
            </section>
        </motion.div>
    );
}
