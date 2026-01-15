import React, { useContext, useState } from 'react';
import app from './app.css';
import { ToastContext } from 'vtex.styleguide';

const urlBase = '/api/dataentities';

const saveInfo = async ({ body }) => {
    const method = 'POST';
    const headers = {
        accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json; charset=utf-8',
    };

    const response = await fetch(`${urlBase}/CO/documents`, {
        method,
        headers,
        body: JSON.stringify({
            agreement: true,
            ...body
        }),
    });

    return response;
};

const index = () => {
    const { showToast } = useContext(ToastContext);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [formulario, setFormulario] = useState({
        email: "",
        nombre: '',
        apeliido: '',
        direccion: '',
        telefono: '',
        mensaje: ''
    });

    const [errores, setErrores] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulario({
            ...formulario,
            [name]: value,
        });
    };

    const validarFormulario = () => {
        const erroresTemp = {};

        if (!formulario.nombre.trim()) {
            erroresTemp.nombre = 'El nombre es requerido';
        }

        if (!formulario.telefono.trim()) {
            erroresTemp.telefono = 'El teléfono es requerido';
        }

        if (!formulario.email.trim()) {
            erroresTemp.email = 'El Email es requerido';
        }

        if (!formulario.apeliido.trim()) {
            erroresTemp.apeliido = 'El Apellido es requerido';
        }

        if (!formulario.direccion.trim()) {
            erroresTemp.direccion = 'La Dirección es requerida';
        }

        if (!formulario.mensaje.trim()) {
            erroresTemp.mensaje = 'El mensaje es requerido';
        }

        setErrores(erroresTemp);
        return Object.keys(erroresTemp).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validarFormulario()) {
            const res = await saveInfo({ body: formulario });

            if (res.status === 201) {
                showToast('Formulario enviado correctamente.');
                setFormulario({
                    email: "",
                    nombre: '',
                    apeliido: '',
                    direccion: '',
                    telefono: '',
                    mensaje: ''
                });
            } else {
                showToast('Upps!!! Hubo un error, intenta más tarde.');
            }
        }
    };

    return (
        <form className={app.form__servicio} onSubmit={handleSubmit} noValidate>

            <div className={app.inputs__colum__servicio}>
                <input
                    type="text"
                    id="email"
                    name="email"
                    value={formulario.email}
                    placeholder='Email'
                    onChange={handleChange}
                    className={app.input__servicio__tecnico}
                />
                {errores.email && <span className={app.input__servicio__error}>{errores.email}</span>}
            </div>

            <div className={app.groups__dir}>
                <div className={app.inputs__colum__servicio}>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder='Nombre'
                        value={formulario.nombre}
                        onChange={handleChange}
                        className={app.input__servicio__tecnico}
                    />
                    {errores.nombre && <span className={app.input__servicio__error}>{errores.nombre}</span>}
                </div>

                <div className={app.inputs__colum__servicio}>
                    <input
                        type="text"
                        id="apeliido"
                        name="apeliido"
                        placeholder='Apellido'
                        value={formulario.apeliido}
                        onChange={handleChange}
                        className={app.input__servicio__tecnico}
                    />
                    {errores.apeliido && <span className={app.input__servicio__error}>{errores.apeliido}</span>}
                </div>
            </div>

            <div className={app.groups__dir}>
                <div className={app.inputs__colum__servicio}>
                    <input
                        type="text"
                        id="direccion"
                        placeholder='Dirección'
                        name="direccion"
                        value={formulario.direccion}
                        onChange={handleChange}
                        className={app.input__servicio__tecnico}
                    />
                    {errores.direccion && <span className={app.input__servicio__error}>{errores.direccion}</span>}
                </div>

                <div className={app.inputs__colum__servicio}>
                    <input
                        type="text"
                        id="telefono"
                        placeholder='Teléfono'
                        name="telefono"
                        value={formulario.telefono}
                        onChange={handleChange}
                        className={app.input__servicio__tecnico}
                    />
                    {errores.telefono && <span className={app.input__servicio__error}>{errores.telefono}</span>}
                </div>
            </div>


            <div className={app.inputs__colum__servicio}>
                <input
                    type="text"
                    id="mensaje"
                    placeholder='Cuentanos más'
                    name="mensaje"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    className={app.input__servicio__tecnico}
                />
                {errores.mensaje && <span className={app.input__servicio__error}>{errores.mensaje}</span>}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem"}} >
                <input 
                    type="checkbox" 
                    name="terminos"
                     id="terminos"
                     checked={aceptaTerminos}
                     onChange={(e) => setAceptaTerminos(e.target.checked)}
                />
                <div className={app.terminos} >Acepto los términos y condiciones del servicio</div>
            </div>

            <button disabled={!aceptaTerminos} className={`${app.btn__submit__servicio} ${!aceptaTerminos ? app.btn__disabled : ""}`} type="submit">
                Enviar formulario de contacto
            </button>
        </form>
    );
};

export default index;