import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Subject } from '../../types/curriculum';
import {
  BookOpen,
  Calculator,
  Atom,
  Dna,
  Globe,
  Languages,
  GraduationCap,
  Landmark,
  ChevronRight,
  Edit2,
  Archive,
  Trash2,
} from 'lucide-react-native';
import Colors from '../../constants/colors';

interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
  onEdit: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onPress,
  onEdit,
  onToggleArchive,
  onDelete,
}) => {
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'calculator':
        return <Calculator size={22} color={Colors.primary} />;
      case 'atom':
        return <Atom size={22} color={Colors.primary} />;
      case 'dna':
        return <Dna size={22} color={Colors.primary} />;
      case 'languages':
        return <Languages size={22} color={Colors.primary} />;
      case 'graduation-cap':
        return <GraduationCap size={22} color={Colors.primary} />;
      case 'globe':
        return <Globe size={22} color={Colors.primary} />;
      case 'landmark':
        return <Landmark size={22} color={Colors.primary} />;
      case 'book-open':
      default:
        return <BookOpen size={22} color={Colors.primary} />;
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'stem':
        return { bg: 'bg-[#EDE9FE]', text: 'text-[#4338CA]', label: 'STEM' };
      case 'languages':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Language' };
      case 'social':
        return { bg: 'bg-[#E7F3ED]', text: 'text-success', label: 'Social Sciences' };
      default:
        return { bg: 'bg-softWarm', text: 'text-textSecondary', label: 'General' };
    }
  };

  const cat = getCategoryClass(subject.category);

  return (
    <View
      className={`bg-white rounded-2xl p-4 border shadow-sm gap-3 ${
        subject.isArchived ? 'border-border opacity-70' : 'border-border'
      }`}
    >
      {/* Top Header Row */}
      <TouchableOpacity
        className="flex-row items-start justify-between gap-3"
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <View className="w-12 h-12 rounded-xl bg-palePeach items-center justify-center border border-primaryLight shadow-sm">
            {getSubjectIcon(subject.iconName)}
          </View>
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2">
              <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight" numberOfLines={1}>
                {subject.name}
              </Text>
              {subject.isArchived && (
                <View className="bg-softWarm px-2 py-0.5 rounded-full border border-border">
                  <Text className="font-manrope-bold text-[10px] text-textMuted">Archived</Text>
                </View>
              )}
            </View>
            {subject.description ? (
              <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5" numberOfLines={1}>
                {subject.description}
              </Text>
            ) : null}
          </View>
        </View>

        <ChevronRight size={18} color={Colors.textMuted} className="mt-2" />
      </TouchableOpacity>

      {/* Meta & Stats Row */}
      <View className="flex-row items-center justify-between pt-2.5 border-t border-border">
        <View className="flex-row items-center gap-2">
          <View className={`px-2.5 py-0.5 rounded-full ${cat.bg}`}>
            <Text className={`font-manrope-bold text-[11px] ${cat.text}`}>{cat.label}</Text>
          </View>
          <View className="bg-softWarm px-2.5 py-0.5 rounded-full border border-border">
            <Text className="font-manrope-bold text-[11px] text-textPrimary">
              {subject.chapters.length} {subject.chapters.length === 1 ? 'Chapter' : 'Chapters'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            className="w-8 h-8 rounded-lg bg-softWarm items-center justify-center border border-border"
            onPress={onEdit}
            activeOpacity={0.7}
            accessibilityLabel="Edit subject"
          >
            <Edit2 size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-lg bg-softWarm items-center justify-center border border-border"
            onPress={onToggleArchive}
            activeOpacity={0.7}
            accessibilityLabel={subject.isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive size={14} color={subject.isArchived ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="w-8 h-8 rounded-lg bg-softWarm items-center justify-center border border-border"
            onPress={onDelete}
            activeOpacity={0.7}
            accessibilityLabel="Delete subject"
          >
            <Trash2 size={14} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
