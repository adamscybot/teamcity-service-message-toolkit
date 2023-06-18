import z, { ZodBoolean, ZodObject, ZodSchema, ZodType } from 'zod'

/** Used to ensure that a provided schema is of an object shape (to accept multiple attributes). */
export type InferMultiAttributeMessageSchema<Schema extends ZodSchema> =
  Schema extends ZodSchema
    ? z.infer<Schema> extends Record<string, any>
      ? Schema
      : never
    : never

export type StrictKeysOfMultiAttrSchema<Schema extends Readonly<ZodSchema>> =
  keyof Zod.infer<Schema>

export type KeysOfMultiAttrSchema<Schema extends Readonly<ZodSchema>> =
  StrictKeysOfMultiAttrSchema<Schema> & ({} | string)

export type RawKwargsOfMultiAttrSchema<Schema extends Readonly<ZodSchema>> =
  Partial<Zod.input<Schema>> & Record<string, string>

export type ValidatedAttrTypeForKey<
  Schema extends Readonly<ZodSchema>,
  Key extends StrictKeysOfMultiAttrSchema<Schema>
> = Zod.infer<Schema>[Key]

const schemaBuilder = {
  /**
   * Allows Zod schemas to be built that represent multi attribute messages. The full power of Zod can be used to represent complex
   * relationships by composing schemas output by this builder at a higher level. Schemas can also use Zod transforms to allow
   * values to be converted to more abstract representations.
   *
   * @returns A set of utilities that allows for easy building of a Zod schema that represents a multi attribute message.
   *
   * @example
   * Define a schema with a required string attribute called `name` and a required string attribute called `id`.
   * ```
   * schemaBuilder.multiAttribute().attribute('name').attribute('id').build()
   * ```
   *
   * @example
   * Define a schema with an optional string attribute called `description`.
   * ```
   * schemaBuilder.multiAttribute().attribute('description', (attr) => attr.optional()).build()
   * ```
   *
   * @example
   * Define a schema with an boolean attribute called `enabled`, which defaults to `false`.
   * `z` can be imported from `zod`.
   * ```
   * schemaBuilder.multiAttribute().attribute('enabled', () => z.coerce.boolean().default(false)).build()
   * ```
   *
   * @example
   * Define a schema which accepts a message that can be accept two different sets of attributes.
   * `z` can be imported from `zod`.
   * ```
   * z.union([
   *   schemaBuilder
   *     .multiAttribute()
   *     .attribute("type", () => z.literal("one"))
   *     .attribute("uniqueToTypeOne")
   *     .build(),
   *   schemaBuilder
   *     .multiAttribute()
   *     .attribute("type", () => z.literal("two"))
   *     .attribute("uniqueToTypeTwo")
   *     .build(),
   * ]);
   * ```
   */
  multiAttribute() {
    const multiBuilder = <
      Schema extends Readonly<Array<ZodObject<any, any, any, any, any>>>
    >(
      schema: Schema
    ) =>
      ({
        /**
         * Define an attribute that this message accepts.
         *
         * @param attributeName The string which represents the name of the attribute
         * @param getAttrSchema An optional function that returns a zod schema for this attribute.
         *                      By default a schema representing a required string is provided as
         *                      the first paramater. Allows for full use of Zod functionality such
         *                      as transforms.
         * @returns The builder, to build more attributes. See `build` to get the zod schema.
         * @see schemaBuilder.multiAttribute
         */
        attribute<
          const AttributeName extends string,
          AttrSchema extends z.ZodTypeAny = z.ZodString
        >(
          attributeName: AttributeName,
          getAttrSchema?: (
            /** The default schema representing a required string to build on if desirable.*/
            defaultAttrSchema: z.ZodString
          ) => AttrSchema
        ) {
          const validatedAttrName = z.string().parse(attributeName)

          const schemaDef = {
            [validatedAttrName]: getAttrSchema?.(z.string()) ?? z.string(),
          } as Readonly<Record<AttributeName, AttrSchema>>

          const newSchema = z.object(schemaDef).merge(schema[0] as Schema[0])
          return multiBuilder<[typeof newSchema, ...Schema]>([
            newSchema,
            ...schema,
          ])
        },
        /**
         * Get the combined zod schema for everything defined up to this point in the builder chain.
         *
         * @returns The Zod schema representing all the chained calls to `attribute`.
         * @see schemaBuilder.multiAttribute
         */
        build() {
          return schema[0] as Schema[0]
        },
      } as const)

    return multiBuilder([z.object({})])
  },
  singleAttribute() {
    const singleBuilder = () => ({
      default() {
        return z.string()
      },
    })

    return singleBuilder()
  },
} as const

export default schemaBuilder
