import { CategoryRecord, CategoryValidationResult } from './types';

export class CategoryValidator {
  /**
   * Validate a category create/edit payload
   */
  static validate(
    category: Partial<CategoryRecord>,
    existingCategories: CategoryRecord[],
    isUpdate = false
  ): CategoryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Mandatory Bengali Name
    if (!category.name_bn || category.name_bn.trim().length === 0) {
      errors.push('ক্যাটাগরির বাংলা নাম প্রদান করা আবশ্যক (name_bn missing)');
    }

    // 2. Mandatory English Name
    if (!category.name_en || category.name_en.trim().length === 0) {
      errors.push('ক্যাটাগরির ইংরেজি নাম প্রদান করা আবশ্যক (name_en missing)');
    }

    // 3. Slug Validation
    if (!category.slug || category.slug.trim().length === 0) {
      errors.push('ক্যাটাগরির স্লাগ (slug) প্রদান করা আবশ্যক');
    } else {
      const slugClean = category.slug.trim().toLowerCase();
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slugClean)) {
        errors.push(`স্লাগটি সঠিক ফরম্যাটে নেই (${category.slug})। শুধুমাত্র ইংরেজি ছোট অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।`);
      }

      // Slug Uniqueness check
      const duplicateSlug = existingCategories.find(
        (c) => c.slug.toLowerCase() === slugClean && (!isUpdate || c.id !== category.id)
      );
      if (duplicateSlug) {
        errors.push(`স্লাগ "${slugClean}" ইতিমধ্যে অন্য ক্যাটাগরিতে ব্যবহৃত হয়েছে (ID: ${duplicateSlug.id})`);
      }
    }

    // 4. Parent Reference & Hierarchy Checks
    if (category.parent_id) {
      if (category.parent_id === category.id) {
        errors.push('কোনো ক্যাটাগরি নিজেই নিজের প্যারেন্ট (Parent) হতে পারে না');
      }

      const parentExists = existingCategories.find((c) => c.id === category.parent_id);
      if (!parentExists) {
        errors.push(`নির্বাচিত প্যারেন্ট ক্যাটাগরি পাওয়া যায়নি (Parent ID: ${category.parent_id})`);
      } else {
        // Detect circular loops: A -> B -> C -> A
        if (category.id) {
          const visited = new Set<string>([category.id]);
          let currParentId: string | null = category.parent_id;

          while (currParentId) {
            if (visited.has(currParentId)) {
              errors.push(`ক্যাটাগরি হায়ারার্কিতে সার্কুলার লুপ (Circular Reference) সনাক্ত হয়েছে: ${currParentId}`);
              break;
            }
            visited.add(currParentId);
            const nextParent = existingCategories.find((c) => c.id === currParentId);
            currParentId = nextParent?.parent_id || null;
          }
        }
      }
    }

    // 5. Display order warning
    if (category.display_order !== undefined && category.display_order < 0) {
      warnings.push('ডিসপ্লে অর্ডার সাধারণত ০ বা তার বেশি ধনাত্মক সংখ্যা হওয়া উচিত');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate safe deletion of a category with job reassignment check
   */
  static validateDeletion(
    categoryId: string,
    existingCategories: CategoryRecord[],
    assignedJobCount: number,
    reassignmentCategoryId?: string
  ): CategoryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const category = existingCategories.find((c) => c.id === categoryId);
    if (!category) {
      errors.push(`মুছে ফেলার জন্য ক্যাটাগরি পাওয়া যায়নি (ID: ${categoryId})`);
      return { isValid: false, errors, warnings };
    }

    // Check if category has child categories
    const childCategories = existingCategories.filter((c) => c.parent_id === categoryId);
    if (childCategories.length > 0 && !reassignmentCategoryId) {
      errors.push(
        `এই ক্যাটাগরির অধীনে ${childCategories.length}টি সাবক্যাটাগরি বিদ্যমান। এগুলো প্রথমে মুছে ফেলুন বা অন্য ক্যাটাগরিতে স্থানান্তর করুন।`
      );
    }

    // Check if category has active jobs
    if (assignedJobCount > 0) {
      if (!reassignmentCategoryId) {
        errors.push(
          `এই ক্যাটাগরিতে ${assignedJobCount}টি সক্রিয় চাকরি বিদ্যমান। চাকরিগুলো অন্য ক্যাটাগরিতে স্থানান্তর (reassignment) ছাড়া মুছে ফেলা যাবে না।`
        );
      } else {
        if (reassignmentCategoryId === categoryId) {
          errors.push('স্থানান্তরের জন্য নির্বাচিত ক্যাটাগরি ও মুছে ফেলা ক্যাটাগরি একই হতে পারে না');
        }
        const targetCategory = existingCategories.find((c) => c.id === reassignmentCategoryId);
        if (!targetCategory) {
          errors.push(`স্থানান্তরের জন্য নির্বাচিত ক্যাটাগরি পাওয়া যায়নি (Target ID: ${reassignmentCategoryId})`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
