"use strict";

const CLAVE_VETERINARIOS = "veterinarios";
const formulario        = document.getElementById("formVeterinarios");
const listadoVeterinarios = document.getElementById("tablaVeterinarios");
const total             = document.getElementById("totalVeterinarios");
const mensajeVacio      = document.getElementById("mensajeVacio");
const mensaje           = document.getElementById("mensaje");
const tituloFormulario  = document.getElementById("tituloFormulario");
const btnGuardar        = document.getElementById("btnGuardar");
const btnLimpiar        = document.getElementById("btnLimpiar");
const btnCancelar       = document.getElementById("btnCancelar");

let veterinarios = JSON.parse(localStorage.getItem(CLAVE_VETERINARIOS)) || [];
let idVeterinarioEditar = null;

function guardarEnLocalStorage() {
  localStorage.setItem(CLAVE_VETERINARIOS, JSON.stringify(veterinarios));
}

function generarId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(valor);
}
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `alert alert-${tipo} mt-3 mb-0`;
}
function render() {
  listadoVeterinarios.innerHTML = "";
  veterinarios.forEach((veterinario) => {
    listadoVeterinarios.innerHTML += `
      <tr>
        <td>${veterinario.matricula}</td>
        <td>${veterinario.nombre}</td>
        <td>${veterinario.especializacion}</td>
        <td class="text-end">${formatearMoneda(veterinario.valorConsulta)}</td>
        <td class="text-nowrap">
          <button type="button" class="btn btn-success btn-sm me-2 mb-1" onclick="editarVeterinario('${veterinario.idVeterinario}')">Editar</button>
          <button type="button" class="btn btn-outline-danger btn-sm mb-1" onclick="eliminarVeterinario('${veterinario.idVeterinario}')">Eliminar</button>
        </td>
      </tr>
    `;
  });

  total.textContent = veterinarios.length;
  mensajeVacio.classList.toggle("d-none", veterinarios.length > 0);
}

function editarVeterinario(id) {
  idVeterinarioEditar = id;
  const veterinario = veterinarios.find((v) => v.idVeterinario === id);
  if (!veterinario) return;

  document.getElementById("matricula").value      = veterinario.matricula;
  document.getElementById("nombre").value         = veterinario.nombre;
  document.getElementById("especializacion").value = veterinario.especializacion;
  document.getElementById("valorConsulta").value  = veterinario.valorConsulta;
  tituloFormulario.textContent = "Editar veterinario";
  btnGuardar.textContent = "Guardar cambios";
  btnCancelar.classList.remove("d-none");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("nombre").focus();
}

function eliminarVeterinario(id) {
  const veterinario = veterinarios.find((v) => v.idVeterinario === id);
  if (!veterinario) return;
  if (!confirm(`¿Querés eliminar al veterinario ${veterinario.nombre}?`)) return;
  veterinarios = veterinarios.filter((v) => v.idVeterinario !== id);
  if (idVeterinarioEditar === id) cancelarEdicion();

  guardarEnLocalStorage();
  render();
  mostrarMensaje("Veterinario eliminado correctamente.", "success");
}

function cancelarEdicion() {
  idVeterinarioEditar = null;
  formulario.reset();
  tituloFormulario.textContent = "Registrar veterinario";
  btnGuardar.textContent = "Registrar veterinario";
  btnCancelar.classList.add("d-none");
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!formulario.reportValidity()) return;

  const datos = new FormData(formulario);
  const matricula      = Number(datos.get("matricula"));
  const nombre         = datos.get("nombre").trim();
  const especializacion = datos.get("especializacion").trim();
  const valorConsulta  = Number(datos.get("valorConsulta"));

  if (!Number.isInteger(matricula) || matricula <= 0) {
    mostrarMensaje("La matrícula debe ser un entero positivo.", "danger");
    return;
  }
  if (!nombre || !especializacion) {
    mostrarMensaje("Completá el nombre y la especialización.", "danger");
    return;
  }
  if (!Number.isFinite(valorConsulta) || valorConsulta < 0) {
    mostrarMensaje("El valor de consulta debe ser un número válido y no negativo.", "danger");
    return;
  }
  const datosVeterinario = { matricula, nombre, especializacion, valorConsulta };
  if (idVeterinarioEditar !== null) {
    veterinarios = veterinarios.map((v) =>
      v.idVeterinario === idVeterinarioEditar ? { ...v, ...datosVeterinario } : v
    );
    mostrarMensaje("Veterinario modificado correctamente.", "success");
  } else {
    veterinarios.push({ idVeterinario: generarId(), ...datosVeterinario });
    mostrarMensaje("Veterinario registrado correctamente.", "success");
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
