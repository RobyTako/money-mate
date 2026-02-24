import AppNavigator from "./src/navigation/AppNavigator";
import { ExpenseProvider } from "./src/context/ExpenseContext";

export default function App() {
  return (
    <ExpenseProvider>
      <AppNavigator />
    </ExpenseProvider>
  );
}