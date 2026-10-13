import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Layers, Filter } from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { MaterialCard } from '../components/materials/MaterialCard';
import { ModalConfirm } from '../components/common/ModalConfirm';
import { EmptyState } from '../components/common/EmptyState';
import {
  getAllMaterials,
  filterMaterials,
  updateMaterialStatus,
  deleteMaterial,
} from '../services/materialsService';
import { getClasses } from '../services/curriculumService';
import { LectureMaterial, MaterialType, PublicationStatus } from '../types/materials';
import { SchoolClass } from '../types/curriculum';

export const MaterialsLibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<MaterialType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus | 'all'>('all');

  // Delete Modal
  const [materialToDelete, setMaterialToDelete] = useState<LectureMaterial | null>(null);

  const loadData = async () => {
    try {
      const [allMat, cls] = await Promise.all([
        filterMaterials({
          classId: selectedClassId === 'all' ? undefined : selectedClassId,
          materialType: selectedType,
          status: selectedStatus,
          searchQuery,
        }),
        getClasses(),
      ]);
      setMaterials(allMat);
      setClasses(cls);
    } catch (err) {
      console.error('Failed to load materials:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedClassId, selectedType, selectedStatus, searchQuery])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleStatus = async (material: LectureMaterial) => {
    const nextStatus: PublicationStatus = material.status === 'published' ? 'draft' : 'published';
    try {
      await updateMaterialStatus(material.id, nextStatus);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update publication status.');
    }
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    try {
      await deleteMaterial(materialToDelete.id);
      setMaterialToDelete(null);
      await loadData();
    } catch (err: any) {
      setMaterialToDelete(null);
      Alert.alert('Error', err.message || 'Failed to delete material.');
    }
  };

  // Status Filter Chips
  const statusFilters = [
    { key: 'all', label: 'All Status', badge: materials.length },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
    { key: 'archived', label: 'Archived' },
  ];

  // Material Type Chips
  const typeChips: Array<{ key: MaterialType | 'all'; label: string }> = [
    { key: 'all', label: 'All Types' },
    { key: 'pdf', label: 'PDFs' },
    { key: 'video', label: 'Videos' },
    { key: 'presentation', label: 'Slides' },
    { key: 'notes', label: 'Notes' },
    { key: 'image', label: 'Images' },
    { key: 'quiz', label: 'Quizzes' },
  ];

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Lecture Materials"
        subtitle={`${materials.length} Materials in Library`}
        rightAction={
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full shadow-sm"
            onPress={() => navigation.navigate('AddEditMaterial')}
            activeOpacity={0.8}
          >
            <Plus size={14} color={Colors.white} />
            <Text className="font-manrope-bold text-xs text-white">Upload Material</Text>
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
        {/* Search Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by title, subject or notes..."
          filters={statusFilters}
          activeFilter={selectedStatus}
          onFilterSelect={(k) => setSelectedStatus(k as any)}
        />

        {/* Secondary Filter: Class Selector */}
        <View className="gap-2">
          <Text className="font-manrope-bold text-xs text-textLead">Filter by Class</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <TouchableOpacity
              className={`px-3 py-1.5 rounded-full border ${
                selectedClassId === 'all'
                  ? 'bg-primary border-primary'
                  : 'bg-white border-border'
              }`}
              onPress={() => setSelectedClassId('all')}
              activeOpacity={0.8}
            >
              <Text
                className={`font-manrope-bold text-xs ${
                  selectedClassId === 'all' ? 'text-white' : 'text-textSecondary'
                }`}
              >
                All Classes
              </Text>
            </TouchableOpacity>

            {classes.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              return (
                <TouchableOpacity
                  key={cls.id}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-white border-border'
                  }`}
                  onPress={() => setSelectedClassId(cls.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-xs ${
                      isSelected ? 'text-white' : 'text-textSecondary'
                    }`}
                  >
                    {cls.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Third Filter: Material Type */}
        <View className="gap-2">
          <Text className="font-manrope-bold text-xs text-textLead">Material Format</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {typeChips.map((chip) => {
              const isSelected = selectedType === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  className={`px-3 py-1 rounded-xl border ${
                    isSelected
                      ? 'bg-palePeach border-primary'
                      : 'bg-softWarm border-border'
                  }`}
                  onPress={() => setSelectedType(chip.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-manrope-bold text-[11px] ${
                      isSelected ? 'text-primaryDark' : 'text-textSecondary'
                    }`}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Materials List */}
        <View className="gap-2.5 mt-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-sm text-textPrimary">
              Available Materials ({materials.length})
            </Text>
          </View>

          {materials.length === 0 ? (
            <EmptyState
              icon={<Layers size={28} color={Colors.primary} />}
              title="No Materials Match"
              message="No lecture materials found matching the current filters. Tap 'Upload Material' to create one."
              actionLabel="Upload Material"
              onActionPress={() => navigation.navigate('AddEditMaterial')}
            />
          ) : (
            materials.map((mat) => (
              <MaterialCard
                key={mat.id}
                material={mat}
                onPress={() => navigation.navigate('PreviewPublish', { materialId: mat.id })}
                onEdit={() => navigation.navigate('AddEditMaterial', { materialId: mat.id })}
                onToggleStatus={() => handleToggleStatus(mat)}
                onDelete={() => setMaterialToDelete(mat)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        visible={Boolean(materialToDelete)}
        title="Delete Lecture Material"
        message={`Are you sure you want to delete '${materialToDelete?.title}'? Students will no longer have access to this resource.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setMaterialToDelete(null)}
      />
    </View>
  );
};
