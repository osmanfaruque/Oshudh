require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Firebase Admin SDK
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT;

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      "https://oshudh-a12.web.app",
      "https://oshudh-a12.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// JWT Verification Middleware
const verifyToken = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No valid authorization token provided",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

// Role-based middleware
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const db = getDB();
      const user = await db
        .collection("users")
        .findOne({ email: req.user.email });

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: "Access denied. Insufficient permissions.",
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
};

// MongoDB connection
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db = client.db("oshudh_db");;

const connectDB = async () => {
  try {
    db = client.db("oshudh_db");
    try {
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
      await db.collection("medicines").createIndex({ itemName: 1 });
      await db.collection("medicines").createIndex({ category: 1 });
      await db.collection("medicines").createIndex({ sellerEmail: 1 });
      await db.collection("cart").createIndex({ userEmail: 1 });
      await db.collection("orders").createIndex({ userEmail: 1 });
      await db.collection("orders").createIndex({ sellerEmail: 1 });
      await db
        .collection("categories")
        .createIndex({ categoryName: 1 }, { unique: true });
    } catch (indexError) {}
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};

// =============== MEDICINE FUNCTIONS ===============
const getMedicines = async (req, res) => {
  try {
    const db = getDB();
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      sortBy = "itemName",
      sortOrder = "asc",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const medicines = await db
      .collection("medicines")
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("medicines").countDocuments(query);

    res.json({
      success: true,
      data: medicines,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: medicines.length,
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const medicine = await db
      .collection("medicines")
      .findOne({ _id: new ObjectId(id) });

    if (!medicine) {
      return res
        .status(404)
        .json({ success: false, error: "Medicine not found" });
    }

    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addMedicine = async (req, res) => {
  try {
    const db = getDB();
    const medicineData = {
      ...req.body,
      sellerEmail: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("medicines").insertOne(medicineData);
    res.json({
      success: true,
      data: { _id: result.insertedId, ...medicineData },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const medicine = await db
      .collection("medicines")
      .findOne({ _id: new ObjectId(id), sellerEmail: req.user.email });

    if (!medicine) {
      return res
        .status(404)
        .json({ success: false, error: "Medicine not found or unauthorized" });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await db
      .collection("medicines")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    res.json({ success: true, message: "Medicine updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const result = await db
      .collection("medicines")
      .deleteOne({ _id: new ObjectId(id), sellerEmail: req.user.email });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Medicine not found or unauthorized" });
    }

    res.json({ success: true, message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDiscountProducts = async (req, res) => {
  try {
    const db = getDB();
    const discountProducts = await db
      .collection("medicines")
      .find({ discountPercentage: { $gt: 0 } })
      .sort({ discountPercentage: -1 })
      .limit(20)
      .toArray();

    res.json({ success: true, data: discountProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== CATEGORY FUNCTIONS ===============
const getCategories = async (req, res) => {
  try {
    const db = getDB();
    const categories = await db.collection("categories").find({}).toArray();

    for (let category of categories) {
      const categoryNameTrimmed = category.categoryName.trim();
      const count = await db.collection("medicines").countDocuments({
        category: {
          $in: [category.categoryName, categoryNameTrimmed],
        },
      });
      category.medicineCount = count;
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMedicinesByCategory = async (req, res) => {
  try {
    const db = getDB();
    const { categoryName } = req.params;
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "itemName",
      sortOrder = "asc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const categoryRegex = new RegExp(`^${categoryName}$`, "i");
    
    // Build query with category and search
    const query = { category: categoryRegex };
    
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const medicines = await db
      .collection("medicines")
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db
      .collection("medicines")
      .countDocuments(query);

    res.json({
      success: true,
      data: medicines,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: medicines.length,
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== USER FUNCTIONS ===============
const saveUser = async (req, res) => {
  try {
    const db = getDB();
    
    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: req.user.email });


    let role;
    if (req.body.role) {
      role = req.body.role;
    } else if (existingUser) {
      role = existingUser.role;
    } else {
      role = "user";
    }

    const userData = {
      ...req.body,
      email: req.user.email,
      uid: req.user.uid,
      name: req.user.name,
      role: role,
      createdAt: existingUser ? existingUser.createdAt : new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("users")
      .updateOne(
        { email: req.user.email },
        { $set: userData },
        { upsert: true }
      );
    
    res.json({ 
      success: true, 
      message: "User saved successfully", 
      data: userData 
    });
  } catch (error) {
    console.error("Save user error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const db = getDB();
    
    
    const user = await db
      .collection("users")
      .findOne({ email: req.user.email });

    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User profile not found. Please complete your registration.",
        shouldRegister: true
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const db = getDB();
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await db
      .collection("users")
      .updateOne({ email: req.user.email }, { $set: updateData });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== CART FUNCTIONS ===============
const addToCart = async (req, res) => {
  try {
    const db = getDB();
    const cartItem = {
      ...req.body,
      userEmail: req.user.email,
      createdAt: new Date(),
    };

    const existingItem = await db
      .collection("cart")
      .findOne({ userEmail: req.user.email, medicineId: cartItem.medicineId });

    if (existingItem) {
      await db.collection("cart").updateOne(
        { _id: existingItem._id },
        {
          $inc: { quantity: cartItem.quantity || 1 },
          $set: {
            currentPrice: cartItem.currentPrice || cartItem.perUnitPrice,
            perUnitPrice: cartItem.perUnitPrice,
            discountPercentage: cartItem.discountPercentage || 0,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await db.collection("cart").insertOne(cartItem);
    }

    res.json({ success: true, message: "Added to cart successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCartItems = async (req, res) => {
  try {
    const db = getDB();
    const cartItems = await db
      .collection("cart")
      .find({ userEmail: req.user.email })
      .toArray();

    res.json({ success: true, data: cartItems });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { quantity } = req.body;

    await db
      .collection("cart")
      .updateOne(
        { _id: new ObjectId(id), userEmail: req.user.email },
        { $set: { quantity } }
      );

    res.json({ success: true, message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    await db.collection("cart").deleteOne({
      _id: new ObjectId(id),
      userEmail: req.user.email,
    });

    res.json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const db = getDB();
    await db.collection("cart").deleteMany({ userEmail: req.user.email });
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== PAYMENT FUNCTIONS ===============
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      metadata: {
        userEmail: req.user.email,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent creation failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const saveOrder = async (req, res) => {
  try {
    const db = getDB();
    const orderData = {
      ...req.body,
      userEmail: req.user.email,
      status: req.body.status,
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(orderData);

    // Clear cart after successful order
    await db.collection("cart").deleteMany({ userEmail: req.user.email });

    res.json({ success: true, orderId: result.insertedId });
  } catch (error) {
    console.error("Save order error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const db = getDB();
    const payments = await db.collection("orders").find({}).toArray();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUserPaymentHistory = async (req, res) => {
  try {
    const db = getDB();
    const payments = await db
      .collection("orders")
      .find({ userEmail: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("Get user payment history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const db = getDB();
    const { orderId, status } = req.body;
    
    const result = await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(orderId), userEmail: req.user.email },
        { $set: { status, updatedAt: new Date() } }
      );
      
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSellerPaymentHistory = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10, search, status, dateRange } = req.query;
    const skip = (page - 1) * limit;
    let query = { sellerEmail: req.user.email };
    if (status && status !== "all") {
      query.status = status;
    }
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      if (startDate && endDate) {
        query.orderDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    // Add search filter
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { transactionId: { $regex: search, $options: "i" } },
        { buyerEmail: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } },
        { "medicines.itemName": { $regex: search, $options: "i" } },
        { "medicines.genericName": { $regex: search, $options: "i" } },
      ];
    }

    const total = await db.collection("orders").countDocuments(query);
    const payments = await db
      .collection("orders")
      .find(query)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Calculate statistics
    const stats = {
      total,
      paid: await db
        .collection("orders")
        .countDocuments({ ...query, status: "paid" }),
      pending: await db
        .collection("orders")
        .countDocuments({ ...query, status: "pending" }),
      totalEarnings:
        (
          await db
            .collection("orders")
            .aggregate([
              { $match: { ...query, status: "paid" } },
              { $group: { _id: null, total: { $sum: "$sellerEarning" } } },
            ])
            .toArray()
        )[0]?.total,
      pendingEarnings:
        (
          await db
            .collection("orders")
            .aggregate([
              { $match: { ...query, status: "pending" } },
              { $group: { _id: null, total: { $sum: "$sellerEarning" } } },
            ])
            .toArray()
        )[0]?.total,
      totalCommission:
        (
          await db
            .collection("orders")
            .aggregate([
              { $match: { ...query, status: "paid" } },
              { $group: { _id: null, total: { $sum: "$commission" } } },
            ])
            .toArray()
        )[0]?.total,
    };

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== DASHBOARD FUNCTIONS ===============
const getUserDashboard = async (req, res) => {
  try {
    const db = getDB();
    const orderCount = await db
      .collection("orders")
      .countDocuments({ userEmail: req.user.email });
    const totalSpent = await db
      .collection("orders")
      .aggregate([
        { $match: { userEmail: req.user.email, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    res.json({
      success: true,
      data: {
        orderCount,
        totalSpent: totalSpent[0]?.total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== ADMIN FUNCTIONS ===============
const getAdminDashboard = async (req, res) => {
  try {
    const db = getDB();

    // Total Revenue
    const totalRevenue = await db
      .collection("orders")
      .aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    // Pending Revenue
    const pendingRevenue = await db
      .collection("orders")
      .aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    // User counts
    const totalUsers = await db.collection("users").countDocuments({});
    const totalSellers = await db
      .collection("users")
      .countDocuments({ role: "seller" });
    const totalMedicines = await db.collection("medicines").countDocuments({});
    const totalOrders = await db.collection("orders").countDocuments({});

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total,
        pendingRevenue: pendingRevenue[0]?.total,
        totalUsers,
        totalSellers,
        totalMedicines,
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const db = getDB();

    const adminUser = await db
      .collection("users")
      .findOne({ email: req.user.email });
    if (!adminUser || adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied. Admin role required." });
    }

    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role && role !== "all") {
      query.role = role;
    }

    const users = await db.collection("users").find(query).toArray();

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { role } = req.body;

    const adminUser = await db
      .collection("users")
      .findOne({ email: req.user.email });
    if (!adminUser || adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, error: "Access denied. Admin role required." });
    }

    if (!["admin", "seller", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Must be admin, seller, or user",
      });
    }

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { role, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { userId: id, newRole: role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const db = getDB();
    const categories = await db.collection("categories").find({}).toArray();

    // Count medicines for each category
    for (let category of categories) {
      const count = await db.collection("medicines").countDocuments({
        category: category.categoryName,
      });
      category.medicineCount = count;
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const db = getDB();
    const categoryData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("categories").insertOne(categoryData);

    res.json({
      success: true,
      data: { _id: result.insertedId, ...categoryData },
      message: "Category added successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    res.json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    // Check if category has medicines
    const medicineCount = await db.collection("medicines").countDocuments({
      categoryId: id,
    });

    if (medicineCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete category with existing medicines",
      });
    }

    await db.collection("categories").deleteOne({ _id: new ObjectId(id) });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10, status = "" } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("orders").countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: payments.length,
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );

    res.json({ success: true, message: "Payment status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    console.log("Sales report query params:", { startDate, endDate, page, limit });

    const query = { status: "paid" };

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    console.log("Sales query:", query);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sales = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    console.log("Found orders:", sales.length);
    console.log("Sample order:", sales[0] ? JSON.stringify(sales[0], null, 2) : "No orders found");

    // Transform orders to sales format
    const transformedSales = sales.map(order => {
      // Extract sales data from order items
      const salesItems = [];
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          salesItems.push({
            _id: order._id,
            orderId: order.transactionId || order._id,
            medicineName: item.medicine?.medicineName || item.medicineName,
            genericName: item.medicine?.genericName || item.genericName,
            company: item.medicine?.company || item.company,
            category: item.medicine?.category || item.category,
            quantity: item.quantity,
            unitPrice: item.perUnitPrice || item.price,
            totalPrice: (item.quantity) * (item.perUnitPrice || item.price),
            buyerName: order.userName,
            buyerEmail: order.userEmail,
            sellerName: item.medicine?.sellerName,
            sellerEmail: item.medicine?.sellerEmail,
            saleDate: order.createdAt,
            paymentStatus: order.status
          });
        });
      }
      
      return salesItems;
    }).flat();

    console.log("Transformed sales count:", transformedSales.length);
    console.log("Sample transformed sale:", transformedSales[0] ? JSON.stringify(transformedSales[0], null, 2) : "No transformed sales");

    const total = await db.collection("orders").countDocuments(query);

    // Calculate total revenue
    const totalRevenue = await db
      .collection("orders")
      .aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    res.json({
      success: true,
      data: transformedSales,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: transformedSales.length,
        totalCount: total,
      },
      totalRevenue: totalRevenue[0]?.total,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAdvertisements = async (req, res) => {
  try {
    const db = getDB();
    const advertisements = await db
      .collection("advertisements")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: advertisements });
  } catch (error) {
    console.error("getAdvertisements error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//active advertisements
const getActiveAdvertisements = async (req, res) => {
  try {
    const db = getDB();
    const activeAds = await db
      .collection("advertisements")
      .find({
        isActive: true,
        adminStatus: "approved",
      })
      .sort({ priority: 1, activatedAt: -1 })
      .toArray();

    res.json({ success: true, data: activeAds });
  } catch (error) {
    console.error("getActiveAdvertisements error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const toggleAdvertisement = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { action } = req.body;

    const ad = await db
      .collection("advertisements")
      .findOne({ _id: new ObjectId(id) });

    if (!ad) {
      return res
        .status(404)
        .json({ success: false, error: "Advertisement not found" });
    }

    let updateData = { updatedAt: new Date() };

    switch (action) {
      case "approve":
        updateData.adminStatus = "approved";
        updateData.approvedAt = new Date();
        break;
      case "reject":
        updateData.adminStatus = "rejected";
        updateData.rejectedAt = new Date();
        updateData.isActive = false;
        break;
      case "activate":
        if (ad.adminStatus !== "approved") {
          return res.status(400).json({
            success: false,
            error: "Advertisement must be approved before activation",
          });
        }
        updateData.isActive = true;
        updateData.activatedAt = new Date();
        break;
      case "deactivate":
        updateData.isActive = false;
        updateData.deactivatedAt = new Date();
        break;
      default:
        return res.status(400).json({
          success: false,
          error:
            "Invalid action. Use: approve, reject, activate, or deactivate",
        });
    }

    await db
      .collection("advertisements")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    const actionMessages = {
      approve: "Advertisement approved successfully",
      reject: "Advertisement rejected",
      activate: "Advertisement activated and added to homepage slider",
      deactivate: "Advertisement deactivated and removed from slider",
    };

    res.json({
      success: true,
      message: actionMessages[action],
      data: { ...ad, ...updateData },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== ADMIN DASHBOARD STATS FUNCTION ===============
const getAdminStats = async (req, res) => {
  try {
    const db = getDB();

    // Check if user exists and has admin role
    const user = await db
      .collection("users")
      .findOne({ email: req.user.email });

    if (!user) {
      return res.status(403).json({
        success: false,
        error: "User not found in database",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin role required.",
      });
    }

    // Calculate total sales from orders
    const salesPipeline = [
      {
        $match: { status: { $in: ["paid", "pending"] } },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ];

    const salesStats = await db
      .collection("orders")
      .aggregate(salesPipeline)
      .toArray();

    // Get total users, sellers, medicines count
    const totalUsers = await db.collection("users").countDocuments();
    const totalSellers = await db
      .collection("users")
      .countDocuments({ role: "seller" });
    const totalMedicines = await db.collection("medicines").countDocuments();
    const totalOrders = await db.collection("orders").countDocuments();

    // Calculate revenue
    let totalSalesRevenue = 0;
    let paidTotal = 0;
    let pendingTotal = 0;

    salesStats.forEach((stat) => {
      totalSalesRevenue += stat.total;
      if (stat._id === "paid") {
        paidTotal = stat.total;
      } else if (stat._id === "pending") {
        pendingTotal = stat.total;
      }
    });

    res.json({
      success: true,
      data: {
        totalSalesRevenue,
        paidTotal,
        pendingTotal,
        totalUsers,
        totalSellers,
        totalMedicines,
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// =============== SELLER FUNCTIONS ===============
const getSellerDashboard = async (req, res) => {
  try {
    const db = getDB();

    // Seller's total revenue
    const totalRevenue = await db
      .collection("orders")
      .aggregate([
        { $match: { sellerEmail: req.user.email, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    // Pending revenue
    const pendingRevenue = await db
      .collection("orders")
      .aggregate([
        { $match: { sellerEmail: req.user.email, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    // Medicine count
    const totalMedicines = await db.collection("medicines").countDocuments({
      sellerEmail: req.user.email,
    });

    // Order count
    const totalOrders = await db.collection("orders").countDocuments({
      sellerEmail: req.user.email,
    });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total,
        pendingRevenue: pendingRevenue[0]?.total,
        totalMedicines,
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSellerMedicines = async (req, res) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const medicines = await db
      .collection("medicines")
      .find({ sellerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection("medicines").countDocuments({
      sellerEmail: req.user.email,
    });

    res.json({
      success: true,
      data: medicines,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: medicines.length,
        totalCount: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addAdvertisementRequest = async (req, res) => {
  try {
    const db = getDB();
    const adData = {
      ...req.body,
      sellerEmail: req.user.email,
      sellerName: req.user.name,
      adminStatus: "pending",
      isActive: false,
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Get the medicine details to add category information
    if (adData.medicineId) {
      const medicine = await db.collection("medicines").findOne({
        _id: new ObjectId(adData.medicineId),
      });
      if (medicine) {
        adData.category = medicine.category;
      }
    }

    const result = await db.collection("advertisements").insertOne(adData);

    res.json({
      success: true,
      data: { _id: result.insertedId, ...adData },
      message: "Advertisement request submitted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSellerAdvertisements = async (req, res) => {
  try {
    const db = getDB();
    const advertisements = await db
      .collection("advertisements")
      .find({ sellerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: advertisements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function run() {
  try {
    // await connectDB();

    // =============== MEDICINES API ===============
    app.get("/medicines", getMedicines);
    app.get("/medicines/discount-products", getDiscountProducts);
    app.get("/medicines/:id", getMedicineById);

    // =============== CATEGORIES API ===============
    app.get("/categories", getCategories);
    app.get("/categories/:id", getCategoryById);
    app.get("/categories/:categoryName/medicines", getMedicinesByCategory);

    // =============== AUTH/USER API ===============
    app.post("/auth/profile", verifyToken, saveUser);
    app.get("/auth/profile", verifyToken, getUserProfile);
    app.post("/auth/register", verifyToken, saveUser);
    app.post("/auth/google-login", verifyToken, async (req, res) => {
      try {
        const db = getDB();
        let user = await db
          .collection("users")
          .findOne({ email: req.user.email });

        if (!user) {
          const userData = {
            email: req.user.email,
            uid: req.user.uid,
            name: req.user.name,
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.collection("users").insertOne(userData);
          user = userData;
        } else {
        }
        res.json({
          success: true,
          message: "Google login successful",
          data: user,
        });
      } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // =============== CART API ===============
    app.post("/cart", verifyToken, addToCart);
    app.get("/cart", verifyToken, getCartItems);
    app.put("/cart/:id", verifyToken, updateCartItem);
    app.delete("/cart/:id", verifyToken, removeFromCart);
    app.patch("/cart/clear", verifyToken, clearCart);

    // =============== PAYMENT API ===============
    app.post("/payment/create-intent", verifyToken, createPaymentIntent);
    app.post("/payment/save-order", verifyToken, saveOrder);
    app.put("/payment/update-status", verifyToken, updateOrderStatus);
    app.get("/payment/history", verifyToken, getPaymentHistory);
    app.get("/payment/history/user", verifyToken, getUserPaymentHistory);
    app.get("/payment/history/seller", verifyToken, getSellerPaymentHistory);

    // =============== USER DASHBOARD API ===============
    app.get("/user/dashboard", verifyToken, getUserDashboard);
    app.get("/user/payment-history", verifyToken, getUserPaymentHistory);
    app.get("/user/profile", verifyToken, getUserProfile);
    app.put("/user/profile", verifyToken, updateUserProfile);

    // =============== SELLER API ===============
    app.get(
      "/seller/dashboard",
      verifyToken,
      checkRole(["seller"]),
      getSellerDashboard
    );
    app.get(
      "/seller/medicines",
      verifyToken,
      checkRole(["seller"]),
      getSellerMedicines
    );
    app.post(
      "/seller/medicines",
      verifyToken,
      checkRole(["seller"]),
      addMedicine
    );
    app.put(
      "/seller/medicines/:id",
      verifyToken,
      checkRole(["seller"]),
      updateMedicine
    );
    app.delete(
      "/seller/medicines/:id",
      verifyToken,
      checkRole(["seller"]),
      deleteMedicine
    );
    app.get(
      "/seller/payment-history",
      verifyToken,
      checkRole(["seller"]),
      getSellerPaymentHistory
    );
    app.post(
      "/seller/advertisements",
      verifyToken,
      checkRole(["seller"]),
      addAdvertisementRequest
    );
    app.get(
      "/seller/advertisements",
      verifyToken,
      checkRole(["seller"]),
      getSellerAdvertisements
    );

    // =============== ADMIN API ===============
    app.get("/admin/stats", verifyToken, checkRole(["admin"]), getAdminStats);
    app.get(
      "/admin/dashboard",
      verifyToken,
      checkRole(["admin"]),
      getAdminDashboard
    );
    app.get("/admin/users", verifyToken, checkRole(["admin"]), getAllUsers);
    app.patch(
      "/admin/users/:id/role",
      verifyToken,
      checkRole(["admin"]),
      updateUserRole
    );
    app.get(
      "/admin/categories",
      verifyToken,
      checkRole(["admin"]),
      getAllCategories
    );
    app.post(
      "/admin/categories",
      verifyToken,
      checkRole(["admin"]),
      addCategory
    );
    app.put(
      "/admin/categories/:id",
      verifyToken,
      checkRole(["admin"]),
      updateCategory
    );
    app.delete(
      "/admin/categories/:id",
      verifyToken,
      checkRole(["admin"]),
      deleteCategory
    );
    app.get(
      "/admin/payments",
      verifyToken,
      checkRole(["admin"]),
      getAllPayments
    );
    app.patch(
      "/admin/payments/:id/status",
      verifyToken,
      checkRole(["admin"]),
      updatePaymentStatus
    );
    app.get(
      "/admin/sales-report",
      verifyToken,
      checkRole(["admin"]),
      getSalesReport
    );
    app.get(
      "/admin/advertisements",
      verifyToken,
      checkRole(["admin"]),
      getAdvertisements
    );
    app.patch(
      "/admin/advertisements/:id/toggle",
      verifyToken,
      checkRole(["admin"]),
      toggleAdvertisement
    );
    app.get("/advertisements/active", getActiveAdvertisements);

    // Health check route
    app.get("/health", (req, res) => {
      res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: db ? "connected" : "disconnected",
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
      });
    });

    // 404 handler
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl,
      });
    });

    // Start server
    app.listen(port, () => {
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

run();

// Export for Vercel
module.exports = app;
