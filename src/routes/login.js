const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('170820854020-805ekemr3jtm9ed87rc0sh9h8408f0qt.apps.googleusercontent.com');

const app = express();

//models
const User = require('../models/User');

app.post('/login', (req,res) => {

    // recibo los datos que se enviaron
    let body = req.body;

    //encuentro el usuario en la bs por el email ingresado en body
    User.findOne({email: body.email}, (err, userBD) => {
        //si ocurrio un error en conectar con la bd
        if(err) {
            return res.status(500).json({
                ok: false,
                message: 'Error searching in BD',
                err
            });
        }

        //si no encuentra el usuario
        if(!userBD){
            return res.status(400).json({
                ok: false,
                message: 'User not found',
            });
        }

        //compara la contraseya ingresada con la que esta en bd para verificar que coincidan
        if(!bcrypt.compareSync(body.password, userBD.password)){
            return res.status(400).json({
                ok: false,
                message: 'Incorrect password',
            });
        }

        //crea el token de sesion
        let token = jwt.sign({
            user: userBD,
        }, 'secret', { expiresIn: 60*60*24*30}); //segundos*minutos*horas*dias -- esto expira en 30 dias

        //retorna los datos
        res.json({
            ok: true,
            user: userBD,
            token
        });

    });
});

//Google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '170820854020-805ekemr3jtm9ed87rc0sh9h8408f0qt.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    return {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        google: true,
    }
}


app.post('/google', async (req,res) => {
    id_token = req.body.id_token;

    //verifico si el token de sesion es valido
    let googleUser = await verify(id_token)
                        .catch(e => {
                            return res.status(403).json({
                                ok: false,
                                err: e
                            });
                        });
    
    //encuentro un usuario en bd con el email de google ingresado
    User.findOne({email: googleUser.email}, (err, userDB) =>{
        //si ocurrio un error en conectar con la bd
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //si el usuario existe en bd
        if(userDB) {
            //verifico si no se registro con google y retorno error
            if(userDB.google == false){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Google false'
                    }
                });
            } else {
                //si se habia registrado con google genero el token y retorno los datos
                let token = jwt.sign({
                    user: userDB,
                }, 'secret', { expiresIn: 60*60*24*30}); //segundos*minutos*horas*dias -- esto expira en 30 dias
            
                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            
            }
        } else {
            //si no encuentra el usuario
            //creo una instancia de usuario
            let user = new User();
            //le asigno los datos recibidos de la api de google
            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.picture;
            user.google = true;
            user.password = 'google';

            //salvo el usuario en bd
            user.save((err, userDB) => {
                //si ocurrio un error en conectar con la bd
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                //genero el token de sesion
                let token = jwt.sign({
                    user: userDB,
                }, 'secret', { expiresIn: 60*60*24*30}); //segundos*minutos*horas*dias -- esto expira en 30 dias
            
                //retorno los datos
                return res.json({
                    ok: true,
                    user: userDB,
                    token
                });
            });
        }
    });
    
});


module.exports = app;