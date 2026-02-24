import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);

    // Load data saat app start
    useEffect(() => {
        loadTransactions();
    }, []);

    // Save setiap ada perubahan
    useEffect(() => {
        saveTransactions();
    }, [transactions]);

    const loadTransactions = async () => {
        try {
            const data = await AsyncStorage.getItem("transactions");
            if (data !== null) {
                setTransactions(JSON.parse(data));
            }
        } catch (error) {
            console.log("Load error", error);
        }
    };

    const saveTransactions = async () => {
        try {
            await AsyncStorage.setItem(
                "transactions",
                JSON.stringify(transactions)
            );
        } catch (error) {
            console.log("Save error", error);
        }
    };

    const addTransaction = (transaction) => {
        setTransactions((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                date: transaction.date || new Date().toISOString(),
                ...transaction,
            },
        ]);
    };

    const deleteTransaction = (id) => {
        setTransactions((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    return (
        <ExpenseContext.Provider
            value={{
                transactions,
                addTransaction,
                deleteTransaction,
            }}
        >
            {children}
        </ExpenseContext.Provider>
    );
};