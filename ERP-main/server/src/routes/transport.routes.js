import express from "express";
import TransportVehicle from "../models/TransportVehicle.js";
import { protect } from "../middleware/auth.middleware.js";
import { getAllTimetablesForAdmin } from "../controllers/timetable.controller.js";

const router = express.Router();

/* =====================================================
   CREATE TRANSPORT VEHICLE
   POST /api/admin/transport
===================================================== */
router.post("/", protect(["admin"]), async (req, res) => {
  try {
    const vehicle = await TransportVehicle.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create transport vehicle",
      error: err.message,
    });
  }
});

/* =====================================================
   GET ALL TRANSPORT VEHICLES
===================================================== */
router.get("/", protect(["admin"]), async (req, res) => {
  try {
    const vehicles = await TransportVehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch {
    res.status(500).json({ message: "Failed to fetch transport vehicles" });
  }
});

/* =====================================================
   🔥 GET VEHICLE ROUTE (IMPORTANT)
   MUST BE ABOVE /:id
===================================================== */
router.get("/:id/route", protect(["admin"]), async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findById(req.params.id);

    if (!vehicle || !vehicle.route) {
      return res.status(404).json({
        message: "Route not assigned to this vehicle",
      });
    }

    res.json(vehicle.route);
  } catch {
    res.status(400).json({ message: "Failed to fetch route" });
  }
});

/* =====================================================
   ASSIGN / UPDATE ROUTE TO VEHICLE
===================================================== */
router.put("/:id/route", protect(["admin"]), async (req, res) => {
  try {
    const {
      routeName,
      routeCode,
      startLocation,
      endLocation,
      morningStartTime,
      morningEndTime,
      eveningStartTime,
      eveningEndTime,
      distanceKm,
      stops = [],
    } = req.body;

    if (!routeName || !startLocation || !endLocation || !morningStartTime || !morningEndTime) {
      return res.status(400).json({
        message: "Missing required route fields",
      });
    }

    const vehicle = await TransportVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.route = {
      routeName,
      routeCode,
      startLocation,
      endLocation,
      morningStartTime,
      morningEndTime,
      eveningStartTime,
      eveningEndTime,
      distanceKm,
      stops: stops.sort((a, b) => a.order - b.order),
      active: true,
    };

    await vehicle.save();
    res.json({ message: "Route assigned successfully", vehicle });
  } catch (err) {
    res.status(400).json({
      message: "Failed to assign route",
      error: err.message,
    });
  }
});

/* =====================================================
   REMOVE ROUTE FROM VEHICLE
===================================================== */
router.delete("/:id/route", protect(["admin"]), async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.route = undefined;
    await vehicle.save();
    res.json({ message: "Route removed successfully" });
  } catch {
    res.status(400).json({ message: "Failed to remove route" });
  }
});

/* =====================================================
   GET SINGLE VEHICLE
===================================================== */
router.get("/:id", protect(["admin"]), async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch {
    res.status(400).json({ message: "Invalid vehicle ID" });
  }
});

/* =====================================================
   UPDATE VEHICLE
===================================================== */
router.put("/:id", protect(["admin"]), async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

/* =====================================================
   DELETE VEHICLE
===================================================== */
router.delete("/:id", protect(["admin"]), async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    await vehicle.deleteOne();
    res.json({ message: "Vehicle deleted successfully" });
  } catch {
    res.status(400).json({ message: "Delete failed" });
  }
});

export default router;

