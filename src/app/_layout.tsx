import { Stack, router } from "expo-router";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#38bdf8",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Audit Logs (SQLite)",
            headerRight: () => (
              <Pressable onPress={() => router.push("/create-log")}>
                <Text
                  style={{ color: "#38bdf8", fontWeight: "bold", fontSize: 16 }}
                >
                  + Add
                </Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="create-log"
          options={{ title: "New Inspection Log", presentation: "modal" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
