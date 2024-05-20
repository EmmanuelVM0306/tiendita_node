import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import { metodos as auth } from './controladores/auth.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


var app = express();

import bodyParser from 'body-parser';

const con = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQLPORT

});

con.connect( error => {
    if(error) throw error;
    console.log('Conexion exitosa a la base de datos');

});



app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//Para eliminar la cache 
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.get("/", (req, res) => res.sendFile(__dirname + "/paginas/login.html")); 
app.get("/consultarProductos", auth.estaAutenticado,(req, res) => res.sendFile(__dirname + "/paginas/tiendita/consultar.html"));
app.get("/eliminarProductos", auth.estaAutenticado,(req, res) => res.sendFile(__dirname + "/paginas/tiendita/eliminar.html"));
app.get("/actualizarProductos", auth.estaAutenticado,(req, res) => res.sendFile(__dirname + "/paginas/tiendita/actualizar.html"));
app.get("/agregarProducto", auth.estaAutenticado,(req, res) => res.sendFile(__dirname + "/paginas/tiendita/agregar.html"));
app.get("/registro", (req, res) => res.sendFile(__dirname + "/paginas/registro.html")); 

app.post("/registroform", auth.registro); 
app.post("/loginform", auth.login);
app.get("/logout", auth.cerrarSesion);


//tabla productos
app.post('/agregarProducto', (req, res) => {
    let nombre = req.body.nombre;
    let precio = req.body.precio;
    let existencia = req.body.existencia;
    let sql = 'INSERT INTO productos (nombre, precio, existencia) VALUES (?, ?, ?)';
    con.query(sql, [nombre, precio, existencia], (err, respuesta, fields) => {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).send('Error al agregar el producto');
        }
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <title>Producto Agregado</title>
</head>
<body>
    <div class="container mt-4">
        <h1 class="text-success">Producto agregado con éxito</h1>
        <p class="lead">Producto: ${nombre}</p>
        <p>Precio: ${precio}</p>
        <p>Existencia: ${existencia}</p>
        <a href="/" class="btn btn-primary">Regresar</a>
    </div>
</body>
</html>
`);
    });
});


//colsultar producto
app.get('/obtenerProducto', (req, res) => {
    con.query('SELECT * FROM productos', (err, respuesta, fields) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(respuesta);
    });
});
       


app.post('/eliminarProductosSeleccionados', (req, res) => {
    let idsParaEliminar = req.body.idProducto;

    if (!idsParaEliminar) {
        return res.send(`<script>alert('No se seleccionaron productos para eliminar'); window.location.href='/eliminarProductos';</script>`);
    }


    const placeholders = idsParaEliminar.map(() => '?').join(',');
    const sql = `DELETE FROM productos WHERE id_productos IN (${placeholders})`;

    con.query(sql, idsParaEliminar, (err, resultado) => {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).send('Error al eliminar productos');
        }
        res.redirect('/eliminarProductos'); 
    });
});


app.get('/obtenerDatosProducto/:idProducto', (req, res) => {
    const idProducto = req.params.idProducto;
    con.query('SELECT nombre, precio, existencia FROM productos WHERE id_productos = ?', [idProducto], (err, resultados) => {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).json({error: 'Error al obtener los datos del producto'});
        }
        if (resultados.length > 0) {
            res.json(resultados[0]);
        } else {
            res.status(404).json({error: 'Producto no encontrado'});
        }
    });
});

app.post('/actualizarProducto', (req, res) => {
    const { idProducto, nombre, precio, existencia } = req.body;
    con.query('UPDATE productos SET nombre = ?, precio = ?, existencia = ? WHERE id_productos = ?', [nombre, precio, existencia, idProducto], (err, resultados) => {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).send('Error al actualizar el producto');
        }
        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <title>Producto Actualizado</title>
</head>
<body>
    <div class="container mt-4">
        <h1 class="text-success">Producto actualizado con éxito</h1>
        <a href="/" class="btn btn-primary">Regresar</a>
    </div>
</body>
</html>
`);
    });
});


app.set('port', 4000);

export { app, con };

app.listen(app.get('port'),()=>{

    console.log('servidor escuchando en el puerto ' + app.get('port'));

});