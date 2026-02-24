import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
} from "react-native";
import { useContext, useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ExpenseContext } from "../context/ExpenseContext";
import BalanceCard from "../components/BalanceCard";
import SummaryCard from "../components/SummaryCard";
import { colors } from "../theme/colors";

const categoryEmojis = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Salary: "💼",
    Entertainment: "🎮",
};

function getDateLabel(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (a, b) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getDateKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const FILTER_OPTIONS = [
    { key: "all", label: "All" },
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

export default function HomeScreen({ navigation }) {
    const { transactions, deleteTransaction } = useContext(ExpenseContext);
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

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTransaction(id),
                },
            ]
        );
    };

    const filtered = useMemo(
        () => filterTransactions(transactions, activeFilter, customDate),
        [transactions, activeFilter, customDate]
    );

    const totalIncome = filtered
        .filter((item) => item.type === "income")
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const totalExpense = filtered
        .filter((item) => item.type === "expense")
        .reduce((acc, item) => acc + Number(item.amount), 0);

    const total = totalIncome - totalExpense;

    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // Group filtered transactions by date (newest first)
    const sections = useMemo(() => {
        const grouped = {};
        filtered.forEach((tx) => {
            const txDate = tx.date || new Date(parseInt(tx.id)).toISOString();
            const key = getDateKey(txDate);
            if (!grouped[key]) {
                grouped[key] = { label: getDateLabel(txDate), dateKey: key, data: [] };
            }
            grouped[key].data.push(tx);
        });

        return Object.values(grouped).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    }, [filtered]);

    return (
        <View style={styles.container}>
            {/* Transaction List grouped by date */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.greeting}>Hello! 👋</Text>
                                <Text style={styles.dateText}>{dateStr}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.statsButton}
                                onPress={() => navigation.navigate("Stats")}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.statsButtonText}>📊 Stats</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Balance */}
                        <BalanceCard total={total} />

                        {/* Summary */}
                        <SummaryCard income={totalIncome} expense={totalExpense} />

                        {/* Date Filter */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterRow}
                            contentContainerStyle={{ gap: 8 }}
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
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>📝</Text>
                        <Text style={styles.emptyText}>
                            {activeFilter === "all"
                                ? "No transactions yet"
                                : "No transactions for this period"}
                        </Text>
                        <Text style={styles.emptySubText}>
                            {activeFilter === "all"
                                ? "Tap + to add your first transaction"
                                : "Try a different filter"}
                        </Text>
                    </View>
                }
                renderSectionHeader={({ section }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.label}</Text>
                        <Text style={styles.sectionCount}>
                            {section.data.length} transaction{section.data.length > 1 ? "s" : ""}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.transaction}
                        onLongPress={() => handleDelete(item.id)}
                        activeOpacity={0.7}
                    >
                        {/* Icon */}
                        <View style={styles.txIconContainer}>
                            <Text style={styles.txIcon}>
                                {categoryEmojis[item.category] || "📌"}
                            </Text>
                        </View>

                        {/* Info */}
                        <View style={styles.txInfo}>
                            <Text style={styles.txTitle}>{item.title}</Text>
                            <Text style={styles.txCategory}>
                                {item.category}
                                {item.date && (
                                    <>
                                        {"  ·  "}
                                        {new Date(item.date).toLocaleTimeString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </>
                                )}
                            </Text>
                        </View>

                        {/* Amount */}
                        <Text
                            style={[
                                styles.txAmount,
                                {
                                    color:
                                        item.type === "income"
                                            ? colors.income
                                            : colors.expense,
                                },
                            ]}
                        >
                            {item.type === "income" ? "+" : "-"} Rp{" "}
                            {Number(item.amount).toLocaleString("id-ID")}
                        </Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fabWrapper}
                onPress={() => navigation.navigate("Add Transaction")}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fab}
                >
                    <Text style={styles.fabText}>+</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    greeting: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    dateText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    statsButton: {
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statsButtonText: {
        color: colors.primaryLight,
        fontWeight: "700",
        fontSize: 14,
    },
    // Filter row
    filterRow: {
        marginBottom: 6,
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
    // Sections
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textSecondary,
        letterSpacing: 0.3,
    },
    sectionCount: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: "500",
    },
    transaction: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    txIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.surfaceLight,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    txIcon: {
        fontSize: 20,
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 3,
    },
    txCategory: {
        fontSize: 12,
        color: colors.textMuted,
    },
    txAmount: {
        fontWeight: "700",
        fontSize: 15,
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    emptySubText: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 4,
    },
    fabWrapper: {
        position: "absolute",
        bottom: 30,
        right: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fab: {
        width: 62,
        height: 62,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    fabText: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "600",
    },
});