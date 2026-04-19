import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Chủ Đề',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Tên', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Mô tả', type: 'text', rows: 2 }),
  ],
})
