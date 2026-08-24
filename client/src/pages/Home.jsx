import React, { useState, useEffect, useRef } from 'react';
import auctionPng from '../assets/auction.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import EmptyLoader from '../components/EmptyLoader';
import { fetchAuctions } from '../services/operations/auctionAPI';
import { ChevronRight, Star, Users, Shield, Clock } from "lucide-react";
import { motion, useInView } from "motion/react";
import { FaGavel, FaGem, FaCar, FaPalette, FaHome, FaTshirt, FaLaptop, FaGamepad } from "react-icons/fa";
import { fetchFeaturedAuctions } from '../services/operations/auctionAPI';

const categories = [
    { name: "Art & Collectibles", icon: FaPalette, color: "from-purple-500 to-pink-500", count: "2.5k+" },
    { name: "Jewelry & Watches", icon: FaGem, color: "from-yellow-500 to-orange-500", count: "1.8k+" },
    { name: "Vehicles", icon: FaCar, color: "from-blue-500 to-cyan-500", count: "950+" },
    { name: "Real Estate", icon: FaHome, color: "from-green-500 to-emerald-500", count: "420+" },
    { name: "Fashion", icon: FaTshirt, color: "from-pink-500 to-rose-500", count: "3.2k+" },
    { name: "Electronics", icon: FaLaptop, color: "from-indigo-500 to-purple-500", count: "1.5k+" },
    { name: "Gaming", icon: FaGamepad, color: "from-red-500 to-pink-500", count: "890+" },
    { name: "Antiques", icon: FaGavel, color: "from-amber-500 to-yellow-500", count: "670+" },
];

const features = [
    {
      icon: Shield,
      title: "Secure Bidding",
      description: "Advanced security measures protect every transaction",
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Connect with collectors and sellers worldwide",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live bidding updates and instant notifications",
    },
];
  
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
};

const staggerContainer = {
    animate: {
        transition: {
        staggerChildren: 0.1,
        },
    },
};

function AnimatedSection({ children, className = " ", ...props }){
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return(
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

const Home = () => {
    const { user } = useSelector((state) => state.profile);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/auctions');
        }
    }, [user, navigate]);

  return (
    <>
        <section className='pt-24 pb-16 px-4 sm:px-6 lg:px-8'>
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Discover
                            </span>
                            <br />
                            <span className="text-slate-800">Rare Treasures</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Join the world's most exclusive auction platform where collectors and enthusiasts discover extraordinary
                            items from around the globe.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-16"
                    >
                        <Link to="/login"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg 
                            px-8 py-1.5 group gap-3 text-white flex items-center rounded-lg cursor-pointer transition-all duration-1000"
                        >
                            Start Bidding
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/auctions"
                            className="text-lg px-8 py-1.5 border-2 border-slate-200 hover:bg-slate-50 bg-transparent cursor-pointer rounded-lg"
                        >
                            Browse Auctions
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                    >
                        {[
                            { label: "Active Auctions", value: "12,500+" },
                            { label: "Happy Bidders", value: "85,000+" },
                            { label: "Items Sold", value: "$2.5M+" },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</div>
                                <div className="text-slate-600">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>

        <AnimatedSection className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose AuctionHub?</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Experience the future of online auctions with our cutting-edge platform
                </p>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {features.map((feature, index) => (
                    <motion.div key={index} variants={fadeInUp}>
                        <div className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border rounded-xl border-slate-200 bg-gradient-to-br from-white to-slate-50">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-4">{feature.title}</h3>
                                <p className="text-slate-600">{feature.description}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            </div>
        </AnimatedSection>

        <AnimatedSection id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Buy and sell rare items in four simple steps
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        {
                            step: "01",
                            title: "Register Account",
                            desc: "Sign up and verify your profile with secure email verification.",
                            color: "text-blue-600"
                        },
                        {
                            step: "02",
                            title: "Browse Auctions",
                            desc: "Explore categories or search for specific items live.",
                            color: "text-purple-600"
                        },
                        {
                            step: "03",
                            title: "Place Bids",
                            desc: "Submit your offers. Outbid other buyers in real-time.",
                            color: "text-pink-600"
                        },
                        {
                            step: "04",
                            title: "Win & Collect",
                            desc: "Win the auction and securely acquire your new treasure.",
                            color: "text-indigo-600"
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative border border-slate-100">
                            <div className={`text-5xl font-extrabold ${item.color} opacity-20 mb-4`}>
                                {item.step}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AnimatedSection>

        <AnimatedSection id="categories" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-800 mb-4">Explore Categories</h2>
                <p className="text-xl text-slate-600">Find exactly what you're looking for</p>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {categories.map((category, index) => (
                <motion.div key={index} variants={fadeInUp}>
                    <div className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 rounded-xl overflow-hidden">
                        <div className="p-0">
                            <div
                            className={`h-32 bg-gradient-to-r ${category.color} flex items-center justify-center relative overflow-hidden`}
                            >
                            <category.icon className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                            <div className="p-6">
                            <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-slate-500">{category.count} items</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                ))}
            </motion.div>
            </div>
        </AnimatedSection>

        <AnimatedSection id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-200">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-bold text-slate-800 mb-6">Have Questions? Get in Touch</h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Need help with registration, placing bids, or managing your active auctions? Send us a message and our support team will assist you.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                    <Star className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Email Support</h4>
                                    <p className="text-slate-600">support@auctioneer.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Security & Verifications</h4>
                                    <p className="text-slate-600">security@auctioneer.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent successfully!"); e.target.reset(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                                <input type="text" placeholder="Your name" className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                <input type="email" placeholder="Your email" className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                <textarea placeholder="Your message" rows={4} className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AnimatedSection>

        <AnimatedSection className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Collection?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of collectors who trust Auctioneer for their most valuable acquisitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                    <button className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-10 py-1.5 cursor-pointer transition-all duration-300 rounded-xl">
                        Create Account
                    </button>
                </Link>
                <Link to="/login">
                    <button
                        className="border-white text-white hover:bg-white/10 text-lg px-10 py-1.5 bg-transparent cursor-pointer transition-all duration-300 rounded-xl"
                    >
                        Sell Your Items
                    </button>
                </Link>
            </div>
            </div>
        </AnimatedSection>

        <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                <div className="flex items-center space-x-2 mb-4">
                    <FaGavel className="h-8 w-8 text-blue-400" />
                    <span className="text-2xl font-bold">Auctioneer</span>
                </div>
                <p className="text-slate-400 mb-4">
                    The world's premier online auction platform for collectors and enthusiasts.
                </p>
                <div className="flex space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        <Star className="h-5 w-5" />
                    </div>
                    ))}
                </div>
                </div>

                {[
                {
                    title: "Marketplace",
                    links: ["Browse Auctions", "Categories", "Sell Items", "How It Works"],
                },
                {
                    title: "Support",
                    links: ["Help Center", "Contact Us", "Safety Tips", "Community"],
                },
                {
                    title: "Company",
                    links: ["About Us", "Careers", "Press", "Partners"],
                },
                ].map((section, index) => (
                <div key={index}>
                    <h3 className="font-semibold mb-4">{section.title}</h3>
                    <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                        <a href="#" className="text-slate-400 hover:text-white transition-colors">
                            {link}
                        </a>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>

            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-slate-400 mb-4 md:mb-0">© 2025 Auctioneer. All rights reserved.</p>
                <div className="flex space-x-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                </a>
                </div>
            </div>
            </div>
        </footer>
    </>
  );
};

export default Home;
