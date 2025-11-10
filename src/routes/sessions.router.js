import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();


const generateToken = (user) => {
    const { _id, first_name, last_name, email, age, cart, role } = user;
    const userForToken = { _id, first_name, last_name, email, age, cart, role };

    return jwt.sign({ user: userForToken }, process.env.JWT_PRIVATE_KEY || 'coderSecretKey', { expiresIn: '1h' });
};

router.post(
  "/register",

  passport.authenticate("register", {
    failureRedirect: "/register-fail",
    session: false,
  }),
  async (req, res) => {
    res
      .status(201)
      .json({ status: "success", message: "Usuario registrado con éxito" });
  }
);

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res
        .status(401)
        .json({
          status: "error",
          message: info.message || "Error de autenticación.",
        });
    }

    try {
      const token = generateToken(user);

      res
        .cookie("coderCookieToken", token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
          path: "/",
        })
        .json({
          status: "success",
          message: "Login exitoso",
          redirectTo: "/products",
        });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

router.get(
  "/current",

  passport.authenticate("current", {
    session: false,
  }),
  async (req, res) => {
    res.json({ status: "success", payload: req.user });
  }
);

router.post("/logout", (req, res) => {
  res
    .clearCookie("coderCookieToken")
    .json({ status: "success", message: "Logout exitoso" });
});

router.get("/register-fail", (req, res) => {
  res.status(400).json({ status: "error", message: "Error en el registro." });
});

router.get("/login-fail", (req, res) => {
  res.status(401).json({ status: "error", message: "Error en el login." });
});

export default router;
