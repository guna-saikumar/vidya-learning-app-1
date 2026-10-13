import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Save,
  Plus,
  Trash2,
  Eye,
  Type,
  AlignLeft,
  List,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';

interface NoteBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'formula' | 'list' | 'axiom';
  title?: string;
  content: string;
}

export const ContentEditorScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { initialNotes, title: defaultTitle } = route.params || {};

  const [documentTitle, setDocumentTitle] = useState(defaultTitle || 'Distributive Property & Axioms');
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    {
      id: 'b-1',
      type: 'heading',
      content: '1. Introduction to Distributive Law in Rational Numbers',
    },
    {
      id: 'b-2',
      type: 'paragraph',
      content:
        'The distributive property of multiplication over addition is one of the most fundamental algebraic identities in the set of rational numbers ℚ.',
    },
    {
      id: 'b-3',
      type: 'formula',
      title: 'Distributive Law Identity',
      content: 'a(b + c) = ab + ac  (for all a, b, c ∈ ℚ)',
    },
    {
      id: 'b-4',
      type: 'axiom',
      title: 'Key Axiom',
      content: 'Multiplication distributes over addition and subtraction across all real numbers.',
    },
    {
      id: 'b-5',
      type: 'list',
      title: 'Core Learning Objectives',
      content: '• Closure under addition and multiplication\n• Commutative identity\n• Associative identity\n• Distributive expansion',
    },
  ]);

  const [isPreview, setIsPreview] = useState(false);

  const addBlock = (type: NoteBlock['type']) => {
    const newBlock: NoteBlock = {
      id: `blk-${Date.now()}`,
      type,
      title: type === 'formula' ? 'Key Formula' : type === 'axiom' ? 'Key Axiom' : undefined,
      content:
        type === 'heading'
          ? 'New Section Heading'
          : type === 'formula'
          ? 'x² + y² = z²'
          : type === 'list'
          ? '• Point 1\n• Point 2'
          : 'Detailed study explanation...',
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockTitle = (id: string, title: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, title } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleSaveNote = () => {
    const compiledMarkdown = blocks
      .map((b) => {
        if (b.type === 'heading') return `### ${b.content}`;
        if (b.type === 'formula') return `> **${b.title || 'Formula'}**: \`${b.content}\``;
        if (b.type === 'axiom') return `> **Axiom**: ${b.content}`;
        return b.content;
      })
      .join('\n\n');

    Alert.alert('Notes Saved', 'Your structured note content has been formatted and saved successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Learning Content Editor"
        subtitle="Structured Note & Formula Builder"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full shadow-sm"
            onPress={handleSaveNote}
            activeOpacity={0.8}
          >
            <Save size={14} color={Colors.white} />
            <Text className="font-manrope-bold text-xs text-white">Save Notes</Text>
          </TouchableOpacity>
        }
      />

      {/* Editor / Preview Mode Switcher */}
      <View className="px-5 py-2.5 bg-white border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className={`px-3 py-1 rounded-full border ${
              !isPreview ? 'bg-primary border-primary' : 'bg-white border-border'
            }`}
            onPress={() => setIsPreview(false)}
          >
            <Text className={`font-manrope-bold text-xs ${!isPreview ? 'text-white' : 'text-textSecondary'}`}>
              Block Editor ({blocks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center gap-1 px-3 py-1 rounded-full border ${
              isPreview ? 'bg-primary border-primary' : 'bg-white border-border'
            }`}
            onPress={() => setIsPreview(true)}
          >
            <Eye size={12} color={isPreview ? Colors.white : Colors.textSecondary} />
            <Text className={`font-manrope-bold text-xs ${isPreview ? 'text-white' : 'text-textSecondary'}`}>
              Live Preview
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="font-manrope-semibold text-[11px] text-textMuted">
          AP Board Formatting
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Title Input */}
        <View className="gap-1.5">
          <Text className="font-manrope-bold text-xs text-textLead">Note Document Title</Text>
          <TextInput
            className="bg-white border border-border rounded-xl px-3.5 h-12 font-manrope-extrabold text-base text-textPrimary shadow-sm"
            value={documentTitle}
            onChangeText={setDocumentTitle}
            placeholder="Document Title"
          />
        </View>

        {isPreview ? (
          /* Live Preview Mode matching student app visual presentation */
          <View className="bg-white rounded-3xl p-5 border border-border shadow-sm gap-4">
            <View className="pb-3 border-b border-border">
              <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
                {documentTitle}
              </Text>
              <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                Official SCERT AP State Board Reference Notes
              </Text>
            </View>

            {blocks.map((b) => {
              if (b.type === 'heading') {
                return (
                  <Text key={b.id} className="font-manrope-extrabold text-lg text-primary tracking-tight mt-2">
                    {b.content}
                  </Text>
                );
              }
              if (b.type === 'formula') {
                return (
                  <View key={b.id} className="bg-palePeach p-4 rounded-2xl border border-primaryLight my-1 gap-1">
                    <Text className="font-manrope-bold text-[10px] text-primary tracking-wider uppercase">
                      {b.title || 'FORMULA IDENTITIES'}
                    </Text>
                    <Text className="font-manrope-extrabold text-base text-textPrimary">
                      {b.content}
                    </Text>
                  </View>
                );
              }
              if (b.type === 'axiom') {
                return (
                  <View key={b.id} className="bg-accentGoldBg p-4 border-l-4 border-l-accentGold rounded-r-2xl my-1 gap-1">
                    <Text className="font-manrope-bold text-[10px] text-accentGoldDark tracking-wider uppercase">
                      {b.title || 'AXIOM & PRINCIPLE'}
                    </Text>
                    <Text className="font-manrope-semibold text-sm text-textPrimary">
                      {b.content}
                    </Text>
                  </View>
                );
              }
              if (b.type === 'list') {
                return (
                  <View key={b.id} className="bg-softWarm p-4 rounded-2xl border border-border my-1 gap-1.5">
                    {b.title && (
                      <Text className="font-manrope-bold text-xs text-textLead uppercase tracking-wider mb-0.5">
                        {b.title}
                      </Text>
                    )}
                    <Text className="font-manrope-medium text-sm text-textSecondary leading-6">
                      {b.content}
                    </Text>
                  </View>
                );
              }
              return (
                <Text key={b.id} className="font-manrope-medium text-sm text-textSecondary leading-6">
                  {b.content}
                </Text>
              );
            })}
          </View>
        ) : (
          /* Structured Block Editor */
          <View className="gap-3">
            {blocks.map((block, idx) => (
              <View key={block.id} className="bg-white rounded-2xl p-4 border border-border shadow-sm gap-2">
                <View className="flex-row items-center justify-between pb-2 border-b border-border">
                  <View className="flex-row items-center gap-1.5">
                    <View className="w-5 h-5 rounded-md bg-palePeach items-center justify-center">
                      <Text className="font-manrope-bold text-[10px] text-primary">{idx + 1}</Text>
                    </View>
                    <Text className="font-manrope-bold text-xs text-primaryDark uppercase">
                      {block.type} Block
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeBlock(block.id)} className="p-1">
                    <Trash2 size={14} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                {block.title !== undefined && (
                  <TextInput
                    className="bg-softWarm/80 border border-border rounded-xl px-3 h-10 font-manrope-bold text-xs text-textPrimary"
                    placeholder="Block Title / Label"
                    value={block.title}
                    onChangeText={(txt) => updateBlockTitle(block.id, txt)}
                  />
                )}

                <TextInput
                  className="bg-white border border-border rounded-xl p-3 min-h-[70px] font-manrope-medium text-sm text-textPrimary shadow-sm"
                  placeholder="Enter block content..."
                  placeholderTextColor={Colors.textPlaceholder}
                  value={block.content}
                  onChangeText={(txt) => updateBlockContent(block.id, txt)}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            ))}

            {/* Block Add Toolbar */}
            <View className="bg-softWarm rounded-2xl p-4 border border-border gap-2.5 mt-2">
              <Text className="font-manrope-bold text-xs text-textLead uppercase tracking-wider text-center">
                Add Structured Content Block
              </Text>
              <View className="flex-row flex-wrap gap-2 justify-center">
                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-white px-3 py-2 rounded-xl border border-border shadow-sm"
                  onPress={() => addBlock('heading')}
                >
                  <Type size={14} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">Heading</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-white px-3 py-2 rounded-xl border border-border shadow-sm"
                  onPress={() => addBlock('paragraph')}
                >
                  <AlignLeft size={14} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">Paragraph</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-white px-3 py-2 rounded-xl border border-border shadow-sm"
                  onPress={() => addBlock('formula')}
                >
                  <Sparkles size={14} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">Formula Box</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-white px-3 py-2 rounded-xl border border-border shadow-sm"
                  onPress={() => addBlock('axiom')}
                >
                  <BookmarkCheck size={14} color={Colors.accentGoldDark} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">Key Axiom</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-white px-3 py-2 rounded-xl border border-border shadow-sm"
                  onPress={() => addBlock('list')}
                >
                  <List size={14} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">Bullet Points</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
