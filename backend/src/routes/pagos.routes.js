import express from "express";
import { crearPago, confirmarPago } from "../controllers/pagos.controller.js";

const router = express.Router();

router.post("/crear", crearPago);
router.get("/confirmar", confirmarPago);

export default router;