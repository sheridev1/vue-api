const { query } = require("express");
const Product = require("../models/products");
const Review = require("../models/review");
const multer = require('multer');
const path = require('path');




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Adjust destination folder as per your setup
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage: storage });


//add products
const addProduct = async (req, res) => {
    try {
        const { name, price, featured, category, company } = req.body;

        const newProduct = new Product({
            name,
            price,
            featured,
            category,
            company
        });

        await newProduct.save();

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


}



//fetch company
const getmetaData = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        const companies = await Product.distinct('company');

        res.status(200).json({ categories, companies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
//delete product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



//edit product 
const editProduct=async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
    
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.featured = req.body.featured !== undefined ? req.body.featured : product.featured;
        product.category = req.body.category || product.category;
        product.company = req.body.company || product.company;
    
        const updatedProduct = await product.save();
        res.json(updatedProduct);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
}


const getAllProductsByID = async (req, res) => {
    const myData = await Product.findById(req.query.id).populate('reviews');

    res.status(200).json({ myData })
}

const getAllProducts = async (req, res) => {
    const myData = await Product.find({}).populate('reviews');

    res.status(200).json({ myData })
}
const findProducts = async (req, res) => {
    const { category, company, featured, name, sort, select, id } = req.query;
    let queryObject = {};

    if (category) {
        queryObject.category = category;
    }

    if (company) {
        queryObject.company = company;
    }

    if (featured) {
        queryObject.featured = featured;
    }

    if (name) {
        queryObject.name = { $regex: name, $options: "i" };
    }

    let apiData = Product.find(queryObject).populate('reviews');

    if (sort) {
        let sortFix = sort.replace(",", " ");
        apiData = apiData.sort(sortFix);
    }

    if (select) {
        let selectFix = select.split(",").join(" ");
        apiData = apiData.select(selectFix);
    }

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    try {
        const filteredData = await apiData.skip(skip).limit(limit);
        console.log("Filtered Data:", filteredData);
        res.status(200).json({ filteredData, nbHits: filteredData.length });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}



//add review
const addReview = async (req, res) => {
    const { productId, user, rating, comment } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(201).json({ message: 'Product not found' });
        }

        const existingReview = await Review.findOne({ user: user, product: productId });
        if (existingReview) {
            return res.status(201).json({ message: 'You have already reviewed this product' });
        }

        const review = new Review({ user: user, product: productId, rating, comment });
        await review.save();

        product.reviews.push(review._id);
        product.numberOfReviews = product.reviews.length;
        product.averageRating = (product.averageRating * (product.numberOfReviews - 1) + rating) / product.numberOfReviews;
        await product.save();

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};



const getReviews = async (req, res) => {
    const { product } = req.params;
    console.log(product)
    try {
        const review = await Review.find({ product }).populate('user');

        res.status(201).json({ message: 'Reviews', review })
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching reviews', error: error.message });
    }
}



const checkUserReview = async (req, res) => {
    try {
        const { product, user } = req.body;
        const existingReview = await Review.findOne({ product, user });
        if (existingReview) {
            return res.json({ message: "Already entered", hasReviewed: true });
        } else {
            return res.json({ message: "No entered", hasReviewed: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = { getAllProducts, findProducts, getAllProductsByID, addReview, getReviews, checkUserReview, addProduct, upload, getmetaData, deleteProduct, editProduct }