export type Locale = "hy" | "ru" | "en";

export const locales: Locale[] = ["hy", "ru", "en"];
export const defaultLocale: Locale = "hy";

export const localeLabels: Record<Locale, string> = {
  hy: "ՀԱՅ",
  ru: "РУС",
  en: "ENG",
};

export interface Dictionary {
  pageTitle: string;
  pageSubtitle: string;
  stepDay: string;
  stepSlot: string;
  stepDetails: string;
  stepOtp: string;
  stepDone: string;
  stepTopic: string;
  stepOfLabel: string;
  chooseTopic: string;
  modalClose: string;
  recapTopic: string;
  recapWhen: string;
  landing: {
    kicker: string;
    title: string;
    subtitle: string;
    cta: string;
    phoneNote: string;
    securitiesNote: string;
    securitiesCta: string;
  };
  chooseDay: string;
  chooseSlot: string;
  noSlotsToday: string;
  nextAvailableDay: string;
  slotDurationNote: string;
  yerevanTimeNote: string;
  timeRemaining: string;
  form: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    interestArea: string;
    interestAreaOptions: { value: string; label: string }[];
    consent: string;
    submit: string;
    back: string;
    required: string;
    invalidPhone: string;
    invalidEmail: string;
    consentRequired: string;
  };
  otp: {
    title: string;
    sentTo: string;
    codeLabel: string;
    verify: string;
    resend: string;
    resendIn: string;
    invalidCode: string;
    expired: string;
  };
  confirmation: {
    title: string;
    bookingIdLabel: string;
    whenLabel: string;
    detailsSent: string;
    addToCalendar: string;
    bookAnother: string;
    cancelNote: string;
  };
  errors: {
    slotTaken: string;
    holdExpired: string;
    tooManyActive: string;
    rateLimited: string;
    generic: string;
  };
}

const en: Dictionary = {
  pageTitle: "Book an investment consultation call",
  pageSubtitle:
    "Pick a time that works for you and one of our investment specialists will call you back.",
  stepDay: "Day",
  stepSlot: "Time",
  stepDetails: "Your details",
  stepOtp: "Confirm phone",
  stepDone: "Done",
  stepTopic: "Topic",
  stepOfLabel: "Step {current} of {total}",
  chooseTopic: "What would you like to discuss?",
  modalClose: "Close",
  recapTopic: "Topic",
  recapWhen: "When",
  landing: {
    kicker: "Brokerage & securities",
    title: "Talk to a brokerage specialist",
    subtitle: "Book a free consultation. Pick a time that works for you — we'll call you.",
    cta: "Book a consultation",
    phoneNote: "Prefer to talk now? Call {phone}",
    securitiesNote: "Questions on securities? A specialist can walk you through it.",
    securitiesCta: "Book a call",
  },
  chooseDay: "Choose a day",
  chooseSlot: "Choose a time (Yerevan time)",
  noSlotsToday: "No free times on this day.",
  nextAvailableDay: "Next available day",
  slotDurationNote: "Each call is a short {minutes}-minute introductory consultation.",
  yerevanTimeNote: "All times are shown in Yerevan time.",
  timeRemaining: "Time left to complete your booking",
  form: {
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    email: "Email",
    interestArea: "What would you like to discuss?",
    interestAreaOptions: [
      { value: "deposits_investment", label: "Investment deposits" },
      { value: "bonds", label: "Bonds" },
      { value: "brokerage", label: "Brokerage account" },
      { value: "portfolio", label: "Portfolio management" },
      { value: "general", label: "General consultation" },
    ],
    consent: "I agree to the processing of my personal data for the purpose of this call.",
    submit: "Continue",
    back: "Back",
    required: "This field is required.",
    invalidPhone: "Enter a valid phone number with country code.",
    invalidEmail: "Enter a valid email address.",
    consentRequired: "Please accept the data-processing consent to continue.",
  },
  otp: {
    title: "Confirm your phone number",
    sentTo: "We sent a 6-digit code to",
    codeLabel: "Verification code",
    verify: "Confirm booking",
    resend: "Resend code",
    resendIn: "Resend available in {seconds}s",
    invalidCode: "The code is incorrect or expired. Request a new one.",
    expired: "Your reserved time expired. Please select a slot again.",
  },
  confirmation: {
    title: "Your call is confirmed",
    bookingIdLabel: "Booking ID",
    whenLabel: "When",
    detailsSent: "We've sent the details to your email and phone.",
    addToCalendar: "Add to calendar (.ics)",
    bookAnother: "Book another call",
    cancelNote: "To cancel, please email Investments@conversebank.am.",
  },
  errors: {
    slotTaken: "This slot has just been taken. Please choose another time.",
    holdExpired: "Your reserved time expired. Please select a slot again.",
    tooManyActive: "You already have an active booking. Please wait for your call or contact us to change it.",
    rateLimited: "Too many attempts. Please try again later.",
    generic: "Something went wrong. Please try again.",
  },
};

