import { useGetDashboardOverview } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const WHATSAPP = "https://wa.me/918208990366";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:    { label: "IN PRODUCTION", color: "#1B6CA8", bg: "rgba(27,108,168,0.10)" },
  in_production:{ label: "IN PRODUCTION", color: "#1B6CA8", bg: "rgba(27,108,168,0.10)" },
  qc_check:     { label: "QC CHECK",      color: "#D97706", bg: "rgba(232,168,56,0.15)" },
  dispatched:   { label: "DISPATCHED",    color: "#7C3AED", bg: "rgba(139,92,246,0.10)" },
  delivered:    { label: "DELIVERED",     color: "#16A34A", bg: "rgba(34,197,94,0.10)" },
  pending:      { label: "PENDING",       color: "#64748B", bg: "rgba(100,116,139,0.08)" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
      <Text style={{ color: c.color, fontSize: 10, fontWeight: "800" as const, letterSpacing: 0.6 }}>{c.label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch } = useGetDashboardOverview();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const companyName = (data as any)?.company_name ?? "";

  const stats = [
    { label: "Active Orders", value: (data as any)?.active_orders ?? 0, icon: "package" as const, color: colors.secondary },
    { label: "In Production", value: (data as any)?.in_production_count ?? 0, icon: "tool" as const, color: "#7C3AED" },
    { label: "Dispatched", value: (data as any)?.dispatched_count ?? 0, icon: "truck" as const, color: "#D97706" },
    { label: "Quotes Pending", value: (data as any)?.pending_quotes ?? 0, icon: "file-text" as const, color: colors.amber },
  ];

  const recentOrders = ((data as any)?.recent_orders as any[]) ?? [];
  const activeOrders = recentOrders.filter((o: any) => o.status !== "delivered" && o.status !== "cancelled").slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.secondary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100) }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
          <Text style={[styles.company, { color: colors.navy }]} numberOfLines={1}>{companyName || "Dashboard"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(WHATSAPP)}
          style={[styles.waBtn, { backgroundColor: "#25D366" }]}
        >
          <Feather name="message-circle" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + "18" }]}>
              <Feather name={stat.icon} size={16} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.navy }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Savings */}
      {(data as any)?.total_saved > 0 && (
        <View style={[styles.savingsCard, { backgroundColor: colors.navy, marginHorizontal: 16, borderRadius: colors.radius }]}>
          <Text style={[styles.savingsLabel, { color: colors.amber }]}>TOTAL SAVINGS</Text>
          <Text style={styles.savingsValue}>₹{fmt((data as any).total_saved)}</Text>
          <Text style={[styles.savingsSub, { color: "rgba(255,255,255,0.6)" }]}>vs market rate</Text>
        </View>
      )}

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <View style={{ marginTop: 24, marginHorizontal: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.navy }]}>Active Orders</Text>
          {activeOrders.map((order: any, idx: number) => (
            <View
              key={order.id ?? idx}
              style={[styles.orderCard, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <View style={styles.orderRow}>
                <Text style={[styles.orderId, { color: colors.amber }]}>
                  {order.order_id ?? `ORD-${idx + 1}`}
                </Text>
                <StatusBadge status={order.status} />
              </View>
              {Array.isArray(order.items) && order.items[0] && (
                <Text style={[styles.orderProduct, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {order.items[0].product_name}
                </Text>
              )}
              {order.total_price && (
                <Text style={[styles.orderPrice, { color: colors.navy }]}>₹{fmt(Number(order.total_price))}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* WhatsApp CTA */}
      <TouchableOpacity
        onPress={() => Linking.openURL(WHATSAPP)}
        style={[styles.ctaCard, { backgroundColor: colors.background, borderColor: colors.border, marginHorizontal: 16, marginTop: 20, borderRadius: colors.radius }]}
      >
        <Feather name="message-circle" size={20} color="#25D366" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.ctaTitle, { color: colors.navy }]}>Need help with your order?</Text>
          <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>WhatsApp us for instant support</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  greeting: { fontSize: 13, fontWeight: "500" as const },
  company: { fontSize: 22, fontWeight: "800" as const, letterSpacing: -0.3, marginTop: 2 },
  waBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  statCard: {
    flex: 1, minWidth: "44%", padding: 16, borderRadius: 12, borderWidth: 1,
  },
  statIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: "800" as const, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: "500" as const, marginTop: 2 },
  savingsCard: { padding: 20, marginTop: 8 },
  savingsLabel: { fontSize: 10, fontWeight: "800" as const, letterSpacing: 1.2, marginBottom: 4 },
  savingsValue: { fontSize: 32, fontWeight: "900" as const, color: "#fff", letterSpacing: -1 },
  savingsSub: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const, letterSpacing: -0.2, marginBottom: 10 },
  orderCard: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 10 },
  orderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  orderId: { fontSize: 12, fontWeight: "800" as const, letterSpacing: 0.5, fontFamily: "monospace" },
  orderProduct: { fontSize: 13, marginBottom: 4 },
  orderPrice: { fontSize: 15, fontWeight: "700" as const },
  ctaCard: { flexDirection: "row", alignItems: "center", padding: 16, borderWidth: 1 },
  ctaTitle: { fontSize: 14, fontWeight: "600" as const },
  ctaSub: { fontSize: 12, marginTop: 1 },
});
