const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();

//middleware
app.use(fileUpload());

app.post('/upload', (req, res) => {
    //si no hay archivos en el request
    if(!req.files){
        return res.status(400).json({
            ok: false,
            message: 'No files have been uploaded',
        });
    }

    //recibo el archivo
    let file = req.files.file;

    //partes del nombre
    let nameFile = file.name.split('.');
    let extensionFile = nameFile[nameFile.length - 1];
    
    //extensiones permitidas
    let extensions = ['png', 'jpg', 'gif', 'jpeg'];

    //valido que el archivo tenga extension permitida
    if(extensions.indexOf(extensionFile)<0){
        return res.status(400).json({
            ok: false,
            message: 'The file has no extensions allowed',
        });
    }

    //lo muevo a la carpeta
    file.mv(`uploads/${file.name}`, (err) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //retorno la informacion
        res.json({
            ok: true,
            message: 'File uploaded successfully'
        });
    });
});

module.exports = app;