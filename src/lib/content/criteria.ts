import type { Criterion, Pillar } from "./types";

// Die 60 Kriterien basieren auf den drei Säulen der QET-Masterclass
// (Qualität, Ethik, Transparenz – qet-masterclass.com), je 20 pro Säule.
// Die drei bewertbaren Statements je Kriterium wurden für dieses
// Kultur-Dashboard neu formuliert und sind trilingual (DE/EN/TR) hinterlegt.
// Hinweis: Die türkischen Formulierungen sollten vor dem produktiven Einsatz
// von einer Muttersprachlerin/einem Muttersprachler gegengelesen werden.

export const PILLARS: Pillar[] = [
  { key: "Q", name: { de: "Qualität", en: "Quality", tr: "Kalite" } },
  { key: "E", name: { de: "Ethik", en: "Ethics", tr: "Etik" } },
  { key: "T", name: { de: "Transparenz", en: "Transparency", tr: "Şeffaflık" } },
];

export const CRITERIA: Criterion[] = [
  // ---------------------------------------------------------------------
  // QUALITÄT (Q01–Q20)
  // ---------------------------------------------------------------------
  {
    id: "Q01",
    pillar: "Q",
    name: { de: "Führungskompetenzen", en: "Leadership Competencies", tr: "Liderlik Yetkinlikleri" },
    statements: [
      {
        de: "Unsere Führungskräfte treffen Entscheidungen nachvollziehbar und erklären ihre Beweggründe.",
        en: "Our leaders make decisions transparently and explain their reasoning.",
        tr: "Yöneticilerimiz kararları şeffaf bir şekilde alır ve gerekçelerini açıklar.",
      },
      {
        de: "Führungskräfte geben regelmäßig konstruktives Feedback an ihre Teams.",
        en: "Leaders regularly give their teams constructive feedback.",
        tr: "Yöneticiler ekiplerine düzenli olarak yapıcı geri bildirim verir.",
      },
      {
        de: "Führungskräfte übernehmen sichtbar Verantwortung, auch wenn etwas schiefläuft.",
        en: "Leaders visibly take responsibility, even when things go wrong.",
        tr: "Yöneticiler, işler ters gittiğinde bile sorumluluğu açıkça üstlenir.",
      },
    ],
  },
  {
    id: "Q02",
    pillar: "Q",
    name: { de: "Soziale Kompetenzen", en: "Social Competencies", tr: "Sosyal Yetkinlikler" },
    statements: [
      {
        de: "Im Umgang miteinander herrscht ein respektvoller, wertschätzender Ton.",
        en: "Interactions among colleagues are respectful and appreciative.",
        tr: "Çalışanlar arasındaki ilişkilerde saygılı ve takdir edici bir üslup hakimdir.",
      },
      {
        de: "Konflikte werden offen angesprochen statt totgeschwiegen.",
        en: "Conflicts are addressed openly rather than swept under the rug.",
        tr: "Çatışmalar görmezden gelinmek yerine açıkça ele alınır.",
      },
      {
        de: "Kolleg:innen hören einander aktiv zu, bevor sie urteilen.",
        en: "Colleagues listen actively before passing judgment.",
        tr: "Çalışanlar yargılamadan önce birbirini gerçekten dinler.",
      },
    ],
  },
  {
    id: "Q03",
    pillar: "Q",
    name: { de: "Leadership", en: "Leadership", tr: "Liderlik" },
    statements: [
      {
        de: "Es gibt eine klare, gemeinsam getragene Vision, wohin sich das Unternehmen entwickeln soll.",
        en: "There is a clear, shared vision of where the company is heading.",
        tr: "Şirketin nereye doğru geliştiğine dair net ve ortak bir vizyon vardır.",
      },
      {
        de: "Führung befähigt Mitarbeitende, statt sie zu kontrollieren.",
        en: "Leadership empowers employees rather than controlling them.",
        tr: "Liderlik, çalışanları kontrol etmek yerine güçlendirir.",
      },
      {
        de: "Wichtige strategische Entscheidungen werden rechtzeitig und verständlich kommuniziert.",
        en: "Important strategic decisions are communicated in time and in an understandable way.",
        tr: "Önemli stratejik kararlar zamanında ve anlaşılır şekilde iletilir.",
      },
    ],
  },
  {
    id: "Q04",
    pillar: "Q",
    name: { de: "Mitarbeiter", en: "Employees", tr: "Çalışanlar" },
    statements: [
      {
        de: "Mitarbeitende fühlen sich als wichtiger Teil des Unternehmenserfolgs wahrgenommen.",
        en: "Employees feel recognized as an important part of the company's success.",
        tr: "Çalışanlar, şirketin başarısının önemli bir parçası olarak görüldüklerini hissediyor.",
      },
      {
        de: "Die Meinung der Mitarbeitenden wird bei Entscheidungen tatsächlich berücksichtigt.",
        en: "Employees' opinions are genuinely taken into account in decisions.",
        tr: "Çalışanların görüşleri kararlarda gerçekten dikkate alınıyor.",
      },
      {
        de: "Es gibt spürbare Anerkennung für gute Leistungen.",
        en: "Good performance is noticeably acknowledged.",
        tr: "İyi performans fark edilir şekilde takdir ediliyor.",
      },
    ],
  },
  {
    id: "Q05",
    pillar: "Q",
    name: { de: "Eigenverantwortung", en: "Ownership & Accountability", tr: "Özsorumluluk" },
    statements: [
      {
        de: "Mitarbeitende können in ihrem Bereich eigenständig Entscheidungen treffen.",
        en: "Employees can make decisions independently within their own area.",
        tr: "Çalışanlar kendi alanlarında bağımsız kararlar alabiliyor.",
      },
      {
        de: "Fehler werden als Lernchance behandelt, nicht als Vorwand zur Schuldzuweisung.",
        en: "Mistakes are treated as a learning opportunity, not a pretext for blame.",
        tr: "Hatalar suçlama nedeni değil, öğrenme fırsatı olarak görülüyor.",
      },
      {
        de: "Jede:r kennt den eigenen Verantwortungsbereich klar und eindeutig.",
        en: "Everyone clearly knows their own area of responsibility.",
        tr: "Herkes kendi sorumluluk alanını net bir şekilde biliyor.",
      },
    ],
  },
  {
    id: "Q06",
    pillar: "Q",
    name: { de: "Change Management", en: "Change Management", tr: "Değişim Yönetimi" },
    statements: [
      {
        de: "Veränderungen werden rechtzeitig angekündigt und gut erklärt.",
        en: "Changes are announced in good time and explained well.",
        tr: "Değişiklikler zamanında duyurulur ve iyi açıklanır.",
      },
      {
        de: "Mitarbeitende werden aktiv in Veränderungsprozesse einbezogen.",
        en: "Employees are actively involved in change processes.",
        tr: "Çalışanlar değişim süreçlerine aktif olarak dahil edilir.",
      },
      {
        de: "Nach Veränderungen wird überprüft, ob sie den gewünschten Effekt erzielt haben.",
        en: "After changes, it is reviewed whether they achieved the desired effect.",
        tr: "Değişikliklerden sonra istenen etkiyi yaratıp yaratmadığı kontrol edilir.",
      },
    ],
  },
  {
    id: "Q07",
    pillar: "Q",
    name: { de: "Personalmanagement", en: "HR Management", tr: "İnsan Kaynakları Yönetimi" },
    statements: [
      {
        de: "Der Einstellungsprozess ist professionell, fair und zügig.",
        en: "The hiring process is professional, fair and timely.",
        tr: "İşe alım süreci profesyonel, adil ve hızlıdır.",
      },
      {
        de: "Es gibt klare Entwicklungspfade und Karriereperspektiven im Unternehmen.",
        en: "There are clear development paths and career prospects within the company.",
        tr: "Şirket içinde net gelişim yolları ve kariyer perspektifleri vardır.",
      },
      {
        de: "Personalentscheidungen (Beförderung, Gehalt) sind nachvollziehbar und fair.",
        en: "HR decisions (promotion, pay) are transparent and fair.",
        tr: "Personel kararları (terfi, maaş) anlaşılır ve adildir.",
      },
    ],
  },
  {
    id: "Q08",
    pillar: "Q",
    name: { de: "Produktmanagement", en: "Product Management", tr: "Ürün Yönetimi" },
    statements: [
      {
        de: "Produkte/Dienstleistungen werden konsequent an echten Kundenbedürfnissen ausgerichtet.",
        en: "Products/services are consistently aligned with real customer needs.",
        tr: "Ürün/hizmetler tutarlı bir şekilde gerçek müşteri ihtiyaçlarına göre şekillendirilir.",
      },
      {
        de: "Es gibt einen klaren Prozess, wie neue Produktideen bewertet und umgesetzt werden.",
        en: "There is a clear process for evaluating and implementing new product ideas.",
        tr: "Yeni ürün fikirlerinin değerlendirilip hayata geçirilmesi için net bir süreç vardır.",
      },
      {
        de: "Feedback aus dem Markt fließt sichtbar in die Weiterentwicklung der Produkte ein.",
        en: "Market feedback visibly feeds into further product development.",
        tr: "Pazardan gelen geri bildirimler ürün geliştirmeye açıkça yansır.",
      },
    ],
  },
  {
    id: "Q09",
    pillar: "Q",
    name: { de: "Kunden", en: "Customers", tr: "Müşteriler" },
    statements: [
      {
        de: "Kundenanliegen werden schnell und verbindlich bearbeitet.",
        en: "Customer concerns are handled quickly and reliably.",
        tr: "Müşteri talepleri hızlı ve güvenilir şekilde ele alınır.",
      },
      {
        de: "Wir kennen die Bedürfnisse unserer Kunden gut und reagieren darauf.",
        en: "We understand our customers' needs well and respond to them.",
        tr: "Müşterilerimizin ihtiyaçlarını iyi biliyor ve buna göre hareket ediyoruz.",
      },
      {
        de: "Kundenzufriedenheit wird regelmäßig gemessen und ernst genommen.",
        en: "Customer satisfaction is measured regularly and taken seriously.",
        tr: "Müşteri memnuniyeti düzenli olarak ölçülür ve ciddiye alınır.",
      },
    ],
  },
  {
    id: "Q10",
    pillar: "Q",
    name: { de: "Netzwerke", en: "Networks", tr: "Ağlar" },
    statements: [
      {
        de: "Das Unternehmen pflegt aktiv wertvolle Kontakte zu Partnern, Verbänden und der Branche.",
        en: "The company actively maintains valuable contacts with partners, associations and the industry.",
        tr: "Şirket, ortaklar, dernekler ve sektörle değerli bağlantıları aktif olarak sürdürür.",
      },
      {
        de: "Internes Wissen wird über Team- und Abteilungsgrenzen hinweg geteilt.",
        en: "Internal knowledge is shared across team and department boundaries.",
        tr: "Şirket içi bilgi, ekip ve departman sınırlarının ötesinde paylaşılır.",
      },
      {
        de: "Externe Netzwerke werden gezielt genutzt, um neue Chancen zu erschließen.",
        en: "External networks are used deliberately to open up new opportunities.",
        tr: "Dış ağlar yeni fırsatlar yaratmak için bilinçli şekilde kullanılır.",
      },
    ],
  },
  {
    id: "Q11",
    pillar: "Q",
    name: { de: "Markenführung", en: "Brand Management", tr: "Marka Yönetimi" },
    statements: [
      {
        de: "Unsere Marke steht für klar erkennbare Werte, die auch gelebt werden.",
        en: "Our brand stands for clearly recognizable values that are actually lived.",
        tr: "Markamız, gerçekten yaşanan, açıkça tanınabilir değerleri temsil ediyor.",
      },
      {
        de: "Der Marktauftritt ist einheitlich und konsistent über alle Kanäle hinweg.",
        en: "Our market presence is consistent across all channels.",
        tr: "Piyasadaki görünümümüz tüm kanallarda tutarlıdır.",
      },
      {
        de: "Mitarbeitende können erklären, wofür die Marke steht, und identifizieren sich damit.",
        en: "Employees can explain what the brand stands for and identify with it.",
        tr: "Çalışanlar markanın neyi temsil ettiğini açıklayabiliyor ve kendini onunla özdeşleştiriyor.",
      },
    ],
  },
  {
    id: "Q12",
    pillar: "Q",
    name: { de: "Qualitätsmanagement", en: "Quality Management", tr: "Kalite Yönetimi" },
    statements: [
      {
        de: "Es gibt klar definierte Qualitätsstandards, die im Alltag auch eingehalten werden.",
        en: "There are clearly defined quality standards that are actually followed day to day.",
        tr: "Günlük iş akışında gerçekten uygulanan, net tanımlanmış kalite standartları vardır.",
      },
      {
        de: "Qualitätsprobleme werden systematisch erfasst und nachverfolgt.",
        en: "Quality issues are systematically recorded and tracked.",
        tr: "Kalite sorunları sistematik olarak kayıt altına alınır ve takip edilir.",
      },
      {
        de: "Qualität hat im Unternehmen einen erkennbar hohen Stellenwert.",
        en: "Quality clearly has a high priority within the company.",
        tr: "Kalitenin şirket içinde belirgin şekilde yüksek bir önceliği var.",
      },
    ],
  },
  {
    id: "Q13",
    pillar: "Q",
    name: { de: "Unternehmensnachfolge", en: "Succession Planning", tr: "Şirket Devri (Halefiyet Planlaması)" },
    statements: [
      {
        de: "Für Schlüsselpositionen gibt es einen erkennbaren Nachfolgeplan.",
        en: "There is a recognizable succession plan for key positions.",
        tr: "Kilit pozisyonlar için belirgin bir halefiyet planı vardır.",
      },
      {
        de: "Wissen von erfahrenen Mitarbeitenden wird systematisch weitergegeben.",
        en: "Knowledge from experienced employees is systematically passed on.",
        tr: "Deneyimli çalışanların bilgisi sistematik olarak aktarılır.",
      },
      {
        de: "Die langfristige Zukunftssicherung des Unternehmens ist erkennbar geplant.",
        en: "The company's long-term future is visibly being planned for.",
        tr: "Şirketin uzun vadeli geleceği görünür şekilde planlanıyor.",
      },
    ],
  },
  {
    id: "Q14",
    pillar: "Q",
    name: { de: "Ressourcen", en: "Resources", tr: "Kaynaklar" },
    statements: [
      {
        de: "Mitarbeitende verfügen über die notwendigen Mittel (Zeit, Budget, Werkzeuge), um ihre Arbeit gut zu erledigen.",
        en: "Employees have the resources they need (time, budget, tools) to do their work well.",
        tr: "Çalışanlar işlerini iyi yapabilmek için gerekli kaynaklara (zaman, bütçe, araçlar) sahiptir.",
      },
      {
        de: "Ressourcen werden sinnvoll und effizient eingesetzt.",
        en: "Resources are used sensibly and efficiently.",
        tr: "Kaynaklar akıllıca ve verimli kullanılır.",
      },
      {
        de: "Engpässe bei Personal oder Material werden frühzeitig erkannt und adressiert.",
        en: "Staffing or material bottlenecks are identified and addressed early.",
        tr: "Personel veya malzeme darboğazları erken fark edilip ele alınır.",
      },
    ],
  },
  {
    id: "Q15",
    pillar: "Q",
    name: { de: "Prozesse", en: "Processes", tr: "Süreçler" },
    statements: [
      {
        de: "Wichtige Arbeitsabläufe sind klar dokumentiert und für alle nachvollziehbar.",
        en: "Key workflows are clearly documented and understandable for everyone.",
        tr: "Önemli iş akışları herkes için anlaşılır şekilde belgelenmiştir.",
      },
      {
        de: "Prozesse werden regelmäßig auf Sinnhaftigkeit und Effizienz geprüft.",
        en: "Processes are regularly reviewed for usefulness and efficiency.",
        tr: "Süreçler anlamlılık ve verimlilik açısından düzenli olarak gözden geçirilir.",
      },
      {
        de: "Unnötige Bürokratie wird konsequent abgebaut.",
        en: "Unnecessary bureaucracy is consistently reduced.",
        tr: "Gereksiz bürokrasi sürekli olarak azaltılır.",
      },
    ],
  },
  {
    id: "Q16",
    pillar: "Q",
    name: { de: "Flexible Organisation", en: "Organizational Flexibility", tr: "Esnek Organizasyon" },
    statements: [
      {
        de: "Das Unternehmen kann schnell auf neue Anforderungen oder Marktveränderungen reagieren.",
        en: "The company can respond quickly to new requirements or market changes.",
        tr: "Şirket yeni gereksinimlere veya pazar değişikliklerine hızlı yanıt verebiliyor.",
      },
      {
        de: "Strukturen erlauben es, Aufgaben je nach Situation flexibel zu verteilen.",
        en: "Structures allow tasks to be flexibly redistributed depending on the situation.",
        tr: "Yapılar, görevlerin duruma göre esnek şekilde dağıtılmasına izin veriyor.",
      },
      {
        de: "Entscheidungswege sind kurz genug, um zügig handeln zu können.",
        en: "Decision paths are short enough to allow quick action.",
        tr: "Karar alma yolları hızlı hareket edebilecek kadar kısadır.",
      },
    ],
  },
  {
    id: "Q17",
    pillar: "Q",
    name: { de: "Lernende Organisation", en: "Learning Organization", tr: "Öğrenen Organizasyon" },
    statements: [
      {
        de: "Aus Fehlern und Projekten werden systematisch Lehren für die Zukunft gezogen.",
        en: "Lessons are systematically drawn from mistakes and projects for the future.",
        tr: "Hatalardan ve projelerden gelecek için sistematik dersler çıkarılır.",
      },
      {
        de: "Wissen und Erfahrungen werden aktiv im Unternehmen geteilt.",
        en: "Knowledge and experience are actively shared within the company.",
        tr: "Bilgi ve deneyimler şirket içinde aktif olarak paylaşılır.",
      },
      {
        de: "Es herrscht eine spürbare Neugier, Neues auszuprobieren und dazuzulernen.",
        en: "There is a noticeable curiosity to try new things and keep learning.",
        tr: "Yeni şeyler denemeye ve öğrenmeye yönelik belirgin bir merak var.",
      },
    ],
  },
  {
    id: "Q18",
    pillar: "Q",
    name: { de: "Innovation", en: "Innovation", tr: "İnovasyon" },
    statements: [
      {
        de: "Neue Ideen werden ernsthaft geprüft, unabhängig davon, von wem sie kommen.",
        en: "New ideas are seriously evaluated, regardless of who they come from.",
        tr: "Yeni fikirler, kimden geldiğine bakılmaksızın ciddiyetle değerlendirilir.",
      },
      {
        de: "Es gibt Freiräume und Zeit, um Innovationen zu entwickeln.",
        en: "There is time and space to develop innovations.",
        tr: "İnovasyon geliştirmek için zaman ve alan tanınır.",
      },
      {
        de: "Das Unternehmen investiert erkennbar in Zukunftsthemen.",
        en: "The company visibly invests in future-oriented topics.",
        tr: "Şirket geleceğe yönelik konulara belirgin şekilde yatırım yapıyor.",
      },
    ],
  },
  {
    id: "Q19",
    pillar: "Q",
    name: { de: "Risikomanagement", en: "Risk Management", tr: "Risk Yönetimi" },
    statements: [
      {
        de: "Wesentliche Risiken für das Unternehmen sind bekannt und werden aktiv beobachtet.",
        en: "Key risks to the company are known and actively monitored.",
        tr: "Şirket için önemli riskler bilinir ve aktif olarak izlenir.",
      },
      {
        de: "Es gibt einen klaren Plan, wie mit Krisen oder unerwarteten Ereignissen umgegangen wird.",
        en: "There is a clear plan for how to handle crises or unexpected events.",
        tr: "Kriz veya beklenmedik olaylarla nasıl başa çıkılacağına dair net bir plan vardır.",
      },
      {
        de: "Risiken werden offen angesprochen, statt beschönigt zu werden.",
        en: "Risks are discussed openly rather than glossed over.",
        tr: "Riskler örtbas edilmeden açıkça konuşulur.",
      },
    ],
  },
  {
    id: "Q20",
    pillar: "Q",
    name: { de: "Kontinuierlicher Verbesserungsprozess", en: "Continuous Improvement", tr: "Sürekli İyileştirme Süreci" },
    statements: [
      {
        de: "Es gibt einen etablierten Weg, Verbesserungsvorschläge einzureichen.",
        en: "There is an established way to submit improvement suggestions.",
        tr: "İyileştirme önerileri sunmak için yerleşik bir yol vardır.",
      },
      {
        de: "Verbesserungsvorschläge werden ernsthaft geprüft und häufig umgesetzt.",
        en: "Improvement suggestions are seriously reviewed and frequently implemented.",
        tr: "İyileştirme önerileri ciddiyetle değerlendirilir ve sıklıkla hayata geçirilir.",
      },
      {
        de: "Kontinuierliche Verbesserung ist im Arbeitsalltag spürbar verankert.",
        en: "Continuous improvement is noticeably embedded in everyday work.",
        tr: "Sürekli iyileştirme günlük iş hayatında belirgin şekilde yerleşiktir.",
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ETHIK (E01–E20)
  // ---------------------------------------------------------------------
  {
    id: "E01",
    pillar: "E",
    name: { de: "Wirtschaftsethik", en: "Business Ethics", tr: "İş Etiği" },
    statements: [
      {
        de: "Geschäftsentscheidungen orientieren sich klar an ethischen Grundsätzen, nicht nur am kurzfristigen Gewinn.",
        en: "Business decisions are clearly guided by ethical principles, not just short-term profit.",
        tr: "İş kararları kısa vadeli kârdan çok, açıkça etik ilkelere dayanır.",
      },
      {
        de: "Es gibt klare Regeln, wie mit Interessenkonflikten umgegangen wird.",
        en: "There are clear rules for handling conflicts of interest.",
        tr: "Çıkar çatışmalarının nasıl ele alınacağına dair net kurallar vardır.",
      },
      {
        de: "Unethisches Verhalten hat spürbare Konsequenzen, unabhängig von der Position der Person.",
        en: "Unethical behavior has noticeable consequences, regardless of the person's position.",
        tr: "Etik olmayan davranışların, kişinin pozisyonundan bağımsız olarak somut sonuçları vardır.",
      },
    ],
  },
  {
    id: "E02",
    pillar: "E",
    name: { de: "Vertrauen", en: "Trust", tr: "Güven" },
    statements: [
      {
        de: "Zusagen von Führung und Unternehmen werden eingehalten.",
        en: "Commitments made by leadership and the company are kept.",
        tr: "Yönetimin ve şirketin verdiği sözler tutulur.",
      },
      {
        de: "Man kann offen Kritik äußern, ohne negative Konsequenzen befürchten zu müssen.",
        en: "People can openly voice criticism without fearing negative consequences.",
        tr: "İnsanlar olumsuz sonuçlardan korkmadan açıkça eleştiri dile getirebilir.",
      },
      {
        de: "Es herrscht ein grundsätzliches Vertrauen zwischen Mitarbeitenden und Führung.",
        en: "There is a basic level of trust between employees and leadership.",
        tr: "Çalışanlar ile yönetim arasında temel bir güven ilişkisi vardır.",
      },
    ],
  },
  {
    id: "E03",
    pillar: "E",
    name: { de: "Diversität", en: "Diversity", tr: "Çeşitlilik" },
    statements: [
      {
        de: "Menschen mit unterschiedlichem Hintergrund (Herkunft, Alter, Geschlecht, Lebensentwurf) werden gleichermaßen wertgeschätzt.",
        en: "People of different backgrounds (origin, age, gender, life path) are equally valued.",
        tr: "Farklı geçmişe sahip insanlar (köken, yaş, cinsiyet, yaşam tarzı) eşit derecede değer görür.",
      },
      {
        de: "Vielfalt wird aktiv gefördert, z.B. bei Einstellungen und Beförderungen.",
        en: "Diversity is actively promoted, e.g. in hiring and promotions.",
        tr: "Çeşitlilik, örneğin işe alım ve terfilerde aktif olarak desteklenir.",
      },
      {
        de: "Unterschiedliche Perspektiven werden als Bereicherung wahrgenommen, nicht als Störung.",
        en: "Different perspectives are seen as an asset, not a disruption.",
        tr: "Farklı bakış açıları bir rahatsızlık değil, bir zenginlik olarak görülür.",
      },
    ],
  },
  {
    id: "E04",
    pillar: "E",
    name: { de: "Beschäftigungssicherheit", en: "Employment Security", tr: "İstihdam Güvencesi" },
    statements: [
      {
        de: "Mitarbeitende fühlen sich in ihrem Arbeitsplatz grundsätzlich sicher.",
        en: "Employees generally feel secure in their jobs.",
        tr: "Çalışanlar iş yerlerinde genel olarak kendilerini güvende hissediyor.",
      },
      {
        de: "Bei wirtschaftlichen Herausforderungen wird offen und fair kommuniziert.",
        en: "In economically challenging times, communication is open and fair.",
        tr: "Ekonomik zorluklarda açık ve adil bir şekilde iletişim kurulur.",
      },
      {
        de: "Personalabbau ist, wenn nötig, das letzte statt das erste Mittel.",
        en: "Layoffs, if necessary, are the last resort rather than the first.",
        tr: "Gerekirse işten çıkarmalar ilk değil, son çare olarak uygulanır.",
      },
    ],
  },
  {
    id: "E05",
    pillar: "E",
    name: { de: "Datenschutz", en: "Data Protection", tr: "Veri Koruma" },
    statements: [
      {
        de: "Mit personenbezogenen Daten wird sorgfältig und regelkonform umgegangen.",
        en: "Personal data is handled carefully and in compliance with regulations.",
        tr: "Kişisel veriler özenli ve mevzuata uygun şekilde işlenir.",
      },
      {
        de: "Mitarbeitende wissen, welche Datenschutzregeln für ihre Arbeit gelten.",
        en: "Employees know which data protection rules apply to their work.",
        tr: "Çalışanlar kendi işleri için hangi veri koruma kurallarının geçerli olduğunu biliyor.",
      },
      {
        de: "Datenschutzvorfälle werden ernst genommen und transparent aufgearbeitet.",
        en: "Data protection incidents are taken seriously and addressed transparently.",
        tr: "Veri koruma ihlalleri ciddiye alınır ve şeffaf şekilde ele alınır.",
      },
    ],
  },
  {
    id: "E06",
    pillar: "E",
    name: { de: "Arbeitssicherheit", en: "Occupational Safety", tr: "İş Güvenliği" },
    statements: [
      {
        de: "Arbeitssicherheit hat im Unternehmen einen hohen, spürbaren Stellenwert.",
        en: "Occupational safety clearly has a high priority within the company.",
        tr: "İş güvenliği şirket içinde belirgin şekilde yüksek bir öneme sahiptir.",
      },
      {
        de: "Sicherheitsvorschriften werden im Alltag tatsächlich eingehalten.",
        en: "Safety rules are actually followed in everyday work.",
        tr: "Güvenlik kuralları günlük çalışmada gerçekten uygulanır.",
      },
      {
        de: "Gefahren und Beinaheunfälle werden offen gemeldet und ernst genommen.",
        en: "Hazards and near-misses are openly reported and taken seriously.",
        tr: "Tehlikeler ve ramak kala olaylar açıkça bildirilir ve ciddiye alınır.",
      },
    ],
  },
  {
    id: "E07",
    pillar: "E",
    name: { de: "Stressprävention", en: "Stress Prevention", tr: "Stres Önleme" },
    statements: [
      {
        de: "Das Unternehmen achtet aktiv auf ein gesundes Arbeitspensum.",
        en: "The company actively watches out for a healthy workload.",
        tr: "Şirket sağlıklı bir iş yüküne aktif olarak dikkat eder.",
      },
      {
        de: "Es gibt Angebote oder Maßnahmen, um Überlastung vorzubeugen.",
        en: "There are offerings or measures to prevent overload.",
        tr: "Aşırı yüklenmeyi önlemeye yönelik teklifler veya önlemler vardır.",
      },
      {
        de: "Über Stress und Belastung kann offen gesprochen werden, ohne Schwäche zu zeigen.",
        en: "People can talk openly about stress and strain without appearing weak.",
        tr: "Stres ve yoğunluk hakkında zayıflık gibi görünmeden açıkça konuşulabilir.",
      },
    ],
  },
  {
    id: "E08",
    pillar: "E",
    name: { de: "Vergütung", en: "Compensation", tr: "Ücretlendirme" },
    statements: [
      {
        de: "Die Bezahlung wird als fair im Vergleich zu Leistung und Verantwortung empfunden.",
        en: "Pay is perceived as fair relative to performance and responsibility.",
        tr: "Ücretlendirme, performans ve sorumlulukla karşılaştırıldığında adil olarak algılanıyor.",
      },
      {
        de: "Vergütungskriterien sind nachvollziehbar und werden konsistent angewendet.",
        en: "Compensation criteria are transparent and applied consistently.",
        tr: "Ücretlendirme kriterleri anlaşılır ve tutarlı şekilde uygulanır.",
      },
      {
        de: "Gehaltsunterschiede zwischen vergleichbaren Positionen sind sachlich begründet.",
        en: "Pay differences between comparable positions are objectively justified.",
        tr: "Benzer pozisyonlar arasındaki maaş farkları objektif nedenlere dayanır.",
      },
    ],
  },
  {
    id: "E09",
    pillar: "E",
    name: { de: "Arbeitszeiten", en: "Working Hours", tr: "Çalışma Saatleri" },
    statements: [
      {
        de: "Arbeitszeiten sind realistisch und werden respektiert.",
        en: "Working hours are realistic and respected.",
        tr: "Çalışma saatleri gerçekçidir ve bunlara saygı gösterilir.",
      },
      {
        de: "Überstunden bleiben die Ausnahme, nicht die Regel.",
        en: "Overtime is the exception, not the rule.",
        tr: "Fazla mesai kural değil, istisnadır.",
      },
      {
        de: "Arbeitszeit wird korrekt erfasst und vergütet oder ausgeglichen.",
        en: "Working time is recorded correctly and compensated or offset.",
        tr: "Çalışma süresi doğru şekilde kaydedilir ve ücretlendirilir veya telafi edilir.",
      },
    ],
  },
  {
    id: "E10",
    pillar: "E",
    name: { de: "Work-Life-Balance", en: "Work-Life Balance", tr: "İş-Yaşam Dengesi" },
    statements: [
      {
        de: "Beruf und Privatleben lassen sich bei uns gut miteinander vereinbaren.",
        en: "Work and private life can be reconciled well here.",
        tr: "İş ve özel hayat burada iyi bir şekilde bağdaştırılabiliyor.",
      },
      {
        de: "Erreichbarkeit außerhalb der Arbeitszeit wird nicht stillschweigend erwartet.",
        en: "Availability outside working hours is not silently expected.",
        tr: "Mesai saatleri dışında ulaşılabilir olmak sessizce beklenmiyor.",
      },
      {
        de: "Flexible Arbeitsmodelle (Zeit, Ort) werden ernsthaft ermöglicht.",
        en: "Flexible working models (time, place) are genuinely made possible.",
        tr: "Esnek çalışma modelleri (zaman, yer) gerçekten mümkün kılınıyor.",
      },
    ],
  },
  {
    id: "E11",
    pillar: "E",
    name: { de: "Beteiligung", en: "Participation", tr: "Katılım" },
    statements: [
      {
        de: "Mitarbeitende haben echte Mitsprachemöglichkeiten bei Entscheidungen, die sie betreffen.",
        en: "Employees have real say in decisions that affect them.",
        tr: "Çalışanların kendilerini ilgilendiren kararlarda gerçek söz hakkı vardır.",
      },
      {
        de: "Es gibt Formate (Umfragen, Meetings, Vertretungen), über die Mitarbeitende sich einbringen können.",
        en: "There are formats (surveys, meetings, representation) through which employees can contribute.",
        tr: "Çalışanların katkı sağlayabileceği formatlar (anketler, toplantılar, temsilcilikler) vardır.",
      },
      {
        de: "Beteiligungsangebote führen erkennbar zu tatsächlichen Veränderungen.",
        en: "Participation opportunities visibly lead to actual change.",
        tr: "Katılım imkanları görünür şekilde gerçek değişikliklere yol açıyor.",
      },
    ],
  },
  {
    id: "E12",
    pillar: "E",
    name: { de: "Frauenquote", en: "Gender Balance", tr: "Cinsiyet Dengesi" },
    statements: [
      {
        de: "Frauen sind auf allen Hierarchieebenen angemessen vertreten.",
        en: "Women are appropriately represented at all hierarchy levels.",
        tr: "Kadınlar tüm hiyerarşi kademelerinde uygun şekilde temsil ediliyor.",
      },
      {
        de: "Es gibt konkrete Maßnahmen, um die Geschlechterverteilung ausgewogener zu gestalten.",
        en: "There are concrete measures to make the gender balance more even.",
        tr: "Cinsiyet dağılımını daha dengeli hale getirmek için somut önlemler var.",
      },
      {
        de: "Aufstiegschancen sind unabhängig vom Geschlecht gleich verteilt.",
        en: "Advancement opportunities are distributed equally regardless of gender.",
        tr: "Yükselme fırsatları cinsiyetten bağımsız olarak eşit dağıtılıyor.",
      },
    ],
  },
  {
    id: "E13",
    pillar: "E",
    name: { de: "50Plus", en: "50Plus (Older Employees)", tr: "50Plus (Deneyimli Çalışanlar)" },
    statements: [
      {
        de: "Erfahrene, ältere Mitarbeitende werden wertgeschätzt und aktiv eingebunden.",
        en: "Experienced, older employees are valued and actively included.",
        tr: "Deneyimli, yaşlı çalışanlar değer görüyor ve aktif olarak dahil ediliyor.",
      },
      {
        de: "Es gibt altersgerechte Arbeitsmodelle und Entwicklungsmöglichkeiten.",
        en: "There are age-appropriate work models and development opportunities.",
        tr: "Yaşa uygun çalışma modelleri ve gelişim imkanları var.",
      },
      {
        de: "Altersdiskriminierung, in beide Richtungen, hat bei uns keinen Platz.",
        en: "Age discrimination, in either direction, has no place here.",
        tr: "Her iki yönde de yaş ayrımcılığına burada yer yok.",
      },
    ],
  },
  {
    id: "E14",
    pillar: "E",
    name: { de: "Inklusion", en: "Inclusion", tr: "Kapsayıcılık" },
    statements: [
      {
        de: "Menschen mit Behinderung oder besonderem Unterstützungsbedarf finden bei uns geeignete Arbeitsbedingungen.",
        en: "People with disabilities or special support needs find suitable working conditions here.",
        tr: "Engelli veya özel destek ihtiyacı olan kişiler burada uygun çalışma koşulları buluyor.",
      },
      {
        de: "Inklusion wird aktiv gefördert und nicht nur formal erfüllt.",
        en: "Inclusion is actively promoted, not just formally fulfilled.",
        tr: "Kapsayıcılık sadece biçimsel olarak değil, aktif olarak destekleniyor.",
      },
      {
        de: "Alle Mitarbeitenden können sich unabhängig von persönlichen Voraussetzungen voll einbringen.",
        en: "All employees can fully contribute regardless of personal circumstances.",
        tr: "Tüm çalışanlar kişisel koşullarından bağımsız olarak tam anlamıyla katkı sağlayabiliyor.",
      },
    ],
  },
  {
    id: "E15",
    pillar: "E",
    name: { de: "Reintegration", en: "Reintegration", tr: "Yeniden Entegrasyon" },
    statements: [
      {
        de: "Nach längerer Abwesenheit (Krankheit, Elternzeit) gibt es einen strukturierten Wiedereinstieg.",
        en: "There is a structured return process after longer absences (illness, parental leave).",
        tr: "Uzun süreli devamsızlıktan (hastalık, ebeveyn izni) sonra yapılandırılmış bir geri dönüş süreci var.",
      },
      {
        de: "Rückkehrende Mitarbeitende werden unterstützt statt an den Rand gedrängt.",
        en: "Returning employees are supported rather than pushed aside.",
        tr: "Geri dönen çalışanlar dışlanmak yerine destekleniyor.",
      },
      {
        de: "Es gibt klare Ansprechpartner für die Rückkehr an den Arbeitsplatz.",
        en: "There are clear contacts for returning to the workplace.",
        tr: "İşe geri dönüş için net irtibat kişileri var.",
      },
    ],
  },
  {
    id: "E16",
    pillar: "E",
    name: { de: "Aus- und Weiterbildung", en: "Training & Development", tr: "Eğitim ve Gelişim" },
    statements: [
      {
        de: "Mitarbeitende haben ausreichend Möglichkeiten zur fachlichen Weiterbildung.",
        en: "Employees have sufficient opportunities for professional development.",
        tr: "Çalışanların mesleki gelişim için yeterli imkanları var.",
      },
      {
        de: "Weiterbildung wird vom Unternehmen aktiv gefördert und unterstützt.",
        en: "Further training is actively encouraged and supported by the company.",
        tr: "Mesleki gelişim şirket tarafından aktif olarak teşvik edilip destekleniyor.",
      },
      {
        de: "Neue Mitarbeitende werden strukturiert eingearbeitet.",
        en: "New employees are onboarded in a structured way.",
        tr: "Yeni çalışanlar yapılandırılmış bir şekilde işe alıştırılıyor.",
      },
    ],
  },
  {
    id: "E17",
    pillar: "E",
    name: { de: "Compliance", en: "Compliance", tr: "Uyumluluk (Compliance)" },
    statements: [
      {
        de: "Gesetzliche und interne Regeln werden konsequent eingehalten.",
        en: "Legal and internal rules are consistently followed.",
        tr: "Yasal ve şirket içi kurallara tutarlı şekilde uyuluyor.",
      },
      {
        de: "Es gibt klare, bekannte Wege, um Regelverstöße zu melden.",
        en: "There are clear, known ways to report rule violations.",
        tr: "Kural ihlallerini bildirmek için net ve bilinen yollar var.",
      },
      {
        de: "Meldungen von Regelverstößen werden ernsthaft und ohne Nachteile für Meldende bearbeitet.",
        en: "Reports of rule violations are handled seriously and without disadvantage to whistleblowers.",
        tr: "Kural ihlali bildirimleri, bildirende dezavantaj yaratmadan ciddiyetle ele alınıyor.",
      },
    ],
  },
  {
    id: "E18",
    pillar: "E",
    name: { de: "Fair Trade", en: "Fair Trade", tr: "Adil Ticaret" },
    statements: [
      {
        de: "Bei Einkauf und Lieferketten wird auf faire Handelsbedingungen geachtet.",
        en: "Purchasing and supply chains take fair trading conditions into account.",
        tr: "Satın alma ve tedarik zincirlerinde adil ticaret koşulları dikkate alınıyor.",
      },
      {
        de: "Lieferanten werden nach fairen, nachvollziehbaren Kriterien ausgewählt und behandelt.",
        en: "Suppliers are selected and treated according to fair, transparent criteria.",
        tr: "Tedarikçiler adil ve anlaşılır kriterlere göre seçilip muamele görüyor.",
      },
      {
        de: "Auf faire Bezahlung entlang der gesamten Wertschöpfungskette wird geachtet.",
        en: "Fair pay is considered along the entire value chain.",
        tr: "Tüm değer zinciri boyunca adil ücretlendirmeye dikkat ediliyor.",
      },
    ],
  },
  {
    id: "E19",
    pillar: "E",
    name: { de: "Ökologie", en: "Ecology", tr: "Ekoloji" },
    statements: [
      {
        de: "Umweltschutz wird bei unternehmerischen Entscheidungen aktiv mitgedacht.",
        en: "Environmental protection is actively considered in business decisions.",
        tr: "Çevre koruma, iş kararlarında aktif olarak dikkate alınıyor.",
      },
      {
        de: "Es gibt konkrete Maßnahmen zur Reduzierung des ökologischen Fußabdrucks.",
        en: "There are concrete measures to reduce the ecological footprint.",
        tr: "Ekolojik ayak izini azaltmaya yönelik somut önlemler var.",
      },
      {
        de: "Mitarbeitende werden zu umweltbewusstem Verhalten ermutigt und dabei unterstützt.",
        en: "Employees are encouraged and supported in behaving in an environmentally conscious way.",
        tr: "Çalışanlar çevre bilinciyle hareket etmeye teşvik edilip destekleniyor.",
      },
    ],
  },
  {
    id: "E20",
    pillar: "E",
    name: { de: "CSR", en: "CSR (Corporate Social Responsibility)", tr: "Kurumsal Sosyal Sorumluluk (CSR)" },
    statements: [
      {
        de: "Das Unternehmen übernimmt erkennbar gesellschaftliche Verantwortung über das Kerngeschäft hinaus.",
        en: "The company visibly takes on social responsibility beyond its core business.",
        tr: "Şirket, temel iş alanının ötesinde belirgin şekilde toplumsal sorumluluk üstleniyor.",
      },
      {
        de: "Soziales/gesellschaftliches Engagement wird glaubwürdig und nicht nur für die Außenwirkung betrieben.",
        en: "Social engagement is credible, not just for PR purposes.",
        tr: "Sosyal katılım, sadece imaj için değil, inandırıcı şekilde yürütülüyor.",
      },
      {
        de: "Mitarbeitende können sich aktiv an gesellschaftlichen Projekten des Unternehmens beteiligen.",
        en: "Employees can actively participate in the company's social projects.",
        tr: "Çalışanlar şirketin toplumsal projelerine aktif olarak katılabiliyor.",
      },
    ],
  },

  // ---------------------------------------------------------------------
  // TRANSPARENZ (T01–T20)
  // ---------------------------------------------------------------------
  {
    id: "T01",
    pillar: "T",
    name: { de: "Leitlinien", en: "Guiding Principles", tr: "Yol Gösterici İlkeler" },
    statements: [
      {
        de: "Es gibt klare, schriftlich festgehaltene Leitlinien für Zusammenarbeit und Verhalten.",
        en: "There are clear, written guiding principles for collaboration and behavior.",
        tr: "İşbirliği ve davranış için net, yazılı yol gösterici ilkeler var.",
      },
      {
        de: "Diese Leitlinien sind allen bekannt und werden im Alltag tatsächlich gelebt.",
        en: "These principles are known to everyone and actually lived out day to day.",
        tr: "Bu ilkeler herkes tarafından biliniyor ve günlük hayatta gerçekten uygulanıyor.",
      },
      {
        de: "Bei Widersprüchen zwischen Leitlinien und Praxis wird offen nachgesteuert.",
        en: "Contradictions between principles and practice are openly addressed.",
        tr: "İlkeler ile uygulama arasındaki çelişkiler açıkça ele alınıyor.",
      },
    ],
  },
  {
    id: "T02",
    pillar: "T",
    name: { de: "CI Corporate Identity", en: "Corporate Identity", tr: "Kurumsal Kimlik" },
    statements: [
      {
        de: "Das Unternehmen hat ein klares, einheitliches Erscheinungsbild nach innen und außen.",
        en: "The company has a clear, consistent image internally and externally.",
        tr: "Şirketin içe ve dışa dönük net, tutarlı bir görünümü var.",
      },
      {
        de: "Werte und Selbstverständnis des Unternehmens sind klar formuliert und bekannt.",
        en: "The company's values and self-image are clearly formulated and known.",
        tr: "Şirketin değerleri ve öz algısı net şekilde ifade edilmiş ve biliniyor.",
      },
      {
        de: "Mitarbeitende identifizieren sich erkennbar mit dem Corporate-Identity-Bild des Unternehmens.",
        en: "Employees visibly identify with the company's corporate identity.",
        tr: "Çalışanlar şirketin kurumsal kimliğiyle belirgin şekilde özdeşleşiyor.",
      },
    ],
  },
  {
    id: "T03",
    pillar: "T",
    name: { de: "Corporate Transparency", en: "Corporate Transparency", tr: "Kurumsal Şeffaflık" },
    statements: [
      {
        de: "Wichtige Unternehmenskennzahlen und -entwicklungen werden offen kommuniziert.",
        en: "Important company figures and developments are communicated openly.",
        tr: "Önemli şirket rakamları ve gelişmeleri açıkça paylaşılıyor.",
      },
      {
        de: "Entscheidungswege sind für Mitarbeitende nachvollziehbar, nicht nur das Ergebnis.",
        en: "Decision-making paths are understandable to employees, not just the outcome.",
        tr: "Karar süreçleri, sadece sonuç değil, çalışanlar için anlaşılır.",
      },
      {
        de: "Auch unangenehme Themen werden offen angesprochen statt vertuscht.",
        en: "Even uncomfortable topics are addressed openly rather than hidden.",
        tr: "Rahatsız edici konular bile gizlenmek yerine açıkça ele alınıyor.",
      },
    ],
  },
  {
    id: "T04",
    pillar: "T",
    name: { de: "Preisgestaltung", en: "Pricing", tr: "Fiyatlandırma" },
    statements: [
      {
        de: "Preise sind nachvollziehbar aufgebaut und werden verständlich kommuniziert.",
        en: "Prices are built up transparently and communicated understandably.",
        tr: "Fiyatlar anlaşılır şekilde oluşturulur ve açıkça iletilir.",
      },
      {
        de: "Es gibt keine versteckten Kosten oder überraschenden Preisänderungen.",
        en: "There are no hidden costs or surprising price changes.",
        tr: "Gizli maliyetler veya sürpriz fiyat değişiklikleri yoktur.",
      },
      {
        de: "Preisänderungen werden Kunden rechtzeitig und begründet mitgeteilt.",
        en: "Price changes are communicated to customers in advance and with reasons.",
        tr: "Fiyat değişiklikleri müşterilere zamanında ve gerekçeli olarak bildirilir.",
      },
    ],
  },
  {
    id: "T05",
    pillar: "T",
    name: { de: "Verträge", en: "Contracts", tr: "Sözleşmeler" },
    statements: [
      {
        de: "Verträge sind klar, verständlich formuliert und ohne versteckte Klauseln.",
        en: "Contracts are clear, understandably worded and free of hidden clauses.",
        tr: "Sözleşmeler net, anlaşılır şekilde yazılmıştır ve gizli maddeler içermez.",
      },
      {
        de: "Vertragspartner werden fair und auf Augenhöhe behandelt.",
        en: "Contract partners are treated fairly and as equals.",
        tr: "Sözleşme tarafları adil ve eşit koşullarda muamele görür.",
      },
      {
        de: "Änderungen an Verträgen werden transparent kommuniziert.",
        en: "Contract changes are communicated transparently.",
        tr: "Sözleşme değişiklikleri şeffaf şekilde iletilir.",
      },
    ],
  },
  {
    id: "T06",
    pillar: "T",
    name: { de: "Social Media", en: "Social Media", tr: "Sosyal Medya" },
    statements: [
      {
        de: "Das Unternehmen kommuniziert in sozialen Medien authentisch und ehrlich.",
        en: "The company communicates authentically and honestly on social media.",
        tr: "Şirket sosyal medyada özgün ve dürüst iletişim kuruyor.",
      },
      {
        de: "Kritik und Anfragen in sozialen Medien werden offen und zeitnah beantwortet.",
        en: "Criticism and questions on social media are answered openly and promptly.",
        tr: "Sosyal medyadaki eleştiri ve sorulara açık ve zamanında yanıt veriliyor.",
      },
      {
        de: "Der Auftritt in sozialen Medien passt glaubwürdig zu den echten Unternehmenswerten.",
        en: "The social media presence credibly matches the company's real values.",
        tr: "Sosyal medya görünümü, şirketin gerçek değerleriyle inandırıcı şekilde örtüşüyor.",
      },
    ],
  },
  {
    id: "T07",
    pillar: "T",
    name: { de: "Zielvereinbarungen", en: "Goal Agreements", tr: "Hedef Anlaşmaları" },
    statements: [
      {
        de: "Ziele werden klar, messbar und gemeinsam vereinbart.",
        en: "Goals are agreed clearly, measurably and jointly.",
        tr: "Hedefler net, ölçülebilir ve ortaklaşa belirlenir.",
      },
      {
        de: "Der Stand der Zielerreichung wird regelmäßig und offen besprochen.",
        en: "Progress toward goals is discussed regularly and openly.",
        tr: "Hedeflere ulaşma durumu düzenli ve açık şekilde görüşülür.",
      },
      {
        de: "Ziele sind realistisch und werden nicht willkürlich verändert.",
        en: "Goals are realistic and not changed arbitrarily.",
        tr: "Hedefler gerçekçidir ve keyfi olarak değiştirilmez.",
      },
    ],
  },
  {
    id: "T08",
    pillar: "T",
    name: { de: "Konfliktmanagement", en: "Conflict Management", tr: "Çatışma Yönetimi" },
    statements: [
      {
        de: "Es gibt einen klaren, bekannten Weg, um Konflikte anzusprechen und zu klären.",
        en: "There is a clear, known way to raise and resolve conflicts.",
        tr: "Çatışmaları dile getirmek ve çözmek için net, bilinen bir yol var.",
      },
      {
        de: "Konflikte werden zeitnah und lösungsorientiert angegangen.",
        en: "Conflicts are addressed promptly and with a focus on solutions.",
        tr: "Çatışmalar zamanında ve çözüm odaklı ele alınır.",
      },
      {
        de: "Bei Konflikten wird fair vermittelt, ohne einseitig Partei zu ergreifen.",
        en: "Conflicts are mediated fairly, without taking one-sided positions.",
        tr: "Çatışmalarda taraf tutulmadan adil şekilde arabuluculuk yapılır.",
      },
    ],
  },
  {
    id: "T09",
    pillar: "T",
    name: { de: "Fehlerkultur", en: "Error Culture", tr: "Hata Kültürü" },
    statements: [
      {
        de: "Fehler dürfen offen zugegeben werden, ohne Angst vor Bloßstellung.",
        en: "Mistakes can be openly admitted without fear of exposure.",
        tr: "Hatalar, teşhir edilme korkusu olmadan açıkça kabul edilebilir.",
      },
      {
        de: "Aus Fehlern wird systematisch gelernt, statt Schuldige zu suchen.",
        en: "Lessons are systematically learned from mistakes instead of looking for someone to blame.",
        tr: "Hatalardan suçlu aramak yerine sistematik olarak ders çıkarılır.",
      },
      {
        de: "Führungskräfte gehen mit eigenen Fehlern offen und vorbildlich um.",
        en: "Leaders handle their own mistakes openly and set a good example.",
        tr: "Yöneticiler kendi hatalarıyla açık ve örnek teşkil eder şekilde başa çıkar.",
      },
    ],
  },
  {
    id: "T10",
    pillar: "T",
    name: { de: "Lieferanten", en: "Suppliers", tr: "Tedarikçiler" },
    statements: [
      {
        de: "Lieferantenbeziehungen sind fair, verlässlich und auf Dauer angelegt.",
        en: "Supplier relationships are fair, reliable and built for the long term.",
        tr: "Tedarikçi ilişkileri adil, güvenilir ve uzun vadeli kurulmuştur.",
      },
      {
        de: "Auswahlkriterien für Lieferanten sind klar und nachvollziehbar.",
        en: "Selection criteria for suppliers are clear and understandable.",
        tr: "Tedarikçi seçim kriterleri net ve anlaşılırdır.",
      },
      {
        de: "Zahlungen an Lieferanten erfolgen pünktlich und wie vereinbart.",
        en: "Payments to suppliers are made on time and as agreed.",
        tr: "Tedarikçilere ödemeler zamanında ve anlaşıldığı şekilde yapılır.",
      },
    ],
  },
  {
    id: "T11",
    pillar: "T",
    name: { de: "Marketing", en: "Marketing", tr: "Pazarlama" },
    statements: [
      {
        de: "Werbeaussagen sind wahrheitsgemäß und halten, was sie versprechen.",
        en: "Advertising claims are truthful and deliver on what they promise.",
        tr: "Reklam iddiaları doğrudur ve vaat ettiklerini yerine getirir.",
      },
      {
        de: "Marketingbotschaften spiegeln die tatsächlichen Werte des Unternehmens wider.",
        en: "Marketing messages reflect the company's actual values.",
        tr: "Pazarlama mesajları şirketin gerçek değerlerini yansıtır.",
      },
      {
        de: "Es wird auf irreführende oder übertriebene Werbeversprechen verzichtet.",
        en: "Misleading or exaggerated advertising promises are avoided.",
        tr: "Yanıltıcı veya abartılı reklam vaatlerinden kaçınılır.",
      },
    ],
  },
  {
    id: "T12",
    pillar: "T",
    name: { de: "Kommunikation", en: "Communication", tr: "İletişim" },
    statements: [
      {
        de: "Wichtige Informationen erreichen alle, die sie benötigen, rechtzeitig.",
        en: "Important information reaches everyone who needs it in time.",
        tr: "Önemli bilgiler ihtiyacı olan herkese zamanında ulaşır.",
      },
      {
        de: "Kommunikation verläuft in beide Richtungen, nicht nur von oben nach unten.",
        en: "Communication flows in both directions, not just top-down.",
        tr: "İletişim yalnızca yukarıdan aşağıya değil, her iki yönde de akar.",
      },
      {
        de: "Interne Kommunikationskanäle funktionieren zuverlässig und werden genutzt.",
        en: "Internal communication channels work reliably and are actually used.",
        tr: "İç iletişim kanalları güvenilir şekilde çalışır ve gerçekten kullanılır.",
      },
    ],
  },
  {
    id: "T13",
    pillar: "T",
    name: { de: "IKT Informations- und Kommunikationstechnologie", en: "ICT (Information & Communication Technology)", tr: "Bilgi ve İletişim Teknolojisi (BİT)" },
    statements: [
      {
        de: "Die eingesetzten IT-Systeme unterstützen die Arbeit gut, statt sie zu behindern.",
        en: "The IT systems used genuinely support the work instead of hindering it.",
        tr: "Kullanılan BT sistemleri işi engellemek yerine gerçekten destekliyor.",
      },
      {
        de: "Informationen sind für die, die sie brauchen, leicht zugänglich.",
        en: "Information is easily accessible to those who need it.",
        tr: "Bilgiye ihtiyaç duyanlar için kolay erişim sağlanıyor.",
      },
      {
        de: "IT-Sicherheit und Datenschutz werden bei der Systemwahl ernst genommen.",
        en: "IT security and data protection are taken seriously when choosing systems.",
        tr: "Sistem seçiminde BT güvenliği ve veri koruma ciddiye alınıyor.",
      },
    ],
  },
  {
    id: "T14",
    pillar: "T",
    name: { de: "Controlling", en: "Controlling", tr: "Kontrolling" },
    statements: [
      {
        de: "Zahlen und Kennzahlen werden regelmäßig erhoben und ausgewertet.",
        en: "Figures and metrics are collected and evaluated regularly.",
        tr: "Rakamlar ve göstergeler düzenli olarak toplanır ve değerlendirilir.",
      },
      {
        de: "Controlling-Ergebnisse fließen sichtbar in Entscheidungen ein.",
        en: "Controlling results are visibly factored into decisions.",
        tr: "Kontrolling sonuçları kararlara görünür şekilde yansır.",
      },
      {
        de: "Relevante Kennzahlen sind für die betroffenen Bereiche einsehbar.",
        en: "Relevant metrics are accessible to the areas concerned.",
        tr: "İlgili göstergeler etkilenen alanlar tarafından görülebilir.",
      },
    ],
  },
  {
    id: "T15",
    pillar: "T",
    name: { de: "Benchmarking", en: "Benchmarking", tr: "Kıyaslama (Benchmarking)" },
    statements: [
      {
        de: "Das Unternehmen vergleicht sich regelmäßig mit relevanten Wettbewerbern oder Standards.",
        en: "The company regularly compares itself with relevant competitors or standards.",
        tr: "Şirket kendini düzenli olarak ilgili rakiplerle veya standartlarla karşılaştırır.",
      },
      {
        de: "Erkenntnisse aus Benchmarking führen zu konkreten Verbesserungen.",
        en: "Insights from benchmarking lead to concrete improvements.",
        tr: "Kıyaslamadan elde edilen bulgular somut iyileştirmelere yol açar.",
      },
      {
        de: "Man kennt die eigene Position im Marktvergleich realistisch.",
        en: "The company has a realistic view of its own position in the market.",
        tr: "Şirket, pazardaki kendi konumunu gerçekçi şekilde biliyor.",
      },
    ],
  },
  {
    id: "T16",
    pillar: "T",
    name: { de: "SWOT", en: "SWOT Analysis", tr: "SWOT Analizi" },
    statements: [
      {
        de: "Stärken, Schwächen, Chancen und Risiken des Unternehmens werden regelmäßig analysiert.",
        en: "The company's strengths, weaknesses, opportunities and risks are analyzed regularly.",
        tr: "Şirketin güçlü, zayıf yönleri, fırsatları ve riskleri düzenli olarak analiz edilir.",
      },
      {
        de: "Diese Analysen werden offen im Unternehmen kommuniziert.",
        en: "These analyses are communicated openly within the company.",
        tr: "Bu analizler şirket içinde açıkça paylaşılır.",
      },
      {
        de: "Aus der Analyse abgeleitete Maßnahmen werden tatsächlich umgesetzt.",
        en: "Measures derived from the analysis are actually implemented.",
        tr: "Analizden çıkarılan önlemler gerçekten hayata geçirilir.",
      },
    ],
  },
  {
    id: "T17",
    pillar: "T",
    name: { de: "Mediation", en: "Mediation", tr: "Arabuluculuk" },
    statements: [
      {
        de: "Bei festgefahrenen Konflikten steht eine neutrale Vermittlung zur Verfügung.",
        en: "Neutral mediation is available for entrenched conflicts.",
        tr: "Çıkmaza giren çatışmalar için tarafsız bir arabuluculuk imkanı vardır.",
      },
      {
        de: "Mediationsangebote werden im Bedarfsfall auch tatsächlich genutzt.",
        en: "Mediation offers are actually used when needed.",
        tr: "Arabuluculuk imkanları gerektiğinde gerçekten kullanılır.",
      },
      {
        de: "Mediationsergebnisse werden von allen Beteiligten respektiert und umgesetzt.",
        en: "Mediation outcomes are respected and implemented by everyone involved.",
        tr: "Arabuluculuk sonuçlarına tüm taraflarca saygı gösterilir ve uygulanır.",
      },
    ],
  },
  {
    id: "T18",
    pillar: "T",
    name: { de: "Audit", en: "Audit", tr: "Denetim (Audit)" },
    statements: [
      {
        de: "Interne oder externe Audits finden regelmäßig und ernsthaft statt.",
        en: "Internal or external audits take place regularly and are taken seriously.",
        tr: "İç veya dış denetimler düzenli ve ciddiyetle gerçekleştirilir.",
      },
      {
        de: "Audit-Ergebnisse werden offen kommuniziert, auch wenn sie unangenehm sind.",
        en: "Audit results are communicated openly, even when they are uncomfortable.",
        tr: "Denetim sonuçları, rahatsız edici olsa bile açıkça paylaşılır.",
      },
      {
        de: "Aus Audit-Feststellungen werden konsequent Verbesserungen abgeleitet.",
        en: "Improvements are consistently derived from audit findings.",
        tr: "Denetim bulgularından tutarlı şekilde iyileştirmeler çıkarılır.",
      },
    ],
  },
  {
    id: "T19",
    pillar: "T",
    name: { de: "Rating", en: "Rating", tr: "Derecelendirme (Rating)" },
    statements: [
      {
        de: "Das Unternehmen kennt seine Bewertung durch relevante Rating-/Bewertungsstellen oder Kunden.",
        en: "The company knows its rating from relevant rating bodies or customers.",
        tr: "Şirket, ilgili derecelendirme kuruluşları veya müşteriler tarafından nasıl değerlendirildiğini biliyor.",
      },
      {
        de: "Mit schlechten Bewertungen wird konstruktiv statt defensiv umgegangen.",
        en: "Poor ratings are handled constructively rather than defensively.",
        tr: "Kötü değerlendirmelere savunmacı değil, yapıcı şekilde yaklaşılır.",
      },
      {
        de: "Ratings und Bewertungen werden intern transparent gemacht.",
        en: "Ratings and reviews are made transparent internally.",
        tr: "Değerlendirmeler ve puanlamalar şirket içinde şeffaf hale getirilir.",
      },
    ],
  },
  {
    id: "T20",
    pillar: "T",
    name: { de: "Zertifizierung", en: "Certification", tr: "Sertifikasyon" },
    statements: [
      {
        de: "Relevante Zertifizierungen (Qualität, Umwelt, Sozialstandards) werden konsequent gepflegt.",
        en: "Relevant certifications (quality, environment, social standards) are consistently maintained.",
        tr: "İlgili sertifikalar (kalite, çevre, sosyal standartlar) tutarlı şekilde sürdürülür.",
      },
      {
        de: "Zertifizierungsstandards werden nicht nur formal, sondern auch inhaltlich gelebt.",
        en: "Certification standards are lived out in substance, not just formally fulfilled.",
        tr: "Sertifikasyon standartları sadece biçimsel değil, içerik olarak da yaşanır.",
      },
      {
        de: "Zertifikate werden gegenüber Kunden und Partnern glaubwürdig kommuniziert.",
        en: "Certificates are communicated credibly to customers and partners.",
        tr: "Sertifikalar müşterilere ve iş ortaklarına inandırıcı şekilde iletilir.",
      },
    ],
  },
];
