import { z } from "zod";

/**
 * 共通のエラー詳細スキーマ
 * APIレスポンスのエラー情報を表現する
 */
export const ErrorDetailSchema = z.object({
  details: z
    .object({
      errors: z
        .array(
          z.object({
            message: z.string().optional(),
          }),
        )
        .optional(),
      error: z.string().optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
