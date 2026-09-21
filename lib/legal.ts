import type { Locale } from "@/i18n.config";

export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  contactPrefix: string;
};

const contact = {
  site: "kirwinbodyworks.com",
  email: "Stephen.kirwin.cmt@gmail.com",
  phone: "+852 6906 5503",
  address: "218 Jaffe Road, Suite 602, Wan Chai, Hong Kong",
  company: "Stephen Kirwin Bodywork Seminars",
};

const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: 20 September 2026",
  intro: `This Privacy Policy describes how ${contact.company} ("we", "us", or "our") collects, uses, stores, and protects your personal information when you visit ${contact.site} (the "Site").`,
  sections: [
    {
      heading: "1. Information we collect",
      body: `We collect information you provide directly, such as your name, email address, phone number, and message when you use the contact form. We also collect information automatically when you browse the Site, including your IP address, browser type, pages visited, and device information, through cookies and similar technologies. If you make a booking or payment, we collect the details required to process that transaction.`,
    },
    {
      heading: "2. How we use your information",
      body: `We use your information to respond to your inquiries, provide seminars and bodywork services, process bookings and payments, send administrative updates, improve the Site, and comply with legal obligations.`,
    },
    {
      heading: "3. Cookies and analytics",
      body: `We use essential cookies so the Site functions correctly, and analytics cookies to understand how visitors use the Site. You can disable non-essential cookies through your browser settings.`,
    },
    {
      heading: "4. Third-party services",
      body: `We use trusted third-party services to host the Site, store data, process payments, send emails, and manage bookings. These include our hosting provider, database provider, payment processor, and Cliniko for appointment scheduling. Each provider has its own privacy policy and only receives the information necessary to perform its service.`,
    },
    {
      heading: "5. Data retention",
      body: `We keep your information only as long as needed for the purposes described above, or as required by law. Contact-form submissions are typically retained for up to 12 months unless you ask us to delete them earlier.`,
    },
    {
      heading: "6. Your rights",
      body: `You have the right to access, correct, update, or delete your personal information. To exercise these rights, contact us using the details below.`,
    },
    {
      heading: "7. Security",
      body: `We take reasonable technical and organisational measures to protect your information. However, no online transmission or storage system can be guaranteed completely secure.`,
    },
    {
      heading: "8. Changes to this policy",
      body: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.`,
    },
    {
      heading: "9. Contact us",
      body: `If you have questions about this Privacy Policy or how we handle your data, contact us at ${contact.email}, by phone at ${contact.phone}, or by post at ${contact.address}.`,
    },
    {
      heading: "10. Governing law",
      body: `This Privacy Policy is governed by the laws of the Hong Kong Special Administrative Region.`,
    },
  ],
  contactPrefix: "Questions? Contact us at ",
};

const termsEn: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "Last updated: 20 September 2026",
  intro: `These Terms of Service ("Terms") govern your access to and use of ${contact.site} and the services provided by ${contact.company} ("we", "us", or "our"). By using the Site, you agree to these Terms.`,
  sections: [
    {
      heading: "1. Services",
      body: `We offer neuromuscular therapy and deep tissue bodywork seminars, private cohorts, and therapeutic bodywork sessions. Course details, schedules, and availability are listed on the Site and may change.`,
    },
    {
      heading: "2. Bookings and payments",
      body: `Bookings for appointments are made through Cliniko, our third-party scheduling provider. Course bookings and payments are processed via the payment method shown at checkout. Prices are listed in Hong Kong Dollars (HKD) unless otherwise stated.`,
    },
    {
      heading: "3. Cancellations and refunds",
      body: `Cancellation and refund policies are communicated at the time of booking. If you need to reschedule or cancel, please contact us as soon as possible.`,
    },
    {
      heading: "4. Eligibility",
      body: `By using the Site and booking services, you confirm that you are at least 18 years old, or that you have the consent of a parent or guardian.`,
    },
    {
      heading: "5. Intellectual property",
      body: `All content on the Site, including text, images, videos, and course materials, is owned by us or licensed to us. You may not reproduce, distribute, or use our content for commercial purposes without our written permission.`,
    },
    {
      heading: "6. User conduct",
      body: `You agree not to use the Site for unlawful purposes, interfere with its operation, or attempt to gain unauthorised access to our systems or data.`,
    },
    {
      heading: "7. Medical disclaimer",
      body: `Our seminars and bodywork services are educational and therapeutic in nature. They are not a substitute for medical diagnosis or treatment. Always consult a qualified healthcare provider for medical concerns.`,
    },
    {
      heading: "8. Limitation of liability",
      body: `To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the Site or our services.`,
    },
    {
      heading: "9. Changes to these terms",
      body: `We may update these Terms from time to time. Continued use of the Site after changes means you accept the updated Terms.`,
    },
    {
      heading: "10. Governing law",
      body: `These Terms are governed by the laws of the Hong Kong Special Administrative Region.`,
    },
    {
      heading: "11. Contact us",
      body: `For questions about these Terms, contact us at ${contact.email}, by phone at ${contact.phone}, or by post at ${contact.address}.`,
    },
  ],
  contactPrefix: "Questions? Contact us at ",
};

const privacyZh: LegalDocument = {
  title: "隱私政策",
  lastUpdated: "最後更新：2026年9月20日",
  intro: `本隱私政策說明 ${contact.company}（「我們」）如何收集、使用、儲存及保護您瀏覽 ${contact.site}（「本網站」）時提供的個人資料。`,
  sections: [
    {
      heading: "1. 我們收集的資料",
      body: `我們會收集您直接提供的資料，例如使用聯絡表單時填寫的姓名、電郵地址、電話號碼及訊息。當您瀏覽本網站時，我們也會透過 Cookie 及類似技術自動收集 IP 地址、瀏覽器類型、瀏覽頁面及裝置資訊。若您進行預約或付款，我們會收集處理交易所需的資料。`,
    },
    {
      heading: "2. 我們如何使用您的資料",
      body: `我們使用您的資料回覆查詢、提供研討會及身體工作服務、處理預約與付款、發送行政通知、改善本網站，以及遵守法律義務。`,
    },
    {
      heading: "3. Cookie 與分析",
      body: `我們使用必要的 Cookie 以確保本網站正常運作，並使用分析 Cookie 了解訪客如何使用本網站。您可透過瀏覽器設定停用非必要 Cookie。`,
    },
    {
      heading: "4. 第三方服務",
      body: `我們使用可信賴的第三方服務來託管本網站、儲存資料、處理付款、發送電郵及管理預約，包括託管商、資料庫服務商、付款處理商及 Cliniko 預約系統。各服務商僅接收執行其服務所需的資料，並受各自的隱私政策約束。`,
    },
    {
      heading: "5. 資料保留",
      body: `我們僅在需要達成本政策所述目的或法律要求的期間內保留您的資料。聯絡表單提交內容通常保留最多 12 個月，除非您要求提前刪除。`,
    },
    {
      heading: "6. 您的權利",
      body: `您有權查閱、更正、更新或刪除您的個人資料。如需行使這些權利，請使用下方聯絡方式與我們聯絡。`,
    },
    {
      heading: "7. 安全",
      body: `我們採取合理的技術及組織措施保護您的資料。然而，任何網上傳輸或儲存系統均無法保證絕對安全。`,
    },
    {
      heading: "8. 政策變更",
      body: `我們可能不時更新本隱私政策。任何變更將連同更新後的生效日期張貼於本頁面。`,
    },
    {
      heading: "9. 聯絡我們",
      body: `如對本隱私政策或我們處理資料的方式有任何疑問，請發送電郵至 ${contact.email}，致電 ${contact.phone}，或郵寄至 ${contact.address}。`,
    },
    {
      heading: "10. 管轄法律",
      body: `本隱私政策受香港特別行政區法律管轄。`,
    },
  ],
  contactPrefix: "如有疑問，請聯絡：",
};

const termsZh: LegalDocument = {
  title: "服務條款",
  lastUpdated: "最後更新：2026年9月20日",
  intro: `本服務條款（「條款」）規管您瀏覽及使用 ${contact.site} 以及 ${contact.company}（「我們」）所提供服務的權利與義務。使用本網站即表示您同意本條款。`,
  sections: [
    {
      heading: "1. 服務內容",
      body: `我們提供神經肌肉治療及深層組織身體工作研討會、私人小班及治療性身體工作服務。課程詳情、時間表及名額會列於本網站，並可能有所更改。`,
    },
    {
      heading: "2. 預約與付款",
      body: `療程預約透過我們的第三方預約服務商 Cliniko 進行。課程預約及付款則透過結帳時顯示的付款方式處理。除非另有說明，價格以港幣（HKD）計算。`,
    },
    {
      heading: "3. 取消與退款",
      body: `取消及退款政策會在預約時說明。如需改期或取消，請盡快與我們聯絡。`,
    },
    {
      heading: "4. 使用資格",
      body: `使用本網站及預約服務，即表示您已年滿 18 歲，或已獲得家長或監護人同意。`,
    },
    {
      heading: "5. 知識產權",
      body: `本網站所有內容，包括文字、圖片、影片及課程材料，均由我們擁有或獲授權使用。未經我們書面許可，不得複製、分發或將內容用於商業用途。`,
    },
    {
      heading: "6. 用戶行為",
      body: `您同意不將本網站用於非法目的、干擾本網站運作，或試圖未經授權存取我們的系統或資料。`,
    },
    {
      heading: "7. 醫療免責聲明",
      body: `我們的研討會及身體工作服務屬教育及治療性質，並不能取代醫療診斷或治療。如有健康疑慮，請諮詢合資格的醫療專業人員。`,
    },
    {
      heading: "8. 責任限制",
      body: `在法律允許的最大範圍內，我們不會就您使用本網站或我們的服務所引致的任何間接、附帶或後果性損失承擔責任。`,
    },
    {
      heading: "9. 條款變更",
      body: `我們可能不時更新本條款。條款變更後繼續使用本網站，即表示您接受更新後的條款。`,
    },
    {
      heading: "10. 管轄法律",
      body: `本條款受香港特別行政區法律管轄。`,
    },
    {
      heading: "11. 聯絡我們",
      body: `如對本條款有任何疑問，請發送電郵至 ${contact.email}，致電 ${contact.phone}，或郵寄至 ${contact.address}。`,
    },
  ],
  contactPrefix: "如有疑問，請聯絡：",
};

export function getPrivacyDocument(locale: Locale): LegalDocument {
  return locale === "zh-Hant" ? privacyZh : privacyEn;
}

export function getTermsDocument(locale: Locale): LegalDocument {
  return locale === "zh-Hant" ? termsZh : termsEn;
}
