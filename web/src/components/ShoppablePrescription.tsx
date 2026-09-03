/**
 * SHOPPABLE PRESCRIPTION - Drag & Drop Meal Builder
 * Story 2.2: "The Invisible Scribe"
 * 
 * Features:
 * - Drag-and-drop meal blocks
 * - Auto macro calculation
 * - Product catalog connection
 * - Shopping list generation
 */

import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
    GripVertical,
    Plus,
    Trash2,
    ShoppingCart,
    Salad,
    ExternalLink,
    Calculator,
    Package
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Types
interface MealBlock {
    id: string;
    name: string;
    icon: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: Ingredient[];
    color: string;
}

interface Ingredient {
    name: string;
    amount: string;
    productLink?: string;
}

interface DayPlan {
    day: string;
    meals: MealBlock[];
}

// Mock meal blocks catalog
const mealBlocksCatalog: MealBlock[] = [
    {
        id: 'breakfast-protein',
        name: 'Desayuno Proteico',
        icon: '🥚',
        calories: 450,
        protein: 35,
        carbs: 30,
        fat: 22,
        color: '#F59E0B',
        ingredients: [
            { name: 'Huevos', amount: '3 unidades', productLink: '#' },
            { name: 'Pan integral', amount: '2 rebanadas' },
            { name: 'Aguacate', amount: '1/2 unidad' },
        ]
    },
    {
        id: 'lunch-balanced',
        name: 'Almuerzo Balanceado',
        icon: '🥗',
        calories: 550,
        protein: 40,
        carbs: 45,
        fat: 20,
        color: '#10B981',
        ingredients: [
            { name: 'Pechuga de pollo', amount: '150g', productLink: '#' },
            { name: 'Arroz integral', amount: '100g' },
            { name: 'Vegetales mixtos', amount: '200g' },
        ]
    },
    {
        id: 'dinner-light',
        name: 'Cena Ligera',
        icon: '🐟',
        calories: 380,
        protein: 35,
        carbs: 20,
        fat: 18,
        color: '#3B82F6',
        ingredients: [
            { name: 'Salmón', amount: '120g', productLink: '#' },
            { name: 'Espárragos', amount: '150g' },
            { name: 'Aceite de oliva', amount: '1 cda' },
        ]
    },
    {
        id: 'snack-energy',
        name: 'Snack Energético',
        icon: '🥜',
        calories: 250,
        protein: 12,
        carbs: 20,
        fat: 15,
        color: '#8B5CF6',
        ingredients: [
            { name: 'Almendras', amount: '30g', productLink: '#' },
            { name: 'Yogurt griego', amount: '150g', productLink: '#' },
            { name: 'Miel', amount: '1 cdta' },
        ]
    },
    {
        id: 'pre-workout',
        name: 'Pre-Entreno',
        icon: '⚡',
        calories: 300,
        protein: 25,
        carbs: 35,
        fat: 8,
        color: '#EC4899',
        ingredients: [
            { name: 'Avena', amount: '50g' },
            { name: 'Whey Protein', amount: '1 scoop', productLink: '#' },
            { name: 'Banana', amount: '1 unidad' },
        ]
    },
    {
        id: 'post-workout',
        name: 'Post-Entreno',
        icon: '💪',
        calories: 400,
        protein: 40,
        carbs: 40,
        fat: 10,
        color: '#EF4444',
        ingredients: [
            { name: 'Whey Protein', amount: '2 scoops', productLink: '#' },
            { name: 'Frutos rojos', amount: '100g' },
            { name: 'Creatina', amount: '5g', productLink: '#' },
        ]
    },
];

