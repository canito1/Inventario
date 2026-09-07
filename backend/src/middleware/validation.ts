import Joi from "joi";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(
      "🔍 Validating request body:",
      JSON.stringify(req.body, null, 2)
    );

    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      console.log("❌ Validation failed:", errorMessage);
      console.log("📋 Error details:", error.details);

      res.status(400).json({
        success: false,
        message: errorMessage,
        details: error.details,
      });
      return;
    }

    console.log("✅ Validation passed");
    next();
  };
};

// Validation schemas
export const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "manager", "employee").optional(),
  }),

  // Item schemas
  createItem: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    minStock: Joi.number().min(0).required(),
    maxStock: Joi.number().min(0).optional(),
    price: Joi.number().min(0).required(),
    currency: Joi.string().valid("PEN", "USD").required(),
    location: Joi.string().min(1).max(100).required(),
    barcode: Joi.string().allow("").optional(),
    image: Joi.string().allow("").optional(),
    status: Joi.string().valid("active", "inactive", "discontinued").optional(),
  }),

  updateItem: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().optional(),
    quantity: Joi.number().min(0).optional(),
    minStock: Joi.number().min(0).optional(),
    maxStock: Joi.number().min(0).optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().valid("PEN", "USD").optional(),
    location: Joi.string().min(1).max(100).optional(),
    barcode: Joi.string().allow("").optional(),
    image: Joi.string().allow("").optional(),
    status: Joi.string().valid("active", "inactive", "discontinued").optional(),
  }),

  // Category schemas
  createCategory: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().max(200).optional(),
  }),

  updateCategory: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    description: Joi.string().max(200).optional(),
  }),

  // User schemas
  updateUser: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid("admin", "manager", "employee").optional(),
    isActive: Joi.boolean().optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),

  // Stock Entry schemas
  createStockEntry: Joi.object({
    itemId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    unitCost: Joi.number().min(0).required(),
    supplier: Joi.string().max(100).optional(),
    reason: Joi.string()
      .valid("purchase", "return", "adjustment", "transfer", "exit")
      .optional(),
    notes: Joi.string().max(500).optional(),
  }),

  updateStockEntry: Joi.object({
    quantity: Joi.number().min(1).optional(),
    unitCost: Joi.number().min(0).optional(),
    supplier: Joi.string().max(100).optional(),
    reason: Joi.string()
      .valid("purchase", "return", "adjustment", "transfer", "exit")
      .optional(),
    notes: Joi.string().max(500).optional(),
  }),

  // Stock Exit schemas
  createStockExit: Joi.object({
    itemId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    unitCost: Joi.number().min(0).required(),
    destination: Joi.string().max(100).optional(),
    reason: Joi.string()
      .valid("sale", "damage", "loss", "transfer", "adjustment", "return")
      .optional(),
    notes: Joi.string().max(500).optional(),
  }),

  updateStockExit: Joi.object({
    quantity: Joi.number().min(1).optional(),
    unitCost: Joi.number().min(0).optional(),
    destination: Joi.string().max(100).optional(),
    reason: Joi.string()
      .valid("sale", "damage", "loss", "transfer", "adjustment", "return")
      .optional(),
    notes: Joi.string().max(500).optional(),
  }),

  // Settings schemas
  updateSettings: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    timezone: Joi.string().optional(),
    defaultCurrency: Joi.string().valid("PEN", "USD").optional(),
    exchangeRate: Joi.number().min(0.01).max(20).precision(4).optional(),
  }),
};

// Validation middleware functions
export const validateLogin = validate(schemas.login);
export const validateRegister = validate(schemas.register);
export const validateCreateItem = validate(schemas.createItem);
export const validateUpdateItem = validate(schemas.updateItem);
export const validateCreateCategory = validate(schemas.createCategory);
export const validateUpdateCategory = validate(schemas.updateCategory);
export const validateUpdateUser = validate(schemas.updateUser);
export const validateChangePassword = validate(schemas.changePassword);
export const validateStockEntry = validate(schemas.createStockEntry);
export const validateUpdateStockEntry = validate(schemas.updateStockEntry);
export const validateStockExit = validate(schemas.createStockExit);
export const validateUpdateStockExit = validate(schemas.updateStockExit);
export const validateUpdateSettings = validate(schemas.updateSettings);