const ru: Dictionary = {
  pageTitle: "Запись на консультацию по инвестициям",
  pageSubtitle: "Выберите удобное время, и наш специалист перезвонит вам.",
  stepDay: "День",
  stepSlot: "Время",
  stepDetails: "Ваши данные",
  stepOtp: "Подтверждение телефона",
  stepDone: "Готово",
  stepTopic: "Тема",
  stepOfLabel: "Шаг {current} из {total}",
  chooseTopic: "Что вы хотите обсудить?",
  modalClose: "Закрыть",
  recapTopic: "Тема",
  recapWhen: "Когда",
  landing: {
    kicker: "Брокерские услуги и ценные бумаги",
    title: "Поговорите со специалистом по брокериджу",
    subtitle: "Запишитесь на бесплатную консультацию. Выберите удобное время — мы вам перезвоним.",
    cta: "Записаться на консультацию",
    phoneNote: "Хотите поговорить прямо сейчас? Звоните {phone}",
    securitiesNote: "Вопросы по ценным бумагам? Специалист всё объяснит.",
    securitiesCta: "Записаться на звонок",
  },
  chooseDay: "Выберите день",
  chooseSlot: "Выберите время (по еревaнскому времени)",
  noSlotsToday: "На этот день нет свободного времени.",
  nextAvailableDay: "Ближайший свободный день",
  slotDurationNote: "Каждый звонок — это короткая ознакомительная консультация на {minutes} минут.",
  yerevanTimeNote: "Всё время указано по еревaнскому времени.",
  timeRemaining: "Осталось времени на завершение записи",
  form: {
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Номер телефона",
    email: "Эл. почта",
    interestArea: "Что вы хотите обсудить?",
    interestAreaOptions: [
      { value: "deposits_investment", label: "Инвестиционные вклады" },
      { value: "bonds", label: "Облигации" },
      { value: "brokerage", label: "Брокерский счёт" },
      { value: "portfolio", label: "Управление портфелем" },
      { value: "general", label: "Общая консультация" },
    ],
    consent: "Я согласен(а) на обработку моих персональных данных для целей этого звонка.",
    submit: "Продолжить",
    back: "Назад",
    required: "Обязательное поле.",
    invalidPhone: "Введите корректный номер телефона с кодом страны.",
    invalidEmail: "Введите корректный адрес электронной почты.",
    consentRequired: "Пожалуйста, подтвердите согласие на обработку данных.",
  },
  otp: {
    title: "Подтвердите номер телефона",
    sentTo: "Мы отправили 6-значный код на номер",
    codeLabel: "Код подтверждения",
    verify: "Подтвердить запись",
    resend: "Отправить код повторно",
    resendIn: "Повторная отправка через {seconds} с",
    invalidCode: "Неверный или истёкший код. Запросите новый.",
    expired: "Время резервирования истекло. Пожалуйста, выберите время заново.",
  },
  confirmation: {
    title: "Ваш звонок подтверждён",
    bookingIdLabel: "Номер записи",
    whenLabel: "Когда",
    detailsSent: "Мы отправили детали на вашу эл. почту и телефон.",
    addToCalendar: "Добавить в календарь (.ics)",
    bookAnother: "Записаться ещё раз",
    cancelNote: "Для отмены напишите на Investments@conversebank.am.",
  },
  errors: {
    slotTaken: "Это время только что заняли. Пожалуйста, выберите другое.",
    holdExpired: "Время резервирования истекло. Пожалуйста, выберите время заново.",
    tooManyActive: "У вас уже есть активная запись. Дождитесь звонка или свяжитесь с нами, чтобы изменить её.",
    rateLimited: "Слишком много попыток. Попробуйте позже.",
    generic: "Что-то пошло не так. Попробуйте ещё раз.",
  },
};

