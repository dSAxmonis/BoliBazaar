import React, { useEffect, useRef, useState } from 'react';
import { FaGavel, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { AiOutlineDelete } from 'react-icons/ai';
import { FcGoogle } from "react-icons/fc";

import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin, signup } from '../services/operations/authAPI';

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';

const SignupPage = () => {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {loading} = useSelector((state) => state.profile);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if(file){
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  const removeImage = () => {
    setValue("image", null);
    setPreview(null);
    if(fileInputRef.current){
      fileInputRef.current.value = "";
    }
  }

  const {
      register,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors, isSubmitSuccessful }
  } = useForm();

  const onSubmit = async (data) => {
      setIsLoading(true);
      
      try {
          if(!data.agreeToTerms){
              toast.error("Please agree to the terms and conditions");
              setIsLoading(false);
              return;
          }

          if(data.password !== data.confirmPassword){
              toast.error("Passwords do not match");
              setIsLoading(false);
              return;
          }

          const role = "User";

          const formData = new FormData();

          formData.append("firstName", data.firstName);
          formData.append("lastName", data.lastName);
          formData.append("email", data.email);
          formData.append("password", data.password);
          formData.append("confirmPassword", data.confirmPassword);
          formData.append("role", role);

          if(data.image instanceof File){
              formData.append("image", data.image);
          }

          // console.log("FormData entries:", [...formData.entries()]);
          await dispatch(signup(formData, navigate));
      } catch(error) {
          console.log("ERROR IN SIGNUP:", error);
          toast.error("Something went wrong");
      } finally {
          setIsLoading(false);
      }
  }

  const handleGoogleLogin = () => {
      dispatch(googleLogin(navigate));
  }

  useEffect(() => {
      if(isSubmitSuccessful){
          reset({
              firstName:"",
              lastName:"",
              email:"",
              password:"",
              confirmPassword:"",
              agreeToTerms: false
          });

          setPreview(null);
      }
  }, [isSubmitSuccessful, reset]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 pt-24">
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
            <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
            <p className="text-slate-600 mt-2">Join thousands of collectors and start bidding today</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 relative bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUser className="w-8 h-8 text-gray-400"/>
                    </div>
                  )}
                  
                  {preview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <AiOutlineDelete className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm"
                >
                  {preview ? "Change Photo" : "Upload Photo"}
                </Button>
                
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs"
                    >
                      {errors.firstName.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs"
                    >
                      {errors.lastName.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={`pr-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: "Password must contain uppercase, lowercase, and number",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pr-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => {
                        const passwordValue = watch("password");
                        return value === passwordValue || "Passwords do not match";
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  {...register("agreeToTerms", {
                    required: "You must agree to the terms and conditions"
                  })}
                  className="mt-1"
                  required
                />
                <div className="flex-1">
                  <Label htmlFor="agreeToTerms" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="#" className="text-blue-600 hover:text-blue-700 font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="text-blue-600 hover:text-blue-700 font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                  {errors.agreeToTerms && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.agreeToTerms.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50"
                onClick={() => console.log("Button clicked, agreeToTerms:", watch("agreeToTerms"))}
              >
                {isLoading || loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className='w-full h-[2px] bg-slate-200'></div>

            <Button
              className="w-full text-black font-medium py-3 transition-all duration-200 disabled:opacity-50
              border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
              onClick={handleGoogleLogin}
            >
              {isLoading || loading ? (
                <div className="flex items-center justify-center space-x-5">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing Up with Google...</span>
                </div>
              ) : (
                <div className='flex items-center justify-center space-x-5'>
                  <FcGoogle />
                  <span>Sign Up with Google</span>
                </div>
              )}
            </Button>

            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default SignupPage
