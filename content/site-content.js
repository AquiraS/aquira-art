/**
 * AQUIRA 編集用コンテンツ
 * SEO/AEO 方針: Aquira を「横浜を拠点とする写真家・オーディオビジュアル・現代アーティスト」と
 * 一貫して定義し、ここにある可視本文と同じ事実だけを構造化データに出力する。
 * 展示歴・受賞歴・協働先・数値実績、商標登録・侵害・料金は一次資料が確認できるまで追加しない。
 */

const siteContent = {
  site: {
    origin: "https://www.aquira.art",
    language: "ja",
    name: "Aquira（アキラ）",
    shortName: "AQUIRA",
    titleSuffix: "Aquira（アキラ）公式サイト",
    description:
      "横浜を拠点に活動する写真家・オーディオビジュアル・現代アーティスト Aquira（アキラ）の公式サイト。写真、映像、現代アート、社会との協働に関する作品と活動記録を紹介します。",
  },

  entity: {
    name: "Aquira",
    alternateName: ["アキラ", "AQUIRA"],
    jobTitle: "写真家・オーディオビジュアル・現代アーティスト",
    jobTitleEnglish: "Photographer, audiovisual artist, and contemporary artist",
    location: "横浜・日本",
    locationEnglish: "Yokohama, Japan",
    description:
      "Aquira（アキラ）は、横浜を拠点に、写真、映像、オーディオビジュアル表現、現代アートを横断して制作するアーティストです。作品、対話、学びの場を通じて、表現が人と社会を結ぶ可能性を探究しています。",
    descriptionEnglish:
      "Aquira is a Yokohama-based photographer, audiovisual artist, and contemporary artist working across photography, moving image, and digital expression. Through artwork, dialogue, and learning spaces, Aquira explores how artistic expression can connect people and society.",
    sameAs: [
      "https://www.linkedin.com/in/aquirafillmoonmaker/",
      "https://www.facebook.com/cameramanakira/",
      "https://www.instagram.com/aquirart",
      "https://www.youtube.com/@AQUIRA39",
    ],
  },

  navigation: [
    { label: "プロフィール", href: "/about/" },
    { label: "作品", href: "/works/" },
    { label: "活動と協働", href: "/practice/" },
  ],

  hero: {
    eyebrow: "AQUIRA · YOKOHAMA, JAPAN",
    title: "光の記録から、社会との接点へ。",
    description:
      "横浜を拠点に、写真、映像、オーディオビジュアル表現、現代アートを制作しています。",
    button: { label: "作品と活動を見る", href: "/works/" },
  },

  contact: {
    label: "お問い合わせ・ご相談",
    href: "mailto:aquirae@me.com",
    eyebrow: "CONTACT",
    title: "まだ言葉になっていない構想から、ご相談ください。",
    description:
      "作品、協働、講座、制作のご相談を、相手の時間と心の余白を尊重する対話から始めます。内容や条件が未整理の段階でも、お送りください。",
    buttonLabel: "お問い合わせ・ご相談へ",
  },

  identityFacts: [
    { label: "拠点", value: "横浜・日本" },
    { label: "活動領域", value: "写真・映像・オーディオビジュアル・現代アート" },
    { label: "テーマ", value: "表現、対話、社会との協働" },
  ],


  works: {
    eyebrow: "SELECTED PRACTICE",
    title: "作品領域",
    summary:
      "Aquiraの制作は、写真、現代アート、デジタル表現を横断します。人物、都市、風景、光と場所の関係を手がかりに、静かな物語と新しい視点を探ります。",
    items: [
      {
        number: "01",
        title: "Photography",
        description:
          "人物、都市、風景を通して、光と場所に宿る静かな物語を写し取ります。",
      },
      {
        number: "02",
        title: "Contemporary Art",
        description:
          "アナログとデジタルの手法を横断し、鑑賞者との対話から新しい視点を探ります。",
      },
      {
        number: "03",
        title: "Digital Practice",
        description:
          "テクノロジーを、表現と対話の可能性を広げるための道具として活用します。",
      },
    ],
  },

  officialNetwork: {
    eyebrow: "OFFICIAL ECOSYSTEM",
    title: "作品・記録・公共的実践を、ひとつの文脈で。",
    summary:
      "Aquiraの公式情報は、現在の作品、名称と歩みの記録、社会と交わる実践という3つの入口で構成されています。",
    href: "/official-network/",
    label: "3つの公式サイトの関係を見る",
    links: [
      { label: "作品・表現", description: "作家プロフィール、作品、制作、協働・利用許諾。", href: "https://www.aquira.art/", internal: true },
      { label: "起点・記録", description: "名称の由来、来歴、アーカイブ、ブランド利用に関する記録。", href: "https://www.aquira1978.com/" },
      { label: "公共的実践", description: "対話、協働、社会と交わるプロジェクトの記録と入口。", href: "https://www.aquira.org/" },
    ],
  },

  practice: {
    eyebrow: "ACTIVITY & COLLABORATION",
    title: "活動と協働",
    summary:
      "Aquiraは、個人制作に加え、対話、学びの場、共同プロジェクトを通じて、創作が社会と交わる余白を育てます。協働や講座に関する相談は、公式の問い合わせ窓口から受け付けます。",
    pillars: [
      {
        title: "創作チャレンジ",
        description:
          "制作の試行、公開プロセス、記録を共有しながら、新しい表現の方法を育てます。",
      },
      {
        title: "コミュニティと協働",
        description:
          "講座、協働プロジェクト、パートナーシップを通じて、持続的で開かれた創作の関係をつくります。",
      },
      {
        title: "対話と記録",
        description:
          "作品の背景と制作の問いを記録し、鑑賞者が表現のプロセスに触れられる入口を用意します。",
      },
    ],
  },


  licensing: {
    eyebrow: "LICENSING & PERMISSIONS",
    title: "利用許諾のご相談",
    summary:
      "Aquiraの作品、画像、映像、制作物、または公式表記の利用を検討される場合は、利用内容を確認したうえで個別にご相談を承ります。相談だけで利用許可が成立することはありません。利用の可否、対象、期間、地域、媒体、対価その他の条件は、必要に応じて書面で合意します。",
    scopes: [
      {
        title: "作品・画像・映像",
        description:
          "展示、出版、放送、広告、ウェブサイト、SNS、教育、イベントその他での利用について、対象素材と利用態様を確認します。",
      },
      {
        title: "協働・委託制作",
        description:
          "共同プロジェクト、撮影、映像制作、ワークショップ、講座、企画協力に関する相談を受け付けます。",
      },
      {
        title: "公式表記・紹介文",
        description:
          "作家名、肩書き、公式プロフィール、クレジット表記を掲載する場合は、掲載先と文脈を確認のうえ正確な情報をご案内します。",
      },
    ],
    consultation: [
      {
        title: "ご相談時にお知らせください",
        description:
          "利用したい素材または表記、利用目的、媒体、掲載・開催地域、期間、予定日、想定予算、連絡先を、可能な範囲でお知らせください。",
      },
      {
        title: "確認と書面合意",
        description:
          "権利帰属と利用可能な範囲を確認し、必要な場合は利用条件を個別の書面で合意します。書面での合意前に利用を開始しないでください。",
      },
      {
        title: "お問い合わせ方法",
        description:
          "本サイトの公式プロフィールに掲載されている最新の事業・協働窓口からご連絡ください。秘密鍵、パスワード、APIキーなどの機密情報は送付しないでください。",
      },
    ],
  },

  about: {
    eyebrow: "OFFICIAL ARTIST PROFILE",
    title: "Aquiraについて",
    summary:
      "Aquira（アキラ）は、横浜を拠点に活動する写真家・オーディオビジュアル・現代アーティストです。写真、映像、デジタル表現を通じて、個人の記憶、都市、場所、社会との関係を見つめています。",
    sections: [
      {
        title: "表現の領域",
        text:
          "写真を出発点に、映像、オーディオビジュアル表現、現代アートへと制作を広げています。メディアを横断しながら、光、時間、場所に残る感覚を作品へと編み直します。",
      },
      {
        title: "社会との関係",
        text:
          "Aquiraの活動は、作品の発表だけにとどまりません。対話と学びの場を通じて、表現が人と社会の間に新しい接点を生む可能性を探究します。",
      },
      {
        title: "公式情報について",
        text:
          "本ページはAquiraの公式プロフィールです。作品、活動、協働に関する情報は、公式サイトおよび公式にリンクされたプロフィールからご確認ください。",
      },
    ],
  },

  policy: {
    eyebrow: "AQUIRA POLICY",
    title: "自由と静けさから、創造をはじめる。",
    summary:
      "Aquiraは、作品づくり、対話、協働において、短期的な効率や慣習的な正解よりも、ひとりひとりの自由、快適さ、心の余白を大切にします。美しいものをつくることは、無理を重ねることではなく、よく見て、よく選び、持続できる形へ整えることだと考えています。",
    priority: ["自由・快適さ・心の余白", "時間", "お金"],
    sanctuary: [
      { title: "静けさを守る", description: "過剰な競争、同調、消耗を前提にしません。時間、注意力、感情のエネルギーを、創造に必要な大切な資本として扱います。" },
      { title: "自由な選択を残す", description: "急がせるための言葉や、選択肢を狭めるための設計ではなく、理解し、考え、納得して選べる余白を整えます。" },
      { title: "成長の位置づけ", description: "収益、効率、成長は目的そのものではありません。心身聖域と尊厳を守れる範囲で、はじめて意味を持つものです。" },
    ],
    judgment: [
      { title: "過去の文脈", description: "何が積み重ねられ、何を守るべきかを見つめます。" },
      { title: "現在の制約", description: "時間、体力、関係性、実装の条件を正直に扱います。" },
      { title: "将来への影響", description: "後悔を減らし、自由と選択肢を残す形を考えます。" },
    ],
  },

  ecosystem: {
    eyebrow: "AQUIRA ECOSYSTEM",
    title: "美意識を、内側から育てる。",
    summary:
      "Aquiraは、外部への依存を増やすことではなく、自分自身で見つめ、選び、表現する力を育てることを大切にしています。作品、知識、技術、顧客理解、制作の経験を、使い切るためではなく、次の創造へつながる資産として静かに蓄積します。",
    capabilities: [
      { title: "知識", description: "観察と学びを、次の問いを深めるために蓄積します。" },
      { title: "表現", description: "一回性の体験を、静かな物語として形にします。" },
      { title: "ブランド", description: "誇張ではなく、言葉と行動の一致から信頼を育てます。" },
      { title: "技術", description: "新しさのためではなく、表現と対話を豊かにするために使います。" },
      { title: "顧客理解", description: "相手の背景、時間、感受性を尊重し、関係を急がせません。" },
      { title: "制作力", description: "試行と記録を重ね、学習速度と再現性を高めます。" },
    ],
    values: [
      { title: "美的価値", description: "見るたびに新しい余韻が残ること。" },
      { title: "感情的価値", description: "心を急かさず、自分自身へ戻れること。" },
      { title: "機能的価値", description: "迷わず理解し、無理なく使えること。" },
      { title: "社会的価値", description: "信頼と対話、文化的なつながりが生まれること。" },
      { title: "文化的・象徴的価値", description: "物語や記憶が、個人と場所をゆるやかに結ぶこと。" },
      { title: "長期的な資産性", description: "時間が経っても、学びと選択肢を残すこと。" },
    ],
    principles: [
      { title: "Easy", description: "内容と次の一歩を、わかりやすく整える。" },
      { title: "Attractive", description: "静かな魅力と、選びたくなる美しさを保つ。" },
      { title: "Social", description: "相手の尊厳を守りながら、信頼と文化的なつながりを育てる。" },
      { title: "Timely", description: "いまの状況、時間、心の余白に合う選択肢を示す。" },
    ],
  },

  faq: [
    {
      question: "Aquira（アキラ）はどのようなアーティストですか？",
      answer:
        "Aquira（アキラ）は、横浜を拠点に写真、映像、オーディオビジュアル表現、現代アートを横断して制作するアーティストです。作品、対話、学びの場を通じて、表現が人と社会を結ぶ可能性を探究しています。",
    },
    {
      question: "Aquiraの主な作品領域は何ですか？",
      answer:
        "写真、現代アート、デジタル表現を主な領域としています。人物、都市、風景、光と場所の関係を手がかりに、静かな物語と新しい視点を探ります。",
    },
    {
      question: "Aquiraはどこを拠点に活動していますか？",
      answer: "Aquiraは、横浜・日本を拠点に活動しています。",
    },
    {
      question: "協働や講座について相談できますか？",
      answer:
        "はい。Aquiraは、講座、協働プロジェクト、パートナーシップに関する相談を受け付けています。最新の公式窓口は、本サイトの問い合わせ導線からご確認ください。",
    },
    {
      question: "Aquiraの作品や公式表記を利用できますか？",
      answer:
        "利用内容を確認したうえで個別にご相談を承ります。相談だけで利用許可が成立することはありません。対象、目的、媒体、地域、期間、対価その他の条件は、必要に応じて書面で合意します。",
    },
    {
      question: "CRM製品のAquiraと同じですか？",
      answer:
        "いいえ。本サイトのAquira（アキラ）は、横浜を拠点とする写真家・オーディオビジュアル・現代アーティストに関する公式サイトです。放送業界向けのCRM・広告販売支援製品とは別の存在です。",
    },
  ],

  english: {
    title: "Aquira | Yokohama-based Photographer & Contemporary Artist",
    eyebrow: "AQUIRA · YOKOHAMA, JAPAN",
    headline: "From records of light to points of connection with society.",
    introduction:
      "Aquira is a Yokohama-based photographer, audiovisual artist, and contemporary artist. Working across photography, moving image, audiovisual expression, and digital practice, Aquira explores how artistic expression can connect people and society.",
    identityTitle: "Official artist profile",
    identityText:
      "This is the official website for Aquira, an artist based in Yokohama, Japan. For artwork, activities, and official information, please refer to this website and the official profiles linked here.",
    practiceTitle: "Areas of practice",
    practiceText:
      "Aquira works across photography, contemporary art, and digital expression. The practice considers people, cities, landscapes, light, and the relationship between place and memory.",
    distinctionTitle: "About the name Aquira",
    distinctionText:
      "This website provides official information about Aquira, the Yokohama-based artist. Aquira is a distinct person and artistic practice from software products, organizations, or other third parties that may use the same or a similar name.",
    licensingTitle: "Licensing and permissions",
    licensingText:
      "For enquiries about using Aquira's artwork, images, moving image, creative materials, or official name and biography, please review the licensing and permissions information. A consultation does not itself grant permission; terms are agreed separately when appropriate.",
  },

  tokushoho: {
    eyebrow: "LEGAL NOTICE",
    title: "特定商取引法に基づく表記",
    summary:
      "商品をご検討・ご購入いただく前に、販売条件と連絡先に関する情報をご確認ください。",
    entries: [
      { label: "販売事業者", paragraphs: ["Taiwa Kou Trading Co., Ltd"] },
      { label: "運営統括責任者", paragraphs: ["藤原アキラ"] },
      {
        label: "所在地",
        paragraphs: ["住所の開示請求があった場合には、遅滞なく電子メール等により開示いたします。"],
      },
      {
        label: "電話番号",
        paragraphs: ["電話番号の開示請求があった場合には、遅滞なく電子メール等により開示いたします。"],
      },
      { label: "メールアドレス", paragraphs: ["aquirae@me.com"], href: "mailto:aquirae@me.com" },
      { label: "販売URL", paragraphs: ["https://aquira.art/"], href: "https://aquira.art/" },
      { label: "販売価格", paragraphs: ["各商品ページに表示された価格（税込）"] },
      {
        label: "商品代金以外の必要料金",
        paragraphs: [
          "送料",
          "海外配送に伴う送料、関税、輸入税、通関手数料その他の費用は、購入者の負担となります。",
          "銀行振込を選択した場合の振込手数料は、購入者の負担となります。",
        ],
      },
      { label: "お支払い方法", paragraphs: ["クレジットカード、PayPal、銀行振込"] },
      {
        label: "代金の支払い時期",
        paragraphs: [
          "クレジットカード決済は、ご注文時にお支払いが確定します。",
          "銀行振込は、ご注文後14日以内にお支払いください。",
        ],
      },
      {
        label: "商品の引渡時期",
        paragraphs: [
          "ご入金確認後、通常14営業日以内に発送します。",
          "受注制作商品は、制作内容・仕様により異なるため、個別にご案内します。",
          "天候、配送事業者の事情、通関手続その他の事情により、配送が遅延する場合があります。",
        ],
      },
      {
        label: "返品・交換・キャンセル",
        paragraphs: [
          "原画、一点物および受注制作作品という商品の性質上、お客様都合による返品、交換またはキャンセルはお受けしておりません。",
          "ただし、商品到着時の破損、配送中の事故、またはご注文内容と異なる商品が届いた場合は、商品到着後21日以内に、商品の状態が分かる写真を添えて、aquirae@me.com までご連絡ください。",
          "内容を確認のうえ、返品、交換または返金等の対応を行います。返品にかかる送料は、当方の責任による場合には当方が負担します。",
        ],
      },
    ],
  },

  footer: {
    title: "Aquira（アキラ）",
    description: "写真・オーディオビジュアル・現代アート — 横浜・日本",
    legalNotice: { label: "特定商取引法に基づく表記", href: "/tokushoho/" },
  },
};

export default siteContent;
