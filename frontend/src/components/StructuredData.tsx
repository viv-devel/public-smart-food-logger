"use client";

import Script from "next/script";

type StructuredDataProps = {
  baseUrl: string;
};

export const StructuredData = ({ baseUrl }: StructuredDataProps) => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Smart Food Logger",
    url: baseUrl,
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Smart Food Logger",
    applicationCategory: "HealthApplication",
    operatingSystem: "Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    description:
      "食事の写真を撮るだけでAIが内容を推定し、Fitbitへ記録するWebアプリケーション。",

    // Developer Authorization
    author: {
      "@type": "Organization",
      name: "Smart Food Logger Team",
      url: baseUrl,
    },
    // Screenshot (OK to use OGP image showing AI interaction)
    screenshot: `${baseUrl}/images/ogp-image.png`,

    // Key features - Emphasizing "Ease of Use" and "No Manual Entry"
    featureList: [
      "食事検索や面倒な栄養計算・入力が一切不要",
      "写真やチャットでAIに伝えるだけの圧倒的に楽な記録体験",
      "生成されたJSONをコピペするだけのシンプル操作",
      "Fitbitへの自動連携（完全無料）",
    ],
  };

  return (
    <>
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="schema-software-app"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
    </>
  );
};
