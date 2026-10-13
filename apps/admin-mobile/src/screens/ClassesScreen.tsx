import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, BookOpen, AlertCircle } from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { ClassSelector } from '../components/curriculum/ClassSelector';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { SubjectCard } from '../components/curriculum/SubjectCard';
import { AddEditSubjectModal } from '../components/curriculum/AddEditSubjectModal';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { EmptyState } from '../components/common/EmptyState';
import {
  getClasses,
  addSubjectToClass,
  updateSubject,
  toggleArchiveSubject,
  deleteSubject,
} from '../services/curriculumService';
import { SchoolClass, Subject } from '../types/curriculum';

export const ClassesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('class-8');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const loadData = async () => {
    try {
      const cls = await getClasses();
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const allSubjects = currentClass ? currentClass.subjects : [];

  const filteredSubjects = allSubjects.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleSaveSubject = async (data: any) => {
    try {
      if (subjectToEdit) {
        await updateSubject(selectedClassId, subjectToEdit.id, data);
      } else {
        await addSubjectToClass(selectedClassId, data);
      }
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save subject.');
    }
  };

  const handleToggleArchive = async (subjectId: string) => {
    try {
      await toggleArchiveSubject(selectedClassId, subjectId);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to toggle archive.');
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await deleteSubject(selectedClassId, subjectToDelete.id);
      setSubjectToDelete(null);
      await loadData();
    } catch (err: any) {
      setSubjectToDelete(null);
      Alert.alert('Cannot Delete', err.message);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All Subjects', badge: allSubjects.length },
    { key: 'stem', label: 'STEM', badge: allSubjects.filter((s) => s.category === 'stem').length },
    { key: 'languages', label: 'Languages', badge: allSubjects.filter((s) => s.category === 'languages').length },
    { key: 'social', label: 'Social Studies', badge: allSubjects.filter((s) => s.category === 'social').length },
  ];

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Curriculum"
        subtitle="Manage Classes & Subjects"
        rightAction={
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full shadow-sm"
            onPress={() => {
              setSubjectToEdit(null);
              setIsAddEditModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Plus size={14} color={Colors.white} />
            <Text className="font-manrope-bold text-xs text-white">Add Subject</Text>
          </TouchableOpacity>
        }
      />

      {/* Class Selector Tabs */}
      <View className="py-2.5 border-b border-border bg-white">
        <ClassSelector
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={setSelectedClassId}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Class Overview Banner */}
        {currentClass && (
          <View className="bg-palePeach/70 rounded-2xl p-4 border border-primaryLight flex-row items-center justify-between">
            <View>
              <Text className="font-manrope-extrabold text-base text-textPrimary">
                {currentClass.title} Curriculum
              </Text>
              <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                {currentClass.subtitle}
              </Text>
            </View>
            <View className="bg-white px-2.5 py-1 rounded-full border border-primaryLight">
              <Text className="font-manrope-bold text-xs text-primary">
                {allSubjects.length} Subjects
              </Text>
            </View>
          </View>
        )}

        {/* Search & Category Filter */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search subjects by name or syllabus..."
          filters={filterOptions}
          activeFilter={selectedCategory}
          onFilterSelect={setSelectedCategory}
        />

        {/* Subjects List */}
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-sm text-textPrimary">
              Prescribed Textbooks & Subjects ({filteredSubjects.length})
            </Text>
          </View>

          {filteredSubjects.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={28} color={Colors.primary} />}
              title="No Subjects Found"
              message="No subjects match your search or filter. You can add a new subject for this class."
              actionLabel="Add Subject"
              onActionPress={() => {
                setSubjectToEdit(null);
                setIsAddEditModalVisible(true);
              }}
            />
          ) : (
            filteredSubjects.map((subj) => (
              <SubjectCard
                key={subj.id}
                subject={subj}
                onPress={() =>
                  navigation.navigate('Chapters', {
                    classId: selectedClassId,
                    subjectId: subj.id,
                  })
                }
                onEdit={() => {
                  setSubjectToEdit(subj);
                  setIsAddEditModalVisible(true);
                }}
                onToggleArchive={() => handleToggleArchive(subj.id)}
                onDelete={() => setSubjectToDelete(subj)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Subject Modal */}
      <AddEditSubjectModal
        visible={isAddEditModalVisible}
        subjectToEdit={subjectToEdit}
        onSave={handleSaveSubject}
        onClose={() => {
          setIsAddEditModalVisible(false);
          setSubjectToEdit(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        visible={Boolean(subjectToDelete)}
        title="Delete Subject"
        message={`Are you sure you want to delete '${subjectToDelete?.name}'? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteSubject}
        onCancel={() => setSubjectToDelete(null)}
      />
    </View>
  );
};
