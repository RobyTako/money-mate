import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function SummaryCard({ income, expense }) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={[styles.accentBar, { backgroundColor: colors.income }]} />
                <View style={styles.cardContent}>
                    <Text style={styles.label}>▲ Income</Text>
                    <Text style={[styles.amount, { color: colors.income }]}>
                        Rp {income.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={[styles.accentBar, { backgroundColor: colors.expense }]} />
                <View style={styles.cardContent}>
                    <Text style={styles.label}>▼ Expense</Text>
                    <Text style={[styles.amount, { color: colors.expense }]}>
                        Rp {expense.toLocaleString()}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    card: {
        backgroundColor: colors.surface,
        flex: 1,
        borderRadius: 16,
        marginHorizontal: 5,
        flexDirection: "row",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
    },
    accentBar: {
        width: 4,
    },
    cardContent: {
        padding: 16,
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 6,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    amount: {
        fontSize: 17,
        fontWeight: "bold",
    },
});