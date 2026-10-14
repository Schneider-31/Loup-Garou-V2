export type Language = 'ar' | 'fr';

export const translations = {
  ar: {
    // App
    appTitle: 'لوپ-ڬارو',
    appSubtitle: 'موزّع بطاقات الأدوار',

    // Nav
    language: 'العربية',

    // Home
    welcome: 'مرحباً بك',
    welcomeSubtitle: 'موزّع بطاقات الأدوار السرية للعبة لوپ-ڬارو',
    hostGame: 'أنا المسير',
    hostGameDesc: 'أنشئ غرفة ووزّع الأدوار على اللاعبين',
    joinGame: 'أنا لاعب',
    joinGameDesc: 'أدخل رمز الغرفة وانتظر بطاقتك',
    chooseRole: 'اختر دورك',

    // Host setup
    hostName: 'اسم المسير',
    hostNamePlaceholder: 'أدخل اسمك',
    createRoom: 'إنشاء الغرفة',
    creating: 'جارٍ الإنشاء...',

    // Host dashboard
    roomCode: 'رمز الغرفة',
    shareCode: 'شارك هذا الرمز مع اللاعبين',
    playersJoined: 'اللاعبون المنضمون',
    playersCount: '{count} لاعب',
    noPlayersYet: 'لا يوجد لاعبون بعد',
    waitingForPlayers: 'في انتظار انضمام اللاعبين...',
    selectRoles: 'اختر الأدوار والكميات',
    selectRolesDesc: 'اختر الأدوار التي ستوزع على اللاعبين',
    quantity: 'الكمية',
    dealCards: 'توزيع الأدوار',
    dealing: 'جارٍ التوزيع...',
    cardsDealt: 'تم توزيع البطاقات!',
    dealAgain: 'إعادة التوزيع',
    closeRoom: 'إغلاق الغرفة',
    roleCount: 'الأدوار: {roles} | اللاعبون: {players}',
    mismatchWarning: 'عدد الأدوار لا يساوي عدد اللاعبين!',
    customRoles: 'الأدوار المخصصة',
    addCustomRole: 'إضافة دور مخصص',

    // Custom role builder
    customRoleBuilder: 'منشئ الأدوار المخصصة',
    customRoleTitle: 'عنوان الدور',
    customRoleTitlePlaceholder: 'مثال: الصياد',
    customRoleDescription: 'وصف الدور',
    customRoleDescriptionPlaceholder: 'صف دور اللاعب بإيجاز',
    customRoleQuantity: 'الكمية',
    addRole: 'إضافة الدور',
    cancel: 'إلغاء',

    // Player join
    enterRoomCode: 'أدخل رمز الغرفة',
    roomCodePlaceholder: '4 أرقام',
    enterName: 'أدخل اسمك',
    namePlaceholder: 'اسمك',
    joinRoom: 'انضمام',
    joining: 'جارٍ الانضمام...',
    roomNotFound: 'الغرفة غير موجودة',
    nameRequired: 'الرجاء إدخال الاسم',
    invalidCode: 'الرمز غير صحيح',
    alreadyJoined: 'انضممت بالفعل',
    nameTaken: 'هذا الاسم مستعمل في الغرفة، اختر اسماً آخر',
    gameStarted: 'اللعبة بدأت بالفعل. اطلب من المسير إعادة التوزيع ثم حاول من جديد',
    resumeHost: 'العودة إلى غرفتي',
    resumePlayer: 'العودة إلى بطاقتي',
    kickPlayer: 'إزالة اللاعب',
    kickConfirm: 'إزالة هذا اللاعب من الغرفة؟',

    // Player card
    waitingForDeal: 'في انتظار توزيع البطاقات...',
    hostIsDealing: 'المسير يوزّع الأدوار...',
    holdToReveal: 'إضغط مطوّلاً لإظهار البطاقة',
    releaseToHide: 'اترك لإخفاء البطاقة',
    yourRole: 'دورك',
    seenByPlayer: 'شاهدت بطاقتك',
    waitingForOthers: 'في انتظار باقي اللاعبين',
    leaveRoom: 'مغادرة الغرفة',

    // Roles
    roles: {
      villageois: 'قروي بسيط',
      loup_garou: 'ذئب بشري',
      protecteur: 'الحامي',
      sorciere: 'الاحارقة',
      voyante: 'العرافة',
      loup_blanc: 'الذئب الأبيض',
      cupidon: 'كيوپيد',
    },
    roleDescriptions: {
      villageois: 'قروي عادي. يحاول النجاة وكشف الذئاب عبر التصويت.',
      loup_garou: 'ذئب متنكر في هيئة قروي. يفترس ضحية كل ليلة.',
      protecteur: 'يحمي لاعباً واحداً كل ليلة من هجمات الذئاب.',
      sorciere: 'تمتلك جرعة موت وجرعة حياة. يمكنها إنقاذ أو قتل لاعباً.',
      voyante: 'تكتشف هوية لاعب واحد كل ليلة.',
      loup_blanc: 'ذئب خاص. يقتل لاعباً إضافياً في الليل دون علم باقي الذئاب.',
      cupidon: 'يربط قلبين بالحب الأبدي من أول ليلة.',
    },
    nightInstructions: {
      cupidon: 'يستيقظ ويختار لاعبَين ليكونا عاشقَين، ثم يغمض عينيه. اجعل العاشقَين يفتحان أعينهما لحظة ليتعارفا ثم يغمضانها.',
      protecteur: 'يستيقظ ويختار لاعباً يحميه هذه الليلة (لا يحمي نفس اللاعب ليلتين متتاليتين)، ثم يغمض عينيه.',
      voyante: 'تستيقظ وتشير إلى لاعب، فتريها دوره بإشارة من يدك، ثم تغمض عينيها.',
      loup_garou: 'يستيقظ الذئاب ويتفقون بصمت على ضحية، ثم يغمضون أعينهم.',
      loup_blanc: 'يستيقظ (كل ليلة زوجية فقط): له أن يقضي على أحد الذئاب أو يترك الأمر، ثم يغمض عينيه.',
      sorciere: 'تستيقظ: أرها ضحية الذئاب، فتقرر هل تستعمل جرعة الحياة أو الموت أو لا شيء، ثم تغمض عينيها.',
    },

    // Footer
    directedBy: 'إخراج Schneider_31',

    // Status
    waiting: 'انتظار',
    statusDealing: 'توزيع',
    dealt: 'تم التوزيع',

    // Game control (host tools)
    gameControl: 'سير اللعبة',
    nightN: 'الليلة {n}',
    dayN: 'النهار {n}',
    lobbyWaiting: 'تم توزيع الأوراق. ابدأ اللعبة عندما يكون الجميع جاهزاً',
    startNight: 'ابدأ الليلة {n}',
    startDay: 'ابدأ النهار',
    statWolves: 'الذئاب',
    statVillage: 'القرية',
    statAlive: 'الأحياء',
    aliveNow: 'الأحياء الآن',
    winVillage: 'يبدو أن فريق القرية فاز (مؤشر فقط)',
    winWolves: 'يبدو أن الذئاب فازت (مؤشر فقط)',
    nightGuideTitle: 'دليل الليل',
    nightGuideHint: 'نادِ الأدوار بالترتيب، واضغط على كل خطوة بعد أن تنهيها',
    nightGuideDone: 'نوديت كل الأدوار. اضغط «ابدأ النهار»',
    nightGuideEmpty: 'لا يوجد دور تناديه هذه الليلة. اضغط «ابدأ النهار»',
    customRolesNote: 'أدوار مخصصة: رتّبها حسب قواعدك',
    dayGuideTitle: 'النهار',
    dayGuide: 'أعلن من مات في الليل، ثم النقاش والتصويت. علّم المقصيين بزر الجمجمة في القائمة.',
    eliminate: 'إقصاء',
    revive: 'إعادة للحياة',
    deadLabel: 'مقصى',
    diedTitle: 'تم إقصاؤك',
    diedDesc: 'تابع اللعبة بصمت، ولا تكشف دورك إلا إذا طلب المسير ذلك',
    playerNight: 'الليلة {n}: أغمض عينيك',
    playerDay: 'النهار {n}: افتح عينيك',
    feedbackOn: 'الصوت والاهتزاز: مفعّلان',
    feedbackOff: 'الصوت والاهتزاز: متوقفان',
  },
  fr: {
    // App
    appTitle: 'Loup-Garou',
    appSubtitle: 'Distributeur de cartes',

    // Nav
    language: 'Français',

    // Home
    welcome: 'Bienvenue',
    welcomeSubtitle: 'Distributeur de cartes de rôles secrets pour le jeu Loup-Garou',
    hostGame: 'Je suis Maître',
    hostGameDesc: 'Créez une salle et distribuez les rôles aux joueurs',
    joinGame: 'Je suis Joueur',
    joinGameDesc: 'Entrez le code de la salle et attendez votre carte',
    chooseRole: 'Choisissez votre rôle',

    // Host setup
    hostName: 'Nom du Maître',
    hostNamePlaceholder: 'Entrez votre nom',
    createRoom: 'Créer la salle',
    creating: 'Création...',

    // Host dashboard
    roomCode: 'Code de la salle',
    shareCode: 'Partagez ce code avec les joueurs',
    playersJoined: 'Joueurs connectés',
    playersCount: '{count} joueur(s)',
    noPlayersYet: 'Aucun joueur pour l\'instant',
    waitingForPlayers: 'En attente des joueurs...',
    selectRoles: 'Choisissez les rôles et quantités',
    selectRolesDesc: 'Sélectionnez les rôles à distribuer aux joueurs',
    quantity: 'Quantité',
    dealCards: 'Distribuer les cartes',
    dealing: 'Distribution...',
    cardsDealt: 'Cartes distribuées !',
    dealAgain: 'Redistribuer',
    closeRoom: 'Fermer la salle',
    roleCount: 'Rôles: {roles} | Joueurs: {players}',
    mismatchWarning: 'Le nombre de rôles ne correspond pas au nombre de joueurs !',
    customRoles: 'Rôles personnalisés',
    addCustomRole: 'Ajouter un rôle personnalisé',

    // Custom role builder
    customRoleBuilder: 'Créateur de rôles personnalisés',
    customRoleTitle: 'Titre du rôle',
    customRoleTitlePlaceholder: 'Ex: Le Chasseur',
    customRoleDescription: 'Description du rôle',
    customRoleDescriptionPlaceholder: 'Décrivez le rôle brièvement',
    customRoleQuantity: 'Quantité',
    addRole: 'Ajouter le rôle',
    cancel: 'Annuler',

    // Player join
    enterRoomCode: 'Entrez le code de la salle',
    roomCodePlaceholder: '4 chiffres',
    enterName: 'Entrez votre nom',
    namePlaceholder: 'Votre nom',
    joinRoom: 'Rejoindre',
    joining: 'Connexion...',
    roomNotFound: 'Salle introuvable',
    nameRequired: 'Veuillez entrer votre nom',
    invalidCode: 'Code invalide',
    alreadyJoined: 'Déjà rejoint',
    nameTaken: 'Ce nom est déjà pris dans la salle, choisissez-en un autre',
    gameStarted: "La partie a déjà commencé. Demandez au Maître de redistribuer puis réessayez",
    resumeHost: 'Retourner à ma salle',
    resumePlayer: 'Retourner à ma carte',
    kickPlayer: 'Retirer le joueur',
    kickConfirm: 'Retirer ce joueur de la salle ?',

    // Player card
    waitingForDeal: 'En attente de la distribution des cartes...',
    hostIsDealing: 'Le maître distribue les cartes...',
    holdToReveal: 'Maintenez pour révéler la carte',
    releaseToHide: 'Relâchez pour cacher la carte',
    yourRole: 'Votre rôle',
    seenByPlayer: 'Vous avez vu votre carte',
    waitingForOthers: 'En attente des autres joueurs',
    leaveRoom: 'Quitter la salle',

    // Roles
    roles: {
      villageois: 'Villageois',
      loup_garou: 'Loup-Garou',
      protecteur: 'Protecteur',
      sorciere: 'Sorcière',
      voyante: 'Voyante',
      loup_blanc: 'Loup Blanc',
      cupidon: 'Cupidon',
    },
    roleDescriptions: {
      villageois: 'Villageois ordinaire. Tente de survivre et de démasquer les loups en votant.',
      loup_garou: 'Loup déguisé en villageois. Dévore une victime chaque nuit.',
      protecteur: 'Protège un joueur chaque nuit contre les attaques des loups.',
      sorciere: 'Possède une potion de mort et une de vie. Peut sauver ou tuer un joueur.',
      voyante: 'Découvre l\'identité d\'un joueur chaque nuit.',
      loup_blanc: 'Loup spécial. Tue un joueur supplémentaire la nuit à l\'insu des autres loups.',
      cupidon: 'Unit deux cœurs par un amour éternel dès la première nuit.',
    },
    nightInstructions: {
      cupidon: 'Se réveille et désigne deux amoureux, puis se rendort. Les amoureux ouvrent les yeux un instant pour se reconnaître.',
      protecteur: 'Se réveille et désigne un joueur à protéger cette nuit (pas deux nuits de suite le même), puis se rendort.',
      voyante: 'Se réveille et désigne un joueur ; montrez-lui son rôle d’un geste, puis elle se rendort.',
      loup_garou: 'Les loups se réveillent, désignent une victime en silence, puis se rendorment.',
      loup_blanc: 'Se réveille (une nuit sur deux seulement) : il peut éliminer un autre loup, ou personne, puis se rendort.',
      sorciere: 'Se réveille : montrez-lui la victime des loups ; elle choisit sa potion de vie, de mort, ou rien, puis se rendort.',
    },

    // Footer
    directedBy: 'Directed by Schneider_31',

    // Status
    waiting: 'Attente',
    statusDealing: 'Distribution',
    dealt: 'Distribué',

    // Game control (host tools)
    gameControl: 'Déroulement',
    nightN: 'Nuit {n}',
    dayN: 'Jour {n}',
    lobbyWaiting: 'Les cartes sont distribuées. Lancez la partie quand tout le monde est prêt',
    startNight: 'Commencer la nuit {n}',
    startDay: 'Commencer le jour',
    statWolves: 'Loups',
    statVillage: 'Village',
    statAlive: 'Vivants',
    aliveNow: 'Encore en vie',
    winVillage: 'Le village semble avoir gagné (indicatif)',
    winWolves: 'Les loups semblent avoir gagné (indicatif)',
    nightGuideTitle: 'Guide de la nuit',
    nightGuideHint: 'Appelez les rôles dans l’ordre et touchez chaque étape une fois terminée',
    nightGuideDone: 'Tous les rôles ont été appelés. Appuyez sur « Commencer le jour »',
    nightGuideEmpty: 'Aucun rôle à appeler cette nuit. Appuyez sur « Commencer le jour »',
    customRolesNote: 'Rôles personnalisés : placez-les selon vos règles',
    dayGuideTitle: 'Le jour',
    dayGuide: 'Annoncez les morts de la nuit, puis débat et vote. Marquez les éliminés avec le bouton crâne de la liste.',
    eliminate: 'Éliminer',
    revive: 'Réanimer',
    deadLabel: 'Éliminé',
    diedTitle: 'Vous êtes éliminé(e)',
    diedDesc: 'Continuez à suivre la partie en silence ; ne révélez votre rôle que si le Maître le demande',
    playerNight: 'Nuit {n} : fermez les yeux',
    playerDay: 'Jour {n} : ouvrez les yeux',
    feedbackOn: 'Son et vibration : activés',
    feedbackOff: 'Son et vibration : coupés',
  },
} as const;

type FlatTranslationKey = keyof Omit<typeof translations.fr, 'roles' | 'roleDescriptions' | 'nightInstructions'>;

export type TranslationKey = FlatTranslationKey;
