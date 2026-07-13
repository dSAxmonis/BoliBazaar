const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        // Create new category
        await Category.create({ name, description });

        return res.status(201).json({
            success: true,
            message: "Category created successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.fetchAllCategory = async (req, res) => {
    try{
        const categories = await Category.find({})
            .select("name")

        if(!categories){
            return res.status(400).json({
                success:true,
                message:"No Categories Found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Categories returned successfully",
            categories
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.fetchAllCategoryPosts = async (req, res) => {
    try{
        const categories = await Category.find({})
            .select("name description")
            .populate("products")

        if(!categories){
            return res.status(400).json({
                success:true,
                message:"No Categories Found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Categories returned successfully",
            categories
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}