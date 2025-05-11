import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { ActiveLink } from './ActiveLink'

export default function LNB() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  return (
    <div className="sticky top-10 hidden h-full max-h-screen max-w-[280px] min-w-[280px] flex-wrap overflow-auto rounded-sm bg-gray-50 pt-5 shadow-md sm:flex dark:bg-gray-900/70 dark:shadow-gray-800/40">
      <div className="px-6 py-4">
        <ActiveLink href="/blog" className="font-bold uppercase">
          All Posts
        </ActiveLink>
        <ul>
          {sortedTags.map((t) => {
            const tagSlug = slug(t)
            return (
              <li key={t} className="my-3">
                <ActiveLink
                  href={`/tags/${tagSlug}`}
                  className="px-3 py-2 text-sm font-medium text-gray-500 uppercase dark:text-gray-300"
                  activeClassName="text-primary-500 font-bold"
                  aria-label={`View posts tagged ${t}`}
                >
                  {`${t} (${tagCounts[t]})`}
                </ActiveLink>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
