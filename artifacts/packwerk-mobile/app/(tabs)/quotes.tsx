import { useGetDashboardQuotes, useAcceptDashboardQuote } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted:  { label: "SUBMITTED",  color: "#64748B", bg: "rgba(100,116,139,0.08)" },
  reviewing:  { label: "REVIEWING",  color: "#1B6CA8", bg: "rgba(27,108,168,0.10)" },
  quoted:     { label: "QUOTED",     color: "#D97706", bg: "rgba(232,168,56,0.15)" },
  accepted:   { label: "ACCEPTED",   color: "#16A34A", bg: "rgba(34,197,94,0.10)" },
  rejected:   { label: "REJECTED",   color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function daysUntilExpiry(createdAt: string) {
  const expiry = new Date(createdAt).getTime() + 7 * 86400000;
  return Math.max(0, Math.round((expiry - Date.now()) / 86400000));
}

export default function QuotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmQuote, setConfirmQuote] = useState<any>(null);
  const { data: quotes, isLoading, refetch } = useGetDashboardQuotes();
  const acceptMutation = useAcceptDashboardQuote();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAccept = (quote: any) => {
    setConfirmQuote(quote);
  };

  const confirmAccept = () => {
    if (!confirmQuote) return;
    acceptMutation.mutate(
      confirmQuote.id,
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setConfirmQuote(null);
          refetch();
        },
        onError: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Error", "Could not accept this quote. Please try again.");
        },
      }
    );
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.navy }]}>Quotes</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{(quotes as any[] ?? []).length} total</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} size="large" />
        </View>
      ) : (
        <FlatList
          data={quotes as any[]}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          }}
          scrollEnabled={!!((quotes as any[] ?? []).length)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="file-text" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.navy }]}>No quotes yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Request a quote from the Products tab to get started.</Text>
            </View>
          }
          renderItem={({ item: quote }: { item: any }) => {
            const cfg = STATUS_CONFIG[quote.status] ?? STATUS_CONFIG.submitted;
            const firstItem = Array.isArray(quote.items) ? quote.items[0] : null;
            const daysLeft = quote.status === "quoted" ? daysUntilExpiry(quote.created_at) : null;
            return (
              <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <Text style={[styles.quoteId, { color: colors.amber }]}>{quote.quote_id}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {firstItem && (
                  <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
                    {firstItem.product_name ?? firstItem.product_id}
                  </Text>
                )}

                <View style={styles.metaRow}>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {new Date(quote.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  {(quote.quoted_amount || quote.total_estimated_max) && (
                    <Text style={[styles.price, { color: colors.navy }]}>
                      ₹{fmt(Number(quote.quoted_amount || quote.total_estimated_max))}
                    </Text>
                  )}
                </View>

                {daysLeft !== null && (
                  <View style={[styles.expiryBanner, { backgroundColor: daysLeft <= 2 ? "rgba(239,68,68,0.08)" : "rgba(232,168,56,0.10)" }]}>
                    <Feather name="clock" size={12} color={daysLeft <= 2 ? "#EF4444" : "#D97706"} />
                    <Text style={[styles.expiryText, { color: daysLeft <= 2 ? "#EF4444" : "#D97706" }]}>
                      {daysLeft === 0 ? "Expires today" : `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
                    </Text>
                  </View>
                )}

                {quote.status === "quoted" && (
                  <TouchableOpacity
                    onPress={() => handleAccept(quote)}
                    style={[styles.acceptBtn, { backgroundColor: colors.navy }]}
                  >
                    <Text style={styles.acceptText}>Confirm Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Confirm Modal */}
      <Modal visible={!!confirmQuote} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.navy }]}>Confirm your order?</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Once confirmed, production will begin and cannot be cancelled.
            </Text>
            {confirmQuote && (
              <View style={[styles.modalDetails, { borderColor: colors.border }]}>
                <Text style={[styles.modalId, { color: colors.amber }]}>{confirmQuote.quote_id}</Text>
                {(confirmQuote.quoted_amount || confirmQuote.total_estimated_max) && (
                  <Text style={[styles.modalPrice, { color: colors.navy }]}>
                    ₹{fmt(Number(confirmQuote.quoted_amount || confirmQuote.total_estimated_max))}
                  </Text>
                )}
              </View>
            )}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setConfirmQuote(null)}
                style={[styles.modalCancel, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmAccept}
                style={[styles.modalConfirm, { backgroundColor: colors.navy }]}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.5 },
  count: { fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" as const, marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center", maxWidth: 260 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  quoteId: { fontSize: 12, fontWeight: "800" as const, letterSpacing: 0.5, fontFamily: "monospace" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" as const, letterSpacing: 0.6 },
  productName: { fontSize: 14, fontWeight: "500" as const, marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  meta: { fontSize: 12 },
  price: { fontSize: 16, fontWeight: "700" as const },
  expiryBanner: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 6, marginTop: 10 },
  expiryText: { fontSize: 12, fontWeight: "600" as const },
  acceptBtn: { borderRadius: 8, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  acceptText: { color: "#fff", fontWeight: "700" as const, fontSize: 14 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modal: { borderRadius: 16, padding: 24, width: "100%" },
  modalTitle: { fontSize: 20, fontWeight: "800" as const, marginBottom: 6 },
  modalSub: { fontSize: 13, marginBottom: 16 },
  modalDetails: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 20 },
  modalId: { fontSize: 12, fontWeight: "800" as const, letterSpacing: 0.5, fontFamily: "monospace", marginBottom: 4 },
  modalPrice: { fontSize: 20, fontWeight: "800" as const },
  modalActions: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 13, alignItems: "center" },
  modalCancelText: { fontSize: 14, fontWeight: "600" as const },
  modalConfirm: { flex: 1, borderRadius: 8, paddingVertical: 13, alignItems: "center" },
  modalConfirmText: { color: "#fff", fontSize: 14, fontWeight: "700" as const },
});
