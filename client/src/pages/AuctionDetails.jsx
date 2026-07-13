import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAuctionDetails } from '../services/operations/auctionAPI';
import { placeBid, editBid, deleteBid } from '../services/operations/bidAPI';
import CountdownTimer from '../components/CountdownTimer';
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import EmptyLoader from '../components/EmptyLoader';
import BidModal from '../components/common/BidModal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TiStarFullOutline } from "react-icons/ti";
import { LuCircleCheckBig } from 'react-icons/lu';
import { BsExclamationCircle } from 'react-icons/bs';
import { PiClock } from "react-icons/pi";
import { getSocket } from '../services/socketService';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const AuctionDetails = () => {
  const { auctionId } = useParams();
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [highlightBidId, setHighlightBidId] = useState(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: editRegister, handleSubmit: handleEditSubmit, formState: { errors: editErrors } } = useForm();
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    const getFullAuctionDetails = async () => {
      setLoading(true);
      try {
        if (!auctionId) return;
        const res = await fetchAuctionDetails(auctionId);
        setAuctionData(res);
      } catch (error) {
        console.error("ERROR CALLING API", error);
        toast.error("Failed to fetch auction details");
      } finally {
        setLoading(false);
      }
    };

    getFullAuctionDetails();
  }, [auctionId]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onNewBid = (payload) => {
      try {
        if (!payload) return;
        const productId = payload.productId || payload.productId === 0 ? payload.productId : null;
        if (productId && productId.toString() !== auctionId?.toString()) return;

        const incomingBid = payload.bid || payload;

        const normalizedBid = {
          _id: incomingBid._id || `bid_${Date.now()}`,
          bidAmount: incomingBid.bidAmount ?? incomingBid.amount ?? 0,
          user: incomingBid.user || {
            _id: incomingBid.userId || incomingBid.bidderId || `u_${incomingBid.bidderEmail || 'anon'}`,
            firstName: incomingBid.user?.firstName || (incomingBid.bidderEmail ? incomingBid.bidderEmail.split('@')[0] : 'Anonymous'),
            lastName: incomingBid.user?.lastName || '',
            image: incomingBid.user?.image || ''
          },
          createdAt: incomingBid.createdAt || new Date().toISOString()
        };

        setAuctionData(prev => {
          if (!prev) return prev;

          const exists = prev.bids?.some(b => b._id === normalizedBid._id);
          if (exists) {

            if (normalizedBid.bidAmount > (prev.currentBid ?? 0)) {
              return { ...prev, currentBid: normalizedBid.bidAmount };
            }
            return prev;
          }

          const newBids = [...(prev.bids || []), normalizedBid];
          const updated = {
            ...prev,
            bids: newBids,
            currentBid: Math.max(prev.currentBid ?? 0, normalizedBid.bidAmount)
          };
          return updated;
        });

        setHighlightBidId(normalizedBid._id);
        setTimeout(() => setHighlightBidId(null), 2200);
      } catch (err) {
        console.error("Error normalizing socket payload", err);
      }
    };

    socket.on('newBid', onNewBid);

    // Cleanup
    return () => {
      socket.off('newBid', onNewBid);
      socketRef.current = null;
    };
  }, [auctionId]);

  const onSubmit = async (data) => {
    setLoading(true);

    if (!user) {
      navigate("/login");
      return;
    }

    const bidData = {
      productId: auctionId,
      bidAmount: Number(data.bidAmount)
    };

    try {
      const response = await placeBid(bidData);
      if (response) {

        setAuctionData(prev => prev ? ({
          ...prev,
          currentBid: Math.max(prev.currentBid ?? 0, response.bidAmount ?? bidData.bidAmount),
          bids: [...(prev.bids || []), response]
        }) : prev);

        const updatedAuction = await fetchAuctionDetails(auctionId);
        setAuctionData(updatedAuction);

        try {
            getSocket().emit("newBid", {
                productId: auctionId,
                bidAmount: data.bidAmount,
                bidderEmail: user.email,
                productCreatorId: auctionData.seller._id
            })
        } catch (emitErr) {
          console.log("EMIT ERROR", emitErr);
        }

        toast.success("Bid placed successfully!");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error(error?.response?.data?.message || "Failed to place bid");
    } finally {
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  const handleEditBid = async (data) => {
    setLoading(true);
    try {
      const parsed = Number(data.bidAmount);
      const response = await editBid(editingBid._id, parsed);
      if (response) {
        setIsEditModalOpen(false);
        setEditingBid(null);
        const updatedAuction = await fetchAuctionDetails(auctionId);
        setAuctionData(updatedAuction);
        toast.success("Bid updated");
      }
    } catch (error) {
      console.error("Error editing bid:", error);
      toast.error("Failed to update bid");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBid = async (bidId) => {
    if (!window.confirm("Are you sure you want to delete this bid?")) return;
    setLoading(true);
    try {
      const response = await deleteBid(bidId);
      if (response) {
        const updatedAuction = await fetchAuctionDetails(auctionId);
        setAuctionData(updatedAuction);
        toast.success("Bid deleted");
      }
    } catch (error) {
      console.error("Error deleting bid:", error);
      toast.error("Failed to delete bid");
    } finally {
      setLoading(false);
    }
  };

  const isAuctionEndingSoon = () => {
    if (!auctionData?.auctionEndTime) return false;
    const endTime = new Date(auctionData.auctionEndTime);
    const now = new Date();
    const diffInHours = (endTime - now) / (1000 * 60 * 60);
    return diffInHours <= 24 && diffInHours > 0;
  };

  const bidsSortedDesc = (auctionData?.bids || []).slice().sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0));
  
  return (
    <div className='w-full xl:w-[95%] mx-auto mt-10 flex flex-col xl:flex-row gap-8 pt-24'>

      <motion.div
        className='w-full xl:w-[70%] p-3'
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div className='w-full flex flex-col lg:flex-row gap-8'>
          <motion.div
            className='w-full xl:w-[50%] rounded-3xl overflow-hidden shadow-2xl bg-black/40'
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={auctionData?.images?.url}
              alt='product-img'
              loading='lazy'
              className='w-full h-[420px] object-cover'
            />
          </motion.div>

          <div className='w-full xl:w-[50%] px-5'>
            <motion.h1
              className='text-blue-600 text-3xl font-semibold'
            >
              {auctionData?.title || 'Loading...'}
            </motion.h1>

            <div className='flex gap-3 items-center mt-3'>
              <img
                src={auctionData?.seller?.image?.url}
                alt='user-img'
                loading='lazy'
                className='w-[30px] h-[30px] object-cover rounded-full border border-white/20'
              />
              <p className='text-black font-medium'>
                {auctionData?.seller?.firstName} {auctionData?.seller?.lastName}
              </p>

              <div className='flex items-center gap-1 text-xl ml-3'>
                {[...Array(5)].map((_, i) => (
                  <TiStarFullOutline key={i} className={i < 4 ? 'text-yellow-400' : 'text-gray-500'} />
                ))}
              </div>
              <h1 className='text-gray-400 ml-2'>211 reviews</h1>
            </div>

            <div className='text-black flex flex-col gap-4 mt-4'>
              {["Free Return", "Fast and Secure Shipping", "Trending Auction - High Demand!"].map((text, idx) => (
                <motion.div key={idx} className='text-lg gap-3 flex items-center' whileHover={{ x: 4 }}>
                  <LuCircleCheckBig fontSize={24} />
                  <h1>{text}</h1>
                </motion.div>
              ))}

              {isAuctionEndingSoon() && (
                <motion.div className='text-red-600 font-semibold text-lg gap-3 flex items-center animate-pulse' whileHover={{ x: 4 }}>
                  <LuCircleCheckBig fontSize={24} />
                  <h1>Auction Closing soon - Place your Bid!</h1>
                </motion.div>
              )}
            </div>

            <div className='flex justify-between mt-6 items-center bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl'>
              <div className='flex -space-x-3'>
                {auctionData?.bids && auctionData.bids.length > 0 ? (
                  [...new Map(auctionData?.bids?.map(bid => [bid?.bidder?._id, bid?.bidder])).values()]
                    .slice(0, 3)
                    .map((user, idx) => (
                      <motion.img
                        key={user?._id}
                        src={user?.image?.url}
                        alt='user-avatar'
                        className='w-9 h-9 rounded-full object-cover border-2 border-white bg-white shadow-md'
                        style={{ zIndex: 10 - idx }}
                        whileHover={{ scale: 1.08 }}
                      />
                    ))
                ) : (
                  <div className='text-white text-sm'>No Bid Placed Yet!</div>
                )}
              </div>

              <div className='text-white font-medium text-[15px]'>
                {auctionData?.bids?.length ? auctionData.bids.length.toLocaleString() : 0} bids placed
              </div>
            </div>

            {(() => {
              if (!auctionData?.bids?.length || !user) return null;
              const highestBid = bidsSortedDesc[0];
              if (highestBid?.bidder?._id !== user?.id) {
                return (
                  <motion.div
                    className="text-red-500 font-semibold mt-4 flex gap-3 items-center"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  >
                    <BsExclamationCircle />
                    <h1>Someone outbid you. Increase your bid to win!</h1>
                  </motion.div>
                );
              }
              return null;
            })()}

            <motion.button
              className='mt-4 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 transition-all px-10 py-2 rounded-lg text-white font-medium'
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
            >
              Place Bid
            </motion.button>
          </div>
        </motion.div>

        <motion.div className='w-full px-4 xl:px-0 lg:w-[50%] flex flex-col gap-3 mt-[40px]' variants={fadeInUp}>
          <p className='text-sm text-gray-500 font-medium'>Description</p>
          <p className='text-[15px] text-black'>{auctionData?.description}</p>
        </motion.div>
      </motion.div>

      <motion.div className='w-full xl:w-[30%] flex flex-col gap-6 h-auto p-5 py-8' initial="hidden" animate="visible" variants={fadeInUp}>

        <motion.div className='w-full flex items-center rounded-lg bg-[#F6F6F6] px-5 py-6 shadow-md' whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className='w-[50%] flex flex-col gap-2'>
            <h1 className='text-[#515151] text-base font-semibold'>Starting Price</h1>
            <p className='text-[#515151] text-3xl font-bold'>${auctionData?.startingPrice ?? '0'}</p>

            <div className='flex items-center mt-2'>
              <div className='flex -space-x-3'>
                {auctionData?.bids && auctionData.bids.length > 0 ? (
                  [...new Map(auctionData.bids.map(bid => [bid?.bidder?._id, bid?.bidder])).values()]
                    .slice(0, 3)
                    .map((user, idx) => (
                      <motion.img
                        key={user?._id}
                        src={user?.image?.url}
                        alt='user-avatar'
                        className='w-7 h-7 rounded-full object-cover border-2 border-white bg-white shadow-md'
                        style={{ zIndex: 10 - idx }}
                        whileHover={{ scale: 1.08 }}
                      />
                    ))
                ) : (
                  <div className='text-gray-400 text-sm'>No Bid Placed Yet!</div>
                )}
              </div>

              <div className='flex items-center gap-3 ml-3'>
                <span className='text-[#515151] font-medium text-[15px]'>
                  {auctionData?.bids?.length || 0} bids are live
                </span>
              </div>
            </div>
          </div>

          <div className='h-full w-[1.5px] bg-[#515151]'></div>

          <div className='w-[50%] flex flex-col gap-2 pl-5'>
            <h1 className='text-[#515151] text-base font-semibold'>Current Bid Price</h1>

            <motion.p className='text-[#515151] text-3xl font-bold' animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              ${auctionData?.currentBid ?? '0'}
            </motion.p>

            <motion.div className='w-full flex gap-2 text-red-600 items-center px-2 py-2 bg-red-200 rounded-md' animate={{ opacity: [1, 0.85, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <PiClock />
              <h1 className='text-red-600 text-sm'>
                <CountdownTimer auctionEndTime={auctionData?.auctionEndTime} />
              </h1>
            </motion.div>
          </div>
        </motion.div>

        <motion.div className='w-full flex flex-col rounded-lg bg-[#F6F6F6] px-7 py-7 shadow-md' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className='flex gap-3 items-center' animate={{ opacity: [1, 0.75, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <h1 className='text-[#515151] font-bold text-lg'>Live Auction</h1>
          </motion.div>

          <div className='w-full flex flex-col gap-3 mt-4'>
            <AnimatePresence>
              {auctionData?.bids.length > 0 ? (
                [...auctionData?.bids]
                  .sort((a, b) => b.amount - a.amount)  
                  .map((bid, index) => {
                  const isHighlighted = highlightBidId && bid?._id === highlightBidId;
                  return (
                    <motion.div
                      key={bid?._id || index}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full flex justify-between bg-white p-3 rounded-md shadow-sm ${isHighlighted ? 'ring-2 ring-yellow-300' : ''}`}
                    >
                      <div className='flex gap-4 items-center'>
                        <motion.img
                          src={bid?.bidder?.image?.url}
                          alt='user-img'
                          loading='lazy'
                          className='w-[40px] h-[40px] object-cover rounded-full border border-gray-200'
                          whileHover={{ scale: 1.12 }}
                        />
                        <div>
                          <p className='text-sm font-bold'>{bid?.bidder?.firstName} {bid?.bidder?.lastName}</p>
                          <p className='text-xs text-gray-500'>{new Date(bid?.createdAt || Date.now()).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <motion.div
                          className='font-bold text-green-600'
                          animate={isHighlighted ? { scale: [1, 1.08, 1] } : {}}
                          transition={{ repeat: isHighlighted ? Infinity : 0, duration: 1.2 }}
                        >
                          ${bid?.amount}
                        </motion.div>

                        {user?.id === bid?.bidder?._id && (
                          <div className='flex gap-2 items-center'>
                            <motion.button onClick={() => { setEditingBid(bid); setIsEditModalOpen(true); }} className='p-2 hover:bg-black/5 rounded-full transition-all' whileHover={{ rotate: 8 }}>
                              <FiEdit2 className='text-[#E2FE26] text-xl' />
                            </motion.button>
                            <motion.button onClick={() => handleDeleteBid(bid._id)} className='p-2 hover:bg-black/5 rounded-full transition-all' whileHover={{ rotate: -8 }}>
                              <FiTrash2 className='text-red-500 text-xl' />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div className="flex flex-col items-center gap-1 mx-auto mt-[30px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <EmptyLoader />
                  <h1 className='font-medium text-gray-500'>No Bids Yet!!</h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <BidModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className='flex flex-col gap-2'>
          <h1 className='text-sm text-black font-medium'>Highest Bid: ${auctionData?.currentBid ?? 0}</h1>
          <h2 className='text-blue-600 mt-3 text-3xl font-bold'>Bid Amount</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-3">
            <div>
              <input
                type="number"
                id='bidAmount'
                min={(auctionData?.currentBid ?? 0) + 1}
                {...register("bidAmount", { required: true, min: 1 })}
                placeholder="Enter bid amount"
                className="w-full rounded-md p-2 h-12 focus:outline-none bg-white text-black border border-slate-300"
              />
              {errors.bidAmount && <span className="text-red-500 text-sm">Valid bid amount is required</span>}
            </div>

            <div className="flex justify-end gap-4">
              <button type="submit" disabled={loading} className="cursor-pointer px-6 font-medium py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                {loading ? "Placing..." : "Place Bid"}
              </button>
            </div>
          </form>
        </motion.div>
      </BidModal>

      <BidModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingBid(null); }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className='flex flex-col gap-2'>
          <h1 className='text-sm text-black font-medium'>Current Bid: ${editingBid?.amount}</h1>
          <h2 className='text-blue-600 mt-3 text-3xl font-bold'>Edit Bid Amount</h2>

          <form onSubmit={handleEditSubmit(handleEditBid)} className="flex flex-col gap-4 mt-3">
            <div>
              <input
                type="number"
                id='bidAmount_edit'
                min={(auctionData?.currentBid ?? 0) + 1}
                defaultValue={editingBid?.amount}
                {...editRegister("bidAmount", { required: true, min: 1 })}
                placeholder="Enter new bid amount"
                className="w-full rounded-md p-2 h-12 focus:outline-none bg-white text-black border border-slate-300"
              />
              {editErrors.bidAmount && <span className="text-red-500 text-sm">Valid bid amount is required</span>}
            </div>

            <div className="flex justify-end gap-4">
              <button type="submit" disabled={loading} className="cursor-pointer px-6 font-medium py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg">
                {loading ? "Updating..." : "Update Bid"}
              </button>
            </div>
          </form>
        </motion.div>
      </BidModal>
    </div>
  );
};

export default AuctionDetails;
