import { useState, useEffect } from "react";

const CountdownTimer = ({ auctionEndTime }) => {
    const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const endTime = new Date(auctionEndTime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        } else {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 }; // Auction ended
        }
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [auctionEndTime]);

    return (
        <div className="font-medium">
            {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
            {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </div>
    );
};

export default CountdownTimer;
