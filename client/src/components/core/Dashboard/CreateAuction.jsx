import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createAuction, fetchCategories } from '../../../services/operations/auctionAPI';

import { AiFillProduct } from "react-icons/ai";
import { AiOutlineDelete } from 'react-icons/ai';
import { MdOutlineFileUpload } from "react-icons/md";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';

const CreateAuction = () => {

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState();

    const {
        register,
        reset,
        setValue,
        handleSubmit,
        formState: { errors, isSubmitSuccessful }
    } = useForm();

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

    const handleDateChange = (e) => {
        const date = e.target.value;
        const now = new Date(); 
        
        if (!date) return;

        const formattedDateTime = new Date(`${date}T${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}Z`).toISOString();

        setValue("auctionDate", formattedDateTime);
    };

    const onSubmit = async (data) => {
        try{
            setLoading(true);
            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("category", data.category);
            formData.append("startingPrice", data.startingPrice);
            formData.append("auctionDate", data.auctionDate);

            if(data.image instanceof File){
                formData.append("image", data.image);
            }

            const response = await createAuction(formData, navigate);
        }
        catch(error){
            console.error("Error submitting form:", error.response?.data || error.message);
            alert("Failed to create auction. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(isSubmitSuccessful){
            reset({
                title:"",
                description:"",
                category:"",
                startingPrice:"",
                auctionDate:"",
            })

            setPreview(null);
        }
    })

    useEffect(() => {
        const getCategories = async () => {
            setLoading(true);
            try {
                const categories = await fetchCategories();
                if (Array.isArray(categories) && categories.length > 0) {
                    setCategories(categories);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            }
            setLoading(false);
        };
        getCategories();
    }, []);

    return(
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen"
        >
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Create New Auction
                    </h1>
                    <p className="text-gray-600">Fill out the details below to create your auction</p>
                </motion.div>

                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-2xl font-bold text-gray-800">Auction Details</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-4"
                            >
                                <Label className="text-lg font-semibold text-gray-700">Product Image</Label>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-48 h-48 relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                <AiFillProduct className="w-12 h-12 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500 text-center">Upload Product Image</p>
                                                <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                                        </div>
                                        )}
                                        
                                        {preview && (
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                        type="button"
                                        onClick={removeImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                <AiOutlineDelete className="w-4 h-4" />
                                            </motion.button>
                                        )}
                        </div>
    
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-2"
                                    >
                                        <MdOutlineFileUpload />
                                        {preview ? "Change Image" : "Upload Image"}
                                    </Button>
                                    
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                        />
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
                                        Product Title
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter product title"
                                        className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                                            errors.title ? "border-red-500 focus:ring-red-500" : ""
                                        }`}
                                        {...register('title', {required: "Title is required"})}
                                    />
                                    {errors.title && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-sm"
                                        >
                                            {errors.title.message}
                                        </motion.p>
                                    )}
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="category" className="text-lg font-semibold text-gray-700">
                                        Category 
                                            <span className='text-red-600 font-semibold text-xs ml-4'>
                                                Cannot be changed Later
                                            </span>
                                    </Label>
                                <select
                                    id="category"
                                    defaultValue=""
                                        {...register("category", {required: "Category is required"})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="" disabled>Choose a Category</option>
                                        {!loading && categories.map((category, index) => (
                                            <option key={index} value={category?._id}>
                                                {category?.name}
                                            </option>
                                        ))}
                                </select>
                                    {errors.category && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-sm"
                                        >
                                            {errors.category.message}
                                        </motion.p>
                                    )}
                                </motion.div>
                        </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="description" className="text-lg font-semibold text-gray-700">
                                    Product Description
                                </Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe your product in detail..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none min-h-32"
                                    {...register('description', {required: "Description is required"})}
                                />
                                {errors.description && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-500 text-sm"
                                    >
                                        {errors.description.message}
                                    </motion.p>
                                )}
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="startingPrice" className="text-lg font-semibold text-gray-700">
                                        Starting Price ($)
                                    </Label>
                                    <Input
                                        id="startingPrice"
                                    type="number"
                                        min={100}
                                        placeholder="Enter starting price"
                                        className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                                            errors.startingPrice ? "border-red-500 focus:ring-red-500" : ""
                                        }`}
                                    {...register('startingPrice', {
                                            required: "Starting price is required",
                                        min: {
                                            value: 100,
                                                message: "Starting price must be at least $100"
                                        }
                                    })}
                                />
                                    {errors.startingPrice && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-sm"
                                        >
                                            {errors.startingPrice.message}
                                        </motion.p>
                                    )}
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="auctionDate" className="text-lg font-semibold text-gray-700">
                                        Auction End Date
                                    </Label>
                                    <Input
                                        id="auctionDate"
                                        type="date"
                                        min={new Date().toISOString().split("T")[0]}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                        onChange={handleDateChange}
                                    />
                                    {selectedDate && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-blue-600 text-sm"
                                        >
                                            Selected Date: {selectedDate}
                                        </motion.p>
                                    )}
                                </motion.div>
                        </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="pt-6"
                            >
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Creating Auction...</span>
                                        </div>
                                    ) : (
                                        "Create Auction"
                                    )}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
};

export default CreateAuction;