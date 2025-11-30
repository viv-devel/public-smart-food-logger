export const generateTemplate = () => {
  const now = new Date();
  const log_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const log_time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return JSON.stringify(
    {
      foods: [
        {
          foodName: "Example Salmon Teriyaki",
          amount: 1,
          unit: "serving",
          calories: 450,
          description: "A delicious salmon teriyaki fillet.",
          formType: "DRY",
          protein_g: 35,
          totalFat_g: 20,
          saturatedFat_g: 4,
          transFat_g: 0,
          cholesterol_mg: 110,
          sodium_mg: 600,
          potassium_mg: 400,
          totalCarbohydrate_g: 30,
          dietaryFiber_g: 2,
          sugars_g: 15,
          iron_mg: 1.5,
          vitaminD_iu: 600,
        },
        {
          foodName: "White Rice",
          amount: 150,
          unit: "g",
          calories: 205,
          description: "Steamed white rice.",
          formType: "DRY",
          totalCarbohydrate_g: 45,
          protein_g: 4,
        },
      ],
      log_date: log_date,
      log_time: log_time,
      meal_type: "Dinner",
    },
    null,
    2,
  );
};
