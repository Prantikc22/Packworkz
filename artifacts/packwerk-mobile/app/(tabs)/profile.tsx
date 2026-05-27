import { useGetDashboardProfile, useUpdateDashboardProfile } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { data: profile, isLoading } = useGetDashboardProfile();
  const { mutate: updateProfile, isPending } = useUpdateDashboardProfile();

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    phone: "",
    gstin: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      const addr = (profile as any).default_address ?? {};
      setForm({
        company_name: (profile as any).company_name ?? "",
        contact_name: (profile as any).contact_name ?? "",
        phone: (profile as any).phone ?? "",
        gstin: (profile as any).gstin ?? "",
        city: addr.city ?? "",
        state: addr.state ?? "",
        pincode: addr.pincode ?? "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile(
      {
        data: {
          company_name: form.company_name,
          contact_name: form.contact_name,
          phone: form.phone,
          gstin: form.gstin || undefined,
          default_address: {
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: "India",
          } as any,
        },
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Error", "Could not save profile. Please try again.");
        },
      }
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const email = (profile as any)?.email ?? "";

  const Field = ({ label, value, key2, multiline = false }: { label: string; value: string; key2: keyof typeof form; multiline?: boolean }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
        value={value}
        onChangeText={(v) => setForm((f) => ({ ...f, [key2]: v }))}
        placeholder={label}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.navy }]}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
        }}
      >
        {/* Avatar block */}
        <View style={[styles.avatarBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.navy }]}>
            <Text style={styles.avatarText}>{(form.company_name || email || "?")[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.avatarName, { color: colors.navy }]} numberOfLines={1}>{form.company_name || "Your Company"}</Text>
            <Text style={[styles.avatarEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{email}</Text>
          </View>
        </View>

        {/* Form fields */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>Company Details</Text>
          <Field label="Company Name" value={form.company_name} key2="company_name" />
          <Field label="Contact Name" value={form.contact_name} key2="contact_name" />
          <Field label="Phone" value={form.phone} key2="phone" />
          <Field label="GSTIN" value={form.gstin} key2="gstin" />
        </View>

        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>Delivery Address</Text>
          <Field label="City" value={form.city} key2="city" />
          <Field label="State" value={form.state} key2="state" />
          <Field label="Pincode" value={form.pincode} key2="pincode" />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isPending}
          style={[styles.saveBtn, { backgroundColor: saved ? "#22C55E" : colors.navy, opacity: isPending ? 0.7 : 1 }]}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>{saved ? "Saved!" : "Save Changes"}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.5 },
  avatarBlock: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" as const },
  avatarName: { fontSize: 16, fontWeight: "700" as const, letterSpacing: -0.2 },
  avatarEmail: { fontSize: 12, marginTop: 2 },
  section: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700" as const, marginBottom: 16, letterSpacing: -0.1 },
  label: { fontSize: 11, fontWeight: "600" as const, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  saveBtn: { borderRadius: 10, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" as const },
});
