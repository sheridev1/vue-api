const express = require('express');
const router = express.Router();
const { getAllProducts, findProducts, getAllProductsByID, addReview, getReviews, checkUserReview, addProduct, upload, getmetaData, deleteProduct, editProduct } = require("../controllers/products")
const { signUp, signIn, getAllUsers, deleteUser,EditUser } = require("../controllers/user")
const { addtocart, getData, removeData } = require("../controllers/addtocart")
const { createOrder, getAllOrders } = require("../controllers/order")
const { getMessages } = require("../controllers/messages")
const authmiddleware = require("../middleware/authmiddleware")
const { checkRole }=require("../middleware/roleMiddleware")

router.route("/product").get(getAllProductsByID)
router.route("/products").get(getAllProducts);
router.route("/products/filters").get(findProducts);
//add product
router.post('/products/add', addProduct);
//get meta data
router.get("/products/metadata", getmetaData)
//delete product
router.delete("/products/:id",checkRole(['admin']) ,deleteProduct);
//edit product
router.put("/products/:id", checkRole(['admin','editor']),editProduct);



//SignUp
router.post("/signup", signUp);
router.post("/signin", signIn);
//getUser
router.get("/getusers", getAllUsers)
//deleteUser
router.delete("/user/:id",checkRole(['admin']),deleteUser)
//Edit User
router.put("/user/:id",checkRole(['admin','editor']),EditUser)

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
router.post('/order', createOrder)
//getAllOrders
router.get('/order/getOrders',getAllOrders )

//chat
router.get("/chat", getMessages)


module.exports = router