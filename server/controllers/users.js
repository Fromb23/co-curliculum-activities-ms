import pkg from "@prisma/client";

import prisma from "../config/db.js";
import {
  studentEditSchema,
  studentSchema,
  trainerEditSchema,
  trainerSchema,
  userLoginSchema,
} from "../schema/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { ROLE } = pkg;

export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, phoneNo, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNo }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNo,
        password: hashedPassword,
        role: ROLE.ADMIN,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error registering admin" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { userType } = req.query;
    if (!["student", "trainer"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }
    if (userType === "student") {
      const { error, value } = studentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      const { fullName, email, phoneNo, parentName, role, password } = value;

      let hashedPassword;
      if (password) hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { phoneNo }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          role,
          phoneNo,
          password: hashedPassword,
          student: {
            create: {
              parentName,
            },
          },
        },
        include: {
          student: true,
        },
      });
      res.status(201).json(newUser);
    } else if (userType === "trainer") {
      console.log("Trainer registration request:", req.body);
      const { error, value } = trainerSchema.validate(req.body);
      if (error) {
        console.log("Trainer Validation Error:", error);
        return res.status(400).json({ message: error.details[0].message });
      }
      const { fullName, email, phoneNo, nationalIdNo, role, password } = value;

      let hashedPassword;
      if (password) hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { phoneNo },
            { trainer: { nationalIdNo: nationalIdNo } },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const newUser = await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNo,
          password: hashedPassword,
          role,
          trainer: {
            create: {
              nationalIdNo,
            },
          },
        },
        include: {
          trainer: true,
        },
      });

      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = value;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, trainer: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    if (!user.password) {
      console.log("user", user.role);
      return res.status(401).json({
        message: "Password not set. Redirecting to set password ...",
        redirect: true,
        token,
        userId: user.id,
        userType: user.role,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    let userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNo: user.phoneNo,
      role: user.role,
    };
    if (user.role === "STUDENT") {
      userData.student = user.student;
    } else if (user.role === "TRAINER") {
      userData.trainer = user.trainer;
    }

    res.status(200).json({ user: userData, token });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    console.log(role);
    if (role && !["STUDENT", "TRAINER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const whereClause = role
      ? { role }
      : {
          role: {
            in: ["STUDENT", "TRAINER"],
          },
        };
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        student: true,
        trainer: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        student: true,
        trainer: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userType } = req.query;
    const { id } = req.params;
    if (!["student", "trainer", "admin"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }
    if (userType === "student") {
      const { error, value } = studentEditSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { fullName, email, phoneNo, parentName, password } = value;

      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!existingUser)
        return res.status(404).json({ message: "Student not found" });

      let hashedPassword;
      if (password) hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          fullName: fullName || existingUser.fullName,
          email: email || existingUser.email,
          phoneNo: phoneNo || existingUser.phoneNo,
          password: hashedPassword || existingUser.password,
          student: {
            update: {
              parentName: parentName || existingUser.student?.parentName,
            },
          },
        },
        include: {
          student: true,
        },
      });

      res.status(201).json(updatedUser);
    } else if (userType === "trainer") {
      const { error, value } = trainerEditSchema.validate(req.body);
      if (error)
        return res.status(400).json({ message: error.details[0].message });

      const { fullName, email, phoneNo, nationalIdNo, password } = value;

      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!existingUser)
        return res.status(404).json({ message: "Trainer not found" });

      let hashedPassword;
      if (password) hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          fullName: fullName || existingUser.fullName,
          email: email || existingUser.email,
          phoneNo: phoneNo || existingUser.phoneNo,
          password: hashedPassword || existingUser.password,
          trainer: {
            update: {
              nationalIdNo,
            },
          },
        },
        include: {
          trainer: true,
        },
      });

      res.status(201).json(updatedUser);
    }
    else if (userType === "admin") {
      const { fullName, email, phoneNo, password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!existingUser)
        return res.status(404).json({ message: "Admin not found" });

      let hashedPassword;
      if (password) hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          fullName: fullName || existingUser.fullName,
          email: email || existingUser.email,
          phoneNo: phoneNo || existingUser.phoneNo,
          password: hashedPassword || existingUser.password,
        },
      });

      res.status(201).json(updatedUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
