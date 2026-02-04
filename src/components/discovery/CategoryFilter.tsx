import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip } from '../ui/Chip';
import { spacing } from '../../theme';

export interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.label}
            icon={category.icon}
            active={selectedCategory === category.id}
            onPress={() => onSelectCategory(category.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
});

export default CategoryFilter;
