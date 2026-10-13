import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Eye, Layers } from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { ChapterListItem } from '../components/curriculum/ChapterListItem';
import { AddEditChapterModal } from '../components/curriculum/AddEditChapterModal';
import { AddEditSectionModal } from '../components/curriculum/AddEditSectionModal';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { EmptyState } from '../components/common/EmptyState';
import {
  getClassById,
  addChapterToSubject,
  updateChapter,
  deleteChapter,
  addSectionToChapter,
  updateSection,
  deleteSection,
} from '../services/curriculumService';
import { Chapter, Section, Subject, SchoolClass } from '../types/curriculum';

export const ChaptersScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId, subjectId } = route.params;

  const [currentClass, setCurrentClass] = useState<SchoolClass | null>(null);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Chapter Modal States
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // Section Modal States
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [activeChapterForSection, setActiveChapterForSection] = useState<Chapter | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{ chapterId: string; sectionId: string } | null>(null);

  const loadData = async () => {
    try {
      const cls = await getClassById(classId);
      if (cls) {
        setCurrentClass(cls);
        const subj = cls.subjects.find((s) => s.id === subjectId);
        setCurrentSubject(subj || null);
      }
    } catch (err) {
      console.error('Failed to load subject chapters:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [classId, subjectId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Chapter Handlers
  const handleSaveChapter = async (data: any) => {
    try {
      if (chapterToEdit) {
        await updateChapter(classId, subjectId, chapterToEdit.id, data);
      } else {
        await addChapterToSubject(classId, subjectId, data);
      }
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save chapter.');
    }
  };

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return;
    try {
      await deleteChapter(classId, subjectId, chapterToDelete.id);
      setChapterToDelete(null);
      await loadData();
    } catch (err: any) {
      setChapterToDelete(null);
      Alert.alert('Error', err.message || 'Failed to delete chapter.');
    }
  };

  // Section Handlers
  const handleSaveSection = async (data: any) => {
    if (!activeChapterForSection) return;
    try {
      if (sectionToEdit) {
        await updateSection(classId, subjectId, activeChapterForSection.id, sectionToEdit.id, data);
      } else {
        await addSectionToChapter(classId, subjectId, activeChapterForSection.id, data);
      }
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save section.');
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;
    try {
      await deleteSection(classId, subjectId, sectionToDelete.chapterId, sectionToDelete.sectionId);
      setSectionToDelete(null);
      await loadData();
    } catch (err: any) {
      setSectionToDelete(null);
      Alert.alert('Error', err.message || 'Failed to delete section.');
    }
  };

  const chapters = currentSubject ? currentSubject.chapters : [];

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title={currentSubject?.name || 'Subject Chapters'}
        subtitle={`${currentClass?.title || ''} · ${chapters.length} Chapters`}
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full shadow-sm"
            onPress={() => {
              setChapterToEdit(null);
              setIsChapterModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Plus size={14} color={Colors.white} />
            <Text className="font-manrope-bold text-xs text-white">Add Chapter</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Subject Overview Card */}
        {currentSubject && (
          <View className="bg-palePeach/60 rounded-2xl p-4 border border-primaryLight gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-manrope-extrabold text-base text-textPrimary">
                {currentSubject.name} Syllabus
              </Text>
              <View className="bg-white px-2.5 py-0.5 rounded-full border border-primaryLight">
                <Text className="font-manrope-bold text-xs text-primary">
                  {chapters.length} Chapters
                </Text>
              </View>
            </View>
            {currentSubject.description ? (
              <Text className="font-manrope-medium text-xs text-textSecondary leading-4">
                {currentSubject.description}
              </Text>
            ) : null}
          </View>
        )}

        {/* Chapters Header */}
        <View className="flex-row items-center justify-between pt-1">
          <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
            Chapters & Sub-Topics
          </Text>
          <Text className="font-manrope-medium text-xs text-textMuted">
            Hierarchy: Chapter → Sections
          </Text>
        </View>

        {/* Chapters List */}
        {chapters.length === 0 ? (
          <EmptyState
            icon={<Layers size={28} color={Colors.primary} />}
            title="No Chapters Added Yet"
            message="Add the first chapter for this subject to start structuring syllabus topics."
            actionLabel="Add Chapter"
            onActionPress={() => {
              setChapterToEdit(null);
              setIsChapterModalVisible(true);
            }}
          />
        ) : (
          chapters.map((chap) => (
            <ChapterListItem
              key={chap.id}
              chapter={chap}
              onEdit={() => {
                setChapterToEdit(chap);
                setIsChapterModalVisible(true);
              }}
              onDelete={() => setChapterToDelete(chap)}
              onAddSection={() => {
                setActiveChapterForSection(chap);
                setSectionToEdit(null);
                setIsSectionModalVisible(true);
              }}
              onEditSection={(sec) => {
                setActiveChapterForSection(chap);
                setSectionToEdit(sec);
                setIsSectionModalVisible(true);
              }}
              onDeleteSection={(secId) => {
                setSectionToDelete({ chapterId: chap.id, sectionId: secId });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Chapter Modal */}
      <AddEditChapterModal
        visible={isChapterModalVisible}
        chapterToEdit={chapterToEdit}
        nextChapterNumber={chapters.length + 1}
        onSave={handleSaveChapter}
        onClose={() => {
          setIsChapterModalVisible(false);
          setChapterToEdit(null);
        }}
      />

      {/* Section Modal */}
      <AddEditSectionModal
        visible={isSectionModalVisible}
        sectionToEdit={sectionToEdit}
        nextSectionNumber={(activeChapterForSection?.sections.length || 0) + 1}
        onSave={handleSaveSection}
        onClose={() => {
          setIsSectionModalVisible(false);
          setActiveChapterForSection(null);
          setSectionToEdit(null);
        }}
      />

      {/* Delete Chapter Confirm */}
      <ModalConfirm
        visible={Boolean(chapterToDelete)}
        title="Delete Chapter"
        message={`Are you sure you want to delete '${chapterToDelete?.title}'? All nested sections will also be removed.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteChapter}
        onCancel={() => setChapterToDelete(null)}
      />

      {/* Delete Section Confirm */}
      <ModalConfirm
        visible={Boolean(sectionToDelete)}
        title="Delete Section"
        message="Are you sure you want to delete this section?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteSection}
        onCancel={() => setSectionToDelete(null)}
      />
    </View>
  );
};
