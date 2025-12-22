function requireRole(...allowedRoles) {
  return (req, res, next) => {
    //requireAuth must have already set req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = requireRole;
