import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'primary' | 'muted';
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  badge,
  badgeColor = 'primary',
  onPress,
}) => {
  const getBadgeClass = () => {
    switch (badgeColor) {
      case 'success':
        return 'bg-successBg text-success';
      case 'warning':
        return 'bg-[#FEF3C7] text-warning';
      case 'muted':
        return 'bg-softWarm text-textMuted';
      case 'primary':
      default:
        return 'bg-palePeach text-primary';
    }
  };

  return (
    <TouchableOpacity
      className="flex-1 min-w-[46%] bg-white rounded-2xl p-4 border border-border shadow-sm justify-between gap-3"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View className="w-11 h-11 rounded-xl bg-palePeach items-center justify-center border border-primaryLight">
          {icon}
        </View>
        {badge && (
          <View className={`px-2 py-0.5 rounded-full ${getBadgeClass().split(' ')[0]}`}>
            <Text className={`font-manrope-bold text-[10px] ${getBadgeClass().split(' ')[1]}`}>
              {badge}
            </Text>
          </View>
        )}
      </View>

      <View className="gap-0.5">
        <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight">
          {value}
        </Text>
        <Text className="font-manrope-semibold text-[13px] text-textLead">
          {label}
        </Text>
        {subtitle && (
          <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
