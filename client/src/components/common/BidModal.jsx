import React, { useState } from 'react';
import { useTransition, animated } from 'react-spring';
import { IoMdClose } from 'react-icons/io';

import './BidModal.css';

const BidModal = ({ isOpen, onClose, children }) => {
    const transitions = useTransition(isOpen, {
        from: { opacity: 0, transform: "translateY(-40px)" },
        enter: { opacity: 1, transform: "translateY(0px)" },
        leave: { opacity: 0, transform: "translateY(-40px)" }
    });

    return transitions(
        (style, item) => 
            item && (
                <animated.div style={style} className="modal">
                    <div className="bg-white p-[2rem] rounded-2xl max-w-[500px] w-[90%] relative">
                        {children}
                        <button className="absolute top-4 right-4 text-[#666] text-[1.5rem] cursor-pointer 
                        p-[0.4rem] transition-all duration-300 rounded-full hover:text-[#333]" onClick={onClose}>
                            <IoMdClose />
                        </button>
                    </div>
                </animated.div>
            )
    );
};

export default BidModal;
