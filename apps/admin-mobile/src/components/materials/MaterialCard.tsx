import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LectureMaterial } from '../../types/materials';
import { TypeBadge } from '../common/TypeBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Eye, Edit2, Trash2, Globe, File } from 'lucide-react-native';
import Colors from '../../constants/colors';

interface MaterialCardProps {
  material: LectureMaterial;
  onPress: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onPress,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <View className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-3 my-1.5">
      {/* Top Header: Type and Status */}
      <View className="flex-row items-center justify-between">
        <TypeBadge type={material.materialType} size="sm" />
        <StatusBadge status={material.status} size="sm" />
      </View>

      {/* Main Content Area */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="gap-1.5">
        <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight" numberOfLines={2}>
          {material.title}
        </Text>
        {material.description ? (
          <Text className="font-manrope-medium text-xs text-textSecondary leading-4" numberOfLines={2}>
            {material.description}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Breadcrumb Tags (Class, Subject, Chapter) */}
      <View className="flex-row flex-wrap items-center gap-1.5">
        <View className="bg-palePeach px-2 py-0.5 rounded-md border border-primaryLight">
          <Text className="font-manrope-bold text-[10px] text-primaryDark">
            Class {material.grade}
          </Text>
        </View>
        <View className="bg-softWarm px-2 py-0.5 rounded-md border border-border">
          <Text className="font-manrope-semibold text-[10px] text-textSecondary" numberOfLines={1}>
            {material.subjectName}
          </Text>
        </View>
        <View className="bg-softWarm px-2 py-0.5 rounded-md border border-border flex-1 min-w-0">
          <Text className="font-manrope-medium text-[10px] text-textMuted" numberOfLines={1}>
            {material.chapterTitle}
          </Text>
        </View>
      </View>

      {/* File or URL meta info */}
      {(material.fileName || material.videoUrl || material.fileSizeBytes) && (
        <View className="flex-row items-center justify-between bg-softWarm/80 px-2.5 py-1.5 rounded-xl border border-border">
          <View className="flex-row items-center gap-1.5 flex-1 min-w-0 mr-2">
            {material.videoUrl ? (
              <Globe size={13} color={Colors.primary} />
            ) : (
              <File size={13} color={Colors.primary} />
            )}
            <Text className="font-manrope-medium text-[11px] text-textSecondary flex-1" numberOfLines={1}>
              {material.fileName || material.videoUrl}
            </Text>
          </View>
          {formatFileSize(material.fileSizeBytes) && (
            <Text className="font-manrope-semibold text-[10px] text-textMuted">
              {formatFileSize(material.fileSizeBytes)}
            </Text>
          )}
        </View>
      )}

      {/* Bottom Actions Row */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-palePeach px-3 py-1.5 rounded-xl border border-primaryLight"
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Eye size={13} color={Colors.primary} />
          <Text className="font-manrope-bold text-xs text-primary">Preview</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity
            className="px-2.5 py-1.5 rounded-xl bg-softWarm border border-border"
            onPress={onToggleStatus}
            activeOpacity={0.7}
          >
            <Text className="font-manrope-bold text-[11px] text-textSecondary">
              {material.status === 'published' ? 'Unpublish' : 'Publish'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-xl bg-softWarm items-center justify-center border border-border"
            onPress={onEdit}
            activeOpacity={0.7}
            accessibilityLabel="Edit material"
          >
            <Edit2 size={13} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-xl bg-softWarm items-center justify-center border border-border"
            onPress={onDelete}
            activeOpacity={0.7}
            accessibilityLabel="Delete material"
          >
            <Trash2 size={13} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
