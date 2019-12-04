const jwt = require('jsonwebtoken');


//TOKEN
let verificaToken = (req, res, next) => {
    let token = req.get('Authorization');

    jwt.verify(token, 'secret', (err,decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.user = decoded.user;
        next();
    });
};

//ADMIN ROLE
let adminRole = (req, res, next) => {
    let role = req.user.role;

    if(role != "ADMIN_ROLE"){
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Unauthorized user'
            }
        });
    }

    next();

};



module.exports = {
    verificaToken,
    adminRole
}