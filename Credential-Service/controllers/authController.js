const bcrypt = require('bcrypt');
const Account = require('../models/Account');
const jwtDecode = require('jwt-decode');
const jwt = require('jsonwebtoken');
const sessionController = require('./sessionController');
const { default: axios } = require('axios');

const authController = {
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
    // GET REFRESH TOKEN KEY
    getRefreshTokenKey: (role) => {
        let JWT_REFRESH_KEY;
        if (role === 'admin') {
            JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY_ADMIN;
        } else if (role === 'driver') {
            JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY_DRIVER;
        } else {
            JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY_USER;
        }

        return JWT_REFRESH_KEY;
    },
    // GENERATE ACCESS TOKEN
    generateAccessToken: (account) => {
        return jwt.sign(
            {
                id: account.refId,
                email: account.email,
                role: account.role
            },
            authController.getAccessTokenKey(account.role),
            {
                expiresIn: '1h'
            }
        );
    },
    // GENERATE REFRESH TOKEN
    generateRefreshToken: (account) => {
        return jwt.sign(
            {
                id: account.refId,
                email: account.email,
                role: account.role
            },
            authController.getRefreshTokenKey(account.role),
            {
                expiresIn: '3d'
            }
        );
    },
    // REGISTER
    registerAccount: async (req, res) => {
        try {
            const params = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                gender: req.body.gender,
                role: req.body.role,
                vehiclePlate: req.body.vehiclePlate,
                vehicleType: req.body.vehicleType,
                driverType: req.body.driverType,
                numberSeat: req.body.numberSeat
            };

            console.log('params: ', params);

            if (
                !params.email ||
                !params.password ||
                !params.firstName ||
                !params.lastName ||
                !params.phone ||
                !params.gender ||
                !params.role
            ) {
                return res.status(400).json('Missing required fields!');
            }

            if (
                params.role === 'driver' &&
                (!params.vehiclePlate ||
                    !params.vehicleType ||
                    !params.driverType ||
                    !params.numberSeat)
            ) {
                return res.status(400).json('Missing fields for driver!');
            }

            if (params.phone.length < 10) {
                return res
                    .status(400)
                    .json('Phone must be at least 10 characters!');
            }

            //  Check if email already exists
            const emailExist = await Account.findOne({
                email: params.email
            });
            if (emailExist) {
                return res.status(400).json('Email already exists!');
            }

            //  Check if phone already exists
            const phoneExist = await Account.findOne({
                phone: params.phone
            });
            if (phoneExist) {
                return res.status(400).json('Phone already exists!');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(params.password, salt);

            // Create new account
            const newAccount = await new Account({
                email: params.email,
                password: hashedPassword,
                phone: params.phone,
                role: params.role
            });

            console.log('newAccount: ', newAccount);

            if (params.role === 'user') {
                // Send to Demand Service
                const newUser = await axios.post(
                    'http://localhost:8086/v1/user/customers',
                    {
                        accountId: newAccount._id.toString(),
                        firstName: params.firstName,
                        lastName: params.lastName,
                        phone: params.phone,
                        gender: params.gender || 'male'
                    }
                );

                console.log('newUser: ', newUser.data.data);

                newAccount.refId = newUser.data.data.id;
            } else if (params.role === 'driver') {
                // Send to Supply Service
                const newDriver = await axios.post(
                    'http://localhost:8080/driver/create',
                    {
                        accountId: newAccount._id.toString(),
                        firstName: params.firstName,
                        lastName: params.lastName,
                        phoneNumber: params.phone,
                        role: params.role,
                        vehiclePlate: params.vehiclePlate,
                        vehicleType: params.vehicleType,
                        driverType: params.driverType,
                        numberSeat: params.numberSeat,
                        driverId: newAccount._id.toString(),
                        destination: {
                            type: 'Point',
                            coordinates: [0, 0]
                        }
                    }
                );

                console.log('newDriver: ', newDriver.data);

                newAccount.refId = newDriver.data._id;
            }

            // Save to DB
            const account = await newAccount.save();

            console.log('account: ', account);

            const accessToken = authController.generateAccessToken(account);
            const refreshToken = authController.generateRefreshToken(account);
            sessionController.createSession(account, refreshToken);

            const { password, ...others } = account._doc;

            res.status(200).json({ ...others, accessToken, refreshToken });
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // LOGIN
    loginAccount: async (req, res) => {
        try {
            // Login with email or phone
            const account = await Account.findOne({
                $or: [{ email: req.body.email }, { phone: req.body.email }]
            });

            if (!account) {
                return res
                    .status(404)
                    .json('This email or phone does not exist!');
            }

            const validPassword = await bcrypt.compare(
                req.body.password,
                account.password
            );

            if (!validPassword) {
                return res.status(404).json('Wrong password!');
            }

            if (account && validPassword) {
                const accessToken = authController.generateAccessToken(account);
                const refreshToken =
                    authController.generateRefreshToken(account);

                // Store refresh token to database
                sessionController.createSession(account, refreshToken);

                const { password, ...others } = account._doc;

                res.status(200).json({ ...others, accessToken, refreshToken });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // REQUEST NEW ACCESS TOKEN
    requestRefreshToken: async (req, res) => {
        const refreshTokenHeader = req.headers.refreshtoken;
        const refreshToken = refreshTokenHeader.split(' ')[1]; // Refresh token: "Bearer ..."

        if (!refreshToken) {
            return res.status(401).json("You're not authenticated!");
        }

        const refreshTokenDB =
            await sessionController.findSessionByRefreshToken(refreshToken);
        if (!refreshTokenDB) {
            return res.status(403).json('Refresh token is invalid!');
        }

        const decoded = jwtDecode(refreshToken);
        const role = decoded.role;
        const JWT_REFRESH_KEY = authController.getRefreshTokenKey(role);

        jwt.verify(refreshToken, JWT_REFRESH_KEY, (err, account) => {
            if (err) {
                return res.status(403).json('Refresh token is invalid!');
            }

            // Create new access token and refresh token
            const newAccessToken = authController.generateAccessToken(account);

            res.status(200).json({ accessToken: newAccessToken });
        });
    },
    // LOG OUT
    logoutAccount: async (req, res) => {
        const refreshTokenHeader = req.headers.refreshtoken;
        const refreshToken = refreshTokenHeader.split(' ')[1]; // Refresh token: "Bearer ..."

        if (!refreshToken) {
            return res.status(401).json("You're not authenticated!");
        }

        const decoded = jwtDecode(refreshToken);
        const role = decoded.role;
        const JWT_REFRESH_KEY = authController.getRefreshTokenKey(role);

        jwt.verify(refreshToken, JWT_REFRESH_KEY, (err, account) => {
            if (err) {
                return res.status(403).json('Refresh token is invalid!');
            }

            // Remove old refresh token
            sessionController.deleteSessionByRefreshToken(refreshToken);

            res.status(200).json('Logged out!');
        });
    }
};

module.exports = authController;
