import { Recommendation, useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { brand, semantic } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DIFFICULTY_COLORS = {
  easy: semantic.positive,
  medium: brand.coffee,
  hard: brand.koi,
};

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const colors = useColors();
  const [applied, setApplied] = useState(false);
  const difficultyColor = DIFFICULTY_COLORS[rec.difficulty];

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setApplied(true);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: applied ? colors.primary + "50" : colors.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}
        >
          <Ionicons name={rec.icon as any} size={22} color={colors.primary} />
        </View>
        <View style={styles.cardMeta}>
          <View
            style={[
              styles.diffBadge,
              { backgroundColor: difficultyColor + "20" },
            ]}
          >
            <Text
              style={[
                styles.diffText,
                { color: difficultyColor, fontFamily: "Figtree_500Medium" },
              ]}
            >
              {rec.difficulty}
            </Text>
          </View>
          <Text
            style={[
              styles.savings,
              { color: colors.primary, fontFamily: "Figtree_700Bold" },
            ]}
          >
            +£{rec.savingsPerMonth}/mo
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.cardTitle,
          { color: colors.foreground, fontFamily: "Figtree_600SemiBold" },
        ]}
      >
        {rec.title}
      </Text>
      <Text
        style={[
          styles.cardDesc,
          { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" },
        ]}
      >
        {rec.description}
      </Text>
      <TouchableOpacity
        onPress={handleApply}
        disabled={applied}
        style={[
          styles.applyBtn,
          {
            backgroundColor: applied
              ? colors.primary + "20"
              : colors.primary,
          },
        ]}
      >
        <Ionicons
          name={applied ? "checkmark" : "flash-outline"}
          size={16}
          color={applied ? colors.primary : colors.primaryForeground}
        />
        <Text
          style={[
            styles.applyText,
            {
              color: applied ? colors.primary : colors.primaryForeground,
              fontFamily: "Figtree_600SemiBold",
            },
          ]}
        >
          {applied ? "Applied" : "Apply Now"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RecommendationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recommendations } = useEnergy();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const totalSavings = recommendations.reduce(
    (sum, r) => sum + r.savingsPerMonth,
    0
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[
          styles.title,
          { color: colors.foreground, fontFamily: "Figtree_700Bold" },
        ]}
      >
        Recommendations
      </Text>

      <View
        style={[
          styles.totalCard,
          {
            backgroundColor: colors.primary + "18",
            borderColor: colors.primary + "30",
          },
        ]}
      >
        <Ionicons name="trending-up-outline" size={28} color={colors.primary} />
        <View>
          <Text
            style={[
              styles.totalValue,
              { color: colors.primary, fontFamily: "Figtree_700Bold" },
            ]}
          >
            £{totalSavings}/month
          </Text>
          <Text
            style={[
              styles.totalLabel,
              { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" },
            ]}
          >
            potential savings from {recommendations.length} tips
          </Text>
        </View>
      </View>

      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 16 },
  totalCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  totalValue: { fontSize: 24 },
  totalLabel: { fontSize: 13, marginTop: 2 },
  card: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffText: { fontSize: 12, textTransform: "capitalize" },
  savings: { fontSize: 16 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13, lineHeight: 20 },
  applyBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  applyText: { fontSize: 14 },
});
