import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

export async function createUser(data) {
  if (!data.password) {
    throw new Error("Password is required");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  const token = generateToken(user);
  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    token,
  };
}

export async function getUserById(id) {
    return User.findById(id);
}

export async function updateUserById(id, data) {
    const allowedFields = ["username", "avatar"];
    const updateData = {};

    // Chỉ cho phép cập nhật các trường được phép
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    }

    // Xử lý đổi mật khẩu
    if (data.newPassword) {
        if (!data.currentPassword) {
            throw new Error("Current password is required to change password");
        }

        const user = await User.findById(id).select("+password");
        if (!user) {
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }

        updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
        throw new Error("No valid fields to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser;
}

export async function getUsers({ page = 1, limit = 10 }) {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments()
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
    };
}

export async function loginUser(email, password) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user);
    const userObject = user.toObject();
    delete userObject.password;

    return {
        user: userObject,
        token,
    };
}


