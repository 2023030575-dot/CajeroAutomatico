import { Automata } from './automata.js';

document.addEventListener("DOMContentLoaded", () => {
    const automata = new Automata();
    const buttons = document.querySelectorAll(".option-btn:not(#start-btn, #delete-btn)");
    const inputDiv = document.querySelector(".input");
    const startBtn = document.querySelector("#start-btn");
    const deleteBtn = document.querySelector("#delete-btn");

    const process = []; // Eventos del proceso
    const clones = [];  // 🔹 Guardará referencias a los clones en orden

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const clone = btn.cloneNode(true);
            clone.classList.add("cloned-btn");
            clone.style.scale = "0.9";

            inputDiv.appendChild(clone);
            process.push(btn.textContent);
            clones.push(clone); // 🔹 Guardamos el clon en la lista

            // Permitir eliminar del input
            clone.addEventListener("click", () => {
                const index = clones.indexOf(clone);
                if (index > -1) {
                    inputDiv.removeChild(clone);
                    process.splice(index, 1);
                    clones.splice(index, 1);
                }
            });
        });
    });

    // --- 🔹 Función para iluminar el clon según el evento ---
    async function glowStep(index) {
        const clone = clones[index];
        if (!clone) return;

        // 🔹 Asegurar que el clon sea visible al activarse
        clone.scrollIntoView({
            behavior: "smooth",  // movimiento suave
            block: "nearest",    // se alinea sin mover demasiado
            inline: "center"     // centra horizontalmente si el contenedor es horizontal
        });

        clone.classList.add("active");
        await new Promise(res => setTimeout(res, 800)); // Tiempo de iluminación
        clone.classList.remove("active");
    }

    // --- Botón BORRAR: elimina todos los clones y limpia el proceso ---
    deleteBtn.addEventListener("click", () => {
        inputDiv.innerHTML = "Proceso:"; // 🔹 Limpia la zona visual
        process.length = 0;              // 🔹 Vacía el arreglo de eventos
        clones.length = 0;               // 🔹 Vacía el arreglo de clones
        console.clear();
        console.log("Se han borrado todos los eventos del proceso.");
    });

    // --- Iniciar el autómata ---
    startBtn.addEventListener("click", async () => {
        console.clear();

        // 🔹 Validar que haya pasos antes de iniciar
        if (process.length === 0) {
            alert("⚠️ Debe ingresar al menos un paso antes de iniciar la simulación.");
            console.warn("Intento de iniciar sin pasos en el proceso.");
            return;
        }

        automata.restart();

        console.log("Ejecutando proceso:", process);

        // 🔹 Estados vertedero (errores)
        const sinkStates = [2, 4, 5, 7, 8, 10, 11, 12];

        // 🔹 Obtener los clones actuales
        const clones = inputDiv.querySelectorAll(".cloned-btn");

        for (let i = 0; i < process.length; i++) {
            const text = process[i];
            const event = translateEvent(text);

            if (event) {
                await glowStep(i);
                automata.transition(event);
            } else {
                console.warn(`Evento desconocido: "${text}"`);
                break;
            }

            // 🔹 Si el autómata entra en un estado vertedero
            if (sinkStates.includes(automata.state)) {
                console.warn(`Estado vertedero alcanzado: q${automata.state}. Proceso detenido.`);

                badProcess();

                // Salir del bucle
                return;
            }
        }

        console.log("Ejecución terminada. Estado final:", automata.state);

        // 🔹 Verificar si el estado final NO es el estado de aceptación
        if (automata.state !== 13) {
            console.warn(`Proceso incorrecto: terminó en q${automata.state} en lugar de q13.`);
            badProcess();

            return;
        } else {
            console.log(`Proceso correcto: terminó en q${automata.state}`);

            correctProcess();

            return;
        }
    });

    // --- Traductor de eventos ---
    function translateEvent(text) {
        const map = {
            "Insertar tarjeta": "a",
            "Ingresar PIN": "b",
            "Ingresar cantidad": "c",
            "Tomar dinero": "d",
            "Sacar tarjeta": "e"
        };
        return map[text] || null;
    }

    function badProcess(){
        // Iluminar todos los clones en rojo
        clones.forEach(c => c.classList.add("error"));

        // Esperar 3 segundos y quitar el color de error
        setTimeout(() => {
            clones.forEach(c => c.classList.remove("error"));
        }, 3000);
    }

    function correctProcess(){
        // Iluminar todos los clones en verde
        clones.forEach(c => c.classList.add("correct"));

        // Esperar 3 segundos y quitar el color de exito
        setTimeout(() => {
            clones.forEach(c => c.classList.remove("correct"));
        }, 3000);
    }
});
