import { useEffect, useState } from "react";
import { createCategory, fetchCategories } from '../../../services/operations/auctionAPI';
import EmptyLoader from "../../EmptyLoader";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const CreateCategory = () => {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        reset,
        handleSubmit,
        formState: {errors, isSubmitSuccessful},
    } = useForm();

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
    },[]);

    const onSubmit = async (data) => {
        try{                   
            const response = await createCategory(data);

            if (response?.data?.success) {
    
                setCategories((prevCategories) => [
                    ...prevCategories,
                    { name: data.name }
                ]);
    
                reset({
                    name: "",
                    description: ""
                });
            }
        }
        catch(error){
            console.error("Error submitting form:", error.response?.data || error.message);
            toast.error("Failed to create Category. Please try again.");
        }
    }

    return(
        <div className="flex items-center flex-col w-full min-h-[575px] overflow-y-auto bg-white text-3xl p-10">
            <h1 className="bg-[#F2EFE7] w-full px-8 py-6 rounded-4xl text-center 
            font-sans uppercase font-bold text-6xl">Create Category</h1>

            <div className="flex flex-col items-center w-full gap-5">

                <form onSubmit={handleSubmit(onSubmit)} className="w-[70%]">

                    <div className='flex flex-col gap-2 mt-5'>
                        <label htmlFor='name' className="text-base text-gray-500 font-medium">Name of Category (Must be unique)</label>
                        <div className="flex items-center rounded-lg px-4 py-2 w-full gap-3 bg-white border-2 border-gray-300">
                            <div className="flex flex-col w-full gap-1">
                                <input
                                    required
                                    type="name"
                                    name='name'
                                    id='name'
                                    className="outline-none text-lg text-black bg-transparent w-full"
                                    placeholder="Enter Name"
                                    {...register('name', {required:true}) }
                                />
                                {errors.name && <span className="text-red-500 text-sm mt-1 block">Please enter Name of Category</span>}
                            </div>
                        </div>
                    </div>

                    <div className='gap-2 mt-5'>
                        <label htmlFor='description' className="text-base text-gray-500 font-medium">Description of Category</label>
                        <div className="rounded-lg px-4 py-2 w-full gap-3 bg-white border-2 border-gray-300">
                            
                            <textarea
                                required
                                name='description'
                                id='description'
                                className="outline-none resize-none min-h-20 text-lg text-black bg-transparent w-full"
                                placeholder="Enter Description"
                                {...register('description', {required:true}) }
                            ></textarea>
                            {errors.description && <span className="text-red-500 text-sm mt-1 block">Please enter Description</span>}
                        
                        </div>
                    </div>

                    <button type='submit' disabled={loading}
                    className='text-base mt-5 px-6 py-2 bg-[#2973B2] text-white hover:bg-blue-600 transition-all duration-300 rounded-lg cursor-pointer'>
                        {
                            loading ? "Creating..." : "Create Category"
                        }
                    </button>

                </form>

                <div className="w-[70%] gap-5 bg-[#F2EFE7] py-5 rounded-xl px-10 flex flex-col justify-center items-center">
                    <h1 className="font-sans font-bold text-xl">Some Famous Categories already used:</h1>
                    <div className="flex flex-wrap gap-2">
                        {
                            categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <>
                                            <p key={index} 
                                                className="text-lg bg-white rounded-lg px-4 py-2">
                                                {category.name}
                                            </p>
                                        </>
                                    ))
                            ) : (
                                <div className="flex flex-col gap-1 items-center">
                                    <EmptyLoader />
                                    <p>No Categories Yet!!</p>
                                </div>
                            )
                        }
                    </div>
                </div>

            </div>
        </div>
    )
};

export default CreateCategory;