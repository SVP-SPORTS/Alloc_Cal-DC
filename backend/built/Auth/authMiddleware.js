// replace './types' with your actual types file path
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ message: 'User is not authenticated' });
};
export const checkScope = (scope) => (req, res, next) => {
    const user = req.user;
    if (user.scope === scope) {
        return next();
    }
    return res.status(403).json({ message: `User is not authorized for ${scope} scope` });
};
