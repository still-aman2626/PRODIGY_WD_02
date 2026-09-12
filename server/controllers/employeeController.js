const Employee = require("../models/Employee");

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      status,
    } = req.body;

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      status,
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("Create employee error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create employee",
    });
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error.message);

    res.status(500).json({
      message: "Failed to fetch employees",
    });
  }
};

// Get a single employee
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      employee,
    });
  } catch (error) {
    console.error("Get employee error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    res.status(500).json({
      message: "Failed to fetch employee",
    });
  }
};

// Update an employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update employee",
    });
  }
};

// Delete an employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete employee error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete employee",
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
