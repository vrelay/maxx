import ButtonStart from "@/src/componants/atoms/startbutton";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface Task {
  id: string;
  title: string;
  description: string;
  levels: number;
}

const startDayOne = () => {
  router.push("/mainScreen");
};

const planData: { [key: string]: Task[] } = {
  "Month 1-2": [
    { id: "1", title: "Jaw & Face", description: "Mewing and chewing exercises daily", levels: 2 },
    { id: "2", title: "Skin", description: "Tretinoin + Ceramide routine", levels: 5 },
    { id: "3", title: "Hair", description: "Fade cut + Sea salt spray styling", levels: 3 },
    { id: "4", title: "Body", description: "12% body fat + Lean muscle", levels: 2 },
    { id: "5", title: "Eyes", description: "Gua Sha for lymphatic drainage", levels: 6 },
  ],
  "Month 3-4": [
    { id: "6", title: "Posture", description: "Daily stretching and strengthening", levels: 4 },
    { id: "7", title: "Style", description: "Develop a personal aesthetic", levels: 5 },
    { id: "8", title: "Diet", description: "Focus on whole foods and hydration", levels: 3 },
    { id: "9", title: "Mindset", description: "Practice confidence-building exercises", levels: 7 },
    { id: "10", title: "Grooming", description: "Establish a consistent grooming routine", levels: 4 },
  ],
  "Month 5-6": [
    { id: "11", title: "Advanced Skincare", description: "Incorporate weekly masks and peels", levels: 6 },
    { id: "12", title: "Fitness II", description: "Focus on symmetry and proportion", levels: 5 },
    { id: "13", title: "Social Skills", description: "Practice active listening and charisma", levels: 8 },
    { id: "14", title: "Habits", description: "Solidify all new routines", levels: 5 },
    { id: "15", title: "Reflection", description: "Assess progress and set new goals", levels: 4 },
  ],
};

const TaskCard = ({ item }: { item: Task }) => (
  <View style={styles.cardWrapper}>
    <View style={styles.taskCard}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.taskTextContainer}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
      <View style={styles.levelPill}>
        <Text style={styles.taskLevel}>+{item.levels} levels</Text>
      </View>
    </View>
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0)'
      ]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.gradientBorder}
    />
  </View>
);

const LooksmaxxingPlanScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Month 1-2");
  const tabs = ["Month 1-2", "Month 3-4", "Month 5-6"];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>{"\u2190"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Looksmaxxing Plan</Text>
            <View style={{ width: scale(20) }} />
          </View>
          <View style={styles.content}>
            <View style={styles.tabContainer}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FlatList
              data={planData[activeTab]}
              renderItem={({ item }) => <TaskCard item={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
          <ButtonStart text="Start Day 1" handlepress={startDayOne} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2D1B69",
    paddingBottom: verticalScale(20),
  },
  container: {
    flex: 1,
    paddingHorizontal: scale(15),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  backButton: {
    color: "#fff",
    fontSize: moderateScale(28),
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#5f50986b",
    borderRadius: moderateScale(12),
    padding: scale(4),
    marginBottom: verticalScale(24),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#e1e2e6ff",
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  activeTabText: {
    color: "#2D1B69",
  },
  listContainer: {
    paddingBottom: verticalScale(20),
  },
  cardWrapper: {
    marginBottom: verticalScale(16),
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingBottom: verticalScale(12),
  },
  gradientBorder: {
    height: 1,
    width: '100%',
  },
  imagePlaceholder: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(12),
    backgroundColor: "rgba(255,255,255,0.15)",
    marginRight: scale(16),
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  taskDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  levelPill: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
  },
  taskLevel: {
    color: "#2F1C6A",
    fontWeight: "700",
    fontSize: moderateScale(13),
  },
});

export default LooksmaxxingPlanScreen;