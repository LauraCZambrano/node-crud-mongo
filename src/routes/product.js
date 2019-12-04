const express = require('express');

const app = express();

//models
const Product = require('../models/Product');

//middlewares
const { verificaToken } = require('../middlewares/authentication');

// -------------
// GET GLOBAL
// -------------
app.get('/product', verificaToken, (req, res) => {

    //busco todos los productos de la bd
    Product.find({status: true})
        .populate('user_id')
        .populate('category_id')
        .exec((err, products) => {
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
                products
            });
        });
});

// -------------
// GET SPECIFIC
// -------------
app.get('/product/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    //busco el producto en la bd del id que encontre
    Product.findById(id)
        .populate('user_id')
        .populate('category_id')
        .exec((err, product) => {
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
                product
            });
        });
});


// -------------
// POST
// -------------
app.post('/product', verificaToken, (req, res) => {

    //obtener id de usuario logueado --> esto solo funciona por el middleware
    let id = req.user._id;

    //obtener datos a guardar
    let body = req.body;

    //creo una instancia de product con los datos recibidos
    let product = new Product({
        name: body.name,
        price: body.price,
        description: body.description,
        user_id: id,
        category_id: body.category_id
    });

    //salvo en la base de datos el producto
    product.save((err, productDB) => {
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
            product: productDB
        });
    });
});

// -------------
// PUT
// -------------
app.put('/product/:id', verificaToken,  (req, res) => {

    //recibo el id pasado por parametros
    let id = req.params.id;
    
    //recibo los datos a actualizar del body
    let body = {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category_id: req.body.category_id,
    };


    //busco en la bd el producto por el id, si lo encuentra, actualiza
    Product.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, productDB) => {
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
            product: productDB
        });
    });
});


// -------------
// DELETE
// -------------
//soft delete -- encuentra el producto por el id y actualiza el campo status a false
app.delete('/product/:id', verificaToken, (req, res) => {

    //recibo el id pasado por parametros
    let id = req.params.id; 
    let body = {
        status: false
    }

    Product.findByIdAndUpdate(id, body, {new: true, runValidators: true} ,(err, productDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting in BD',
                err
            });
        }

        res.json({
            ok: true,
            product: productDB
        });
    });
});

//exports
module.exports = app;