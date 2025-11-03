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
    }

    // --- Botón BORRAR: elimina todos los clones y limpia el proceso ---
    deleteBtn.addEventListener("click", () => {
        resetCajero();
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

        // 🔹 Animar el estado inicial q0 antes de comenzar
        await animateState(automata.state);

        for (let i = 0; i < process.length; i++) {
            const text = process[i];
            const event = translateEvent(text);

            if (event) {
                await glowStep(i);                // Iluminar el clon
                automata.transition(event);       // Cambiar estado
                await animateState(automata.state); // Animar el nuevo estado
                // 🔹 Una vez terminada la animación, quitar la iluminación
                clones[i]?.classList.remove("active");
            } else {
                console.warn(`Evento desconocido: "${text}"`);
                break;
            }

            // 🔹 Verificar si entró a un estado vertedero
            if (sinkStates.includes(automata.state)) {
                console.warn(`Estado vertedero alcanzado: q${automata.state}. Proceso detenido.`);
                badProcess();
                resetCajero();
                return;
            }
        }

        console.log("Ejecución terminada. Estado final:", automata.state);

        // 🔹 Verificar si el estado final NO es el estado de aceptación
        if (automata.state !== 13) {
            console.warn(`Proceso incorrecto: terminó en q${automata.state} en lugar de q13.`);
            badProcess();
            resetCajero();

            return;
        } else {
            console.log(`Proceso correcto: terminó en q${automata.state}`);
            correctProcess();
            resetCajero();
            
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

    function resetCajero() {
        const display = document.querySelector(".display");
        const card = document.querySelector(".card");
        const dispenser = document.querySelector(".dispenser");
        const bill = document.querySelector(".bill");

        // 🔹 Validar que existan antes de usarlos
        if (display) {
            display.classList.remove("state-q0", "state-q1", "state-q2", "state-q3", "state-q4", "state-q5");
            display.textContent = "";
            display.style.backgroundColor = "";
        }

        if (card) {
            card.classList.remove("insert");
            card.style.display = "none";
        }

        if (dispenser) dispenser.classList.remove("open");
        if (bill) bill.classList.remove("out");

        console.log("🔄 Cajero reiniciado al estado inicial");
    }


    // --- 🔹 Animación del estado actual ---
    async function animateState(state) {
        const display = document.querySelector(".display");
        const card = document.querySelector(".card");

        console.log(`Animando estado q${state}`);

        switch (state) {
            case 0:
                // --- Estado q0: Bienvenida ---
                display.classList.add("state-q0");
                display.addEventListener("animationend", function handler() {
                    const text = "BIENVENIDO";
                    let i = 0;
                    const interval = setInterval(() => {
                        display.textContent += text[i];
                        i++;
                        if (i === text.length) clearInterval(interval);
                    }, 100);
                    display.removeEventListener("animationend", handler);
                });
                await new Promise(res => setTimeout(res, 3000));
                break;

            case 1:
                // --- Estado q1: Inserción de tarjeta ---
                card.style.display = 'block';
                card.classList.add('insert');

                card.addEventListener('animationend', () => {
                    // 🔹 Termina la animación dejando parte visible
                    card.style.display = "none";
                    card.classList.remove('insert');
                }, { once: true });

                await new Promise(res => setTimeout(res, 4000));
                break;

            case 2:
                display.textContent = ""; // limpia el texto anterior
                // --- Estado q2: Error -> No se ha insertado la tarjeta ---
                display.classList.add("state-q2");

                const textError = "AUN NO HAS INSERTADO LA TARJETA";
                let i = 0;
                const interval = setInterval(() => {
                    display.textContent += textError[i];
                    i++;
                    if (i === textError.length) clearInterval(interval);
                }, 70);

                await new Promise(res => setTimeout(res, textError.length * 70 + 2000));
                display.textContent = ""; // limpia el texto antes del siguiente estado
                break;

            case 3:
            // --- Estado q3: Ingreso de PIN ---
            display.textContent = "";
            display.classList.add("state-q3");

            // 🔹 Escribir mensaje principal
            const textPIN = "INGRESE SU PIN";
            let i2 = 0;
            const intervalPIN = setInterval(() => {
                display.textContent += textPIN[i2];
                i2++;
                if (i2 === textPIN.length) clearInterval(intervalPIN);
            }, 70);

            await new Promise(res => setTimeout(res, textPIN.length * 70 + 400));

            // 🔹 Crear los espacios del PIN (____)
            const pinContainer = document.createElement("div");
            pinContainer.classList.add("pin-container");
            pinContainer.textContent = "____";
            display.appendChild(pinContainer);

            await new Promise(res => setTimeout(res, 800));

            // 🔹 Seleccionamos los botones del keypad
            const digits = document.querySelectorAll(".digit-btn");
            const pinSequence = ["1", "2", "3", "4"];

            // 🔹 Animar la presión de botones y mostrar asteriscos
            for (let j = 0; j < pinSequence.length; j++) {
                const btn = Array.from(digits).find(d => d.textContent === pinSequence[j]);
                if (btn) {
                    btn.classList.add("press");
                    await new Promise(res => setTimeout(res, 150)); // tiempo presionado
                    btn.classList.remove("press");

                    // 🔹 Reemplaza el guion bajo correspondiente por "*"
                    pinContainer.textContent =
                        pinContainer.textContent.substring(0, j) + "*" + pinContainer.textContent.substring(j + 1);

                    await new Promise(res => setTimeout(res, 400)); // pausa entre dígitos
                }
            }

            // 🔹 Esperar un poco al final
            await new Promise(res => setTimeout(res, 1000));

            // 🔹 Limpia el mensaje antes del siguiente estado
            display.textContent = "";
            display.classList.remove("state-q3");
            break;

            default:
                // --- Otros estados (animación genérica) ---
                display.classList.add(`state-q${state}`);
                await new Promise(res => setTimeout(res, 3000));
                display.classList.remove(`state-q${state}`);
                break;

            case 4:
                display.textContent = ""; // limpia el texto anterior
                display.classList.add("state-q4");

                const textError2 = "NO PUEDES INSERTAR LA TARJETA 2 VECES";
                let i3 = 0;
                const interval2 = setInterval(() => {
                    display.textContent += textError2[i3];
                    i3++;
                    if (i3 === textError2.length) clearInterval(interval2);
                }, 70);

                await new Promise(res => setTimeout(res, textError2.length * 70 + 2000));
                display.textContent = ""; // limpia el texto antes del siguiente estado
                break;

            case 5:
                display.textContent = ""; // limpia el texto anterior
                // --- Estado q2: Error -> No se ha insertado la tarjeta ---
                display.classList.add("state-q5");

                const textError3 = "AUN NO HAS INGRESADO EL PIN";
                let i4 = 0;
                const interval3 = setInterval(() => {
                    display.textContent += textError3[i4];
                    i4++;
                    if (i4 === textError3.length) clearInterval(interval3);
                }, 70);

                await new Promise(res => setTimeout(res, textError3.length * 70 + 2000));
                display.textContent = ""; // limpia el texto antes del siguiente estado
                break;

            case 6:
            // --- Estado q6: Ingreso de cantidad a retirar ---
            display.textContent = "";
            display.classList.add("state-q6");

            // 🔹 Escribir mensaje principal
            const textAmount = "INGRESE LA CANTIDAD A RETIRAR";
            let i5 = 0;
            const interval4 = setInterval(() => {
                display.textContent += textAmount[i5];
                i5++;
                if (i5 === textAmount.length) clearInterval(interval4);
            }, 70);

            await new Promise(res => setTimeout(res, textAmount.length * 70 + 400));

            // 🔹 Crear contenedor para el monto
            const amountContainer = document.createElement("div");
            amountContainer.classList.add("amount-container");

            // 🔹 Agregar el símbolo de dinero y el espacio para el monto
            const symbol = document.createElement("span");
            symbol.textContent = "$";
            symbol.classList.add("money-symbol");

            const amountText = document.createElement("span");
            amountText.classList.add("money-amount");
            amountText.textContent = "";

            amountContainer.appendChild(symbol);
            amountContainer.appendChild(amountText);
            display.appendChild(amountContainer);

            await new Promise(res => setTimeout(res, 800));

            // 🔹 Simular la entrada de "5000" usando los botones
            const digits6 = document.querySelectorAll(".digit-btn");
            const amountSequence = ["5", "0", "0", "0"];

            for (let j = 0; j < amountSequence.length; j++) {
                const btn = Array.from(digits6).find(d => d.textContent === amountSequence[j]);
                if (btn) {
                    btn.classList.add("press");
                    await new Promise(res => setTimeout(res, 150));
                    btn.classList.remove("press");

                    // 🔹 Mostrar número en pantalla junto al símbolo $
                    amountText.textContent += amountSequence[j];

                    await new Promise(res => setTimeout(res, 400));

                }
            }

            const check = document.getElementById("check-btn")
            check.classList.add("press");
            await new Promise(res => setTimeout(res, 150));
            check.classList.remove("press");

            // --- Animación del dispensador y salida del billete ---
            const dispenser = document.querySelector(".dispenser");

            // Crear el billete si no existe
            let bill = dispenser.querySelector(".bill");
            if (!bill) {
                bill = document.createElement("div");
                bill.classList.add("bill");
                dispenser.appendChild(bill);
            }

            // Cambiar fondo del dispensador a negro
            dispenser.classList.add("open");

            // Esperar un momento antes de sacar el billete
            await new Promise(res => setTimeout(res, 600));

            // Sacar el billete
            bill.classList.add("out");

            // 🔹 Esperar un poco antes de limpiar
            await new Promise(res => setTimeout(res, 1500));

            // 🔹 Limpia el mensaje antes del siguiente estado
            display.textContent = "";
            display.classList.remove("state-q6");
            break;

            case 7:
                display.textContent = ""; // limpia el texto anterior
                display.classList.add("state-q7");

                const textError4 = "NO PUEDES INGRESAR EL PIN 2 VECES";
                let i6 = 0;
                const interval5 = setInterval(() => {
                    display.textContent += textError4[i6];
                    i6++;
                    if (i6 === textError4.length) clearInterval(interval5);
                }, 70);

                await new Promise(res => setTimeout(res, textError4.length * 70 + 2000));
                display.textContent = ""; // limpia el texto antes del siguiente estado
                break;

                case 8:
                display.textContent = ""; // limpia el texto anterior
                display.classList.add("state-q8");

                const textError5 = "AUN NO HAY DINERO PARA TOMAR";
                let i7 = 0;
                const interval6 = setInterval(() => {
                    display.textContent += textError5[i7];
                    i7++;
                    if (i7 === textError5.length) clearInterval(interval6);
                }, 70);

                await new Promise(res => setTimeout(res, textError5.length * 70 + 2000));
                display.textContent = ""; // limpia el texto antes del siguiente estado
                break;
        }
    }

});
