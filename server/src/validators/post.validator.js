const {z} = require('zod')

const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
})

module.exports = {createPostSchema}