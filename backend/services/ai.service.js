import axios from "axios";

export const generateDishDescription = async ({
  name,
  category,
  spiceLevel,
  price,
}) => {

  const prompt = `
You are a professional food menu and metadata generator for a food delivery platform named Snackr.

Generate ONLY valid JSON.
No markdown backticks.
No conversational explanation.

Dish Details:
- Name: ${name}
- Category: ${category}
- Spice Level: ${spiceLevel}
- Base Price: ₹${price}

Output JSON Schema:
{
  "description": "An enticing, professional 1-2 sentence description of the dish highlighting taste and preparation.",
  "tags": ["3-5 descriptive culinary tags like 'Spicy', 'Crispy', 'Comfort Food']",
  "allergens": ["list of common allergens like 'Dairy', 'Gluten', 'Nuts' or 'None'"],
  "serves": "1-2 People",
  "bestFor": ["Lunch", "Dinner", "Snack", "Late Night"]
}
`;

  // Mock fallback logic kept intact if Ollama is unreachable
  if (process.env.OLLAMA_BYPASS === "true") {
    return {
      description: `Delicious ${name} freshly prepared with authentic spices and ingredients, served hot and fresh.`,
      tags: [category || "Fresh", spiceLevel || "Medium", "Popular"],
      allergens: ["Dairy", "Gluten"],
      serves: "1-2 People",
      bestFor: ["Lunch", "Dinner"],
    };
  }

  try {
    const url = `http://127.0.0.1:11434/api/generate`;
    const response = await axios.post(
      url,
      {
        model: "llama3.2:1b",
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.4,
          num_predict: 500,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000, // 60 seconds timeout for CPU inference
      }
    );

    const textContent = response.data?.response;

    if (!textContent) {
      throw new Error("Empty response from Ollama API");
    }

    const cleanJson = textContent.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Ollama AI Food Metadata Generation Error:", error.message);
    return {
      description: `Freshly prepared ${name}, crafted with authentic ingredients and rich flavors.`,
      tags: [category || "Popular", spiceLevel || "Flavorful", "Chef Special"],
      allergens: ["None declared"],
      serves: "1 Person",
      bestFor: ["Lunch", "Dinner"],
    };
  }
};

export default {
  generateDishDescription,
};