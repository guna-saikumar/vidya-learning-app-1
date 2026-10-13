import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  eyebrow,
  showBack = false,
  onBackPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAdminAuth();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  return (
    <View className="bg-white z-10 border-b border-border" style={{ paddingTop: topInset }}>
      {/* Top Navbar */}
      <View className="h-16 px-5 flex-row items-center justify-between bg-white">
        {/* Left: Brand or Back Button */}
        <View className="flex-row items-center gap-3">
          {showBack ? (
            <TouchableOpacity
              className="w-10 h-10 rounded-xl border border-border bg-white items-center justify-center shadow-sm"
              onPress={onBackPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View
              className="w-10 h-10 rounded-xl bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm overflow-hidden"
              style={{ width: 40, height: 40 }}
            >
              <Image
                source={require('../../../assets/app-images/logo.png')}
                className="w-7 h-7"
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
          )}

          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
                {title || 'Vidya Admin'}
              </Text>
              {!showBack && (
                <View className="bg-palePeach px-2 py-0.5 rounded-full border border-primaryLight">
                  <Text className="font-manrope-bold text-[10px] text-primary">SCERT AP</Text>
                </View>
              )}
            </View>
            {subtitle ? (
              <Text className="font-manrope-medium text-xs text-textSecondary" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : eyebrow ? (
              <Text className="font-manrope-bold text-[10px] text-primary tracking-wider uppercase">
                {eyebrow}
              </Text>
            ) : (
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Curriculum & Materials Manager
              </Text>
            )}
          </View>
        </View>

        {/* Right Action or Admin Identity Chip */}
        <View className="flex-row items-center gap-2">
          {rightAction ? (
            rightAction
          ) : (
            <View className="flex-row items-center gap-2 py-1 px-2.5 rounded-full border border-border bg-white">
              <Text className="font-manrope-bold text-xs text-textPrimary">
                {user?.fullName?.split(' ')[0] || 'Admin'}
              </Text>
              <View
                className="w-7 h-7 rounded-full bg-palePeach items-center justify-center border border-primaryLight overflow-hidden"
                style={{ width: 28, height: 28 }}
              >
                <Image
                  source={require('../../../assets/app-images/avatar.png')}
                  className="w-7 h-7"
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
