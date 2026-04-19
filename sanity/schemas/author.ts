import { defineType, defineField } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Tác Giả',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Tên', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'bio', title: 'Giới thiệu', type: 'text', rows: 4 }),
    defineField({ name: 'avatar', title: 'Avatar', type: 'image', options: { hotspot: true } }),
  ],
})
