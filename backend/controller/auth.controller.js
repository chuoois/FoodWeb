const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { generateOtp } = require("../utils/generateOtp");
const { sendOtpEmail } = require("../services/mail.service");
const Account = require("../models/accout.model");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Otp = require("../models/otp.model");

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);


// Đăng ký (tạo account + gửi OTP)
const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email
        const existingAccount = await Account.findOne({ email });
        if (existingAccount) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = await Role.findOne({ name: "CUSTOMER" });

        const newAccount = new Account({
            email,
            password_hash: hashedPassword,
            provider: "local",
            status: "PENDING",
            email_verified: false,
            role_id: role ? role._id : null,
        });
        await newAccount.save();

        const newUser = new User({ account_id: newAccount._id });
        await newUser.save();

        // Sinh OTP
        const otpCode = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { account_id: newAccount._id },
            { otp_code: otpCode, attempts: 0, expires_at: expiresAt },
            { upsert: true, new: true }
        );
        // Gửi email
        await sendOtpEmail(email, otpCode);
        

        res.status(201).json({ message: "Đăng ký thành công, OTP đã gửi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xác thực OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp_code } = req.body;

        const account = await Account.findOne({ email });
        if (!account) return res.status(404).json({ message: "Không tìm thấy account" });

        const otp = await Otp.findOne({ account_id: account._id });
        if (!otp) return res.status(400).json({ message: "OTP không tồn tại" });

        if (otp.expires_at < new Date()) {
            return res.status(400).json({ message: "OTP đã hết hạn" });
        }

        if (otp.attempts >= 5) {
            return res.status(400).json({ message: "Sai OTP quá 5 lần" });
        }

        if (otp.otp_code !== otp_code) {
            otp.attempts += 1;
            await otp.save();
            return res.status(400).json({ message: "OTP sai" });
        }

        account.status = "ACTIVE";
        account.email_verified = true;
        await account.save();

        await Otp.deleteOne({ _id: otp._id });

        const token = jwt.sign(
            { id: account._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        res.json({ message: "Xác thực thành công", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerGoogle = async (req, res) => {
    try {
        const { tokenId } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        // Kiểm tra nếu account đã tồn tại
        let account = await Account.findOne({ email });
        if (account) {
            return res.status(400).json({ message: "Email đã được đăng ký" });
        }

        const role = await Role.findOne({ name: "CUSTOMER" });

        account = new Account({
            email,
            provider: "google",
            provider_id: sub,
            email_verified: true,
            status: "ACTIVE",
            role_id: role ? role._id : null,
        });
        await account.save();

        const user = new User({
            account_id: account._id,
            full_name: name,
            phone: null,
            avatar_url: picture,
            date_of_birth: null,
            gender: null,
        });
        await user.save();

        return res.status(201).json({ message: "Đăng ký Google thành công" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    register,
    verifyOtp,
    registerGoogle,
};
