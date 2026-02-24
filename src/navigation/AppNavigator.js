import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import StatsScreen from "../screens/StatsScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();

const screenOptions = {
    headerStyle: {
        backgroundColor: colors.background,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
        fontWeight: "700",
        fontSize: 18,
    },
    headerShadowVisible: false,
    contentStyle: {
        backgroundColor: colors.background,
    },
};

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            <Stack.Navigator screenOptions={screenOptions}>
                <Stack.Screen
                    name="MoneyMate"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Add Transaction"
                    component={AddTransactionScreen}
                    options={{ title: "New Transaction" }}
                />
                <Stack.Screen
                    name="Stats"
                    component={StatsScreen}
                    options={{ title: "Statistics" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}