import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyEmail } from "../services/operations/authAPI";
import { FaGavel, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hasVerified = useRef(false);
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hasVerified.current) {
      return;
    }
    hasVerified.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    dispatch(verifyEmail(token, navigate, setStatus, setMessage));
  }, [token, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <FaGavel className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Auctioneer
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800">
              {status === "verifying" && "Verifying Email"}
              {status === "success" && "Email Verified"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              {status === "verifying" && "Please wait while we verify your account..."}
              {status === "success" && "Thank you for verifying your email."}
              {status === "error" && "Something went wrong during verification."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            {status === "verifying" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Validating credentials...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <FaCheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
                <p className="text-green-600 font-medium">{message}</p>
                <p className="text-slate-500 text-sm">Redirecting to login page...</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <FaExclamationCircle className="h-16 w-16 text-red-500" />
                <p className="text-red-600 font-medium">{message}</p>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 mt-4"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
