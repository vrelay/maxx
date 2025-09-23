import GridBackgroundImg from "@/src/componants/atoms/gridbackground";
import ButtonStart from "@/src/componants/atoms/startbutton";
import { useAuth } from "@/src/context/AuthContext";
import looksmaxxingService from "@/src/services/looksmaxxingService";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

// Static planData removed - now using dynamic data from looksmaxxing results

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Month 1-2");
  const [looksmaxxingResults, setLooksmaxxingResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [planData, setPlanData] = useState<{ [key: string]: Task[] }>({});
  const tabs = ["Month 1-2", "Month 3-4", "Month 5-6"];

  // Function to fetch looksmaxxing data and organize it
  const fetchAndOrganizeData = async () => {
    try {
      setLoading(true);
      const result = await looksmaxxingService.getJsonFromFirestore(
        user?.uid as string,
        "looksmaxxing_results"
      );
      
      if (result.success) {
        const data = result.data.data.advice_json;
        setLooksmaxxingResults(data);
        
        // Organize priorities by time horizon
        const organizedData = organizeDataByTimeHorizon(data);
        setPlanData(organizedData);
      }
    } catch (error) {
      console.error("Error fetching looksmaxxing data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to organize data by time horizon
  const organizeDataByTimeHorizon = (data: any) => {
    const priorities = data.priorities || [];
    const recommendations = data.recommendations || {};
    
    const organized: { [key: string]: Task[] } = {
      "Month 1-2": [],
      "Month 3-4": [],
      "Month 5-6": []
    };

    priorities.forEach((priority: any, index: number) => {
      const formattedArea = priority.area
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const task: Task = {
        id: `priority_${index}`,
        title: formattedArea,
        description: priority.improvement_habits,
        levels: Math.round((100 - priority.score) / 10)
      };

      // Organize by time horizon
      switch (priority.time_horizon) {
        case "now":
          organized["Month 1-2"].push(task);
          break;
        case "2-4w":
          organized["Month 1-2"].push(task);
          break;
        case "1-3m":
          organized["Month 3-4"].push(task);
          break;
        default:
          organized["Month 1-2"].push(task);
      }
    });

    // Add recommendations as additional tasks
    Object.entries(recommendations).forEach(([area, tips]: [string, any]) => {
      if (Array.isArray(tips) && tips.length > 0) {
        const formattedArea = area
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        const task: Task = {
          id: `rec_${area}`,
          title: formattedArea,
          description: tips[0], // Use first tip as description
          levels: 3 // Default level improvement
        };

        // Add to Month 5-6 for advanced recommendations
        organized["Month 5-6"].push(task);
      }
    });

    return organized;
  };

  // Load data on component mount
  useEffect(() => {
    if (user?.uid) {
      fetchAndOrganizeData();
    }
  }, [user?.uid]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GridBackgroundImg top={true} />
      <LinearGradient
        colors={["#171840", "#6D37D4"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
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
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading your personalized plan...</Text>
              </View>
            ) : (
              <FlatList
                data={planData[activeTab] || []}
                renderItem={({ item }) => <TaskCard item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No tasks available for this period</Text>
                  </View>
                }
              />
            )}
          </View>
          <ButtonStart text="Start Day 1" handlepress={startDayOne} />
        </View>
      </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingBottom: verticalScale(20),
    zIndex: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(50),
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(16),
    marginTop: verticalScale(16),
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(50),
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
});

export default LooksmaxxingPlanScreen;