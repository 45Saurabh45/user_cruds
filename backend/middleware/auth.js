const jwt = require("jsonwebtoken");

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

exports.loginCheck = (req, res, next) => {
  try {
    let token = req.headers.token;
    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }
    if (token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }

    let decode;
    try {
      decode = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        try {
          decode = jwt.verify(token, JWT_REFRESH_SECRET);
          
        } catch (err) {
        
          return res.status(403).json({ error: "Invalid or expired token" });
        }
      } else {
        throw err;
      }
    }
    req.userDetails = decode;
    next();
  } catch (err) {
    res.status(403).json({ error: "You must be logged in" });
  }
};

exports.checkAdmin = (req, res, next) => {
  try {
    if (!req.userDetails || !req.userDetails.role) {
      return res.status(401).json({ error: "Authentication required" });
    }
    console.log(req.userDetails.role)
    if (req.userDetails.role !== 'Admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};


