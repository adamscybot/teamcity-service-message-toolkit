import z, { ZodSchema, ZodString, ZodTypeAny, ZodUndefined } from 'zod'

export interface MultiAttributeMessageContextualisedValidator<Keys> {
  (keys: Readonly<Set<Keys>>): ZodSchema
}

export type MultiAttributeMessageValidator = ZodSchema

export type InferValidatorType<
  Keys extends string,
  Validator extends ZodSchema
> = Validator extends MultiAttributeMessageValidator
  ? z.infer<Validator> extends ValidInterfaceForMultiAttributeMessage<
      Keys,
      z.infer<Validator>
    >
    ? Validator
    : never
  : never

/**
 * Check that an interface is of a shape the message builder will accept for the given keys. Used with `z.infer`
 * to ensure validators conform to a specification that allows each defined `Key` evaluates to string | undefined.
 */
export type ValidInterfaceForMultiAttributeMessage<
  Keys extends string,
  InterfaceToValidate
> = InterfaceToValidate extends {
  [K in Keys]?: K extends keyof InterfaceToValidate
    ? InterfaceToValidate[K] extends string | undefined
      ? InterfaceToValidate[K]
      : never
    : never
} & { [K in Exclude<keyof InterfaceToValidate, Keys>]: string } // Unknown keys are allowed due to tolerance philosophy
  ? InterfaceToValidate
  : never

export interface MultipleAttributeValidationBuilderOpts {
  allowUnknownKeys?: boolean
}

const validatorBuilder = {
  multiAttribute<Keys extends string>(keys: Set<Keys>) {
    const _strictAttrSchema = <OptionalKeys extends Keys[]>(
      optionalKeys?: OptionalKeys
    ) =>
      z.object(
        [...keys.keys()].reduce(
          (agg, k) => ({
            ...agg,
            [k]:
              optionalKeys !== undefined && optionalKeys.includes(k)
                ? z.string().optional()
                : z.string(),
          }),
          {} as Record<
            Exclude<Keys, OptionalKeys[number]>,
            z.ZodUnion<[ZodString]>
          > &
            Record<OptionalKeys[number], z.ZodUnion<[ZodString, ZodUndefined]>>
        )
      )

    const strictAttrSchemaDisallowUnknownKeys = <OptionalKeys extends Keys[]>(
      optionalKeys?: OptionalKeys
    ) => _strictAttrSchema<OptionalKeys>(optionalKeys)

    const strictAttrSchemaAllowUnknownKeys = <OptionalKeys extends Keys[]>(
      optionalKeys?: OptionalKeys
    ) => _strictAttrSchema<OptionalKeys>(optionalKeys).catchall(z.string())

    type StrictAttrSchema<
      OptionalKeys extends Keys[],
      UnknownKeys extends undefined | boolean
    > = UnknownKeys extends true
      ? ReturnType<typeof strictAttrSchemaAllowUnknownKeys<OptionalKeys>>
      : ReturnType<typeof strictAttrSchemaDisallowUnknownKeys<OptionalKeys>>

    return {
      /**
       * Provide a schema that checks that all attribute values are strings. Does not check
       * attrs are known ones.
       *
       * @returns A {@link ZodSchema} for this validation
       */
      stringAttrs() {
        return z.record(z.string(), z.string().optional())
      },
      /**
       * Provide a schema that makes all attributes for this message type required,
       * apart from those excluded. See `opts`.
       *
       * @param opts Configure the strict behaviour. Contains a key called `optionalKeys` that is a list
       * of keys for which the related attribute will remain optional.
       * @returns A {@link ZodSchema} for this validation
       */
      strictAttributes<
        OptionalKeys extends Keys[],
        const UnknownKeys extends boolean | undefined
      >({
        allowUnknownKeys = true,
        optionalKeys,
      }: {
        optionalKeys?: OptionalKeys
        /**
         * Defines if the `validate()` function on the message will throw an error or not if there are attributes
         * present which have not been declared.
         *
         * @default true
         */
        allowUnknownKeys?: UnknownKeys
      } = {}): StrictAttrSchema<OptionalKeys, UnknownKeys> {
        if (allowUnknownKeys) {
          return strictAttrSchemaAllowUnknownKeys<OptionalKeys>(
            optionalKeys
          ) as StrictAttrSchema<OptionalKeys, UnknownKeys>
        }

        return strictAttrSchemaDisallowUnknownKeys<OptionalKeys>(
          optionalKeys
        ) as StrictAttrSchema<OptionalKeys, UnknownKeys>
      },
    } as const
  },
} as const

export default validatorBuilder
