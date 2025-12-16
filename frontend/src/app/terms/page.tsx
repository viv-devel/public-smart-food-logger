/**
 * 利用規約ページコンポーネント。
 *
 * 本サービスの利用条件、免責事項、禁止事項などを表示する静的ページ。
 * Tailwind CSSのtypographyプラグイン (`prose`) を使用してスタイリングされている。
 */
export default function TermsOfServicePage() {
  return (
    <div className="prose prose-sm prose-invert">
      <h2 className="text-3xl font-bold">利用規約</h2>
      <p>
        本利用規約（以下、「本規約」といいます。）は、「Fitbit via
        Gemini」（以下、「本サービス」といいます。）の利用条件を定めるものです。本サービスをご利用になる前に、本規約をよくお読みいただき、同意いただく必要があります。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        第1条（本サービスの役割と構成）
      </h3>
      <p>
        本サービスは、ユーザーがGoogle
        LLCの提供するGemini（カスタムGem）を用いて分析した食事の栄養情報（JSON形式）を、ユーザー自身のFitbitアカウントに食事ログとして記録するためのウェブアプリケーションです。本サービスは、以下の独立したサービスを連携させる「仲介」の役割を果たします。
      </p>
      <ul>
        <li>
          <strong>Google Gemini:</strong> 食事の分析と栄養情報の生成を行います。
        </li>
        <li>
          <strong>Fitbit API:</strong>{" "}
          栄養情報をユーザーのアカウントに記録します。
        </li>
        <li>
          <strong>本サービス:</strong>{" "}
          上記2つを繋ぐデータの中継と処理を行います。
        </li>
      </ul>
      <p>
        本サービスの利用にあたっては、Firebase
        Authenticationを用いた認証（Googleログイン等）を行い、本サービスに対し自身のFitbitアカウントへのアクセス許可（OAuth認証）を与える必要があります。また、上記を含む第三者サービスの利用規約にも従う必要があります。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        第2条（免責事項）
      </h3>
      <p>
        1.
        本サービスは、Geminiが生成する栄養情報の正確性、完全性、または有用性を一切保証しません。AIによる推定値には誤差が含まれる可能性があり、医療専門家の指導に代わるものではありません。
      </p>
      <p>
        2.
        食物アレルギー、食事制限、または特定の健康状態にある方は、本サービスを通じて得られた情報を利用する前に、必ず医師または管理栄養士に相談してください。
      </p>
      <p>
        3.
        開発者は、本サービスの利用、中断、または利用不能に起因するいかなる損害（Fitbitアカウントのデータ損失、健康上の問題、その他一切の不利益）についても、一切の責任を負いません。本サービスは現状有姿（as-is）で提供されます。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        第3条（ユーザーの責任）
      </h3>
      <p>
        ユーザーは、自己の責任において本サービスを利用するものとし、本サービスを利用して登録する食事データの内容について一切の責任を負うものとします。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        第4条（禁止事項）
      </h3>
      <p>
        ユーザーは、本サービスの利用にあたり、法令または公序良俗に違反する行為、本サービスのサーバーに過度な負荷をかける行為、リバースエンジニアリング、その他開発者が不適切と判断する行為を行ってはなりません。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        第5条（本サービスの変更・終了）
      </h3>
      <p>
        開発者は、事前の通知なく、いつでも本サービスの内容を変更し、または提供を終了することができるものとします。
      </p>

      <h3 className="text-xl font-semibold mt-10 mb-6 border-l-4 border-indigo-500 pl-4">
        第6条（本規約の変更）
      </h3>
      <p>
        開発者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の規約は、本サービス上に掲載された時点から効力を生じるものとします。
      </p>
    </div>
  );
}
