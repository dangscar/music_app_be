import { createUser, getUserById, getUsers, loginUser, updateUserById } from "../services/user.service.js";

export async function register(req, res, next) {
    try {
        const user = await createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        }); 
    }

}

export async function getUser(req, res, next) {
    try {
        const user = await getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message  
        })
    }
}

export async function getMe(req, res, next) {
    try {
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getAllUsers(req, res, next) {
  try {
    const { page, limit } = req.query;

    const result = await getUsers({ page, limit });

    res.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.json({
      success: true,
      message: "Login successful",
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateMe(req, res, next) {
    try {
        const updatedUser = await updateUserById(req.user.id, req.body);

        res.json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
