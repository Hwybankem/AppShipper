import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { AuthContextProvider } from "@/context/AuthContext";
import { FirestoreProvider } from "@/context/storageFirebase";

export default function TabLayout() {
    return (
        <AuthContextProvider>
                <FirestoreProvider>
                    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
                        <Tabs.Screen
                            name="index"
                            options={{
                                title: 'Trang chủ',
                                tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                            }}
                        />
                        <Tabs.Screen
                            name="order"
                            options={{
                                title: 'Đơn hàng',
                                tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                            }}
                        />
                        <Tabs.Screen
                            name="profile"
                            options={{
                                title: 'profiles',
                                tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                            }}
                        />
                    </Tabs>
                </FirestoreProvider>
        </AuthContextProvider>
    );
} 