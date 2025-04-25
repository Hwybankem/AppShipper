import { Stack } from 'expo-router/stack';
import { AuthContextProvider } from "@/context/AuthContext";
import { FirestoreProvider } from "@/context/storageFirebase";

export default function Layout() {
  return (
    <AuthContextProvider>
      <FirestoreProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="map"
            options={{
              headerShown: true,
              title: 'Bản đồ chỉ đường',
              headerBackTitle: 'Quay lại'
            }}
          />
        </Stack>
      </FirestoreProvider>
    </AuthContextProvider>
  );
} 