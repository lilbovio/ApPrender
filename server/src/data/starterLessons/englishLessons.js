// 5 Starter English Lessons for Chispapp
// Each lesson includes VAK-adapted content

export const englishStarterLessons = [
  {
    title: "👋 Saludos y Presentaciones",
    description: "Aprende a saludar y presentarte en inglés",
    subject: "english",
    grade: "1",
    icon: "👋",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "illustrated-dialogue",
        title: "Conversaciones Ilustradas",
        description: "Mira las imágenes y aprende los saludos",
        exercises: [
          {
            question: "¿Cómo se dice 'Hola' en inglés?",
            image: "Dos personas saludándose",
            answer: "Hello",
            options: ["Hello", "Goodbye", "Thanks", "Please"]
          },
          {
            question: "¿Qué significa 'Good morning'?",
            image: "Sol saliendo por la mañana",
            answer: "Buenos días",
            options: ["Buenas noches", "Buenos días", "Buenas tardes", "Adiós"]
          },
          {
            question: "¿Cómo se dice 'Me llamo...' en inglés?",
            image: "Persona presentándose",
            answer: "My name is...",
            options: ["My name is...", "I am fine", "How are you?", "Nice to meet you"]
          }
        ]
      },
      auditory: {
        type: "pronunciation-practice",
        title: "Practica la Pronunciación",
        description: "Escucha y repite los saludos",
        exercises: [
          {
            question: "Escucha y repite: 'Hello, how are you?'",
            audioText: "Hello, how are you?",
            phonetic: "/həˈloʊ, haʊ ɑːr juː/",
            answer: "Hello, how are you?",
            options: ["Hello, how are you?", "Goodbye", "Thank you", "Please"]
          },
          {
            question: "Escucha: '¿Cómo se pronuncia Good morning?'",
            audioText: "Good morning",
            phonetic: "/ɡʊd ˈmɔːrnɪŋ/",
            answer: "Good morning",
            options: ["Good night", "Good morning", "Good afternoon", "Good evening"]
          },
          {
            question: "Escucha y repite: 'Nice to meet you'",
            audioText: "Nice to meet you",
            phonetic: "/naɪs tuː miːt juː/",
            answer: "Nice to meet you",
            options: ["Nice to meet you", "See you later", "How are you", "What's your name"]
          }
        ]
      },
      kinesthetic: {
        type: "role-play",
        title: "Juego de Roles",
        description: "Practica conversaciones interactivas",
        exercises: [
          {
            question: "Completa el diálogo: 'Hello! ___ name is Maria'",
            dialogue: ["Hello!", "___", "Nice to meet you!"],
            answer: "My",
            options: ["My", "Your", "His", "Her"]
          },
          {
            question: "Ordena la conversación correctamente",
            sentences: ["Nice to meet you too!", "Hello, my name is John", "Hi! My name is Sarah", "Nice to meet you!"],
            correctOrder: [1, 2, 3, 0]
          },
          {
            question: "Arrastra la respuesta correcta: 'How are you?' → '___'",
            prompt: "How are you?",
            answer: "I'm fine, thank you",
            options: ["I'm fine, thank you", "My name is...", "Goodbye", "Hello"]
          }
        ]
      }
    }
  },
  {
    title: "🎨 Colores en Inglés",
    description: "Aprende los colores básicos en inglés",
    subject: "english",
    grade: "1",
    icon: "🎨",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "color-chart",
        title: "Tabla de Colores",
        description: "Observa y memoriza los colores",
        exercises: [
          {
            question: "¿Cómo se dice 'rojo' en inglés?",
            colorSample: "#FF0000",
            answer: "Red",
            options: ["Red", "Blue", "Green", "Yellow"]
          },
          {
            question: "¿De qué color es el cielo? (en inglés)",
            image: "Cielo azul",
            answer: "Blue",
            options: ["Red", "Blue", "Green", "Yellow"]
          },
          {
            question: "¿Qué color es este? 🟢",
            colorSample: "#00FF00",
            answer: "Green",
            options: ["Red", "Blue", "Green", "Yellow"]
          }
        ]
      },
      auditory: {
        type: "color-pronunciation",
        title: "Pronuncia los Colores",
        description: "Escucha y aprende a pronunciar los colores",
        exercises: [
          {
            question: "Escucha y repite: 'Red'",
            audioText: "Red",
            phonetic: "/red/",
            answer: "Red",
            options: ["Red", "Blue", "Green", "Yellow"]
          },
          {
            question: "Escucha la canción: 'Red and yellow and pink and green...'",
            audioText: "Red and yellow and pink and green, purple and orange and blue",
            answer: "Rainbow song",
            colors: ["red", "yellow", "pink", "green", "purple", "orange", "blue"]
          },
          {
            question: "Escucha: ¿Qué color es? 'Blue'",
            audioText: "Blue",
            phonetic: "/bluː/",
            answer: "Blue",
            options: ["Red", "Blue", "Green", "Black"]
          }
        ]
      },
      kinesthetic: {
        type: "color-matching",
        title: "Empareja los Colores",
        description: "Arrastra cada color a su nombre en inglés",
        exercises: [
          {
            question: "Arrastra el color rojo a 'Red'",
            colors: ["🔴", "🔵", "🟢", "🟡"],
            labels: ["Red", "Blue", "Green", "Yellow"],
            correctMatches: {
              "🔴": "Red",
              "🔵": "Blue",
              "🟢": "Green",
              "🟡": "Yellow"
            }
          },
          {
            question: "Toca todos los objetos azules",
            objects: ["🔵", "🟦", "🔴", "🟢", "💙", "🟡"],
            correctObjects: ["🔵", "🟦", "💙"]
          },
          {
            question: "Pinta el objeto del color correcto: 'Paint it red'",
            object: "apple",
            targetColor: "red",
            colorOptions: ["red", "blue", "green", "yellow"]
          }
        ]
      }
    }
  },
  {
    title: "🐶 Animales Comunes",
    description: "Conoce los nombres de animales en inglés",
    subject: "english",
    grade: "1",
    icon: "🐶",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "animal-pictures",
        title: "Imágenes de Animales",
        description: "Observa los animales y aprende sus nombres",
        exercises: [
          {
            question: "¿Cómo se dice 'perro' en inglés?",
            image: "🐶",
            answer: "Dog",
            options: ["Dog", "Cat", "Bird", "Fish"]
          },
          {
            question: "¿Qué animal es este? 🐱",
            image: "🐱",
            answer: "Cat",
            options: ["Dog", "Cat", "Mouse", "Rabbit"]
          },
          {
            question: "¿Cómo se llama este animal en inglés? 🐦",
            image: "🐦",
            answer: "Bird",
            options: ["Fish", "Bird", "Frog", "Snake"]
          }
        ]
      },
      auditory: {
        type: "animal-sounds",
        title: "Sonidos de Animales",
        description: "Escucha los sonidos y nombres de los animales",
        exercises: [
          {
            question: "Escucha el sonido: '¿Qué animal hace Woof woof?'",
            audioText: "Woof woof",
            sound: "dog_bark",
            answer: "Dog",
            options: ["Dog", "Cat", "Cow", "Sheep"]
          },
          {
            question: "Escucha: 'The cat says...'",
            audioText: "The cat says meow",
            sound: "cat_meow",
            answer: "Meow",
            options: ["Woof", "Meow", "Moo", "Baa"]
          },
          {
            question: "Escucha y repite: 'Elephant'",
            audioText: "Elephant",
            phonetic: "/ˈelɪfənt/",
            answer: "Elephant",
            options: ["Elephant", "Lion", "Tiger", "Bear"]
          }
        ]
      },
      kinesthetic: {
        type: "animal-matching",
        title: "Juego de Animales",
        description: "Arrastra cada animal a su nombre",
        exercises: [
          {
            question: "Empareja los animales con sus nombres",
            animals: ["🐶", "🐱", "🐦", "🐟"],
            names: ["Dog", "Cat", "Bird", "Fish"],
            correctMatches: {
              "🐶": "Dog",
              "🐱": "Cat",
              "🐦": "Bird",
              "🐟": "Fish"
            }
          },
          {
            question: "Agrupa los animales: ¿Cuáles vuelan?",
            animals: ["🐦", "🦅", "🐶", "🐱", "🦋", "🐟"],
            category: "flying",
            correctAnimals: ["🐦", "🦅", "🦋"]
          },
          {
            question: "Toca los animales de granja",
            animals: ["🐄", "🐷", "🐔", "🐶", "🦁", "🐘"],
            correctAnimals: ["🐄", "🐷", "🐔"]
          }
        ]
      }
    }
  },
  {
    title: "🍎 Frutas y Comidas",
    description: "Aprende los nombres de frutas y comidas en inglés",
    subject: "english",
    grade: "1",
    icon: "🍎",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "food-pictures",
        title: "Imágenes de Comida",
        description: "Observa las frutas y comidas",
        exercises: [
          {
            question: "¿Cómo se dice 'manzana' en inglés?",
            image: "🍎",
            answer: "Apple",
            options: ["Apple", "Orange", "Banana", "Grape"]
          },
          {
            question: "¿Qué fruta es esta? 🍌",
            image: "🍌",
            answer: "Banana",
            options: ["Apple", "Banana", "Orange", "Strawberry"]
          },
          {
            question: "¿Cómo se llama en inglés? 🍊",
            image: "🍊",
            answer: "Orange",
            options: ["Lemon", "Orange", "Apple", "Peach"]
          }
        ]
      },
      auditory: {
        type: "food-pronunciation",
        title: "Pronuncia las Comidas",
        description: "Escucha y repite los nombres de las comidas",
        exercises: [
          {
            question: "Escucha y repite: 'Apple'",
            audioText: "Apple",
            phonetic: "/ˈæpəl/",
            answer: "Apple",
            options: ["Apple", "Orange", "Banana", "Grape"]
          },
          {
            question: "Escucha: 'I like to eat...'",
            audioText: "I like to eat pizza",
            answer: "Pizza",
            options: ["Pizza", "Burger", "Salad", "Soup"]
          },
          {
            question: "Escucha la canción: 'Apples and bananas'",
            audioText: "I like to eat, eat, eat apples and bananas",
            answer: "Apples and bananas",
            foods: ["apples", "bananas"]
          }
        ]
      },
      kinesthetic: {
        type: "food-sorting",
        title: "Clasifica las Comidas",
        description: "Arrastra cada comida a su categoría",
        exercises: [
          {
            question: "Arrastra las frutas al canasto",
            items: ["🍎", "🍌", "🍕", "🍊", "🍔", "🍇"],
            category: "fruits",
            correctItems: ["🍎", "🍌", "🍊", "🍇"]
          },
          {
            question: "Empareja la comida con su nombre",
            foods: ["🍎", "🍌", "🍊", "🍇"],
            names: ["Apple", "Banana", "Orange", "Grape"],
            correctMatches: {
              "🍎": "Apple",
              "🍌": "Banana",
              "🍊": "Orange",
              "🍇": "Grape"
            }
          },
          {
            question: "Toca las comidas saludables",
            foods: ["🍎", "🥗", "🍟", "🥦", "🍕", "🥕"],
            correctFoods: ["🍎", "🥗", "🥦", "🥕"]
          }
        ]
      }
    }
  },
  {
    title: "🏠 La Familia",
    description: "Aprende los miembros de la familia en inglés",
    subject: "english",
    grade: "1",
    icon: "🏠",
    xp: 50,
    vakType: "all",
    content: {
      visual: {
        type: "family-tree",
        title: "Árbol Familiar",
        description: "Observa el árbol familiar y aprende los nombres",
        exercises: [
          {
            question: "¿Cómo se dice 'madre' en inglés?",
            image: "Mujer adulta con niño",
            answer: "Mother",
            options: ["Mother", "Father", "Sister", "Brother"]
          },
          {
            question: "¿Qué significa 'Father'?",
            image: "Hombre adulto con familia",
            answer: "Padre",
            options: ["Madre", "Padre", "Hermano", "Abuelo"]
          },
          {
            question: "¿Cómo se dice 'hermana' en inglés?",
            image: "Dos niñas juntas",
            answer: "Sister",
            options: ["Mother", "Sister", "Brother", "Daughter"]
          }
        ]
      },
      auditory: {
        type: "family-pronunciation",
        title: "Pronuncia la Familia",
        description: "Escucha y aprende a pronunciar los miembros de la familia",
        exercises: [
          {
            question: "Escucha y repite: 'Mother'",
            audioText: "Mother",
            phonetic: "/ˈmʌðər/",
            answer: "Mother",
            options: ["Mother", "Father", "Sister", "Brother"]
          },
          {
            question: "Escucha: 'This is my father'",
            audioText: "This is my father",
            answer: "Father",
            options: ["Mother", "Father", "Brother", "Grandfather"]
          },
          {
            question: "Escucha la canción: 'Finger Family'",
            audioText: "Daddy finger, daddy finger, where are you?",
            answer: "Daddy finger",
            familyMembers: ["daddy", "mommy", "brother", "sister", "baby"]
          }
        ]
      },
      kinesthetic: {
        type: "family-matching",
        title: "Juego de la Familia",
        description: "Arrastra cada miembro a su nombre en inglés",
        exercises: [
          {
            question: "Empareja los miembros de la familia",
            members: ["👨", "👩", "👦", "👧"],
            names: ["Father", "Mother", "Brother", "Sister"],
            correctMatches: {
              "👨": "Father",
              "👩": "Mother",
              "👦": "Brother",
              "👧": "Sister"
            }
          },
          {
            question: "Construye tu árbol familiar: Arrastra 'Mother' y 'Father' arriba",
            positions: ["top-left", "top-right", "bottom-left", "bottom-right"],
            members: ["Mother", "Father", "Me", "Sister"],
            correctPositions: {
              "Mother": "top-left",
              "Father": "top-right",
              "Me": "bottom-left",
              "Sister": "bottom-right"
            }
          },
          {
            question: "Toca todos los adultos de la familia",
            members: ["👨", "👩", "👴", "👵", "👦", "👧"],
            correctMembers: ["👨", "👩", "👴", "👵"]
          }
        ]
      }
    }
  }
];

// Made with Bob
