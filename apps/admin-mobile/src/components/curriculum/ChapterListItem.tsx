import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Chapter, Section } from '../../types/curriculum';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Target,
} from 'lucide-react-native';
import Colors from '../../constants/colors';
import { StatusBadge } from '../common/StatusBadge';

interface ChapterListItemProps {
  chapter: Chapter;
  onEdit: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
}

export const ChapterListItem: React.FC<ChapterListItemProps> = ({
  chapter,
  onEdit,
  onDelete,
  onAddSection,
  onEditSection,
  onDeleteSection,
}) => {
  const [expanded, setExpanded] = useState(false);
  const formattedOrder = chapter.chapterNumber < 10 ? `0${chapter.chapterNumber}` : `${chapter.chapterNumber}`;

  return (
    <View className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden my-1.5">
      {/* Chapter Main Header */}
      <View className="p-4 gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-row items-center gap-3 flex-1 min-w-0">
            {/* Number Badge */}
            <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center border border-primaryLight shadow-sm">
              <Text className="font-manrope-extrabold text-sm text-primary">
                {formattedOrder}
              </Text>
            </View>

            <View className="flex-1 min-w-0">
              {chapter.unitName && (
                <Text className="font-manrope-bold text-[10px] text-primary tracking-wider uppercase mb-0.5">
                  {chapter.unitName}
                </Text>
              )}
              <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight" numberOfLines={2}>
                {chapter.title}
              </Text>
            </View>
          </View>

          <StatusBadge status={chapter.status} size="sm" />
        </View>

        {chapter.description ? (
          <Text className="font-manrope-medium text-xs text-textSecondary leading-4">
            {chapter.description}
          </Text>
        ) : null}

        {/* Learning Goals Snippet */}
        {chapter.learningGoals && chapter.learningGoals.length > 0 && (
          <View className="flex-row items-center gap-1.5 bg-softWarm p-2 rounded-xl border border-border">
            <Target size={14} color={Colors.primary} />
            <Text className="font-manrope-semibold text-[11px] text-textSecondary flex-1" numberOfLines={1}>
              {chapter.learningGoals[0]}
              {chapter.learningGoals.length > 1 ? ` (+${chapter.learningGoals.length - 1} more)` : ''}
            </Text>
          </View>
        )}

        {/* Footer Row */}
        <View className="flex-row items-center justify-between pt-2 border-t border-border">
          <View className="flex-row items-center gap-3">
            {chapter.durationMinutes && (
              <View className="flex-row items-center gap-1">
                <Clock size={12} color={Colors.textMuted} />
                <Text className="font-manrope-medium text-[11px] text-textMuted">
                  {chapter.durationMinutes} mins
                </Text>
              </View>
            )}
            <TouchableOpacity
              className="flex-row items-center gap-1 bg-softWarm px-2 py-1 rounded-md border border-border"
              onPress={() => setExpanded(!expanded)}
              activeOpacity={0.7}
            >
              <Text className="font-manrope-bold text-[11px] text-primary">
                {chapter.sections.length} {chapter.sections.length === 1 ? 'Section' : 'Sections'}
              </Text>
              {expanded ? (
                <ChevronUp size={12} color={Colors.primary} />
              ) : (
                <ChevronDown size={12} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Chapter Actions */}
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              className="w-7 h-7 rounded-lg bg-softWarm items-center justify-center border border-border"
              onPress={onEdit}
              activeOpacity={0.7}
              accessibilityLabel="Edit chapter"
            >
              <Edit2 size={12} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-7 h-7 rounded-lg bg-softWarm items-center justify-center border border-border"
              onPress={onDelete}
              activeOpacity={0.7}
              accessibilityLabel="Delete chapter"
            >
              <Trash2 size={12} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Expandable Sections List */}
      {expanded && (
        <View className="bg-softWarm/60 border-t border-border p-3 gap-2">
          <View className="flex-row items-center justify-between px-1">
            <Text className="font-manrope-extrabold text-xs text-textLead uppercase tracking-wider">
              Sections & Sub-topics
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1 bg-white px-2 py-1 rounded-md border border-border shadow-sm"
              onPress={onAddSection}
              activeOpacity={0.7}
            >
              <Plus size={12} color={Colors.primary} />
              <Text className="font-manrope-bold text-[11px] text-primary">Add Section</Text>
            </TouchableOpacity>
          </View>

          {chapter.sections.length === 0 ? (
            <View className="p-4 items-center justify-center bg-white rounded-xl border border-border">
              <Text className="font-manrope-medium text-xs text-textMuted">
                No sections added yet. Click &quot;Add Section&quot; above.
              </Text>
            </View>
          ) : (
            chapter.sections.map((section) => (
              <View
                key={section.id}
                className="bg-white rounded-xl p-3 border border-border flex-row items-center justify-between gap-2 shadow-sm"
              >
                <View className="flex-row items-start gap-2.5 flex-1 min-w-0">
                  <View className="w-6 h-6 rounded-md bg-palePeach items-center justify-center mt-0.5">
                    <FileText size={12} color={Colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-manrope-bold text-xs text-textPrimary" numberOfLines={1}>
                      {section.sectionNumber}. {section.title}
                    </Text>
                    {section.keyAxiom ? (
                      <Text className="font-manrope-medium text-[10px] text-primary mt-0.5" numberOfLines={1}>
                        {section.keyAxiom}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="flex-row items-center gap-1">
                  <TouchableOpacity
                    className="w-6 h-6 rounded-md bg-softWarm items-center justify-center border border-border"
                    onPress={() => onEditSection(section)}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={11} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-6 h-6 rounded-md bg-softWarm items-center justify-center border border-border"
                    onPress={() => onDeleteSection(section.id)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={11} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};
