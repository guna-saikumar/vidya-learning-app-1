import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { StatCard } from '../components/common/StatCard';
import { getDashboardStats, DashboardStats } from '../services/statsService';
import { getClasses } from '../services/curriculumService';
import { SchoolClass } from '../types/curriculum';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [s, cls] = await Promise.all([getDashboardStats(), getClasses()]);
      setStats(s);
      setClasses(cls);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const publishedPercent = stats && stats.totalMaterials > 0
    ? Math.round((stats.publishedMaterials / stats.totalMaterials) * 100)
    : 0;

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Admin Console"
        subtitle="SCERT AP Board (2026–27)"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Welcome Banner Card */}
        <View className="bg-palePeach rounded-3xl p-5 border border-primaryLight shadow-sm gap-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border border-primaryLight">
              <TrendingUp size={12} color={Colors.primary} />
              <Text className="font-manrope-bold text-[11px] text-primary">
                ACADEMIC YEAR 2026–2027
              </Text>
            </View>
            <Text className="font-manrope-bold text-xs text-primaryDark">Live Curriculum</Text>
          </View>
          <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
            Curriculum & Content Management
          </Text>
          <Text className="font-manrope-medium text-xs text-textSecondary leading-4">
            Manage Andhra Pradesh State Board syllabus for Classes 6 through 10. Published content syncs directly to the student mobile app.
          </Text>
        </View>

        {/* Quick Actions Panel */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
            Quick Actions
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-3.5 border border-border shadow-sm items-center justify-center gap-1.5"
              onPress={() => navigation.navigate('Curriculum')}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center border border-primaryLight">
                <PlusCircle size={20} color={Colors.primary} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Add Subject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-3.5 border border-border shadow-sm items-center justify-center gap-1.5"
              onPress={() => navigation.navigate('AddEditMaterial')}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 rounded-xl bg-successBg items-center justify-center border border-success/30">
                <UploadCloud size={20} color={Colors.success} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Upload Material
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-3.5 border border-border shadow-sm items-center justify-center gap-1.5"
              onPress={() => navigation.navigate('ContentEditor', {})}
              activeOpacity={0.8}
            >
              <View className="w-10 h-10 rounded-xl bg-accentGoldBg items-center justify-center border border-accentGold/30">
                <FileText size={20} color={Colors.accentGoldDark} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Note Editor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Real-time Statistics Cards */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              Curriculum Statistics
            </Text>
            <Text className="font-manrope-medium text-xs text-textMuted">Database Sync</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <StatCard
              label="Classes"
              value={stats?.totalClasses || 5}
              subtitle="Grades 6–10 Active"
              icon={<GraduationCap size={22} color={Colors.primary} />}
              badge="SCERT"
              badgeColor="primary"
              onPress={() => navigation.navigate('Curriculum')}
            />

            <StatCard
              label="Subjects"
              value={stats?.totalSubjects || 33}
              subtitle="STEM & Languages"
              icon={<BookOpen size={22} color={Colors.primary} />}
              badge="Configured"
              badgeColor="primary"
              onPress={() => navigation.navigate('Curriculum')}
            />

            <StatCard
              label="Chapters"
              value={stats?.totalChapters || 58}
              subtitle="With Objectives"
              icon={<Layers size={22} color={Colors.primary} />}
              badge="Structured"
              badgeColor="primary"
            />

            <StatCard
              label="Lecture Materials"
              value={stats?.totalMaterials || 6}
              subtitle={`${stats?.publishedMaterials || 4} Published`}
              icon={<FileText size={22} color={Colors.primary} />}
              badge={`${publishedPercent}% Live`}
              badgeColor="success"
              onPress={() => navigation.navigate('Materials')}
            />
          </View>
        </View>

        {/* Publication Status Card */}
        <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-sm text-textPrimary">
              Publication Overview
            </Text>
            <View className="flex-row items-center gap-1.5">
              <CheckCircle2 size={13} color={Colors.success} />
              <Text className="font-manrope-bold text-xs text-success">
                {stats?.publishedMaterials || 0} Published
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View className="w-full h-2.5 bg-softWarm rounded-full overflow-hidden flex-row">
            <View
              className="h-full bg-success rounded-full"
              style={{ width: `${publishedPercent}%` }}
            />
          </View>

          <View className="flex-row items-center justify-between pt-1">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-success" />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Published ({stats?.publishedMaterials || 0})
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-warning" />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Drafts ({stats?.draftsCount || 0})
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-textMuted" />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Archived ({stats?.archivedCount || 0})
              </Text>
            </View>
          </View>
        </View>

        {/* Classes Overview Breakdown */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
              Class Structure
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Curriculum')}>
              <Text className="font-manrope-bold text-xs text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            {classes.slice(0, 3).map((c) => (
              <TouchableOpacity
                key={c.id}
                className="bg-white rounded-2xl p-4 border border-border shadow-sm flex-row items-center justify-between"
                onPress={() => navigation.navigate('Curriculum')}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center border border-primaryLight">
                    <Text className="font-manrope-extrabold text-sm text-primary">
                      {c.grade}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-manrope-extrabold text-sm text-textPrimary">
                      {c.title}
                    </Text>
                    <Text className="font-manrope-medium text-xs text-textSecondary">
                      {c.subjects.length} Subjects · {c.badge}
                    </Text>
                  </View>
                </View>

                <ArrowRight size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Admin Activity Feed */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
            Recent Admin Activity
          </Text>

          <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
            {(stats?.recentActivity || []).map((act, index) => (
              <View
                key={act.id}
                className={`flex-row items-start justify-between gap-3 ${
                  index > 0 ? 'pt-3 border-t border-border' : ''
                }`}
              >
                <View className="flex-row items-start gap-2.5 flex-1 min-w-0">
                  <View className="w-7 h-7 rounded-lg bg-softWarm items-center justify-center mt-0.5">
                    {act.action === 'published' ? (
                      <CheckCircle2 size={14} color={Colors.success} />
                    ) : (
                      <Clock size={14} color={Colors.warning} />
                    )}
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-manrope-bold text-xs text-textPrimary" numberOfLines={1}>
                      {act.title}
                    </Text>
                    <Text className="font-manrope-medium text-[11px] text-textMuted mt-0.5">
                      {act.category}
                    </Text>
                  </View>
                </View>

                <Text className="font-manrope-medium text-[10px] text-textMuted">
                  {act.timestamp}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
