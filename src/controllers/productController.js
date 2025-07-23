import express from "express";
import productService from "../services/productService.js";
import auth from "../middlewares/auth.js";

const productController = express.Router();

// 사용자 인증정보가 있는 상태에서만 post가 가능하게 함
productController.post(
  "/",
  auth.passportAuthenticationSession,
  async (req, res, next) => {
    console.log("req.user: ", req.user);

    const createdProduct = await productService.create(req.body);
    return res.json(createdProduct);
  }
);

productController.get("/:id", async (req, res) => {
  const { id } = req.params;
  const product = await productService.getById(id);
  return res.json(product);
});

export default productController;
