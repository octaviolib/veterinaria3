"use strict";
const CLAVE_MASCOTAS = "mascotas";
const formulario       = document.getElementById("formMascotas");
const listadoMascotas  = document.getElementById("tablaMascotas");
const total            = document.getElementById("totalMascotas");
const mensajeVacio     = document.getElementById("mensajeVacio");
const mensaje          = document.getElementById("mensaje");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar       = document.getElementById("btnGuardar");
const btnLimpiar       = document.getElementById("btnLimpiar");
const btnCancelar      = document.getElementById("btnCancelar");

let mascotas = JSON.parse(localStorage.getItem(CLAVE_MASCOTAS)) || [];
let idMascotaEditar = null;
function guardarEnLocalStorage() {
  localStorage.setItem(CLAVE_MASCOTAS, JSON.stringify(mascotas));
}
function generarId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `alert alert-${tipo} mt-3 mb-0`;
}
function render() {
  listadoMascotas.innerHTML = "";
  mascotas.forEach((mascota) => {
    listadoMascotas.innerHTML += `
      <tr>
        <td>${mascota.nombreMascota}</td>
        <td>${mascota.nombreDuenio}</td>
        <td>${mascota.color}</td>
        <td>${mascota.edad}</td>
        <td>${mascota.peso}</td>
        <td class="text-nowrap">
          <button type="button" class="btn btn-success btn-sm me-2 mb-1"
                  onclick="editarMascota('${mascota.idMascota}')">
            Editar
          </button>
          <button type="button" class="btn btn-outline-danger btn-sm mb-1"
                  onclick="eliminarMascota('${mascota.idMascota}')">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });
  total.textContent = mascotas.length;
  mensajeVacio.classList.toggle("d-none", mascotas.length > 0);
}
function editarMascota(id) {
  idMascotaEditar = id;
  const mascota = mascotas.find((m) => m.idMascota === id);
  if (!mascota) return;
  document.getElementById("nombreMascota").value = mascota.nombreMascota;
  document.getElementById("nombreDuenio").value  = mascota.nombreDuenio;
  document.getElementById("color").value         = mascota.color;
  document.getElementById("edad").value          = mascota.edad;
  document.getElementById("peso").value          = mascota.peso;

  tituloFormulario.textContent = "Editar mascota";
  btnGuardar.textContent = "Guardar cambios";
  btnCancelar.classList.remove("d-none");

  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("nombreMascota").focus();
}
function eliminarMascota(id) {
  const mascota = mascotas.find((m) => m.idMascota === id);
  if (!mascota) return;

  if (!confirm(`¿Querés eliminar a la mascota ${mascota.nombreMascota}?`)) return;

  mascotas = mascotas.filter((m) => m.idMascota !== id);

  if (idMascotaEditar === id) {
    cancelarEdicion();
  }
  guardarEnLocalStorage();
  render();
  mostrarMensaje("Mascota eliminada correctamente.", "success");
}
function cancelarEdicion() {
  idMascotaEditar = null;
  formulario.reset();

  tituloFormulario.textContent = "Registrar mascota";
  btnGuardar.textContent = "Registrar mascota";
  btnCancelar.classList.add("d-none");
}
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!formulario.reportValidity()) {
    return;
  }
  const datos = new FormData(formulario);
  const nombreMascota = datos.get("nombreMascota").trim();
  const nombreDuenio  = datos.get("nombreDuenio").trim();
  const color         = datos.get("color").trim();
  const edad          = Number(datos.get("edad"));
  const peso          = Number(datos.get("peso"));

  if (!nombreMascota || !nombreDuenio || !color) {
    mostrarMensaje("Completá todos los campos.", "danger");
    return;
  }
  if (!Number.isInteger(edad) || edad < 0) {
    mostrarMensaje("La edad debe ser un número entero mayor o igual a 0.", "danger");
    return;
  }
  if (!Number.isFinite(peso) || peso <= 0) {
    mostrarMensaje("El peso debe ser un número mayor a 0.", "danger");
    return;
  }
  const datosMascota = {
    nombreMascota: nombreMascota,
    nombreDuenio:  nombreDuenio,
    color:         color,
    edad:          edad,
    peso:          peso
  };

  if (idMascotaEditar !== null) {
    mascotas = mascotas.map((mascota) => {
      if (mascota.idMascota === idMascotaEditar) {
        return { ...mascota, ...datosMascota };
      }
      return mascota;
    });
    mostrarMensaje("Mascota modificada correctamente.", "success");
  } else {
    mascotas.push({
      idMascota: generarId(),
      ...datosMascota
    });
    mostrarMensaje("Mascota registrada correctamente.", "success");
  }

  guardarEnLocalStorage();
  cancelarEdicion();
  render();
});
btnCancelar.addEventListener("click", () => {
  cancelarEdicion();
  mostrarMensaje("Edición cancelada.", "secondary");
});

btnLimpiar.addEventListener("click", () => {
  cancelarEdicion();
  mensaje.textContent = "";
  mensaje.className = "";
});
render();
