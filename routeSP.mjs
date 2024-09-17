import express from "express";
import SP from "./model/Product.mjs";
import { ProductValidationSchema } from "./ProductValidationSchema.mjs";
import { checkSchema, validationResult } from "express-validator";

const router = express.Router();

router.get("/sp", async (req, res) => {
  try {
    const products = await SP.find();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post("/add", checkSchema(ProductValidationSchema), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, price, details } = req.body;
    const newProduct = new SP({
      name,
      price,
      details,
    });
    await newProduct.save();
    res.status(201).json({ message: "Added successfully", newProduct });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.put("/update/:id", checkSchema(ProductValidationSchema), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, price, details } = req.body;
    const updatedProduct = await SP.findByIdAndUpdate(
      id,
      { name, price, details },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await SP.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Deleted successfully", deletedProduct });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
