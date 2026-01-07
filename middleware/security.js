export const requestLogger = (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

export const corsHeaders = (req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
};

export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};

export default {
    requestLogger,
    corsHeaders,
    sanitizeInput
};
