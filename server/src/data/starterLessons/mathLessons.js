// 5 Starter Math Lessons for Chispapp
// Each lesson includes VAK-adapted content

export const mathStarterLessons = [
  {
    title: "🔢 Suma Básica",
    description: "Aprende a sumar números del 1 al 10 de forma divertida",
    subject: "math",
    grade: "1",
    icon: "🔢",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "interactive",
        title: "Suma con Bloques de Colores",
        description: "Observa los bloques de colores y cuenta cuántos hay en total",
        exercises: [
          {
            question: "¿Cuántos bloques hay en total?",
            image: "2 bloques rojos + 3 bloques azules",
            answer: 5,
            options: [4, 5, 6, 7]
          },
          {
            question: "Suma los bloques amarillos y verdes",
            image: "4 bloques amarillos + 2 bloques verdes",
            answer: 6,
            options: [5, 6, 7, 8]
          },
          {
            question: "¿Cuál es el resultado?",
            image: "3 bloques morados + 3 bloques naranjas",
            answer: 6,
            options: [5, 6, 7, 8]
          }
        ]
      },
      auditory: {
        type: "audio-guided",
        title: "Escucha y Suma",
        description: "Escucha los números y suma mentalmente",
        exercises: [
          {
            question: "Escucha: 'Dos más tres es igual a...'",
            audioText: "Dos más tres es igual a...",
            answer: 5,
            options: [4, 5, 6, 7]
          },
          {
            question: "Escucha: 'Cuatro más dos es igual a...'",
            audioText: "Cuatro más dos es igual a...",
            answer: 6,
            options: [5, 6, 7, 8]
          },
          {
            question: "Escucha: 'Uno más cuatro es igual a...'",
            audioText: "Uno más cuatro es igual a...",
            answer: 5,
            options: [4, 5, 6, 7]
          }
        ]
      },
      kinesthetic: {
        type: "drag-drop",
        title: "Arrastra y Suma",
        description: "Arrastra los números para formar sumas correctas",
        exercises: [
          {
            question: "Arrastra los números para que sumen 5",
            items: [1, 2, 3, 4],
            targetSum: 5,
            correctCombinations: [[1, 4], [2, 3]]
          },
          {
            question: "Arrastra los números para que sumen 7",
            items: [2, 3, 4, 5],
            targetSum: 7,
            correctCombinations: [[2, 5], [3, 4]]
          },
          {
            question: "Arrastra los números para que sumen 10",
            items: [3, 4, 5, 6, 7],
            targetSum: 10,
            correctCombinations: [[3, 7], [4, 6]]
          }
        ]
      }
    }
  },
  {
    title: "➖ Resta Divertida",
    description: "Aprende a restar números del 1 al 10 jugando",
    subject: "math",
    grade: "1",
    icon: "➖",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "interactive",
        title: "Resta con Objetos",
        description: "Mira cómo desaparecen los objetos y cuenta cuántos quedan",
        exercises: [
          {
            question: "Tienes 5 manzanas y comes 2. ¿Cuántas quedan?",
            image: "5 manzanas, 2 tachadas",
            answer: 3,
            options: [2, 3, 4, 5]
          },
          {
            question: "Hay 7 globos y 3 se vuelan. ¿Cuántos quedan?",
            image: "7 globos, 3 volando",
            answer: 4,
            options: [3, 4, 5, 6]
          },
          {
            question: "Tienes 10 caramelos y regalas 4. ¿Cuántos te quedan?",
            image: "10 caramelos, 4 marcados",
            answer: 6,
            options: [5, 6, 7, 8]
          }
        ]
      },
      auditory: {
        type: "audio-story",
        title: "Historias de Resta",
        description: "Escucha las historias y resuelve las restas",
        exercises: [
          {
            question: "Escucha: 'María tenía 6 flores, regaló 2. ¿Cuántas le quedan?'",
            audioText: "María tenía 6 flores, regaló 2. ¿Cuántas le quedan?",
            answer: 4,
            options: [3, 4, 5, 6]
          },
          {
            question: "Escucha: 'Pedro tenía 8 carritos, perdió 3. ¿Cuántos tiene ahora?'",
            audioText: "Pedro tenía 8 carritos, perdió 3. ¿Cuántos tiene ahora?",
            answer: 5,
            options: [4, 5, 6, 7]
          },
          {
            question: "Escucha: 'Ana tenía 9 lápices, prestó 4. ¿Cuántos le quedan?'",
            audioText: "Ana tenía 9 lápices, prestó 4. ¿Cuántos le quedan?",
            answer: 5,
            options: [4, 5, 6, 7]
          }
        ]
      },
      kinesthetic: {
        type: "interactive-game",
        title: "Juego de Resta",
        description: "Toca los objetos que debes quitar",
        exercises: [
          {
            question: "Toca 3 estrellas para quitarlas de las 7",
            totalItems: 7,
            itemsToRemove: 3,
            answer: 4
          },
          {
            question: "Toca 2 corazones para quitarlos de los 6",
            totalItems: 6,
            itemsToRemove: 2,
            answer: 4
          },
          {
            question: "Toca 5 círculos para quitarlos de los 10",
            totalItems: 10,
            itemsToRemove: 5,
            answer: 5
          }
        ]
      }
    }
  },
  {
    title: "🎯 Números del 1 al 20",
    description: "Conoce y practica los números del 1 al 20",
    subject: "math",
    grade: "1",
    icon: "🎯",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "number-chart",
        title: "Tabla de Números Colorida",
        description: "Observa y memoriza los números con colores",
        exercises: [
          {
            question: "¿Qué número viene después del 12?",
            visualAid: "Tabla numérica 1-20",
            answer: 13,
            options: [11, 12, 13, 14]
          },
          {
            question: "¿Qué número está entre 15 y 17?",
            visualAid: "Tabla numérica 1-20",
            answer: 16,
            options: [14, 15, 16, 17]
          },
          {
            question: "¿Cuál es el número que viene antes del 20?",
            visualAid: "Tabla numérica 1-20",
            answer: 19,
            options: [17, 18, 19, 20]
          }
        ]
      },
      auditory: {
        type: "number-song",
        title: "Canción de los Números",
        description: "Escucha y canta la canción de los números",
        exercises: [
          {
            question: "Escucha y completa: 'Uno, dos, tres, cuatro, cinco...'",
            audioText: "Canción contando del 1 al 10",
            answer: "seis",
            options: ["cinco", "seis", "siete", "ocho"]
          },
          {
            question: "¿Qué número escuchas?",
            audioText: "Diecisiete",
            answer: 17,
            options: [15, 16, 17, 18]
          },
          {
            question: "Escucha la secuencia: '10, 11, 12, ___'",
            audioText: "Diez, once, doce...",
            answer: 13,
            options: [11, 12, 13, 14]
          }
        ]
      },
      kinesthetic: {
        type: "number-matching",
        title: "Empareja los Números",
        description: "Arrastra cada número a su posición correcta",
        exercises: [
          {
            question: "Ordena los números del 1 al 10",
            numbers: [3, 1, 5, 2, 4, 7, 6, 9, 8, 10],
            correctOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          },
          {
            question: "Ordena los números del 11 al 15",
            numbers: [13, 11, 15, 12, 14],
            correctOrder: [11, 12, 13, 14, 15]
          },
          {
            question: "Ordena los números del 16 al 20",
            numbers: [18, 20, 16, 19, 17],
            correctOrder: [16, 17, 18, 19, 20]
          }
        ]
      }
    }
  },
  {
    title: "📊 Formas Geométricas",
    description: "Descubre las formas: círculo, cuadrado, triángulo y más",
    subject: "math",
    grade: "1",
    icon: "📊",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "shape-identification",
        title: "Identifica las Formas",
        description: "Observa las formas y sus colores",
        exercises: [
          {
            question: "¿Qué forma es esta? 🔴",
            image: "Círculo rojo",
            answer: "círculo",
            options: ["círculo", "cuadrado", "triángulo", "rectángulo"]
          },
          {
            question: "¿Cuántos lados tiene un triángulo?",
            image: "Triángulo azul",
            answer: 3,
            options: [2, 3, 4, 5]
          },
          {
            question: "¿Qué forma tiene 4 lados iguales?",
            image: "Varias formas",
            answer: "cuadrado",
            options: ["círculo", "cuadrado", "triángulo", "óvalo"]
          }
        ]
      },
      auditory: {
        type: "shape-description",
        title: "Escucha las Formas",
        description: "Escucha la descripción y adivina la forma",
        exercises: [
          {
            question: "Escucha: 'No tiene esquinas y rueda perfectamente'",
            audioText: "No tiene esquinas y rueda perfectamente",
            answer: "círculo",
            options: ["círculo", "cuadrado", "triángulo", "rectángulo"]
          },
          {
            question: "Escucha: 'Tiene tres lados y tres esquinas'",
            audioText: "Tiene tres lados y tres esquinas",
            answer: "triángulo",
            options: ["círculo", "cuadrado", "triángulo", "rectángulo"]
          },
          {
            question: "Escucha: 'Tiene cuatro lados, todos iguales'",
            audioText: "Tiene cuatro lados, todos iguales",
            answer: "cuadrado",
            options: ["círculo", "cuadrado", "triángulo", "rectángulo"]
          }
        ]
      },
      kinesthetic: {
        type: "shape-building",
        title: "Construye las Formas",
        description: "Usa los puntos para crear formas",
        exercises: [
          {
            question: "Conecta los puntos para formar un triángulo",
            points: 3,
            shape: "triangle",
            correctConnections: [[0, 1], [1, 2], [2, 0]]
          },
          {
            question: "Conecta los puntos para formar un cuadrado",
            points: 4,
            shape: "square",
            correctConnections: [[0, 1], [1, 2], [2, 3], [3, 0]]
          },
          {
            question: "Arrastra las formas al grupo correcto",
            shapes: ["🔴", "🟦", "🔺", "🟨"],
            categories: ["círculos", "cuadrados", "triángulos"],
            correctMatches: {
              "🔴": "círculos",
              "🟦": "cuadrados",
              "🔺": "triángulos",
              "🟨": "cuadrados"
            }
          }
        ]
      }
    }
  },
  {
    title: "⏰ Introducción al Tiempo",
    description: "Aprende a leer el reloj y entender las horas",
    subject: "math",
    grade: "2",
    icon: "⏰",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "clock-reading",
        title: "Lee el Reloj",
        description: "Observa el reloj y di qué hora es",
        exercises: [
          {
            question: "¿Qué hora marca este reloj?",
            clockImage: "Reloj marcando 3:00",
            answer: "3:00",
            options: ["2:00", "3:00", "4:00", "5:00"]
          },
          {
            question: "¿Qué hora es?",
            clockImage: "Reloj marcando 7:00",
            answer: "7:00",
            options: ["6:00", "7:00", "8:00", "9:00"]
          },
          {
            question: "¿A qué hora marca el reloj?",
            clockImage: "Reloj marcando 12:00",
            answer: "12:00",
            options: ["11:00", "12:00", "1:00", "2:00"]
          }
        ]
      },
      auditory: {
        type: "time-telling",
        title: "Escucha la Hora",
        description: "Escucha y aprende a decir la hora",
        exercises: [
          {
            question: "Escucha: 'Son las dos en punto'",
            audioText: "Son las dos en punto",
            answer: "2:00",
            options: ["1:00", "2:00", "3:00", "4:00"]
          },
          {
            question: "Escucha: 'Son las cinco de la tarde'",
            audioText: "Son las cinco de la tarde",
            answer: "5:00",
            options: ["4:00", "5:00", "6:00", "7:00"]
          },
          {
            question: "Escucha: 'Es mediodía'",
            audioText: "Es mediodía",
            answer: "12:00",
            options: ["11:00", "12:00", "1:00", "2:00"]
          }
        ]
      },
      kinesthetic: {
        type: "clock-manipulation",
        title: "Mueve las Manecillas",
        description: "Arrastra las manecillas para marcar la hora correcta",
        exercises: [
          {
            question: "Mueve las manecillas para marcar las 4:00",
            targetTime: "4:00",
            clockType: "interactive"
          },
          {
            question: "Mueve las manecillas para marcar las 9:00",
            targetTime: "9:00",
            clockType: "interactive"
          },
          {
            question: "Mueve las manecillas para marcar las 6:00",
            targetTime: "6:00",
            clockType: "interactive"
          }
        ]
      }
    }
  }
];

// Made with Bob
