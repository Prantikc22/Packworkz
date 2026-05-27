import { useGetProduct } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const WHATSAPP = "https://wa.me/918208990366";

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, isLoading } = useGetProduct(slug ?? "");
  const [qty, setQty] = useState(1);

  const handleQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const msg = `Hi, I'm interested in ordering ${(product as any)?.name}. Quantity: ${qty} × ${(product as any)?.moq_unit}. Please send a quote.`;
    Linking.openURL(`${WHATSAPP}?text=${encodeURIComponent(msg)}`);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 15 }}>Product not found</Text>
      </View>
    );
  }

  const p = product as any;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Back button header */}
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.navy }]} numberOfLines={1}>
          {p.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 120),
        }}
      >
        {/* Hero block */}
        <View style={[styles.hero, { backgroundColor: colors.navy }]}>
          <View style={[styles.heroIconBox, { backgroundColor: colors.amber + "22" }]}>
            <Feather name="package" size={48} color={colors.amber} />
          </View>
          <View style={styles.heroBadges}>
            <View style={[styles.heroBadge, { backgroundColor: colors.amber }]}>
              <Text style={[styles.heroBadgeText, { color: colors.navy }]}>
                {p.category?.toUpperCase()}
              </Text>
            </View>
            {p.is_smartstock && (
              <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <Text style={[styles.heroBadgeText, { color: "#fff" }]}>SMARTSTOCK</Text>
              </View>
            )}
            {p.is_eco && (
              <View style={[styles.heroBadge, { backgroundColor: "#22C55E22" }]}>
                <Text style={[styles.heroBadgeText, { color: "#4ADE80" }]}>ECO</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroName}>{p.name}</Text>
          <Text style={styles.heroPrice}>
            ₹{p.price_min?.toFixed(2)} – ₹{p.price_max?.toFixed(2)} / unit
          </Text>
        </View>

        {/* Description */}
        <View style={{ padding: 20 }}>
          <Text style={[styles.desc, { color: colors.foreground }]}>{p.description}</Text>

          {p.use_case && (
            <View style={[styles.useCase, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.useCaseLabel, { color: colors.secondary }]}>IDEAL FOR</Text>
              <Text style={[styles.useCaseText, { color: colors.foreground }]}>{p.use_case}</Text>
            </View>
          )}
        </View>

        {/* Specs */}
        <View style={[styles.section, { marginHorizontal: 20, backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>Specifications</Text>
          <InfoRow label="MOQ" value={`${p.moq} ${p.moq_unit}`} />
          <InfoRow label="India delivery" value={`${p.delivery_days_india} days`} />
          <InfoRow label="Global delivery" value={`${p.delivery_days_global} days`} />
          {p.sample_tier !== "not_required" && (
            <InfoRow label="Sample" value={`₹${p.sample_price} (${p.sample_tier})`} />
          )}
          {p.compliance_certs?.length > 0 && (
            <InfoRow label="Certifications" value={p.compliance_certs.join(", ")} />
          )}
        </View>

        {/* Quantity picker */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Text style={[styles.qtyLabel, { color: colors.mutedForeground }]}>QUANTITY MULTIPLIER</Text>
          <View style={styles.qtyRow}>
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              style={[styles.qtyBtn, { borderColor: colors.border }]}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.qtyNum, { color: colors.navy }]}>{qty} × {p.moq} {p.moq_unit}</Text>
            <Pressable
              onPress={() => setQty((q) => q + 1)}
              style={[styles.qtyBtn, { borderColor: colors.border }]}
            >
              <Feather name="plus" size={18} color={colors.foreground} />
            </Pressable>
          </View>
          <Text style={[styles.estPrice, { color: colors.mutedForeground }]}>
            Est. ₹{((p.price_min ?? 0) * p.moq * qty).toLocaleString("en-IN")} –{" "}
            ₹{((p.price_max ?? 0) * p.moq * qty).toLocaleString("en-IN")}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.cta,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleQuote}
          style={[styles.ctaBtn, { backgroundColor: colors.navy }]}
          testID="get-quote-btn"
        >
          <Feather name="message-circle" size={18} color={colors.amber} />
          <Text style={styles.ctaBtnText}>Get a Quote via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  navTitle: { flex: 1, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  hero: { padding: 28, gap: 12 },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroBadges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  heroBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  heroBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  heroName: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  heroPrice: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  useCase: { borderRadius: 10, borderWidth: 1, padding: 14 },
  useCaseLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 6 },
  useCaseText: { fontSize: 14, lineHeight: 20 },
  section: { borderRadius: 12, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", letterSpacing: -0.1, marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "600" },
  qtyLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 15, fontWeight: "700", flex: 1, textAlign: "center" },
  estPrice: { fontSize: 13 },
  cta: { borderTopWidth: 1, paddingTop: 12, paddingHorizontal: 20 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 15 },
  ctaBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
