const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore')

const app = express();

//models
const User = require('../models/User');

//middlewares
const { verificaToken, adminRole} = require('../middlewares/authentication');

app.get('/usuario', verificaToken, (req, res) => {

    //busco todos los usuarios de la bd que cumplan con la condicion de status = true
    User.find({status: true})
            .exec((err, users) => {
                //si ocurrio un error en conectar con la bd
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error searching in BD',
                        err
                    });
                }
                //cuento la cantidad de usuarios que cumplen con la condicion y retorno ambos datos
                User.count({status: true}, (err, quan) => {
                    res.json({
                        ok: true,
                        quantity: quan,
                        users
                    });
                });
            });
});

app.post('/usuario', [verificaToken, adminRole], (req, res) => {
    //recibo los datos que se enviaron
    let body = req.body; 

    //creo una instancia de usuario con los datos recibidos, encriptando la contraseya
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password,10),
        role: body.role
    });

    //salvo en la base de datos
    user.save((err, userDB) => {
        //si ocurrio un error en conectar con la bd
        if(err) {
            return res.status(500).json({
                ok: false,
                message: 'Error saving in BD',
                err
            });
        }
        //si se guardo bien, retornar los datos
        res.json({
            ok: true,
            user: userDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, adminRole],  (req, res) => {

    //recibo el id pasado por parametros
    let id = req.params.id;
    //recibo los datos a actualizar del body
    let body = _.pick(req.body, ['name', 'email', 'role', 'status']); //pick es para quedarme solo con los datos que me interesan del body

    //busco en la bd el usuario por el id, si lo encuentra, actualiza
    User.findByIdAndUpdate(id, body, {new: true, runValidators: true} ,(err, userDB) => {
        //si ocurrio un error en conectar con la bd
        if(err) {
            return res.status(500).json({
                ok: false,
                message: 'Error updating in BD',
                err
            });
        }

        //si se actualizo bien, retornar los datos actualizados
        res.json({
            ok: true,
            user: userDB
        });
    });
});

//hard delete -- encuentra el usuario por el id y lo elimina de la base de datos
// app.delete('/usuario/:id', (req, res) => {
//     let id = req.params.id;

//     User.findByIdAndDelete(id, (err, userDB) => {
//         if(err) {
//             return res.status(500).json({
//                 ok: false,
//                 message: 'Error deleting in BD',
//                 err
//             });
//         }

//         res.json({
//             ok: true,
//         });
//     });
// });

//soft delete -- encuentra el usuario por el id y actualiza el campo status a false
app.delete('/usuario/:id', [verificaToken, adminRole], (req, res) => {

    //recibo el id pasado por parametros
    let id = req.params.id; 
    let newStatus = {
        status: false
    }

    User.findByIdAndUpdate(id, newStatus, {new: true, runValidators: true} ,(err, userDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting in BD',
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });
    });
});

module.exports = app;