import { Automata } from './automata.js';

document.addEventListener("DOMContentLoaded", () => {
    const automata = new Automata();
    const buttons = document.querySelectorAll(".option-btn:not(#start-btn)");
    const inputDiv = document.querySelector(".input");
    const startBtn = document.querySelector("#start-btn");

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
    async function iluminarPaso(index) {
        const clone = clones[index];
        if (!clone) return;

        clone.classList.add("activo");
        await new Promise(res => setTimeout(res, 800)); // Tiempo de iluminación
        clone.classList.remove("activo");
    }

    // --- Iniciar el autómata ---
    startBtn.addEventListener("click", async () => {
        console.clear();
        automata.restart();

        console.log("Ejecutando proceso:", process);

        for (let i = 0; i < process.length; i++) {
            const text = process[i];
            const event = translateEvent(text);

            if (event) {
                // 🔹 Iluminar el clon antes de procesarlo
                await iluminarPaso(i);
                automata.transition(event);
                console.log(`→ Evento '${text}' (${event}) leído, nuevo estado:`, automata.state);
            } else {
                console.warn(`Evento desconocido: "${text}"`);
            }

            // 🔹 Pequeña pausa entre cada evento
            await new Promise(res => setTimeout(res, 400));
        }

        console.log("Ejecución terminada. Estado final:", automata.state);
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
});
