import { extraLabels } from "./locales"
const labels: Record<string, [string, string]> = {
  "Send message": ["संदेश भेजें", "संदेश पाठवा"],
  "Demo storage unavailable; changes will last only this session.": [
    "डेमो संग्रहण उपलब्ध नहीं है; बदलाव केवल इस सत्र में रहेंगे।",
    "डेमो साठवण उपलब्ध नाही; बदल फक्त या सत्रात राहतील.",
  ],
  "Voice input": ["आवाज़ से इनपुट", "आवाजाने इनपुट"],
  "Voice language": ["आवाज़ की भाषा", "आवाजाची भाषा"],
  "Start recording": ["रिकॉर्डिंग शुरू करें", "रेकॉर्डिंग सुरू करा"],
  "Stop recording": ["रिकॉर्डिंग रोकें", "रेकॉर्डिंग थांबवा"],
  "Recording…": ["रिकॉर्डिंग जारी…", "रेकॉर्डिंग सुरू…"],
  "Processing…": ["प्रक्रिया जारी…", "प्रक्रिया सुरू…"],
  "Review transcription": ["लिखी गई आवाज़ की समीक्षा करें", "लिप्यंतरण तपासा"],
  "Recognized text": ["पहचाना गया पाठ", "ओळखलेला मजकूर"],
  "Use transcription": ["इस पाठ का उपयोग करें", "हा मजकूर वापरा"],
  Retry: ["दोबारा कोशिश करें", "पुन्हा प्रयत्न करा"],
  Cancel: ["रद्द करें", "रद्द करा"],
  Edit: ["बदलें", "संपादित करा"],
  Confirm: ["पुष्टि करें", "पुष्टी करा"],
  "Simulated voice input": ["सिम्युलेटेड आवाज़ डेमो", "सिम्युलेटेड आवाज डेमो"],
  "Speech recognition is unavailable. Use text or the labelled simulation.": [
    "आवाज़ पहचान उपलब्ध नहीं है। पाठ या डेमो उपयोग करें।",
    "आवाज ओळख उपलब्ध नाही. मजकूर किंवा डेमो वापरा.",
  ],
  "Microphone permission denied. Allow microphone access in browser settings.":
    [
      "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें।",
      "मायक्रोफोन परवानगी नाकारली. ब्राउझर सेटिंगमध्ये परवानगी द्या.",
    ],
  "No speech detected. Please retry.": [
    "कोई आवाज़ नहीं मिली। फिर कोशिश करें।",
    "आवाज आढळला नाही. पुन्हा प्रयत्न करा.",
  ],
  "Recognition failed. Retry or use text.": [
    "आवाज़ पहचान विफल। पुनः प्रयास करें या पाठ उपयोग करें।",
    "आवाज ओळख अयशस्वी. पुन्हा प्रयत्न करा किंवा मजकूर वापरा.",
  ],
  "Enter Details": ["विवरण भरें", "तपशील भरा"],
  "Add by Voice": ["आवाज़ से जोड़ें", "आवाजाने जोडा"],
  "Speak naturally. StockSathi will fill in the product details for you.": [
    "स्वाभाविक रूप से बोलें। StockSathi उत्पाद का विवरण भरेगा।",
    "सहज बोला. StockSathi उत्पादनाचे तपशील भरेल.",
  ],
  "Product name": ["उत्पाद का नाम", "उत्पादनाचे नाव"],
  Category: ["श्रेणी", "श्रेणी"],
  "Initial quantity": ["शुरुआती मात्रा", "सुरुवातीचे प्रमाण"],
  Unit: ["इकाई", "एकक"],
  "Selling price (₹)": ["बिक्री मूल्य (₹)", "विक्री किंमत (₹)"],
  "Purchase price (₹, optional)": [
    "खरीद मूल्य (₹, वैकल्पिक)",
    "खरेदी किंमत (₹, ऐच्छिक)",
  ],
  "Minimum stock threshold": ["न्यूनतम स्टॉक सीमा", "किमान साठा मर्यादा"],
  "Supplier (optional)": ["आपूर्तिकर्ता (वैकल्पिक)", "पुरवठादार (ऐच्छिक)"],
  "Save Product": ["उत्पाद सहेजें", "उत्पादन जतन करा"],
  "Review product": ["उत्पाद की समीक्षा", "उत्पादन तपासा"],
  "Complete missing fields. Use valid quantities and a positive selling price.":
    [
      "छूटे विवरण भरें। सही मात्रा और सकारात्मक बिक्री मूल्य दें।",
      "अपूर्ण तपशील भरा. योग्य प्रमाण आणि सकारात्मक विक्री किंमत द्या.",
    ],
  "Product already exists. Select the existing item in Inventory.": [
    "उत्पाद पहले से मौजूद है। इन्वेंटरी में मौजूदा उत्पाद चुनें।",
    "उत्पादन आधीच आहे. साठ्यातील उत्पादन निवडा.",
  ],
  "Product created successfully.": [
    "उत्पाद सफलतापूर्वक बनाया गया।",
    "उत्पादन यशस्वीरित्या तयार झाले.",
  ],
  "No stock changes until confirmation.": [
    "पुष्टि से पहले स्टॉक नहीं बदलेगा।",
    "पुष्टीपूर्वी साठा बदलणार नाही.",
  ],
  "Reports & analytics": ["रिपोर्ट और विश्लेषण", "अहवाल आणि विश्लेषण"],
  "Confirmed transactions · no external messaging or AI API": [
    "पुष्ट डेमो लेनदेन · बाहरी मैसेजिंग या AI API नहीं",
    "पुष्टी केलेले डेमो व्यवहार · बाह्य मेसेजिंग किंवा AI API नाही",
  ],
  Today: ["आज", "आज"],
  "Last 7 days": ["पिछले 7 दिन", "मागील 7 दिवस"],
  "Last 30 days": ["पिछले 30 दिन", "मागील 30 दिवस"],
  "This month": ["इस महीने", "या महिन्यात"],
  "Custom date range": ["तारीख सीमा चुनें", "सानुकूल तारीख श्रेणी"],
  "Date range": ["तारीख सीमा", "तारीख श्रेणी"],
  From: ["से", "पासून"],
  To: ["तक", "पर्यंत"],
  Product: ["उत्पाद", "उत्पादन"],
  Action: ["कार्य", "क्रिया"],
  Source: ["स्रोत", "स्रोत"],
  All: ["सभी", "सर्व"],
  "Stock In": ["स्टॉक आया", "साठा जमा"],
  Sale: ["बिक्री", "विक्री"],
  Text: ["पाठ", "मजकूर"],
  Voice: ["आवाज़", "आवाज"],
  "WhatsApp simulation": ["WhatsApp सिम्युलेशन", "WhatsApp सिम्युलेशन"],
  Search: ["खोजें", "शोधा"],
  Sort: ["क्रम", "क्रम"],
  "Newest first": ["नवीनतम पहले", "नवीन प्रथम"],
  "Oldest first": ["पुराने पहले", "जुने प्रथम"],
  "Highest total": ["सबसे अधिक कुल", "सर्वाधिक एकूण"],
  "Sales revenue": ["बिक्री आय", "विक्री उत्पन्न"],
  "Units sold": ["बेची गई इकाइयाँ", "विकलेली एकके"],
  "Stock received": ["प्राप्त स्टॉक", "प्राप्त साठा"],
  Transactions: ["लेनदेन", "व्यवहार"],
  "Current stock valuation": ["वर्तमान स्टॉक मूल्य", "सध्याच्या साठ्याचे मूल्य"],
  "Low-stock products": ["कम स्टॉक उत्पाद", "कमी साठ्याची उत्पादने"],
  "Daily sales revenue": ["दैनिक बिक्री आय", "दैनिक विक्री उत्पन्न"],
  "Stock In versus Sales": ["स्टॉक बनाम बिक्री", "साठा जमा विरुद्ध विक्री"],
  "Top-selling products": ["सबसे अधिक बिकने वाले उत्पाद", "सर्वाधिक विक्रीची उत्पादने"],
  "Inventory movement over time": ["समय के साथ स्टॉक बदलाव", "कालानुसार साठा बदल"],
  "Low-stock summary": ["कम स्टॉक सारांश", "कमी साठा सारांश"],
  "No matching records.": ["कोई मिलते रिकॉर्ड नहीं।", "जुळणाऱ्या नोंदी नाहीत."],
  "Date and Time": ["तारीख और समय", "तारीख आणि वेळ"],
  Quantity: ["मात्रा", "प्रमाण"],
  "Unit Price": ["इकाई मूल्य", "एकक किंमत"],
  Total: ["कुल", "एकूण"],
  Status: ["स्थिति", "स्थिती"],
  Confirmed: ["पुष्ट", "पुष्टी केलेले"],
  "Export CSV": ["CSV निर्यात", "CSV निर्यात"],
  "Download Report": ["रिपोर्ट डाउनलोड", "अहवाल डाउनलोड"],
  "Print Report": ["रिपोर्ट प्रिंट", "अहवाल मुद्रित करा"],
  Previous: ["पिछला", "मागील"],
  Next: ["अगला", "पुढील"],
  "Mixed units; see individual records. Valuation and alerts show current stock.":
    [
      "मिश्रित इकाइयाँ; अलग रिकॉर्ड देखें। मूल्य और अलर्ट वर्तमान स्टॉक हैं।",
      "मिश्र एकके; स्वतंत्र नोंदी पाहा. मूल्य आणि सूचना सध्याच्या साठ्याच्या आहेत.",
    ],
  "File downloaded.": ["फ़ाइल डाउनलोड हुई।", "फाइल डाउनलोड झाली."],
  "Allow pop-ups to print this report.": [
    "रिपोर्ट प्रिंट करने के लिए पॉप-अप अनुमति दें।",
    "अहवाल छापण्यासाठी पॉप-अप परवानगी द्या.",
  ],
}
const catalogue = { ...labels, ...extraLabels }
const phrases = Object.keys(catalogue).sort((a, b) => b.length - a.length)
const pattern = new RegExp(
  phrases
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "g",
)
export function translate(language: string, text: string) {
  if (language !== "हिंदी" && language !== "मराठी") return text
  const index = language === "हिंदी" ? 0 : 1
  if (catalogue[text]) return catalogue[text][index]
  // Dynamic notifications retain quantities and product identities.
  return text.replace(pattern, (phrase, offset) => {
    const before = text[offset - 1] ?? ""
    const after = text[offset + phrase.length] ?? ""
    if (/[a-zA-Z]/.test(before) || /[a-zA-Z]/.test(after)) return phrase
    return catalogue[phrase][index]
  })
}

export function normalizeNumbers(text: string) {
  const numbers: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    एक: 1,
    दो: 2,
    दोन: 2,
    तीन: 3,
    चार: 4,
    पाँच: 5,
    पांच: 5,
    पाच: 5,
    छह: 6,
    सहा: 6,
    सात: 7,
    आठ: 8,
    नौ: 9,
    नऊ: 9,
    दस: 10,
    दहा: 10,
  }
  return text
    .toLowerCase()
    .replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)))
    .split(/(\s+|[,।])/)
    .map((word) => (numbers[word] === undefined ? word : String(numbers[word])))
    .join("")
}
