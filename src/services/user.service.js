import bcrypt from "bcrypt"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken";

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    ...data,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  const userObject = user.toObject();

  delete userObject.password;

  return {
    user: userObject,
    token,
  };
}

export async function getUserById(id) {
    return User.findById(id)
}

export async function getUsers({ page = 1, limit = 10 }) {
    page = Number(page)
    limit = Number(limit)

    const skip = (page - 1) * limit

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

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    const userObject = user.toObject();
    delete userObject.password;

    return {
        user: userObject,
        token,
    };
}

