import React from "react";
import { motion } from "framer-motion";
import { FaGavel, FaUsers, FaBolt, FaGlobe, FaCode, FaHeart } from "react-icons/fa";

const About = () => {
  const features = [
    {
      icon: <FaGavel className="text-4xl text-yellow-500" />,
      title: "Live Bidding",
      desc: "Place and track bids in real-time with our socket-powered auction engine."
    },
    {
      icon: <FaBolt className="text-4xl text-blue-500" />,
      title: "Instant Updates",
      desc: "Get instant notifications when someone outbids you or wins the auction."
    },
    {
      icon: <FaUsers className="text-4xl text-green-500" />,
      title: "Global Community",
      desc: "Compete with bidders worldwide in a secure and fair marketplace."
    },
    {
      icon: <FaGlobe className="text-4xl text-purple-500" />,
      title: "Accessible Anywhere",
      desc: "Join auctions from any device, anywhere in the world."
    }
  ];

  return (
    <div className="bg-white w-full h-auto rounded-3xl shadow-lg overflow-hidden pt-24">
      <div className="flex flex-col gap-10 items-center w-full px-8 md:px-20 py-16">
        
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          About Us
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          viewport={{ once: true }}
          className="text-lg md:text-xl text-gray-600 text-center max-w-3xl"
        >
          We’re redefining online auctions with lightning-fast real-time updates, 
          a global community of bidders, and a secure, transparent platform you can trust.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center gap-4"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 w-full bg-gray-50 rounded-2xl p-8 shadow-inner text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <FaCode className="text-4xl text-blue-600" />
            <h2 className="text-2xl font-bold">Developer's Note</h2>
            <p className="text-gray-600 max-w-2xl">
              Hi! I’m <span className="font-semibold text-blue-600">Rahil</span>, the developer of this real-time auction platform.  
              This project was built with <span className="font-semibold">MERN Stack</span> and 
              <span className="font-semibold"> Socket.io</span> to showcase my skills in building scalable, 
              real-time applications. You’re free to explore, test, and even contribute to it.  
              It’s currently a test project, but my aim is to make it a fully functional, production-ready platform.  
            </p>
            <p className="flex items-center gap-2 text-gray-500 text-sm">
              Made with <FaHeart className="text-red-500" /> by Rahil
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