const hy: Dictionary = {
  pageTitle: "Գրանցվեք ներդրումային խորհրդատվության զանգի համար",
  pageSubtitle: "Ընտրեք Ձեզ հարմար ժամը, և մեր մասնագետը կզանգահարի Ձեզ։",
  stepDay: "Օր",
  stepSlot: "Ժամ",
  stepDetails: "Ձեր տվյալները",
  stepOtp: "Հեռախոսահամարի հաստատում",
  stepDone: "Ավարտված",
  stepTopic: "Թեմա",
  stepOfLabel: "Քայլ {current}/{total}",
  chooseTopic: "Ի՞նչ եք ցանկանում քննարկել",
  modalClose: "Փակել",
  recapTopic: "Թեմա",
  recapWhen: "Երբ",
  landing: {
    kicker: "Բրոքերային ծառայություններ և արժեթղթեր",
    title: "Խոսեք բրոքերային մասնագետի հետ",
    subtitle: "Գրանցվեք անվճար խորհրդատվության համար։ Ընտրեք Ձեզ հարմար ժամը՝ մենք կզանգենք Ձեզ։",
    cta: "Գրանցվել խորհրդատվության",
    phoneNote: "Նախընտրու՞մ եք զրուցել հիմա։ Զանգահարեք {phone}",
    securitiesNote: "Հարցեր ունե՞ք արժեթղթերի վերաբերյալ։ Մասնագետը կպարզաբանի ամեն ինչ։",
    securitiesCta: "Գրանցվել զանգի",
  },
  chooseDay: "Ընտրեք օրը",
  chooseSlot: "Ընտրեք ժամը (Երևանի ժամանակով)",
  noSlotsToday: "Այս օրվա համար ազատ ժամեր չկան։",
  nextAvailableDay: "Առաջիկա ազատ օրը",
  slotDurationNote: "Յուրաքանչյուր զանգ կարճատև՝ {minutes}-րոպեանոց ծանոթացման խորհրդատվություն է։",
  yerevanTimeNote: "Ամբողջ ժամանակը նշված է Երևանի ժամանակով։",
  timeRemaining: "Գրանցումն ավարտելու համար մնացած ժամանակը",
  form: {
    firstName: "Անուն",
    lastName: "Ազգանուն",
    phone: "Հեռախոսահամար",
    email: "Էլ. հասցե",
    interestArea: "Ի՞նչ եք ցանկանում քննարկել",
    interestAreaOptions: [
      { value: "deposits_investment", label: "Ներդրումային ավանդներ" },
      { value: "bonds", label: "Պարտատոմսեր" },
      { value: "brokerage", label: "Բրոքերային հաշիվ" },
      { value: "portfolio", label: "Պորտֆելի կառավարում" },
      { value: "general", label: "Ընդհանուր խորհրդատվություն" },
    ],
    consent: "Համաձայն եմ իմ անձնական տվյալների մշակմանը՝ այս զանգի նպատակով։",
    submit: "Շարունակել",
    back: "Հետ",
    required: "Պարտադիր դաշտ է։",
    invalidPhone: "Մուտքագրեք վավեր հեռախոսահամար՝ երկրի կոդով։",
    invalidEmail: "Մուտքագրեք վավեր էլ. հասցե։",
    consentRequired: "Խնդրում ենք հաստատել տվյալների մշակման համաձայնությունը։",
  },
  otp: {
    title: "Հաստատեք Ձեր հեռախոսահամարը",
    sentTo: "6-նիշանոց կոդ ուղարկվեց",
    codeLabel: "Հաստատման կոդ",
    verify: "Հաստատել գրանցումը",
    resend: "Կրկին ուղարկել կոդը",
    resendIn: "Կրկին ուղարկումը հասանելի կլինի {seconds} վրկ հետո",
    invalidCode: "Կոդը սխալ է կամ ժամկետանց։ Պահանջեք նոր կոդ։",
    expired: "Ամրագրման ժամանակը սպառվել է։ Խնդրում ենք կրկին ընտրել ժամ։",
  },
  confirmation: {
    title: "Ձեր զանգը հաստատված է",
    bookingIdLabel: "Գրանցման ID",
    whenLabel: "Երբ",
    detailsSent: "Մանրամասները ուղարկվել են Ձեր էլ. հասցեին և հեռախոսին։",
    addToCalendar: "Ավելացնել օրացույց (.ics)",
    bookAnother: "Գրանցվել կրկին",
    cancelNote: "Չեղարկելու համար գրեք Investments@conversebank.am հասցեին։",
  },
  errors: {
    slotTaken: "Այս ժամն արդեն զբաղված է։ Խնդրում ենք ընտրել այլ ժամ։",
    holdExpired: "Ամրագրման ժամանակը սպառվել է։ Խնդրում ենք կրկին ընտրել ժամ։",
    tooManyActive: "Դուք արդեն ունեք ակտիվ գրանցում։ Սպասեք զանգին կամ դիմեք մեզ փոփոխության համար։",
    rateLimited: "Չափազանց շատ փորձեր։ Փորձեք ավելի ուշ։",
    generic: "Ինչ-որ բան այն չէ։ Խնդրում ենք կրկին փորձել։",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { hy, ru, en };

export function getDictionary(locale: string | undefined): Dictionary {
  if (locale === "ru" || locale === "en" || locale === "hy") return dictionaries[locale];
  return dictionaries[defaultLocale];
}
