import TransportVehicle from "../models/TransportVehicle.js";

/* ===============================
   GET ALL VEHICLES
================================ */
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await TransportVehicle.find()
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch transport vehicles",
      error: err.message,
    });
  }
};

/* ===============================
   ADD VEHICLE
================================ */
export const addVehicle = async (req, res) => {
  try {
    const {
      vehicleNo,
      vehicleType,
      capacity,
      driver,
      conductor,
      status,
    } = req.body;

    if (!vehicleNo || !capacity) {
      return res.status(400).json({
        message: "Vehicle number and capacity are required",
      });
    }

    const vehicle = await TransportVehicle.create({
      vehicleNo,
      vehicleType,
      capacity,
      driver,
      conductor,
      status,
      createdBy: req.user?._id, // 🔥 IMPORTANT
    });

    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({
      message: "Failed to add transport vehicle",
      error: err.message,
    });
  }
};
