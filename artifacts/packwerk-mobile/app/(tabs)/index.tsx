import { useListProducts } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { slug: "flexible",   label: "Flexible" },
  { slug: "boxes",      label: "Boxes" },
  { slug: "ecommerce",  label: "E-commerce" },
  { slug: "rolls",      label: "Rolls" },
  { slug: "sustainable",label: "Eco" },
  { slug: "premium",    label: "Premium" },
];

function ProductCard({ product, onPress }: { product: any; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      testID={`product-card-${product.slug}`}
    >
      <View style={[styles.catPill, { backgroundColor: colors.navy + "12" }]}>
        <Text style={[styles.catText, { color: colors.navy }]}>
          {product.category?.toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={[styles.useCase, { color: colors.mutedForeground }]} numberOfLines={2}>
        {product.use_case}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.priceRange, { color: colors.navy }]}>
          ₹{product.price_min?.toFixed(2)}–{product.price_max?.toFixed(2)}
        </Text>
        <Text style={[styles.moq, { color: colors.mutedForeground }]}>
          MOQ {product.moq} {product.moq_unit}
        </Text>
        <View style={styles.badges}>
          {product.is_smartstock && (
            <View style={[styles.chip, { backgroundColor: colors.secondary + "18" }]}>
              <Text style={[styles.chipText, { color: colors.secondary }]}>SMART</Text>
            </View>
          )}
          {product.is_eco && (
            <View style={[styles.chip, { backgroundColor: "#22C55E18" }]}>
              <Text style={[styles.chipText, { color: "#16A34A" }]}>ECO</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(text), 400);
  };

  const { data, isLoading } = useListProducts(
    { search: debouncedSearch || undefined, category: category as any || undefined },
    { query: { queryKey: ["/api/products", debouncedSearch, category] } }
  );
  const products = (data as any)?.data ?? [];

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.eyebrow, { color: colors.secondary }]}>PACKWORKZ CATALOGUE</Text>
        <Text style={[styles.title, { color: colors.navy }]}>Products</Text>
      </View>

      {/* Search bar */}
      <View
        style={[
          styles.searchRow,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={handleSearch}
            placeholder="Search packaging..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search.length > 0 && (
            <Pressable
              onPress={() => {
                setSearch("");
                setDebouncedSearch("");
              }}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category filters */}
      <View style={{ backgroundColor: colors.background, paddingBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
        >
          <Pressable
            onPress={() => setCategory(undefined)}
            style={[
              styles.catBtn,
              { backgroundColor: !category ? colors.navy : colors.muted },
            ]}
          >
            <Text
              style={[
                styles.catBtnText,
                { color: !category ? "#fff" : colors.mutedForeground },
              ]}
            >
              All
            </Text>
          </Pressable>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.slug}
              onPress={() => setCategory(category === c.slug ? undefined : c.slug)}
              style={[
                styles.catBtn,
                {
                  backgroundColor:
                    category === c.slug ? colors.navy : colors.muted,
                },
              ]}
            >
              <Text
                style={[
                  styles.catBtnText,
                  {
                    color:
                      category === c.slug ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.secondary} size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item: any) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          }}
          scrollEnabled={!!products.length}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="box" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.navy }]}>No products found</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Try a different search or category.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <View style={{ flex: 1 }}>
              <ProductCard
                product={item}
                onPress={() => router.push(`/product/${item.slug}` as any)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchInput: { flex: 1, fontSize: 15 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  catBtnText: { fontSize: 13, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center", maxWidth: 260 },
  card: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  catPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  catText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  productName: { fontSize: 13, fontWeight: "700", marginBottom: 4, lineHeight: 18 },
  useCase: { fontSize: 11, lineHeight: 15, marginBottom: 10 },
  cardFooter: { flexDirection: "column", gap: 4 },
  priceRange: { fontSize: 12, fontWeight: "700" },
  moq: { fontSize: 10 },
  badges: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  chipText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
});
