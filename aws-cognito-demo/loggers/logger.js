exports.log = (req, res, next) => {
    console.log("***** Application got traffic *****");
    const logData = {
        url: req.url,
        method: req.method,
        input: req.body
    }
    console.log(logData);
    next();
}