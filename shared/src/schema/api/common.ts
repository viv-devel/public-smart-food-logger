/**
 * @file アプリケーション全体で共通して使用されるAPI関連のスキーマを定義します。
 * @module shared/schema/api/common
 */
import { z } from "zod";

/**
 * APIエラーレスポンスの詳細を表現するZodスキーマです。
 *
 * このスキーマは、外部API（例: Fitbit API）や内部APIから返される可能性のある
 * 様々なエラーレスポンスの形式を柔軟にパースできるように設計されています。
 *
 * エラーメッセージがネストしたオブジェクトに含まれていたり（`details.errors` や `details.error`）、
 * トップレベルに直接含まれていたり（`error`）する複数のパターンに対応するため、
 * 多くのフィールドがオプショナル（`.optional()`）になっています。
 *
 * これにより、エラーの原因を特定する際に、予期せぬレスポンス形式によるパースエラーを防ぎ、
 * 安定したエラーハンドリングを実現します。
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

/**
 * APIエラーレスポンスの詳細を表す型。
 * `ErrorDetailSchema`から自動生成されます。
 */
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
