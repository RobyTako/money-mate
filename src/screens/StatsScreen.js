import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useContext, useState, useMemo } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { PieChart } from "react-native-chart-kit";
import { colors } from "../theme/colors";

const FILTER_OPTIONS = [
    { key: "all", label: "All Time" },
    { key: "today", label: "Today" },
    { key: "7days", label: "7 Days" },
    { key: "30days", label: "30 Days" },
    { key: "custom", label: "Custom" },
];

function filterTransactions(transactions, filterKey, customDate) {
    if (filterKey === "all") return transactions;

    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (filterKey === "today") {
        const todayStart = startOfDay(now);
        return transactions.filter((tx) => {
            const txDate = new Date(tx.date || parseInt(tx.id));
            return txDate >= todayStart;
        });
    }

    if (filterKey === "7days") {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 7);
        return transactions.filter((tx) => {
            const txDate = new Date(tx.date || parseInt(tx.id));
            return txDate >= startOfDay(cutoff);
        });
    }

    if (filterKey === "30days") {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 30);
        return transactions.filter((tx) => {
            const txDate = new Date(tx.date || parseInt(tx.id));
            return txDate >= startOfDay(cutoff);
        });
    }

    if (filterKey === "custom" && customDate) {
        const target = startOfDay(customDate);
        const nextDay = new Date(target);
        nextDay.setDate(nextDay.getDate() + 1);
        return transactions.filter((tx) => {
            const txDate = new Date(tx.date || parseInt(tx.id));
            return txDate >= target && txDate < nextDay;
        });
    }

    return transactions;
}

export default function StatsScreen() {
    const { transactions } = useContext(ExpenseContext);
    const [activeFilter, setActiveFilter] = useState("all");
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [customDateText, setCustomDateText] = useState("");
    const [customDate, setCustomDate] = useState(null);

    const handleFilterPress = (key) => {
        if (key === "custom") {
            setActiveFilter("custom");
            setShowCustomDate(true);
        } else {
            setActiveFilter(key);
            setShowCustomDate(false);
            setCustomDateText("");
            setCustomDate(null);
        }
    };

    const handleCustomDateInput = (text) => {
        setCustomDateText(text);
        const parts = text.split("/");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const parsed = new Date(year, month, day);
            if (!isNaN(parsed.getTime()) && day > 0 && day <= 31 && month >= 0 && month <= 11) {
                setCustomDate(parsed);
            }
        }
    };

    const filtered = useMemo(
        () => filterTransactions(transactions, activeFilter, customDate),
        [transactions, activeFilter, customDate]
    );

    // ===============================
    // Income vs Expense
    // ===============================

    const totalIncome = filtered
        .filter((item) => item.type === "income")
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const totalExpense = filtered
        .filter((item) => item.type === "expense")
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const incomeExpenseData = [
        {
            name: "Income",
            amount: totalIncome,
            color: colors.income,
            legendFontColor: colors.textSecondary,
            legendFontSize: 13,
        },
        {
            name: "Expense",
            amount: totalExpense,
            color: colors.expense,
            legendFontColor: colors.textSecondary,
            legendFontSize: 13,
        },
    ];

    // ===============================
    // Expense per Category
    // ===============================

    const expenseTransactions = filtered.filter(
        (item) => item.type === "expense"
    );

    const categoryMap = {};

    expenseTransactions.forEach((item) => {
        if (categoryMap[item.category]) {
            categoryMap[item.category] += Number(item.amount);
        } else {
            categoryMap[item.category] = Number(item.amount);
        }
    });

    const chartColors = [
        "#A78BFA",
        "#60A5FA",
        "#F472B6",
        "#34D399",
        "#FBBF24",
        "#FB923C",
    ];

    const categoryData = Object.keys(categoryMap).map((key, index) => ({
        name: key,
        amount: categoryMap[key],
        color: chartColors[index % chartColors.length],
        legendFontColor: colors.textSecondary,
        legendFontSize: 13,
    }));

    const screenWidth = Dimensions.get("window").width;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Date Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            >
                {FILTER_OPTIONS.map((opt) => (
                    <TouchableOpacity
                        key={opt.key}
                        style={[
                            styles.filterChip,
                            activeFilter === opt.key && styles.filterChipActive,
                        ]}
                        onPress={() => handleFilterPress(opt.key)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                activeFilter === opt.key && styles.filterChipTextActive,
                            ]}
                        >
                            {opt.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {showCustomDate && (
                <TextInput
                    style={styles.customDateInput}
                    value={customDateText}
                    onChangeText={handleCustomDateInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                />
            )}

            {/* Filter info */}
            {activeFilter !== "all" && (
                <Text style={styles.filterInfo}>
                    📅 Showing: {
                        activeFilter === "today" ? "Today" :
                            activeFilter === "7days" ? "Last 7 days" :
                                activeFilter === "30days" ? "Last 30 days" :
                                    customDate ? customDate.toLocaleDateString("id-ID", {
                                        day: "numeric", month: "short", year: "numeric"
                                    }) : "Select a date"
                    }
                    {" · "}{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                </Text>
            )}

            {/* Income vs Expense Card */}
            <View style={styles.chartCard}>
                <Text style={styles.title}>💹 Income vs Expense</Text>

                {filtered.length > 0 ? (
                    <PieChart
                        data={incomeExpenseData}
                        width={screenWidth - 72}
                        height={200}
                        chartConfig={{
                            color: () => colors.textSecondary,
                        }}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📊</Text>
                        <Text style={styles.emptyText}>No data for this period</Text>
                    </View>
                )}
            </View>

            {/* Expense by Category Card */}
            <View style={styles.chartCard}>
                <Text style={styles.title}>📂 Expense by Category</Text>

                {categoryData.length > 0 ? (
                    <PieChart
                        data={categoryData}
                        width={screenWidth - 72}
                        height={200}
                        chartConfig={{
                            color: () => colors.textSecondary,
                        }}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🗂️</Text>
                        <Text style={styles.emptyText}>No expense data</Text>
                    </View>
                )}
            </View>

            {/* Summary Footer */}
            {filtered.length > 0 && (
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Transactions</Text>
                        <Text style={styles.summaryValue}>{filtered.length}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={[styles.summaryValue, { color: colors.income }]}>
                            Rp {totalIncome.toLocaleString("id-ID")}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Expense</Text>
                        <Text style={[styles.summaryValue, { color: colors.expense }]}>
                            Rp {totalExpense.toLocaleString("id-ID")}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Net Balance</Text>
                        <Text
                            style={[
                                styles.summaryValue,
                                {
                                    color:
                                        totalIncome - totalExpense >= 0
                                            ? colors.income
                                            : colors.expense,
                                },
                            ]}
                        >
                            Rp {(totalIncome - totalExpense).toLocaleString("id-ID")}
                        </Text>
                    </View>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    // Filter
    filterRow: {
        marginBottom: 10,
        flexGrow: 0,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primaryDark,
        borderColor: colors.primary,
    },
    filterChipText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    customDateInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        color: colors.textPrimary,
        fontSize: 14,
    },
    filterInfo: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 14,
        fontWeight: "500",
    },
    // Charts
    chartCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 16,
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 30,
    },
    emptyEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textMuted,
        fontWeight: "500",
    },
    summaryCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    summaryValue: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
});