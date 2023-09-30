const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');

const middlewareController = {
    // GET ACCESS TOKEN KEY
    getAccessTokenKey: (role) => {
        let JWT_ACCESS_KEY;
        if (role === 'admin') {
            JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY_ADMIN;
        } else if (role === 'driver') {
            JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY_DRIVER;
        } else {
            JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY_USER;
        }

        return JWT_ACCESS_KEY;
    },
    // VERIFY TOKEN
    verifyToken: (req, res, next) => {
        const accessTokenHeader = req.headers.accesstoken; // Get access token from headers
        const decoded = jwtDecode(accessTokenHeader);
        const role = decoded.role;
        const JWT_ACCESS_KEY = middlewareController.getAccessTokenKey(role);

        if (accessTokenHeader) {
            const accessToken = accessTokenHeader.split(' ')[1]; // Access token: "Bearer ..."
            jwt.verify(accessToken, JWT_ACCESS_KEY, (err, account) => {
                if (err) {
                    return res.status(403).json('Token is invalid!'); // Forbidden
                }
                req.account = account;
                next();
            });
        } else {
            return res.status(401).json("You're not authenticated!");
        }
    },
    // VERIFY TOKEN ADMIN AUTH
    verifyTokenAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.account.role === 'admin') {
                next();
            } else {
                return res.status(403).json("You're not authorized!");
            }
        });
    }
};

module.exports = middlewareController;
