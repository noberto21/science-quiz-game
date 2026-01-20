import { drizzle } from "drizzle-orm/mysql2";
import { categories, questions } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const quizData = {
  categories: [
    { name: "Math", displayOrder: 1 },
    { name: "Chemistry", displayOrder: 2 },
    { name: "Biology", displayOrder: 3 },
  ],
  questions: {
    Math: {
      Easy: [
        {
          questionText: "What is 15 + 27?",
          optionA: "42",
          optionB: "41",
          optionC: "43",
          optionD: "40",
          correctAnswer: "A",
        },
        {
          questionText: "What is 8 × 7?",
          optionA: "54",
          optionB: "56",
          optionC: "58",
          optionD: "52",
          correctAnswer: "B",
        },
        {
          questionText: "What is 100 ÷ 4?",
          optionA: "20",
          optionB: "30",
          optionC: "25",
          optionD: "15",
          correctAnswer: "C",
        },
        {
          questionText: "What is 12 - 5?",
          optionA: "6",
          optionB: "7",
          optionC: "8",
          optionD: "9",
          correctAnswer: "B",
        },
        {
          questionText: "What is 6 × 6?",
          optionA: "32",
          optionB: "34",
          optionC: "36",
          optionD: "38",
          correctAnswer: "C",
        },
      ],
      Medium: [
        {
          questionText: "What is the square root of 144?",
          optionA: "10",
          optionB: "11",
          optionC: "12",
          optionD: "13",
          correctAnswer: "C",
        },
        {
          questionText: "What is 15% of 200?",
          optionA: "25",
          optionB: "30",
          optionC: "35",
          optionD: "40",
          correctAnswer: "B",
        },
        {
          questionText: "Solve: 3x + 7 = 22. What is x?",
          optionA: "3",
          optionB: "4",
          optionC: "5",
          optionD: "6",
          correctAnswer: "C",
        },
        {
          questionText: "What is 2³ + 3²?",
          optionA: "15",
          optionB: "16",
          optionC: "17",
          optionD: "18",
          correctAnswer: "C",
        },
        {
          questionText: "What is the perimeter of a rectangle with length 8 and width 5?",
          optionA: "24",
          optionB: "26",
          optionC: "28",
          optionD: "30",
          correctAnswer: "B",
        },
      ],
      Hard: [
        {
          questionText: "What is the derivative of x³?",
          optionA: "2x²",
          optionB: "3x²",
          optionC: "x²",
          optionD: "4x²",
          correctAnswer: "B",
        },
        {
          questionText: "Solve: log₂(64) = ?",
          optionA: "5",
          optionB: "6",
          optionC: "7",
          optionD: "8",
          correctAnswer: "B",
        },
        {
          questionText: "What is the integral of 2x?",
          optionA: "x²",
          optionB: "x² + C",
          optionC: "2x²",
          optionD: "2x² + C",
          correctAnswer: "B",
        },
        {
          questionText: "In a right triangle, if one angle is 30°, what is the other acute angle?",
          optionA: "45°",
          optionB: "50°",
          optionC: "60°",
          optionD: "70°",
          correctAnswer: "C",
        },
        {
          questionText: "What is the value of π (pi) to two decimal places?",
          optionA: "3.12",
          optionB: "3.14",
          optionC: "3.16",
          optionD: "3.18",
          correctAnswer: "B",
        },
      ],
    },
    Chemistry: {
      Easy: [
        {
          questionText: "What is the chemical symbol for water?",
          optionA: "H2O",
          optionB: "CO2",
          optionC: "O2",
          optionD: "NaCl",
          correctAnswer: "A",
        },
        {
          questionText: "What is the chemical symbol for gold?",
          optionA: "Go",
          optionB: "Gd",
          optionC: "Au",
          optionD: "Ag",
          correctAnswer: "C",
        },
        {
          questionText: "What is the most abundant gas in Earth's atmosphere?",
          optionA: "Oxygen",
          optionB: "Nitrogen",
          optionC: "Carbon Dioxide",
          optionD: "Hydrogen",
          correctAnswer: "B",
        },
        {
          questionText: "What is the pH of pure water?",
          optionA: "5",
          optionB: "6",
          optionC: "7",
          optionD: "8",
          correctAnswer: "C",
        },
        {
          questionText: "What is table salt chemically known as?",
          optionA: "Sodium Chloride",
          optionB: "Potassium Chloride",
          optionC: "Calcium Carbonate",
          optionD: "Magnesium Sulfate",
          correctAnswer: "A",
        },
      ],
      Medium: [
        {
          questionText: "What is Avogadro's number approximately?",
          optionA: "6.02 × 10²²",
          optionB: "6.02 × 10²³",
          optionC: "6.02 × 10²⁴",
          optionD: "6.02 × 10²⁵",
          correctAnswer: "B",
        },
        {
          questionText: "What type of bond involves the sharing of electrons?",
          optionA: "Ionic",
          optionB: "Metallic",
          optionC: "Covalent",
          optionD: "Hydrogen",
          correctAnswer: "C",
        },
        {
          questionText: "What is the atomic number of Carbon?",
          optionA: "4",
          optionB: "5",
          optionC: "6",
          optionD: "7",
          correctAnswer: "C",
        },
        {
          questionText: "Which element has the symbol 'Fe'?",
          optionA: "Fluorine",
          optionB: "Iron",
          optionC: "Fermium",
          optionD: "Francium",
          correctAnswer: "B",
        },
        {
          questionText: "What is the process of a solid turning directly into a gas called?",
          optionA: "Evaporation",
          optionB: "Condensation",
          optionC: "Sublimation",
          optionD: "Deposition",
          correctAnswer: "C",
        },
      ],
      Hard: [
        {
          questionText: "What is the electron configuration of Oxygen?",
          optionA: "1s² 2s² 2p⁴",
          optionB: "1s² 2s² 2p⁶",
          optionC: "1s² 2s² 2p³",
          optionD: "1s² 2s² 2p⁵",
          correctAnswer: "A",
        },
        {
          questionText: "What is the hybridization of carbon in methane (CH₄)?",
          optionA: "sp",
          optionB: "sp²",
          optionC: "sp³",
          optionD: "sp³d",
          correctAnswer: "C",
        },
        {
          questionText: "Which law states that equal volumes of gases at the same temperature and pressure contain equal numbers of molecules?",
          optionA: "Boyle's Law",
          optionB: "Charles's Law",
          optionC: "Avogadro's Law",
          optionD: "Dalton's Law",
          correctAnswer: "C",
        },
        {
          questionText: "What is the standard enthalpy of formation for elements in their standard state?",
          optionA: "Zero",
          optionB: "Positive",
          optionC: "Negative",
          optionD: "Variable",
          correctAnswer: "A",
        },
        {
          questionText: "What type of reaction is the Haber process?",
          optionA: "Decomposition",
          optionB: "Synthesis",
          optionC: "Single displacement",
          optionD: "Double displacement",
          correctAnswer: "B",
        },
      ],
    },
    Biology: {
      Easy: [
        {
          questionText: "What is the powerhouse of the cell?",
          optionA: "Nucleus",
          optionB: "Mitochondria",
          optionC: "Ribosome",
          optionD: "Chloroplast",
          correctAnswer: "B",
        },
        {
          questionText: "What do plants use to make food?",
          optionA: "Respiration",
          optionB: "Photosynthesis",
          optionC: "Digestion",
          optionD: "Fermentation",
          correctAnswer: "B",
        },
        {
          questionText: "How many chambers does a human heart have?",
          optionA: "Two",
          optionB: "Three",
          optionC: "Four",
          optionD: "Five",
          correctAnswer: "C",
        },
        {
          questionText: "What is the largest organ in the human body?",
          optionA: "Heart",
          optionB: "Liver",
          optionC: "Brain",
          optionD: "Skin",
          correctAnswer: "D",
        },
        {
          questionText: "What gas do plants absorb from the atmosphere?",
          optionA: "Oxygen",
          optionB: "Nitrogen",
          optionC: "Carbon Dioxide",
          optionD: "Hydrogen",
          correctAnswer: "C",
        },
      ],
      Medium: [
        {
          questionText: "What is the basic unit of heredity?",
          optionA: "Cell",
          optionB: "Chromosome",
          optionC: "Gene",
          optionD: "DNA",
          correctAnswer: "C",
        },
        {
          questionText: "What type of blood cells fight infection?",
          optionA: "Red blood cells",
          optionB: "White blood cells",
          optionC: "Platelets",
          optionD: "Plasma cells",
          correctAnswer: "B",
        },
        {
          questionText: "What is the process by which cells divide to form two identical daughter cells?",
          optionA: "Meiosis",
          optionB: "Mitosis",
          optionC: "Binary fission",
          optionD: "Budding",
          correctAnswer: "B",
        },
        {
          questionText: "Which organ produces insulin?",
          optionA: "Liver",
          optionB: "Kidney",
          optionC: "Pancreas",
          optionD: "Spleen",
          correctAnswer: "C",
        },
        {
          questionText: "What is the study of fungi called?",
          optionA: "Botany",
          optionB: "Zoology",
          optionC: "Mycology",
          optionD: "Microbiology",
          correctAnswer: "C",
        },
      ],
      Hard: [
        {
          questionText: "What is the name of the process where RNA is synthesized from DNA?",
          optionA: "Translation",
          optionB: "Transcription",
          optionC: "Replication",
          optionD: "Transformation",
          correctAnswer: "B",
        },
        {
          questionText: "Which organelle is responsible for protein synthesis?",
          optionA: "Golgi apparatus",
          optionB: "Endoplasmic reticulum",
          optionC: "Ribosome",
          optionD: "Lysosome",
          correctAnswer: "C",
        },
        {
          questionText: "What is the diploid number of chromosomes in humans?",
          optionA: "23",
          optionB: "46",
          optionC: "48",
          optionD: "92",
          correctAnswer: "B",
        },
        {
          questionText: "What is the primary function of the Krebs cycle?",
          optionA: "Produce glucose",
          optionB: "Generate ATP",
          optionC: "Synthesize proteins",
          optionD: "Replicate DNA",
          correctAnswer: "B",
        },
        {
          questionText: "Which hormone regulates the sleep-wake cycle?",
          optionA: "Insulin",
          optionB: "Cortisol",
          optionC: "Melatonin",
          optionD: "Adrenaline",
          correctAnswer: "C",
        },
      ],
    },
  },
};

async function seed() {
  try {
    console.log("Starting database seed...");

    // Insert categories
    console.log("Inserting categories...");
    const insertedCategories = await db.insert(categories).values(quizData.categories).$returningId();
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Fetch category IDs
    const allCategories = await db.select().from(categories);
    const categoryMap = {};
    allCategories.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // Insert questions
    console.log("Inserting questions...");
    let totalQuestions = 0;

    for (const [categoryName, difficulties] of Object.entries(quizData.questions)) {
      const categoryId = categoryMap[categoryName];
      
      for (const [difficulty, questionList] of Object.entries(difficulties)) {
        const questionsToInsert = questionList.map((q) => ({
          categoryId,
          difficulty,
          ...q,
        }));

        await db.insert(questions).values(questionsToInsert);
        totalQuestions += questionsToInsert.length;
        console.log(`Inserted ${questionsToInsert.length} ${difficulty} questions for ${categoryName}`);
      }
    }

    console.log(`✓ Seed completed! Total questions: ${totalQuestions}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
