import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import {
  User,
  ShieldCheck,
  Database,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Server,
  RefreshCw,
  HardDrive,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { resetCurriculumToDefaults } from '../services/curriculumService';
import { resetMaterialsToDefaults } from '../services/materialsService';
import { AP_BOARD_CONFIG } from '../constants/curriculumConfig';
import { POSTGRES_CONFIG, checkPostgresHealth } from '../services/postgresService';

export const ProfileSettingsScreen: React.FC = () => {
  const [isResetConfirmVisible, setIsResetConfirmVisible] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; message: string }>({
    ok: false,
    message: 'Testing PostgreSQL status...',
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsTestingDb(true);
    const result = await checkPostgresHealth();
    setDbStatus(result);
    setIsTestingDb(false);
  };

  const handleResetData = async () => {
    try {
      await resetCurriculumToDefaults();
      await resetMaterialsToDefaults();
      setIsResetConfirmVisible(false);
      Alert.alert('Reset Complete', 'Curriculum classes (6–10) and lecture materials have been restored to default SCERT AP Board state.');
    } catch (err: any) {
      setIsResetConfirmVisible(false);
      Alert.alert('Error', err.message || 'Failed to reset data.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Admin Settings"
        subtitle="System & Database Configurations"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Profile Identity Card */}
        <View className="bg-palePeach rounded-3xl p-5 border border-primaryLight shadow-sm flex-row items-center gap-4">
          <View
            className="w-16 h-16 rounded-2xl bg-white items-center justify-center border border-primaryLight overflow-hidden shadow-sm"
            style={{ width: 64, height: 64 }}
          >
            <Image
              source={require('../../assets/app-images/avatar.png')}
              style={{ width: 64, height: 64 }}
              resizeMode="cover"
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-manrope-extrabold text-base text-textPrimary">
                Dr. Ramesh Sharma
              </Text>
              <ShieldCheck size={16} color={Colors.primary} />
            </View>
            <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
              Academic Director · AP SCERT Division
            </Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View className="bg-primary px-2.5 py-0.5 rounded-full">
                <Text className="font-manrope-bold text-[10px] text-white">Full Administrator Access</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Board & Academic Year Metadata */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-sm text-textPrimary uppercase tracking-wider">
            Curriculum Configuration
          </Text>

          <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
            <View className="flex-row items-center justify-between pb-3 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <Calendar size={18} color={Colors.primary} />
                <View>
                  <Text className="font-manrope-bold text-xs text-textPrimary">Academic Year</Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary">
                    {AP_BOARD_CONFIG.academicYear}
                  </Text>
                </View>
              </View>
              <View className="bg-softWarm px-2.5 py-0.5 rounded-full">
                <Text className="font-manrope-bold text-[10px] text-primary">Active</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <CheckCircle2 size={18} color={Colors.success} />
                <View>
                  <Text className="font-manrope-bold text-xs text-textPrimary">State Board</Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary">
                    {AP_BOARD_CONFIG.boardName}
                  </Text>
                </View>
              </View>
              <Text className="font-manrope-bold text-xs text-primary">SCERT AP</Text>
            </View>
          </View>
        </View>

        {/* PostgreSQL Database Connection Status */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-sm text-textPrimary uppercase tracking-wider">
            PostgreSQL Database & Engine
          </Text>

          <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3">
            <View className="flex-row items-center justify-between pb-2 border-b border-border">
              <View className="flex-row items-center gap-2.5">
                <Database size={18} color={Colors.primary} />
                <View>
                  <Text className="font-manrope-bold text-xs text-textPrimary">PostgreSQL Database</Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary">
                    {POSTGRES_CONFIG.database} ({POSTGRES_CONFIG.host}:{POSTGRES_CONFIG.port})
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={checkConnection}
                disabled={isTestingDb}
                className="flex-row items-center gap-1 bg-softWarm px-2.5 py-1 rounded-full"
                activeOpacity={0.7}
              >
                <RefreshCw size={12} color={Colors.primary} />
                <Text className="font-manrope-bold text-[10px] text-primary">
                  {isTestingDb ? 'Checking...' : 'Ping'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2">
              <View
                className={`w-2.5 h-2.5 rounded-full ${
                  dbStatus.ok ? 'bg-success' : 'bg-primary'
                }`}
              />
              <Text className="font-manrope-medium text-xs text-textPrimary flex-1">
                {dbStatus.message}
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-3 border border-border gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-manrope-bold text-[11px] text-textSecondary">SQL Schema File:</Text>
                <Text className="font-manrope-semibold text-[11px] text-textPrimary">
                  postgres/schema.sql
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-manrope-bold text-[11px] text-textSecondary">Storage Mode:</Text>
                <Text className="font-manrope-semibold text-[11px] text-textPrimary">
                  PostgreSQL Tables + Local High-Speed Store
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Maintenance Actions */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-sm text-textPrimary uppercase tracking-wider">
            Maintenance & Actions
          </Text>

          <View className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <TouchableOpacity
              className="p-4 flex-row items-center justify-between"
              onPress={() => setIsResetConfirmVisible(true)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-2.5">
                <RotateCcw size={18} color={Colors.warning} />
                <View>
                  <Text className="font-manrope-bold text-xs text-textPrimary">
                    Restore Default SCERT AP Curriculum
                  </Text>
                  <Text className="font-manrope-medium text-[11px] text-textMuted">
                    Re-seeds Classes 6–10 subjects and sample chapters
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <ModalConfirm
        visible={isResetConfirmVisible}
        title="Restore Default Curriculum?"
        message="This will reset local curriculum and materials to default SCERT Andhra Pradesh State Board 2026–2027 seed data."
        confirmLabel="Reset Data"
        variant="warning"
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmVisible(false)}
      />
    </View>
  );
};
