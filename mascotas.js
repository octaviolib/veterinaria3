
"use strict";

// 1. Obtener los elementos del HTML
const formulario = document.getElementById("formMascotas");
const tablaMascotas = document.getElementById("tablaMascotas");
const totalMascotas = document.getElementById("totalMascotas");
const mensajeVacio = document.getElementById("mensajeVacio");
const mensaje = document.getElementById("mensaje");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnCancelar = document.getElementById("btnCancelar");

// 2. Recuperar las mascotas guardadas
let mascotas = JSON.parse(localStorage.getItem("mascotas")) || [];

// 3. Identificar si estamos editando una mascota
let idMascotaEditando = null;

// 4. Guardar las mascotas en LocalStorage
function guardarMascotas() {
    localStorage.setItem("mascotas", JSON.stringify(mascotas));
}

// 5. Mostrar las mascotas en la tabla
function mostrarMascotas() {
    tablaMascotas.innerHTML = "";

    mascotas.forEach(function (mascota) {
        const fila = document.createElement("tr");

        // Mostrar los datos de cada mascota
        const datos = [
            mascota.nombreMascota,
            mascota.nombreDuenio,
            mascota.tipoAnimal || "Sin especificar",
            mascota.raza || "Desconocido",
            mascota.color,
            mascota.edad,
            mascota.peso
        ];

        datos.forEach(function (dato) {
            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);
        });

        // Crear la celda de acciones
        const celdaAcciones = document.createElement("td");

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn btn-warning btn-sm me-1";
        btnEditar.textContent = "Editar";
        btnEditar.dataset.accion = "editar";
        btnEditar.dataset.id = mascota.idMascota;

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.dataset.accion = "eliminar";
        btnEliminar.dataset.id = mascota.idMascota;

        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnEliminar);
        fila.appendChild(celdaAcciones);

        tablaMascotas.appendChild(fila);
    });

    // Actualizar el total y el mensaje de tabla vacía
    totalMascotas.textContent = mascotas.length;

    mensajeVacio.classList.toggle("d-none", mascotas.length > 0);
}

// 6. Registrar una mascota o guardar los cambios
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Capturar los datos del formulario
    const nombreMascota =
        document.getElementById("nombreMascota").value.trim();

    const nombreDuenio =
        document.getElementById("nombreDuenio").value.trim();

    const tipoAnimal =
        document.getElementById("tipoAnimal").value;

    const raza =
        document.getElementById("raza").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const edadTexto =
        document.getElementById("edad").value;

    const pesoTexto =
        document.getElementById("peso").value;

    const edad = Number(edadTexto);
    const peso = Number(pesoTexto);

    // Validar los datos
    if (
        !nombreMascota ||
        !nombreDuenio ||
        !tipoAnimal ||
        !raza ||
        !color ||
        edadTexto === "" ||
        pesoTexto === "" ||
        !Number.isInteger(edad) ||
        edad < 0 ||
        !Number.isFinite(peso) ||
        peso <= 0
    ) {
        mensaje.textContent =
            'Completá todos los campos. Si no conocés la raza, escribí "Desconocido".';
        return;
    }

    // Crear el objeto con los datos de la mascota
    const datosMascota = {
        nombreMascota: nombreMascota,
        nombreDuenio: nombreDuenio,
        tipoAnimal: tipoAnimal,
        raza: raza,
        color: color,
        edad: edad,
        peso: peso
    };

    if (idMascotaEditando !== null) {
        // Modificar una mascota existente
        mascotas = mascotas.map(function (mascota) {
            if (mascota.idMascota === idMascotaEditando) {
                return {
                    ...mascota,
                    ...datosMascota
                };
            }

            return mascota;
        });

        mensaje.textContent = "Mascota modificada correctamente.";
    } else {
        // Registrar una mascota nueva
        const nuevaMascota = {
            idMascota: crypto.randomUUID(),
            ...datosMascota
        };

        mascotas.push(nuevaMascota);

        mensaje.textContent = "Mascota registrada correctamente.";
    }

    // Guardar y actualizar la tabla
    guardarMascotas();
    mostrarMascotas();
    limpiarFormulario();
});

// 7. Detectar los clics en Editar y Eliminar
tablaMascotas.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "editar") {
        const mascota = mascotas.find(function (item) {
            return item.idMascota === id;
        });

        if (!mascota) return;

        // Guardar el identificador de la mascota seleccionada
        idMascotaEditando = id;

        // Cargar los datos en el formulario
        document.getElementById("nombreMascota").value =
            mascota.nombreMascota;

        document.getElementById("nombreDuenio").value =
            mascota.nombreDuenio;

        document.getElementById("tipoAnimal").value =
            mascota.tipoAnimal || "";

        document.getElementById("raza").value =
            mascota.raza || "";

        document.getElementById("color").value =
            mascota.color;

        document.getElementById("edad").value =
            mascota.edad;

        document.getElementById("peso").value =
            mascota.peso;

        // Cambiar el formulario al modo edición
        tituloFormulario.textContent = "Editar mascota";
        btnGuardar.textContent = "Guardar cambios";
        btnCancelar.classList.remove("d-none");

        mensaje.textContent =
            "Modificá los datos y pulsá Guardar cambios.";

        formulario.scrollIntoView({ behavior: "smooth" });
    }

    if (accion === "eliminar") {
        const confirmar = confirm(
            "¿Estás seguro de que querés eliminar esta mascota?"
        );

        if (!confirmar) return;

        mascotas = mascotas.filter(function (mascota) {
            return mascota.idMascota !== id;
        });

        guardarMascotas();
        mostrarMascotas();

        // Si se elimina la mascota que estábamos editando,
        // limpiar también el formulario
        if (idMascotaEditando === id) {
            limpiarFormulario();
        }

        mensaje.textContent = "Mascota eliminada correctamente.";
    }
});

// 8. Limpiar el formulario y salir del modo edición
function limpiarFormulario() {
    formulario.reset();

    idMascotaEditando = null;

    tituloFormulario.textContent = "Registrar mascota";
    btnGuardar.textContent = "Registrar mascota";
    btnCancelar.classList.add("d-none");
}

// 9. Botón Limpiar formulario
btnLimpiar.addEventListener("click", function () {
    limpiarFormulario();
    mensaje.textContent = "";
});

// 10. Botón Cancelar edición
btnCancelar.addEventListener("click", function () {
    limpiarFormulario();
    mensaje.textContent = "Edición cancelada.";
});

// 11. Mostrar las mascotas al cargar la página
mostrarMascotas();
