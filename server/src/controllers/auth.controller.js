// signup controller
import logger from '#config/logger.js';
import {signupSchema, signinSchema} from '#validations/auth.validation.js';
import {formatValidationErrors} from '#utils/format.js';
import {authenticateUser, createUser} from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';
export const signup = async (req, res, next) => {
    try {
        const validationResult = signupSchema.safeParse(req.body);
        
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error)
            });
        }

        const {name, email,password,role} = validationResult.data;

        const user  = await createUser({ name, email, password, role });

        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role});

        cookies.set(res, 'token', token);


        logger.info('User registered successfully:', {email});
        res.status(201).json({
            message: 'User created successfully',                     
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role             
            }

        });
    }
    catch (e) {
        logger.error('Error during signup:', e);
        if(e.message === 'User with this email already exists') {
            return res.status(409).json({message: e.message});
        }
        next(e);
    }  
};

export const signin = async (req, res, next) => {
    try {
        const validationResult = signinSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error)
            });
        }

        const {email, password} = validationResult.data;
        const user = await authenticateUser({email, password});

        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role});
        cookies.set(res, 'token', token);

        logger.info('User signed in successfully:', {email});
        res.status(200).json({
            message: 'Signin successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (e) {
        logger.error('Error during signin:', e);
        if (e.message === 'Invalid email or password') {
            return res.status(401).json({message: e.message});
        }
        next(e);
    }
};

export const signout = async (req, res, next) => {
    try {
        cookies.clear(res, 'token');
        logger.info('User signed out successfully');
        res.status(200).json({message: 'Signout successful'});
    }
    catch (e) {
        logger.error('Error during signout:', e);
        next(e);
    }
};