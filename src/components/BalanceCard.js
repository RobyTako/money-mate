import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

export default function BalanceCard({ total }) {
    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <Text style={styles.label}>💰 Total Balance</Text>
            <Text style={styles.amount}>
                Rp {total.toLocaleString()}
            </Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 28,
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
    label: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 14,
        marginBottom: 10,
        fontWeight: "500",
        letterSpacing: 0.5,
    },
    amount: {
        color: "#FFFFFF",
        fontSize: 34,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
});