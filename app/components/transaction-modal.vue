<script setup>
import { z } from 'zod';

import { categories, trasanctionTypes } from '~/constants.js';

const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits(['update:modelValue', 'saved']);
const initialState = {
  type: undefined,
  amount: 0,
  created_at: undefined,
  description: undefined,
  category: undefined,
};
const state = reactive({
  ...initialState,
});

const defaultSchema = z.object({
  type: z.string(),
  created_at: z.string('Select date'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
});

const incomeSchema = z.object({
  type: z.literal('Income'),
});

const investmentSchema = z.object({
  type: z.literal('Investment'),
});

const savingSchema = z.object({
  type: z.literal('Saving'),
});

const expenseSchema = z.object({
  type: z.literal('Expense'),
  category: z.enum(categories),
});

const schema = z.intersection(
  z.discriminatedUnion('type', [
    incomeSchema,
    savingSchema,
    investmentSchema,
    expenseSchema,
  ]),
  defaultSchema
);

const form = ref();
const isLoading = ref(false);
const supabase = useSupabaseClient();
const toast = useToast();

const resetForm = () => {
  Object.assign(state, initialState);
  form.value.clear();
};
const onSubmit = async (event) => {
  isLoading.value = true;
  try {
    const { error } = await supabase.from('transactions').upsert({ ...state });
    if (!error) {
      toast.add({
        title: 'Transaction saved',
        icon: 'i-heroicons-check-circle',
        color: 'green',
      });
      isOpen.value = false;
      emit('saved');
      return;
    }
    throw error;
  } catch (e) {
    toast.add({
      title: 'Transaction not saved',
      description: e.message,
      icon: 'i-heroicons-exclmation-circle',
      color: 'red',
    });
  } finally {
    isLoading.value = false;
  }
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) resetForm();
    emit('update:modelValue', value);
  },
});
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header> Add Transaction </template>

      <UForm
        ref="form"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup
          :required="true"
          label="Transaction Type"
          name="type"
          class="mb-4"
        >
          <USelect
            v-model="state.type"
            placeholder="Select transaction type"
            :options="trasanctionTypes"
          />
        </UFormGroup>
        <UFormGroup label="Amount" name="amount" :required="true" class="mb-4">
          <UInput
            v-model.number="state.amount"
            type="number"
            placeholder="Amount"
          />
        </UFormGroup>

        <UFormGroup
          label="Transaction date"
          name="created_at"
          :required="true"
          class="mb-4"
        >
          <UInput
            v-model="state.created_at"
            type="date"
            icon="i-heroicons-calendar-days-20-solid"
          />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          hint="Optional"
          class="mb-4"
        >
          <UTextarea v-model="state.description" placeholder="Description" />
        </UFormGroup>
        <UFormGroup
          :required="true"
          label="Category"
          name="category"
          class="mb-4"
          v-if="state.type === 'Expense'"
        >
          <USelect
            v-model="state.category"
            placeholder="Catetory"
            :options="categories"
          />
        </UFormGroup>
        <UButton
          type="submit"
          color="black"
          variant="solid"
          label="Save"
          :loading="isLoading"
        />
      </UForm>
    </UCard>
  </UModal>
</template>
