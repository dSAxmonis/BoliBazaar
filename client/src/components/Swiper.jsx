import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { Pagination, EffectCoverflow } from "swiper/modules";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";

export default function SwiperComp({auctions}) {

    const navigate = useNavigate();

  return (
    <div className="w-screen px-4">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        spaceBetween={20}
        loop={false}
        pagination={{ clickable: true }}
        coverflowEffect={{
          rotate: 10,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        modules={[Pagination, EffectCoverflow]}
        className="w-screen"
      >
        {auctions.map((auction, index) => {

            return(
                <SwiperSlide
                    key={index}
                    className="bg-[#1E1E1E] rounded-2xl shadow-lg p-3 text-center mb-10 relative group"
                    style={{ width: "clamp(220px, 25vw, 320px)" }}
                >
                    <img 
                        src={auction?.images?.url} 
                        alt={auction?.title} 
                        className="w-full bg-white h-[350px] object-cover rounded-3xl" 
                    />
                    <h3 className="text-lg font-semibold mt-2">{auction.title}</h3>
                    <p className="text-gray-600">{auction.startingPrice}</p>
                    
                    <div className="w-fit px-4 bg-black/30 rounded-lg absolute text-sm top-5 right-5 h-fit py-1">
                        <CountdownTimer auctionEndTime={auction.auctionEndTime}/>
                    </div>

                    <button 
                        className="w-fit px-4 bg-[#DEE8E8] font-medium rounded-lg absolute text-base 
                        h-fit py-2 bottom-22 left-1/2 transform -translate-x-1/2 opacity-0 
                        translate-y-5 group-hover:translate-y-0 group-hover:opacity-100 
                        transition-all duration-500 hover:bg-[#E2FE26] cursor-pointer"
                        onClick={() => navigate(`/auction/${auction._id}`)}
                    >
                        Place Bid
                    </button>
                </SwiperSlide>

            )
        })}
      </Swiper>
    </div>
  );
}