const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function ShoppablePrescription() {
    const { mode } = useTheme();
    const [weekPlan, setWeekPlan] = useState<DayPlan[]>(
        weekDays.map(day => ({ day, meals: [] }))
    );
    const [selectedDay, setSelectedDay] = useState(0);
    const showCatalog = true;

    const accentColor = mode === 'CLINICAL' ? '#88B04B' : '#6366f1';
    const cardBg = mode === 'CLINICAL' ? 'var(--surface)' : 'var(--surface)';

    const addMealToDay = (meal: MealBlock) => {
        setWeekPlan(prev => {
            // Deep copy the specific day being modified
            const updated = [...prev];
            const currentDay = { ...updated[selectedDay] };

            currentDay.meals = [
                ...currentDay.meals,
                {
                    ...meal,
                    id: `${meal.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // More robust unique ID
                }
            ];

            updated[selectedDay] = currentDay;
            return updated;
        });
    };

    const removeMealFromDay = (mealId: string) => {
        setWeekPlan(prev => {
            const updated = [...prev];
            updated[selectedDay].meals = updated[selectedDay].meals.filter(m => m.id !== mealId);
            return updated;
        });
    };

    const reorderMeals = (newOrder: MealBlock[]) => {
        setWeekPlan(prev => {
            const updated = [...prev];
            updated[selectedDay].meals = newOrder;
            return updated;
        });
    };

    // Calculate daily totals
    const dailyTotals = weekPlan[selectedDay].meals.reduce(
        (acc, meal) => ({
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fat: acc.fat + meal.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Generate shopping list
    const generateShoppingList = (): Ingredient[] => {
        const allIngredients: Ingredient[] = [];
        weekPlan.forEach(day => {
            day.meals.forEach(meal => {
                allIngredients.push(...meal.ingredients);
            });
        });
        // Deduplicate by name
        const unique = allIngredients.reduce((acc, ing) => {
            const existing = acc.find(i => i.name === ing.name);
            if (!existing) acc.push(ing);
            return acc;
        }, [] as Ingredient[]);
        return unique;
    };

    return (
        <div className="shoppable-prescription">
            <div className="prescription-header">
                <div className="prescription-title">
                    <ShoppingCart size={24} style={{ color: accentColor }} />
                    <h2>Shoppable Prescription</h2>
                </div>
                <p className="prescription-subtitle">
                    Drag meal blocks to build weekly plans. Auto-generate shopping lists with purchase links.
                </p>
            </div>

            <div className="prescription-layout">
                {/* Left: Meal Blocks Catalog */}
                <AnimatePresence>
                    {showCatalog && (
                        <motion.div
                            className="catalog-panel"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ background: cardBg }}
                        >
                            <div className="catalog-header">
                                <Package size={18} />
                                <span>Meal Blocks</span>
                            </div>

                            <div className="catalog-grid">
                                {mealBlocksCatalog.map(meal => (
                                    <motion.div
                                        key={meal.id}
                                        className="catalog-item"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => addMealToDay(meal)}
                                        style={{ borderColor: meal.color }}
                                    >
                                        <div className="catalog-item-icon" style={{ background: `${meal.color}20` }}>
                                            {meal.icon}
                                        </div>
                                        <div className="catalog-item-info">
                                            <span className="catalog-item-name">{meal.name}</span>
                                            <span className="catalog-item-macros">
                                                {meal.calories} kcal · {meal.protein}g P
                                            </span>
                                        </div>
                                        <Plus size={16} style={{ color: accentColor }} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center: Day Planner */}
                <div className="planner-panel" style={{ background: cardBg }}>
                    {/* Day Tabs */}
                    <div className="day-tabs">
                        {weekDays.map((day, i) => (
                            <button
                                key={day}
                                className={`day-tab ${selectedDay === i ? 'active' : ''}`}
                                onClick={() => setSelectedDay(i)}
                                style={{
                                    borderColor: selectedDay === i ? accentColor : 'transparent',
                                    color: selectedDay === i ? accentColor : 'var(--text-muted)'
                                }}
                            >
                                {day.slice(0, 3)}
                                {weekPlan[i].meals.length > 0 && (
                                    <span className="meal-count">{weekPlan[i].meals.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Meal List */}
                    <div className="meal-list-container">
                        {weekPlan[selectedDay].meals.length === 0 ? (
                            <div className="empty-day">
                                <Salad size={48} style={{ color: 'var(--text-muted)' }} />
                                <p>Click a meal block to add it here</p>
                            </div>
                        ) : (
                            <Reorder.Group
                                axis="y"
                                values={weekPlan[selectedDay].meals}
                                onReorder={reorderMeals}
                                className="meal-list"
                            >
                                {weekPlan[selectedDay].meals.map(meal => (
                                    <Reorder.Item
                                        key={meal.id}
                                        value={meal}
                                        className="meal-item"
                                        style={{ borderLeftColor: meal.color }}
                                    >
                                        <GripVertical size={16} className="drag-handle" />
                                        <div className="meal-item-icon">{meal.icon}</div>
                                        <div className="meal-item-info">
                                            <span className="meal-item-name">{meal.name}</span>
                                            <div className="meal-item-macros">
                                                <span>{meal.calories} kcal</span>
                                                <span>{meal.protein}g P</span>
                                                <span>{meal.carbs}g C</span>
                                                <span>{meal.fat}g F</span>
                                            </div>
                                        </div>
                                        <button
                                            className="remove-meal"
                                            onClick={() => removeMealFromDay(meal.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        )}
                    </div>

                    {/* Daily Totals */}
                    <div className="daily-totals">
                        <div className="totals-header">
                            <Calculator size={16} />
                            <span>Daily Totals</span>
                        </div>
                        <div className="totals-grid">
                            <div className="total-item">
                                <span className="total-value">{dailyTotals.calories}</span>
                                <span className="total-label">kcal</span>
                            </div>
                            <div className="total-item protein">
                                <span className="total-value">{dailyTotals.protein}g</span>
                                <span className="total-label">Protein</span>
                            </div>
                            <div className="total-item carbs">
                                <span className="total-value">{dailyTotals.carbs}g</span>
                                <span className="total-label">Carbs</span>
                            </div>
                            <div className="total-item fat">
                                <span className="total-value">{dailyTotals.fat}g</span>
                                <span className="total-label">Fat</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Shopping List */}
                <div className="shopping-panel" style={{ background: cardBg }}>
                    <div className="shopping-header">
                        <ShoppingCart size={18} />
                        <span>Shopping List</span>
                    </div>

                    <div className="shopping-list">
                        {generateShoppingList().map((ingredient, i) => (
                            <div key={i} className="shopping-item">
                                <span className="ingredient-name">{ingredient.name}</span>
                                <span className="ingredient-amount">{ingredient.amount}</span>
                                {ingredient.productLink && (
                                    <a href={ingredient.productLink} className="product-link">
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        ))}
                        {generateShoppingList().length === 0 && (
                            <p className="shopping-empty">Add meals to generate shopping list</p>
                        )}
                    </div>

                    {generateShoppingList().length > 0 && (
                        <button className="buy-all-btn" style={{ background: accentColor }}>
                            <ShoppingCart size={16} />
                            Buy All ({generateShoppingList().length} items)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
