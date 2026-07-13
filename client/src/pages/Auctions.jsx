import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import EmptyLoader from "../components/EmptyLoader";
import { fetchAuctions } from "../services/operations/auctionAPI";
import auctionPng from "../assets/auction.png";
import { FaSearch, FaFilter } from "react-icons/fa";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const getAuctions = async () => {
      try {
        setLoading(true);
        const res = await fetchAuctions();
        setAuctions(res);
        setFilteredAuctions(res);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    getAuctions();
  }, []);

  // Search + Filter handler
  useEffect(() => {
    let results = auctions;
    if (search.trim() !== "") {
      results = results.filter((auction) =>
        auction.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoryFilter) {
      results = results.filter(
        (auction) => auction.category?.name === categoryFilter
      );
    }
    setFilteredAuctions(results);
  }, [search, categoryFilter, auctions]);

  const categories = [
    "Art & Collectibles",
    "Jewelry & Watches",
    "Vehicles",
    "Real Estate",
    "Fashion",
    "Electronics",
    "Gaming",
    "Antiques",
  ];

  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
            All Auctions
          </h1>
          <p className="text-slate-600 mt-3">
            Browse through all the auctions currently available
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10"
        >

          <div className="flex items-center w-full md:w-1/2 bg-white shadow-sm border rounded-lg px-4 py-2">
            <FaSearch className="text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>

          <div className="flex items-center w-full md:w-1/3 bg-white shadow-sm border rounded-lg px-4 py-2">
            <FaFilter className="text-slate-400 mr-3" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 outline-none bg-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center mt-10">
            <EmptyLoader />
          </div>
        ) : filteredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map((auction, index) => (
              <motion.div
                key={auction._id}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <img
                  src={auction.images?.url || auctionPng}
                  alt={auction.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                    {auction.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-1 mb-3 line-clamp-2">
                    {auction.description}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {auction.category?.name || "Uncategorized"}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      ${auction.startingPrice}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mb-4">
                    By {auction.seller?.firstName} {auction.seller?.lastName}
                  </span>
                  <Link
                    to={`/auction/${auction._id}`}
                    className="mt-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-center hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    View Auction
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center mt-20">
            <EmptyLoader />
            <p className="mt-2 text-slate-500">No auctions found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Auctions;
