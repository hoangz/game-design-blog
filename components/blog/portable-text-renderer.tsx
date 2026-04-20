import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/image'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      const imageUrl = urlForImage(value).width(1200).url()
      return (
        <figure className="my-6">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <Image
              src={imageUrl}
              alt={value.alt ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 65ch"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-xs text-[var(--muted-foreground)] mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value.href}
        target={value.href?.startsWith('http') ? '_blank' : undefined}
        rel={value.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-[var(--accent)] underline hover:text-[var(--accent-hover)]"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-[#fcd34d] text-sm">
        {children}
      </code>
    ),
  },
  block: {
    h2: ({ children }) => (
      <h2
        id={String(children).toLowerCase().replace(/\s+/g, '-')}
        className="font-display text-2xl font-bold text-white mt-10 mb-4"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        id={String(children).toLowerCase().replace(/\s+/g, '-')}
        className="font-display text-xl font-bold text-white mt-8 mb-3"
      >
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[var(--accent)] pl-4 my-6 text-[var(--muted-foreground)] italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="text-[#d4d4d4]">{children}</li>,
    number: ({ children }) => <li className="text-[#d4d4d4]">{children}</li>,
  },
}

interface PortableTextRendererProps {
  content: any[]
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  return (
    <div className="prose max-w-none">
      <PortableText value={content} components={components} />
    </div>
  )
}
