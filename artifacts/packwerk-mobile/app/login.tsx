import { useLogin } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    loginMutation.mutate(
      { data: { email: email.trim(), password } },
      {
        onSuccess: async (data: any) => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await login(data.access_token, data.user);
          router.replace("/(tabs)/");
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Login failed", "Wrong email or password. Please try again.");
        },
      }
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1 },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60),
      paddingBottom: insets.bottom + 40,
      justifyContent: "center",
    },
    brandMark: {
      width: 48,
      height: 48,
      backgroundColor: colors.navy,
      borderRadius: 12,
      marginBottom: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    brandText: {
      color: colors.amber,
      fontSize: 22,
      fontWeight: "900" as const,
      letterSpacing: -0.5,
    },
    heading: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subheading: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 36,
    },
    label: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      textTransform: "uppercase" as const,
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.foreground,
      backgroundColor: colors.card,
      marginBottom: 20,
    },
    inputFocused: {
      borderColor: colors.secondary,
    },
    btn: {
      backgroundColor: colors.navy,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: {
      color: "#fff",
      fontWeight: "700" as const,
      fontSize: 16,
      letterSpacing: 0.3,
    },
    whatsapp: {
      marginTop: 24,
      alignItems: "center",
    },
    whatsappText: {
      fontSize: 13,
      color: colors.mutedForeground,
    },
    whatsappLink: {
      color: colors.secondary,
      fontWeight: "600" as const,
    },
  });

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.inner}>
          <View style={s.brandMark}>
            <Text style={s.brandText}>P</Text>
          </View>

          <Text style={s.heading}>Welcome back</Text>
          <Text style={s.subheading}>Sign in to manage your packaging orders</Text>

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="email-input"
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            testID="password-input"
          />

          <Pressable
            style={[s.btn, (loginMutation.isPending) && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            testID="login-btn"
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Sign In</Text>
            )}
          </Pressable>

          <View style={s.whatsapp}>
            <Text style={s.whatsappText}>
              Need help?{" "}
              <Text style={s.whatsappLink}>WhatsApp +91 82089 90366</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
