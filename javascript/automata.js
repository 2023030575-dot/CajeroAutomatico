/*
LENGUAJE:
a) Insertar tarjeta
b) Ingresar PIN
c) Ingresar cantidad
d) Tomar dinero
e) Sacar tarjeta
ESTADOS:
q0 = Inicio
q1 = Inserto tarjeta
q2 = Falta tarjeta
q3 = Ingreso PIN
q4 = Tarjeta dos veces
q5 = Falta PIN
q6 = Ingreso cantidad
q7 = PIN dos veces
q8 = No hay dinero
q9 = Tomo dinero
q10 = Saco tarjeta
q11 = Cantidad dos veces
q12 = Debe tomar dinero
q13 = Final
*/

export class Automata {
    constructor() {
        this.state = 0;
        this.transitions = {
            0: { a: 1, b: 2, c: 2, d: 2, e: 2 },
            13: { a: 1, b: 2, c: 2, d: 2, e: 2 },
            1: { a: 4, b: 3, c: 5, d: 8, e: 13 },
            3: { a: 4, b: 7, c: 6, d: 8, e: 13 },
            6: { a: 4, b: 7, c: 11, d: 9, e: 10 },
            9: { a: 4, b: 7, c: 6, d: 8, e: 13 },
            10: { a: 12, b: 12, c: 12, e: 12, d: 13 },
            // Los estados vertederos no necesitan transición (se quedan allí)
        };
    }

    transition(event) {
        const nextState = this.transitions[this.state]?.[event];
        if (nextState !== undefined) {
            this.state = nextState;
        } else {
            // Si no hay transición definida, permanece en el mismo estado
            console.warn(`Transición inválida desde q${this.state} con evento '${event}'`);
        }
        console.log(`Nuevo estado: q${this.state}`);
    }

    restart() {
        this.state = 0;
        console.log("Autómata reiniciado al estado 0");
    }
}
