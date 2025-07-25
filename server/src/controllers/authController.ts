import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// It's better practice to get JWT_SECRET from process.env directly in jwt.sign
// or ensure it's loaded from .env at the server entry point (server.ts)
// and not hardcoded here or given a fallback like 'changeme' in production.
const JWT_SECRET = process.env.JWT_SECRET as string; // Assert as string, assuming it's always set

// Register a new user
export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, role } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(409).json({ error: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, role });

        // Sign JWT for newly registered user as well
        const payload = {
            user: {
                id: user._id, // Use _id from Mongoose
                role: user.role // Include role
            }
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        // Return token and basic user info
        res.status(201).json({ token, user: { _id: user._id, username: user.username, role: user.role } });
    } catch (err: any) { // Catch as any for easier error access
        console.error("Registration error:", err);
        res.status(400).json({ error: 'Registration failed', details: err.message });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ msg: 'Invalid credentials' }); // Changed 'error' to 'msg' for consistency with frontend error handling

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' }); // Changed 'error' to 'msg'

        // --- FIX START ---
        // Change the JWT payload to match what the frontend's decodeJwt expects
        const payload = {
            user: {
                id: user._id, // Use _id from Mongoose
                role: user.role // Include role
            }
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        // --- FIX END ---

        // Return token and basic user info (ensure _id is included for frontend state)
        res.json({ token, user: { _id: user._id, username: user.username, role: user.role } });
    } catch (err: any) { // Catch as any for easier error access
        console.error("Login error:", err);
        res.status(400).json({ msg: 'Login failed', details: err.message }); // Changed 'error' to 'msg'
    }
};