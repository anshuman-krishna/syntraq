export interface SearchResult {
  type: 'employee' | 'vehicle' | 'workflow'
  id: string
  label: string
  sublabel: string
  route: string
}

export function useSearch() {
  const results = ref<SearchResult[]>([])
  const searching = ref(false)
  // guards against out-of-order responses when the user keeps typing
  let seq = 0

  async function run(query: string) {
    const q = query.trim()
    if (q.length < 2) {
      results.value = []
      return
    }

    const current = ++seq
    searching.value = true
    try {
      const data = await $fetch<{ results: SearchResult[] }>('/api/search', { params: { q } })
      if (current === seq) results.value = data.results
    } catch {
      if (current === seq) results.value = []
    } finally {
      if (current === seq) searching.value = false
    }
  }

  function clear() {
    seq++
    results.value = []
  }

  return { results, searching, run, clear }
}
