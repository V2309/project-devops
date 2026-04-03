import logger from "#config/logger.js";
import bcrypt from 'bcrypt';

import {db} from '#config/database.js';

import {eq} from 'drizzle-orm';
import {users} from '#models/user.model.js';


export const hashPassword = async (password) => {
   try {
    return await bcrypt.hash(password, 10);

   }
   catch (e) {
    logger.error('Error hashing password:', e);
    throw new Error('Password hashing failed');
}
};

export const verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (e) {
        logger.error('Error verifying password:', e);
        throw new Error('Password verification failed');
    }
};

export const createUser = async ({name, email, password, role='user'}) => {
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await hashPassword(password);
        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            role
        }).returning();

        logger.info('User created successfully:', {email});
        return newUser;
      
    } catch (e) {
        logger.error('Error creating user:', e);
        if (e.message === 'User with this email already exists') {
            throw e;
        }
        throw new Error('User creation failed');
    }
};

export const authenticateUser = async ({email, password}) => {
    try {
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!existingUser) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await verifyPassword(password, existingUser.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        logger.info('User authenticated successfully:', {email});
        return existingUser;
    } catch (e) {
        logger.error('Error authenticating user:', e);
        if (e.message === 'Invalid email or password') {
            throw e;
        }
        throw new Error('Authentication failed');
    }
};