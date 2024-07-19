const User = require("../models/user");
const Product = require("../models/products");
const Cart = require("../models/cart");

const addtocart = async (req, res) => {
  console.log("trigger");
  const { user, item } = req.body;

  try {
    const existingUser = await User.findOne({ _id: user });

    if (!existingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    // const product = await Product.findOne({ _id: productId })
    // if (!product) {
    //     return res.status(400).json({ error: "Product does not exist" })
    // }

    let cart = await Cart.findOne({ user });
    if (!cart) {
      cart = new Cart({ user, item: [], totalPrice: 0 });
    }

    for (const cartItem of item) {
      const { product, quantity } = cartItem;
      const existingProduct = await Product.findOne({ _id: product });

      if (!existingProduct) {
        return res
          .status(400)
          .json({ error: `Product ${product} does not exist` });
      }

      const existingItemIndex = cart.item.findIndex(
        (item) => item.product.toString() === product
      );

      if (existingItemIndex > -1) {
        cart.item[existingItemIndex].quantity = quantity;
        // if (qty > 0) {
        //     cart.item[existingItemIndex].quantity = qty
        // } else {
        //     return res.status(400).json({ error: "Quanity is less or equal to 0" })
        // }
      } else {
        cart.item.push({ product, quantity });
      }
    }

    let totalPrice = 0;

    for (let cartItem of cart.item) {
      const product = await Product.findById(cartItem.product);
      if (product) {
        totalPrice += product.price * cartItem.quantity;
      }
    }
    cart.totalPrice = totalPrice;

    await cart.save();
    res.status(200).json({ message: "Product addded to the cart", cart });
  } catch (error) {
    res.status(400).json({ error: "Server Error" });
  }
};

const getData = async (req, res) => {
  try {
    const { user } = req.query;
    console.log(user);

    const cart = await Cart.findOne({ user }).populate("item");

    if (!cart || cart.item.length === 0) {
      return res.status(200).json({ user:"", item: []});
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

const removeData = async (req, res) => {
  try {
    const { user, item } = req.body;

    const cart = await Cart.findOne({ user });
    if (!cart) {
      return res.status(404).json({ error: "User does not exist" });
    }

    //     const itemIndex = cart.item.findIndex(
    //         (item) => item.product.toString() === productId
    //     )

    //     if (itemIndex == -1) {
    //         return res.status(404).json({ error: "Item not found in cart" })
    //     }

    //     cart.item.splice(itemIndex, 1);

    // //        const updateCart = await Cart.findByIdAndUpdate(
    // //        cart._id,
    //  //       {
    //  //           $pull: { 'item': { 'product': productId } },
    //  ///       },
    //  //       { new: true }
    //  //   )

    //     let totalPrice = 0;
    //     for (let item of cart.item) {
    //         const product = await Product.findById(item.product);
    //         if (product) {
    //             totalPrice += product.price * item.quantity;
    //         }
    //     }
    //     cart.totalPrice = totalPrice;

    cart.item = item;

    const newCart = await cart.save();

    console.log("New Cart", newCart);

    res.status(200).json({ message: "Product removed", newCart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { addtocart, getData, removeData };
