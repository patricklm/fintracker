export const useFetchTransactions = (period) => {
  const supababse = useSupabaseClient();
  const transactions = ref([]);
  const pending = ref(false);

  const income = computed(() =>
    transactions.value.filter((t) => t.type === 'Income')
  );
  const expense = computed(() =>
    transactions.value.filter((t) => t.type === 'Expense')
  );

  const incomeCount = computed(() => income.value.length);

  const expenseCount = computed(() => expense.value.length);

  const incomeTotal = computed(() =>
    income.value.reduce((sum, transaction) => sum + transaction.amount, 0)
  );

  const expenseTotal = computed(() =>
    expense.value.reduce((sum, transaction) => sum + transaction.amount, 0)
  );

  const fetchTransactions = async () => {
    pending.value = true;
    try {
      /**
       * NOTE: The key of useAsyncData should be unique for various queries
       * Our queries will differ based on period
       * e.g. current year, previous year, current month, previous month, current day, previous day
       * if you use 'transactions' as a generic key, multiple queries will override each other
       */
      const { data } = await useAsyncData(
        `transactions-${period.value.from.toDateString()}-${period.value.to.toDateString()}`,
        async () => {
          const { data, error } = await supababse
            .from('transactions')
            .select()
            .gte('created_at', period.value.from.toISOString())
            .lte('created_at', period.value.to.toISOString())
            .order('created_at', { ascending: false });
          return error ? [] : data;
        }
      );

      return data.value;
    } finally {
      pending.value = false;
    }
  };

  const refresh = async () => (transactions.value = await fetchTransactions());

  /**
   * watch changes on period
   * Everytime Yearly, Monthly or Daily is changed, we refresh or refetch the transactions
   *
   * Call this watch after defining refresh
   */
  watch(period, async () => refresh());

  const transactionsGroupedByDate = computed(() => {
    let grouped = {};
    for (const transaction of transactions.value) {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    }
    return grouped;
  });

  return {
    transactions: {
      all: transactions,
      grouped: {
        byDate: transactionsGroupedByDate,
      },
      income,
      expense,
      incomeTotal,
      expenseTotal,
      incomeCount,
      expenseCount,
    },
    refresh,
    pending,
  };
};
