import asyncio
import sys
from app.worker.dietqa_tasks import analyze_meal_image_task

async def main():
    print("Testing DietQA LLM Pipeline with structured outputs...")
    
    # Test 1: Real Food (Home Cooked)
    url_real_food = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    
    # Test 2: Commercial Label
    url_label = "https://cdn.nutritionix.com/solid_images/nutrition_label_example.png"
    
    # Test 3: Ambiguous / Blurry / Non-Food
    url_ambiguous = "https://images.unsplash.com/photo-1542291026-7eec264c27ff" # Just a shoe
    
    patient_id = "demo_patient_123"
    
    print("\n--- TEST 1: HOME COOKED MEAL ---")
    try:
        res = analyze_meal_image_task(url_real_food, patient_id, "corr_1")
        print(f"Confidence: {res['confidence_score']}")
        print(f"Source Type: {res['source_type']}")
        print(f"Is Commercial Label: {res['is_commercial_label']}")
        print(f"Calories: {res['total_calories']}")
    except Exception as e:
        print(f"Error: {e}")
        
    print("\n--- TEST 2: COMMERCIAL NUTRITION LABEL ---")
    try:
        res2 = analyze_meal_image_task(url_label, patient_id, "corr_2")
        print(f"Confidence: {res2['confidence_score']}")
        print(f"Source Type: {res2['source_type']}")
        print(f"Is Commercial Label: {res2['is_commercial_label']}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n--- TEST 3: AMBIGUOUS / NON-FOOD ---")
    try:
        res3 = analyze_meal_image_task(url_ambiguous, patient_id, "corr_3")
        print(f"Confidence: {res3['confidence_score']}")
        print(f"Source Type: {res3['source_type']}")
        print(f"Is Commercial Label: {res3['is_commercial_label']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
