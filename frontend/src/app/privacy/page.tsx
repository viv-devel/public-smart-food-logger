/**
 * プライバシーポリシーページコンポーネント。
 *
 * 本サービスの個人情報の取り扱い、データ収集の目的、利用方法などを表示する静的ページ。
 * Fitbit APIとの連携に伴うデータの取り扱いに重点を置いている。
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="prose prose-sm prose-invert">
      <h2 className="text-3xl font-bold">プライバシーポリシー</h2>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        1. 収集する情報
      </h3>
      <p>
        本サービスは、ユーザーがFitbitアカウントへの食事ログ記録を行うために必要な、以下の最小限の情報を一時的に取得・利用します。
      </p>
      <ul>
        <li>
          <strong>Fitbitアカウント情報:</strong> OAuth
          2.0認証を通じて取得するアクセストークンおよびリフレッシュトークン。
        </li>
        <li>
          <strong>食事データ:</strong>{" "}
          ユーザーがGeminiから送信した、食事の栄養情報（カロリー、タンパク質、脂質、炭水化物など）。
        </li>
      </ul>
      <p>
        本サービスは、ユーザーの氏名、住所、電話番号などの個人を特定できる情報（PII）を独自のデータベースに永続的に保存することはありません。認証にはFirebase
        Authenticationを利用し、安全にサービスを利用できます。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        2. 情報の利用目的
      </h3>
      <p>取得した情報は、以下の目的のみに利用されます。</p>
      <ul>
        <li>ユーザーのFitbitアカウントに食事ログを登録するため。</li>
        <li>
          アクセストークンの有効期限が切れた場合に、トークンを再発行（リフレッシュ）してサービス利用を継続するため。
        </li>
      </ul>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        3. 情報の保管
      </h3>
      <p>
        Fitbit
        APIの連携に必要なアクセストークンおよびリフレッシュトークンは、Google Cloud
        Firestoreにて安全に保管されます。これにより、ユーザーはスムーズに食事ログを記録することができます。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        4. 第三者への提供
      </h3>
      <p>
        本サービスは、ユーザーの同意がある場合、または法令に基づく場合を除き、取得した情報を第三者に提供することはありません。ただし、本サービスの機能実現のために、Fitbit
        API（Google LLC）に対して必要なデータ（認証トークン、食事データ）を送信します。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        5. プライバシーポリシーの変更
      </h3>
      <p>
        本ポリシーの内容は、法令の改正やサービスの変更に伴い、予告なく変更されることがあります。重要な変更がある場合には、本サービス上で適切な方法で通知します。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        6. お問い合わせ
      </h3>
      <p>
        本ポリシーに関するお問い合わせは、GitHubリポジトリのIssueまたは開発者の連絡先までお願いいたします。
      </p>
    </div>
  );
}
