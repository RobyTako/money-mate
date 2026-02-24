import { useState, useContext } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ExpenseContext } from "../context/ExpenseContext";
import { colors } from "../theme/colors";

const categoryEmojis = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Salary: "💼",
    Entertainment: "🎮",
};

// Format number with dot separators: 1000000 → 1.000.000
function formatWithDots(numStr) {
    const cleaned = numStr.replace(/\D/g, "");
    if (!cleaned) return "";
    return Number(cleaned).toLocaleString("id-ID");
}

// Strip dots to get raw number string
function stripDots(formatted) {
    return formatted.replace(/\./g, "");
}

export default function AddTransactionScreen({ navigation }) {
    const { addTransaction } = useContext(ExpenseContext);

    const [title, setTitle] = useState("");
    const [amountDisplay, setAmountDisplay] = useState("");
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("Food");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDateInput, setShowDateInput] = useState(false);
    const [dateText, setDateText] = useState("");

    const categories = [
        "Food",
        "Transport",
        "Shopping",
        "Salary",
        "Entertainment",
    ];

    const handleAmountChange = (text) => {
        const raw = text.replace(/\D/g, "");
        setAmountDisplay(raw ? formatWithDots(raw) : "");
    };

    const formatDate = (date) => {
        return date.toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleDateInput = (text) => {
        setDateText(text);
        const parts = text.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const parsed = new Date(year, month, day);
            if (!isNaN(parsed.getTime()) && day > 0 && day <= 31 && month >= 0 && month <= 11) {
                const now = new Date();
                parsed.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                setSelectedDate(parsed);
            }
        }
    };

    const setQuickDate = (daysAgo) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        setSelectedDate(d);
        setShowDateInput(false);
        setDateText("");
    };

    const handleSave = () => {
        const rawAmount = stripDots(amountDisplay);
        if (!title || !rawAmount) return;

        addTransaction({
            title,
            amount: rawAmount,
            type,
            category,
            date: selectedDate.toISOString(),
        });

        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Type Toggle */}
            <Text style={styles.label}>Transaction Type</Text>
            <View style={styles.typeContainer}>
                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        type === "income" && styles.typeButtonActiveIncome,
                    ]}
                    onPress={() => setType("income")}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.typeText,
                            type === "income" && styles.typeTextActive,
                        ]}
                    >
                        💰 Income
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        type === "expense" && styles.typeButtonActiveExpense,
                    ]}
                    onPress={() => setType("expense")}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.typeText,
                            type === "expense" && styles.typeTextActive,
                        ]}
                    >
                        💸 Expense
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <Text style={styles.label}>📅 Date</Text>
            <View style={styles.dateSection}>
                <View style={styles.dateDisplay}>
                    <Text style={styles.dateDisplayText}>
                        {formatDate(selectedDate)}
                    </Text>
                    <Text style={styles.dateDisplayTime}>
                        {formatTime(selectedDate)}
                    </Text>
                </View>

                <View style={styles.quickDateRow}>
                    <TouchableOpacity
                        style={[
                            styles.quickDateChip,
                            isToday(selectedDate) && !showDateInput && styles.quickDateChipActive,
                        ]}
                        onPress={() => setQuickDate(0)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.quickDateText,
                                isToday(selectedDate) && !showDateInput && styles.quickDateTextActive,
                            ]}
                        >
                            Today
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.quickDateChip,
                            isYesterday(selectedDate) && !showDateInput && styles.quickDateChipActive,
                        ]}
                        onPress={() => setQuickDate(1)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.quickDateText,
                                isYesterday(selectedDate) && !showDateInput && styles.quickDateTextActive,
                            ]}
                        >
                            Yesterday
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.quickDateChip,
                            showDateInput && styles.quickDateChipActive,
                        ]}
                        onPress={() => setShowDateInput(!showDateInput)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.quickDateText,
                                showDateInput && styles.quickDateTextActive,
                            ]}
                        >
                            Custom
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDateInput && (
                    <TextInput
                        style={styles.dateInput}
                        value={dateText}
                        onChangeText={handleDateInput}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                    />
                )}
            </View>

            {/* Title Input */}
            <Text style={styles.label}>Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Lunch, Freelance pay..."
                placeholderTextColor={colors.textMuted}
            />

            {/* Amount Input */}
            <Text style={styles.label}>Amount (Rp)</Text>
            <View style={styles.amountInputWrapper}>
                <Text style={styles.amountPrefix}>Rp</Text>
                <TextInput
                    style={styles.amountInput}
                    value={amountDisplay}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                />
            </View>

            {/* Category Chips */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
                {categories.map((item) => {
                    const isSelected = category === item;
                    return (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.categoryChip,
                                isSelected && styles.categoryChipActive,
                            ]}
                            onPress={() => setCategory(item)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    isSelected && styles.categoryChipTextActive,
                                ]}
                            >
                                {categoryEmojis[item]} {item}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveWrapper}
                onPress={handleSave}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButton}
                >
                    <Text style={styles.saveText}>Save Transaction ✓</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

// Helper functions
function isToday(date) {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    label: {
        marginBottom: 8,
        fontWeight: "600",
        fontSize: 14,
        color: colors.textSecondary,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        borderRadius: 14,
        marginBottom: 22,
        color: colors.textPrimary,
        fontSize: 15,
    },
    // Amount with Rp prefix
    amountInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        marginBottom: 22,
        paddingHorizontal: 16,
    },
    amountPrefix: {
        color: colors.textMuted,
        fontSize: 15,
        fontWeight: "700",
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        paddingVertical: 16,
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: "600",
    },
    // Date section
    dateSection: {
        marginBottom: 22,
    },
    dateDisplay: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    dateDisplayText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    dateDisplayTime: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    quickDateRow: {
        flexDirection: "row",
        gap: 8,
    },
    quickDateChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quickDateChipActive: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
    },
    quickDateText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    quickDateTextActive: {
        color: "#FFFFFF",
    },
    dateInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        borderRadius: 14,
        marginTop: 10,
        color: colors.textPrimary,
        fontSize: 15,
    },
    // Categories
    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 24,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipActive: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
    },
    categoryChipText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    categoryChipTextActive: {
        color: "#FFFFFF",
    },
    // Type toggle
    typeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: "center",
        marginHorizontal: 5,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeButtonActiveIncome: {
        backgroundColor: colors.incomeDark,
        borderColor: colors.income,
    },
    typeButtonActiveExpense: {
        backgroundColor: colors.expenseDark,
        borderColor: colors.expense,
    },
    typeText: {
        color: colors.textSecondary,
        fontWeight: "600",
        fontSize: 15,
    },
    typeTextActive: {
        color: "#FFFFFF",
    },
    // Save
    saveWrapper: {
        marginTop: 8,
        marginBottom: 40,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButton: {
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
    },
    saveText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 0.5,
    },
});