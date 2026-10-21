
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

let idMascotaEditando = null;

// 3. Inicializar el contador de IDs
// Si hay registros anteriores, conserva el número más alto.
function obtenerUltimoId() {
    const ultimoGuardado =
        Number(localStorage.getItem("ultimoIdMascota")) || 0;

    const mayorIdExistente = mascotas.reduce(function (mayor, mascota) {
        const id = Number(mascota.idMascota);

        return Number.isInteger(id) && id > mayor ? id : mayor;
    }, 0);

    const ultimoId = Math.max(ultimoGuardado, mayorIdExistente);

    localStorage.setItem("ultimoIdMascota", String(ultimoId));

    return ultimoId;
}

// Convertir IDs anteriores a números correlativos,
// solamente cuando no sean números válidos o estén repetidos.
function normalizarIds() {
    const idsUsados = new Set();
    let siguienteId = obtenerUltimoId();

    mascotas.forEach(function (mascota) {
        const id = Number(mascota.idMascota);

        if (
            !Number.isInteger(id) ||
            id < 1 ||
            idsUsados.has(String(id))
        ) {
            siguienteId++;
            mascota.idMascota = String(siguienteId);
        } else {
            mascota.idMascota = String(id);
            idsUsados.add(String(id));
        }

        idsUsados.add(mascota.idMascota);
    });

    localStorage.setItem("ultimoIdMascota", String(siguienteId));
    guardarMascotas();
}

// 4. Generar el siguiente ID automáticamente
function generarIdMascota() {
    const ultimoId =
        Number(localStorage.getItem("ultimoIdMascota")) || 0;

    const nuevoId = ultimoId + 1;

    localStorage.setItem("ultimoIdMascota", String(nuevoId));

    return String(nuevoId);
}

// 5. Guardar las mascotas en LocalStorage
function guardarMascotas() {
    localStorage.setItem("mascotas", JSON.stringify(mascotas));
}

// 6. Mostrar las mascotas en la tabla
function mostrarMascotas() {
    tablaMascotas.innerHTML = "";

    mascotas.forEach(function (mascota) {
        const fila = document.createElement("tr");

        // Incluir el ID como primera columna
        const datos = [
            mascota.idMascota,
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
            celda.textContent = dato ?? "";
            fila.appendChild(celda);
        });

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

    totalMascotas.textContent = mascotas.length;
    mensajeVacio.classList.toggle("d-none", mascotas.length > 0);
}

// 7. Registrar una mascota o guardar cambios
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

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
        // Modificar una mascota sin cambiar su ID
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
        // Crear una mascota con un nuevo ID correlativo
        const nuevaMascota = {
            idMascota: generarIdMascota(),
            ...datosMascota
        };

        mascotas.push(nuevaMascota);

        mensaje.textContent = "Mascota registrada correctamente.";
    }

    guardarMascotas();
    mostrarMascotas();
    limpiarFormulario();
});

// 8. Detectar los clics en Editar y Eliminar
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

        idMascotaEditando = id;

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

        if (idMascotaEditando === id) {
            limpiarFormulario();
        }

        mensaje.textContent = "Mascota eliminada correctamente.";
    }
});

// 9. Limpiar el formulario y salir del modo edición
function limpiarFormulario() {
    formulario.reset();

    idMascotaEditando = null;

    tituloFormulario.textContent = "Registrar mascota";
    btnGuardar.textContent = "Registrar mascota";
    btnCancelar.classList.add("d-none");
}

// 10. Botón Limpiar
btnLimpiar.addEventListener("click", function () {
    limpiarFormulario();
    mensaje.textContent = "";
});

// 11. Botón Cancelar edición
btnCancelar.addEventListener("click", function () {
    limpiarFormulario();
    mensaje.textContent = "Edición cancelada.";
});

// 12. Preparar los IDs existentes y mostrar las mascotas
normalizarIds();
mostrarMascotas();
