const express = require('express');

const app = express();

//models
const Category = require('../models/Category');

//middlewares
const { verificaToken, adminRole} = require('../middlewares/authentication');

// -------------
// GET GLOBAL
// -------------
app.get('/category', verificaToken, (req, res) => {

    //busco todas las categorias de la bd
    Category.find({})
        .populate('user_id')
        .exec((err, categories) => {
            //si ocurrio un error en conectar con la bd
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error searching in BD',
                    err
                });
            }

            //retorno la informacion
            res.json({
                ok: true,
                categories
            });
        });
});

// -------------
// GET SPECIFIC
// -------------
app.get('/category/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    //busco la categoria en la bd del id que encontre
    Category.findById(id)
        .exec((err, category) => {
            //si ocurrio un error en conectar con la bd
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error searching in BD',
                    err
                });
            }

            //retorno la informacion
            res.json({
                ok: true,
                category
            });
        });
});


// -------------
// POST
// -------------
app.post('/category', verificaToken, (req, res) => {

    //obtener id de usuario logueado --> esto solo funciona por el middleware
    let id = req.user._id;

    //obtener datos a guardar
    let body = req.body;

    //creo una instancia de category con los datos recibidos
    let category = new Category({
        description: body.description,
        user_id: id
    });

    //salvo en la base de datos la categoria
    category.save((err, categoryDB) => {
        //si ocurrio un error en conectar con la bd
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error saving in BD',
                err
            });
        }
        //si se guardo bien, retornar los datos
        res.json({
            ok: true,
            category: categoryDB
        });
    });
});

// -------------
// PUT
// -------------
app.put('/category/:id', verificaToken,  (req, res) => {

    //recibo el id pasado por parametros
    let id = req.params.id;
    
    //recibo los datos a actualizar del body
    let description = req.body.description;


    //busco en la bd la categoria por el id, si lo encuentra, actualiza
    Category.findByIdAndUpdate(id, {description}, {new: true, runValidators: true}, (err, categoryDB) => {
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
            category: categoryDB
        });
    });
});


// -------------
// DELETE
// -------------
app.delete('/category/:id', [verificaToken, adminRole], (req, res) => {
    let id = req.params.id;

    Category.findByIdAndDelete(id, (err, categoryDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting in BD',
                err
            });
        }

        res.json({
            ok: true,
        });
    });
});

//exports
module.exports = app;