import passport from "passport";
import LocalStrategy from "passport-local";
import jwt from "passport-jwt";
import { UserModel } from "../models/user.model.js";
import { CartModel } from "../models/cart.model.js";


passport.use(
  "register",
  new LocalStrategy.Strategy(
    {
      passReqToCallback: true,
      usernameField: "email",
    },
    async (req, email, password, done) => {
      const { first_name, last_name, age } = req.body;

      try {
        const user = await UserModel.findOne({ email });
        if (user) {
          return done(null, false, { message: "El email ya está registrado." });
        }

        const newCart = await CartModel.create({});

        const newUser = new UserModel({
          first_name,
          last_name,
          email,
          age,
          password,
          cart: newCart._id,
          role: email === "adminCoder@coder.com" ? "admin" : "user",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy.Strategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado." });
        }

        if (!user.isValidPassword(password)) {
          return done(null, false, { message: "Contraseña incorrecta." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);


const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["coderCookieToken"];
  } else {
  }

  return token;
};

const jwtOptions = {
    jwtFromRequest: jwt.ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_PRIVATE_KEY || 'coderSecretKey' 
};

passport.use(
  "current",
  new jwt.Strategy(jwtOptions, async (jwt_payload, done) => {
    try {
      return done(null, jwt_payload.user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
