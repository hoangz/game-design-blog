import { groq } from 'next-sanity'

const postFields = groq`
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  tags,
  "categories": categories[]->{ title, "slug": slug.current }
`

export const allPostsQuery = groq`
  *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc) { ${postFields} }
`

export const featuredPostQuery = groq`
  *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc)[0] { ${postFields} }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ${postFields},
    content
  }
`

export const postsByCategoryQuery = groq`
  *[_type == "post" && $slug in categories[]->slug.current
    && defined(publishedAt) && !(_id in path("drafts.**"))]
  | order(publishedAt desc) { ${postFields} }
`

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    title, "slug": slug.current, description
  }
`

export const allCategoriesQuery = groq`
  *[_type == "category"] { title, "slug": slug.current }
`

export const searchPostsQuery = groq`
  *[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))
    && (title match $query || excerpt match $query)]
  | order(publishedAt desc)[0...10] {
    title, "slug": slug.current, excerpt, publishedAt,
    "categories": categories[]->{ title, "slug": slug.current }
  }
`

export const allPostSlugsQuery = groq`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)] {
    "slug": slug.current, publishedAt
  }
`
