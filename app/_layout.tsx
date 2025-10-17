// app/_layout.tsx
import { useRouter, Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { LinearGradient } from "expo-linear-gradient";
import { UserProvider } from "./context/userContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <GluestackUIProvider mode="light">
        <Stack>
          <Stack.Screen
            name="login"
            options={{ title: "Login", headerShown: false }}
          />
          <Stack.Screen
            name="register"
            options={{ title: "Register", headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ headerShown: false }} />
          <Stack.Screen name="editModal" options={{ headerShown: false }} />
        </Stack>
      </GluestackUIProvider>
    </UserProvider>
  );
}
