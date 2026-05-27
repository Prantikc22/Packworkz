import { useGetDashboardOrders } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  confirmed:    { label: "IN PRODUCTION", color: "#1B6CA8", bg: "rgba(27,108,168,0.10)" },
  in_production:{ label: "IN PRODUCTION", color: "#1B6CA8", bg: "rgba(27,108,168,0.10)" },
  qc_check:     { label: "QC CHECK",      color: "#D97706", bg: "rgba(232,168,56,0.15)" },
  dispatched:   { label: "DISPATCHED",    color: "#7C3AED", bg: "rgba(139,92,246,0.10)" },
  delivered:    { label: "DELIVERED",     color: "#16A34A", bg: "rgba(34,197,94,0.10)" },
  cancelled:    { label: "CANCELLED",     color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
  pending:      { label: "PENDING",       color: "#64748B", bg: "rgba(100,116,139,0.08)" },
};

const FILTERS = ["All", "In Production", "Dispatched", "Delivered"];

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

const PROD_STEPS = ["confirmed", "in_production", "qc_check", "dispatched", "delivered"];
function progressStep(status: string) {
  const idx = PROD_STEPS.indexOf(status);
  return idx < 0 ? 0 : idx;
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const { data: orders, isLoading, refetch } = useGetDashboardOrders({});

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = (orders as any[] ?? []).filter((o: any) => {
    if (filter === "All") return true;
    if (filter === "In Production") return o.status === "in_production" || o.status === "confirmed";
    if (filter === "Dispatched") return o.status === "dispatched";
    if (filter === "Delivered") return o.status === "delivered";
    return true;
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.navy }]}>Orders</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{(orders as any[] ?? []).length} total</Text>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && { borderBottomColor: colors.navy, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.filterText, { color: filter === f ? colors.navy : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.navy }]}>No orders yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Your confirmed orders will appear here.</Text>
            </View>
          }
          renderItem={({ item: order }: { item: any }) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const step = progressStep(order.status);
            const firstItem = Array.isArray(order.items) ? order.items[0] : null;
            return (
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <Text style={[styles.orderId, { color: colors.amber }]}>{order.order_id}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {firstItem && (
                  <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
                    {firstItem.product_name}
                  </Text>
                )}

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  {PROD_STEPS.map((s, i) => (
                    <View key={s} style={[styles.dot, { backgroundColor: i <= step ? colors.secondary : colors.border }]} />
                  ))}
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { width: `${(step / (PROD_STEPS.length - 1)) * 100}%` as any, backgroundColor: colors.secondary }]} />
                  </View>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={[styles.price, { color: colors.navy }]}>₹{fmt(Number(order.total_price))}</Text>
                  {order.estimated_delivery && (
                    <Text style={[styles.eta, { color: colors.mutedForeground }]}>
                      ETA {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
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
  count: { fontSize: 13 },
  filterRow: { flexDirection: "row", borderBottomWidth: 1 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  filterText: { fontSize: 13, fontWeight: "600" as const },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const, marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center", maxWidth: 260 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  orderId: { fontSize: 12, fontWeight: "800" as const, letterSpacing: 0.5, fontFamily: "monospace" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" as const, letterSpacing: 0.6 },
  productName: { fontSize: 14, fontWeight: "500" as const, marginBottom: 12 },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 4, position: "relative" as const },
  progressTrack: { position: "absolute" as const, left: 0, right: 0, height: 3, borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 16, fontWeight: "700" as const },
  eta: { fontSize: 12 },
});
