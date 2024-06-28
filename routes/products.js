const express = require('express');
const router = express.Router();
const { getAllProducts, findProducts, getAllProductsByID, addReview, getReviews, checkUserReview } = require("../controllers/products")
const { signUp, signIn } = require("../controllers/user")
const { addtocart, getData, removeData } = require("../controllers/addtocart")
const { createOrder } = require("../controllers/order")
const {getMessages}= require("../controllers/messages")
const authmiddleware = require("../middleware/authmiddleware")

router.route("/product").get(getAllProductsByID)
router.route("/products").get(getAllProducts);
router.route("/products/filters").get(findProducts);


//SignUp
router.post("/signup", signUp);
router.post("/signin", signIn);



//add to cart
router.post("/cart", addtocart);
//get cart data
router.get('/cartdata', getData);
//remove cart data
router.post('/removedata', removeData)

//add review
router.post("/products/:id/review", addReview)
//get review
router.get("/products/:product/getreview", getReviews)

//check user review
router.post("/products/checkuser", checkUserReview)
//order
router.post('/order', authmiddleware, createOrder)


router.get("/chat", getMessages)


module.exports = router