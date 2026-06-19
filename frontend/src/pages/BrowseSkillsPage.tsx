import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { skillService, categoryService, Skill, Category } from '@/services'
import { SkillCard, EmptyState } from '@/components/SkillCard'
import { SkillCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { debounce } from '@/lib/utils'

export default function BrowseSkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category_id') || ''
  const level = searchParams.get('level') || ''
  const sort = searchParams.get('sort') || 'newest'

  const fetchSkills = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const params: Record<string, string | number> = { page: pageNum, per_page: 12, sort }
      if (search) params.search = search
      if (categoryId) params.category_id = categoryId
      if (level) params.level = level

      const { data } = await skillService.browse(params)
      const payload = data.data
      setSkills((prev) => append ? [...prev, ...payload.items] : payload.items)
      setHasMore(payload.pagination.has_more)
      setPage(pageNum)
    } catch {
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [search, categoryId, level, sort])

  useEffect(() => {
    categoryService.getAll()
      .then(({ data }) => setCategories(data.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchSkills(1)
  }, [fetchSkills])

  const debouncedSearch = useRef(
    debounce((value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('search', value)
        else next.delete('search')
        return next
      })
    }, 400)
  ).current

  useEffect(() => {
    const el = observerRef.current
    if (!el || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchSkills(page + 1, true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, page, fetchSkills])

  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  const clearFilters = () => setSearchParams({})

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            defaultValue={search}
            placeholder="Search skills..."
            className="pl-10"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" /> Filters
        </Button>
        {(categoryId || level || search) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card mb-8 grid gap-4 sm:grid-cols-3"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select className="input-field px-4" value={categoryId} onChange={(e) => updateFilter('category_id', e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Level</label>
            <select className="input-field px-4" value={level} onChange={(e) => updateFilter('level', e.target.value)}>
              <option value="">All levels</option>
              {['beginner', 'intermediate', 'advanced', 'expert'].map((l) => (
                <option key={l} value={l} className="capitalize">{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Sort by</label>
            <select className="input-field px-4" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkillCardSkeleton key={i} />)}
        </div>
      ) : !skills.length ? (
        <EmptyState title="No skills found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skills.map((skill, i) => (
              <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 12) * 0.03 }}>
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </div>
          <div ref={observerRef} className="py-8 text-center">
            {loadingMore && <p className="text-sm text-gray-500">Loading more...</p>}
          </div>
        </>
      )}
    </div>
  )
}
