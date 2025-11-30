import React from "react";

export const AppLinks = () => {
  return (
    <>
      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-3">Fitbitアプリでの確認</h2>
        <p className="text-gray-300 mb-4">
          記録した食事データはFitbitアプリ（スマートフォン版）でご確認いただけます。
        </p>
        <div className="flex space-x-4 mt-4">
          <a
            href="https://apps.apple.com/jp/app/fitbit-健康とフィットネス/id462638897"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            App Storeで見る
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.fitbit.FitbitMobile&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Google Playで見る
          </a>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-3">Geminiアプリの活用</h2>
        <p className="text-gray-300 mb-4">
          Geminiアプリ（スマートフォン版）を使用すると、生成されたJSONデータを簡単にコピーしてFitbitに貼り付けることができます。Web版よりもスムーズな操作が可能です。
        </p>
        <div className="flex space-x-4 mt-4">
          <a
            href="https://apps.apple.com/jp/app/google-gemini/id6477489729"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            App Storeで見る
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.bard&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Google Playで見る
          </a>
        </div>
      </div>
    </>
  );
};
