import admin from "firebase-admin";

import { AuthenticationError } from "../utils/errors.js";

// Firebase Admin SDKを初期化します。
// Cloud Functionsのようなサーバーレス環境では、関数の呼び出しごとにコードが再評価される可能性があります。
// `admin.apps.length === 0` のチェックは、SDKが複数回初期化されるのを防ぐための定石です。
// 重複初期化はエラーを引き起こすため、このガード句が重要になります。
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// トークン用のFirestoreコレクション
const FITBIT_TOKENS_COLLECTION = "fitbit_tokens";

interface FitbitTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  fitbitUserId: string;
  firebaseUids: string[];
}

/**
 * フロントエンドから送られてきたFirebase IDトークンを検証し、デコードされた内容を返します。
 * これは、リクエスト元が正規のFirebaseユーザーであることを確認するための重要なセキュリティステップです。
 * トークンが無効、期限切れ、または不正な形式である場合はエラーをスローし、認証を失敗させます。
 *
 * @param idToken クライアントから `Authorization: Bearer <ID_TOKEN>` ヘッダーで送信されるJWT。
 * @returns 検証済みユーザーのデコードされたトークン情報（uid, emailなどを含む）。
 * @throws {AuthenticationError} トークンの検証に失敗した場合。
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<admin.auth.DecodedIdToken> {
  if (!idToken) {
    throw new AuthenticationError("ID token is required.");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    throw new AuthenticationError("Invalid ID token.");
  }
}

/**
 * 指定されたFirebase UIDに関連付けられたFitbitトークンをFirestoreから取得します。
 * データモデルとして、`firebaseUids` フィールドにUIDが含まれているドキュメントを検索します。
 * これにより、将来的に複数のFirebaseアカウントが同じFitbitアカウントにリンクするようなシナリオにも対応可能です。
 *
 * @param firebaseUid 検索キーとなるFirebaseユーザーのUID。
 * @returns ユーザーに関連付けられたトークン情報。見つからない場合は `null` を返す。
 */
export async function getTokensFromFirestore(
  firebaseUid: string,
): Promise<FitbitTokens | null> {
  const querySnapshot = await db
    .collection(FITBIT_TOKENS_COLLECTION)
    .where("firebaseUids", "array-contains", firebaseUid)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    console.log(`No token found for user ${firebaseUid}`);
    return null;
  }

  return querySnapshot.docs[0].data() as FitbitTokens;
}

/**
 * Fitbitのトークン情報をFirestoreに保存または更新します。
 *
 * データモデルの重要な点:
 * - **ドキュメントID**: `fitbitUserId` を使用します。これにより、Fitbitユーザーごとにトークン情報が一意に保たれます。
 * - **`firebaseUids`**: FirebaseのUIDを配列 (`arrayUnion`) で管理します。これにより、1つのFitbitアカウントに対して複数のFirebaseアカウント（例：Googleログイン、メールログインなど）を紐付けることが可能になります。
 * - **`merge: true`**: このオプションにより、ドキュメント全体を上書きするのではなく、指定されたフィールドのみを更新（または新規作成）します。`firebaseUids` に新しいUIDを追加する際に、既存のUIDを消さずに済みます。
 *
 * @param firebaseUid 関連付けるFirebaseユーザーのUID。
 * @param fitbitUserId 保存するトークンの持ち主であるFitbitユーザーのID。
 * @param tokens Fitbit APIから返されたトークンオブジェクト（`access_token`, `refresh_token`, `expires_in` を含む）。
 */
export async function saveTokensToFirestore(
  firebaseUid: string,
  fitbitUserId: string,
  tokens: any,
): Promise<void> {
  const expiresAt = new Date().getTime() + tokens.expires_in * 1000;
  const tokenData = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: expiresAt,
    fitbitUserId: fitbitUserId,
    firebaseUids: admin.firestore.FieldValue.arrayUnion(firebaseUid),
  };

  await db
    .collection(FITBIT_TOKENS_COLLECTION)
    .doc(fitbitUserId)
    .set(tokenData, { merge: true });
  console.log(
    `Successfully saved tokens for Firebase user ${firebaseUid} (Fitbit user ${fitbitUserId})`,
  );
}
