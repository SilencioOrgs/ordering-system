"use client";

import { motion } from "framer-motion";
import { Leaf, Truck, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { products } from "@/lib/data";

interface LandingViewProps {
    onLogin: () => void;
}

export default function LandingView({ onLogin }: LandingViewProps) {
    const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#FDFBF7]"
        >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">
                            Ate Ai's Kitchen
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-slate-500 font-medium tracking-tight">
                        <a href="#" className="hover:text-emerald-700 transition-colors">Our Story</a>
                        <a href="#" className="hover:text-emerald-700 transition-colors">Menu</a>
                        <a href="#" className="hover:text-emerald-700 transition-colors">Catering</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="hidden sm:block text-slate-900 font-semibold hover:text-emerald-700 transition-colors tracking-tight px-4">
                            Sign Up
                        </button>
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={onLogin}
                            className="bg-emerald-700 text-white font-semibold rounded-full px-6 py-2.5 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Login
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                            Authentic Kakanin, <br />
                            <span className="text-emerald-700">Made Fresh</span> for You
                        </h1>
                        <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                            Experience the true taste of Filipino traditions. Handcrafted daily using locally sourced, organic ingredients passed directly from our farm to your table.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={onLogin}
                                className="bg-emerald-700 text-white font-semibold rounded-full px-8 py-3.5 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-lg shadow-sm shadow-emerald-700/20"
                            >
                                Order Now <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                className="bg-emerald-50 text-emerald-800 font-semibold rounded-full px-8 py-3.5 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-lg"
                            >
                                View Menu
                            </motion.button>
                        </div>
                    </div>
                    <div className="relative h-[400px] md:h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10">
                        <Image
                            src="https://images.unsplash.com/photo-1512485800893-b08ec1ea59b1?q=80&w=1000&auto=format&fit=crop"
                            alt="Delicious Kakanin"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Features Row */}
            <section className="bg-white py-16 border-y border-emerald-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-3 gap-8">
                        {[
                            { icon: Leaf, title: "100% Organic", desc: "Sourced from local partner farms" },
                            { icon: Truck, title: "Fast Delivery", desc: "Freshness delivered to your door" },
                            { icon: ShieldCheck, title: "Quality Guaranteed", desc: "Made with love and tradition" },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl hover:bg-[#FDFBF7] transition-colors group cursor-default">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors group-hover:scale-110 duration-300">
                                    <feature.icon className="w-8 h-8 text-emerald-700" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-500 mt-2">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Our Best Sellers</h2>
                        <p className="text-slate-500 mt-2 text-lg">Taste our most loved recipes</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <motion.div
                            key={product.id}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-[2rem] p-4 shadow-sm border border-emerald-50 hover:shadow-md hover:shadow-emerald-900/5 transition-all group flex flex-col"
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 rounded-xl">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-900 text-lg tracking-tight mb-1">{product.name}</h3>
                                <p className="text-emerald-700 font-semibold text-lg mb-4">₱{product.price}</p>
                                <div className="mt-auto">
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={onLogin}
                                        className="w-full bg-emerald-50 text-emerald-800 font-semibold rounded-full py-3 hover:bg-emerald-700 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                                        Order Now
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-emerald-50 text-center text-slate-500">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Leaf className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />
                    <span className="font-bold text-lg tracking-tight text-slate-900">
                        Ate Ai's Kitchen
                    </span>
                </div>
                <p>&copy; {new Date().getFullYear()} Ate Ai's Kitchen. All rights reserved.</p>
            </footer>
        </motion.div>
    );
}
