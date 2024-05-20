import jsonwebtoken from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import {con} from '../app.js';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

async function registro(req, res){
    try{
        const correo = req.body.correo;
        const contrasena = req.body.contrasena;
        if(!correo || !contrasena){
            return res.status(400).send({status: "Error", message: "Todos los campos son obligatorios"});
        }else{
            con.query('SELECT * FROM usuario WHERE correo = ?', [correo], async (err, resultado) => {
                if (err) {
                    console.log('ERROR: ', err);
                    return res.status(500).send({status: "Error", message:'Error al consultar el usuario'});
                }
                if (resultado.length > 0) {
                    return res.status(400).send({status: "Error", message: "Este correo ya está registrado"});
                }
                const contrasenaHash = await bcryptjs.hash(contrasena, 8);
                con.query('INSERT INTO usuario (correo, contrasena) VALUES (?, ?)', [correo, contrasenaHash], (err, resultado) => {
                    if (err) {
                        console.log('ERROR: ', err);
                        return res.status(500).send({status: "Error", message: "Error al registrar al usuario"});
                    }
                    res.status(201).send({status: "OK", message: "Usuario registrado"});
                });
            })
        }    
        
    }catch(err){
        console.log('ERROR: ', err);
        return res.status(500).send({status: "Error", message: "Error al registrar al usuario"});
    }
    
}

async function login(req, res){
    try{
        const correo = req.body.correo;
        const contrasena = req.body.contrasena;
        if(!correo || !contrasena){
            return res.status(400).send({status: "Error", message: "Todos los campos son obligatorios"});
        }else{
            con.query('SELECT * FROM usuario WHERE correo = ?', [correo], async (err, resultado) => {
                if (err) {
                    console.log('ERROR: ', err);
                    return res.status(500).send({status: "Error", message:'Error al consultar el usuario'});
                }
                if (resultado.length === 0) {
                    return res.status(400).send({status: "Error", message: "El correo no está registrado"});
                }
                const contrasenaValida = await bcryptjs.compare(contrasena, resultado[0].contrasena);
                if(!contrasenaValida){
                    return res.status(400).send({status: "Error", message: "La contraseña es incorrecta"});
                }
                const id = resultado[0].id_usuario;
                const token = jsonwebtoken.sign({id: id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_T_EXPIRA
                });
                const cookiesOptions = {
                    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRA * 24 * 60 * 60 * 1000),
                    httpOnly: true
                };
                res.cookie('jwt_t', token, cookiesOptions);
                res.status(200).send({status: "ok", message: "Sesión iniciada con éxito"});
            })
        }
    }catch(err){
        console.log('ERROR: ', err);
        return res.status(500).send({status: "Error", message: "Error al iniciar sesión"});
    }
}

async function estaAutenticado(req, res, next){
    if (req.cookies.jwt_t) {
        try {
            const decodificada = await promisify(jsonwebtoken.verify)(req.cookies.jwt_t, process.env.JWT_SECRET)
            con.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results)=>{
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/')        
    }
}

function cerrarSesion(req, res){
    res.clearCookie('jwt_t')
    return res.redirect('/')
}

export const metodos = {
    registro,
    login,
    estaAutenticado,
    cerrarSesion
};
