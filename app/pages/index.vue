<script setup>
import { transactionViewOptions } from '~/constants';
const selectedView = ref(transactionViewOptions[1]);
</script>

<template>
  <section class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-extrabold">Summary</h1>
    <div>
      <USelectMenu :options="transactionViewOptions" v-model="selectedView" />
    </div>
  </section>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-10">
    <Trend
      color="green"
      title="Income"
      :amount="42000"
      :last-amount="35500"
      :loading="false"
    />
    <Trend
      color="red"
      title="Expense"
      :amount="13500"
      :last-amount="15500"
      :loading="false"
    />
    <Trend
      color="green"
      title="Investment"
      :amount="46000"
      :last-amount="25000"
      :loading="false"
    />
    <Trend
      color="red"
      title="Saving"
      :amount="15000"
      :last-amount="10000"
      :loading="false"
    />
  </section>
</template>
