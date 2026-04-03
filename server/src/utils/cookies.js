
// Utility functions for handling cookies in the server
export const cookies = { 
    // Get cookie options for setting cookies
    getOptions: () => {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict', // Adjust as needed (e.g., 'Lax' or 'None')
            maxAge: 15 *60 * 1000, // Cookie expires in 1 day
        };
    },
    // Set a cookie in the response
    set:(res, name, value) => {
        const options = cookies.getOptions();
        res.cookie(name, value, {...cookies.getOptions(), ...options});
    },
    // Clear a cookie in the response
    clear:(res, name) => {
        res.clearCookie(name, {...cookies.getOptions()});
    },
    // get a cookie value from the request
    get:(req, name) => {   
        return req.cookies[name];
    }
};
