const Product = require("../Model/productModel");
// const { getIo } = require("../../../services/new-socket");
// const io = getIo();
const socketServer = require("../../../services/index");
const notificationNamespace = socketServer.notificationNamespace();

const successResponse = (res, data, statusCode = 200, message = "Success") => {
  res.status(statusCode).json({ message, data });
};

const errorResponse = (res, statusCode = 500, message = "Server Error") => {
  res.status(statusCode).json({ message });
};

//=============== Add Product ================//

const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;

    const newProduct = await createProduct(name, description, price, quantity);
    notificationNamespace.emit("notification", {
      type: "product-added",
      data: newProduct,
      userId: req.user._id,
    });

    sendProductAddedResponse(res, newProduct);
  } catch (error) {
    console.error("Error adding product:", error.message);
    sendErrorResponse(res, "Failed to add product");
  }
};

const createProduct = async (name, description, price, quantity) => {
  const newProduct = new Product({ name, description, price, quantity });
  await newProduct.save();
  return newProduct;
};

const sendProductAddedResponse = (res, product) => {
  successResponse(res, product, 201, "Product added successfully");
};

const sendErrorResponse = (res, errorMessage) => {
  errorResponse(res, errorMessage);
};

//=============== Get All Product Details ================//

const getAllProducts = async (req, res) => {
  Product.find({ isDeleted: false })
    .then((products) => {
      if (products.length === 0) {
        return successResponse(res, [], 200, "No products found");
      }
      successResponse(res, products);
    })
    .catch((error) => {
      console.error("Error retrieving products:", error.message);
      errorResponse(res, "Failed to retrieve products");
    });
};

//================ Get Product By Product Id =====================//

const getProduct = async (req, res, next) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return next({ statusCode: 404, message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

//================== Edit PRoduct Details ==================//

const updateProduct = async (req, res) => {
  const { name, description, price, quantity } = req.body;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    Object.assign(product, { name, description, price, quantity });

    product = await product.save();
    // io.emit("notification", { type: "product-updated", data: product });

    successResponse(res, product, 200, "Product updated successfully");
  } catch (err) {
    console.error("Error updating product:", err.message);
    errorResponse(res, 500, "Failed to update product");
  }
};

//=================== Delete Product From the Product List ================//

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
      isDeleted: true,
    });

    if (!updatedProduct) {
      return errorResponse(res, 404, "Product not found");
    }

    notificationNamespace.emit("notification", {
      type: "product-deleted",
      data: updatedProduct,
      userId: req.user._id,
    });
    successResponse(res, null, 200, "Product removed successfully");
  } catch (err) {
    console.error("Error deleting product:", err.message);
    errorResponse(res, 500, "Failed to delete product");
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
