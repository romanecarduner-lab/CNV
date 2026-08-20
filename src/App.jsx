import React, { useState, useMemo, useRef, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Jetons de design                                                    */
/* ------------------------------------------------------------------ */

const T = {
  nuit: "#16222E",
  encre: "#3A444E",
  gris: "#7C858C",
  trait: "#E7E3DC",
  brume: "#EFEBE4",
  fond: "#F9F7F3",
  papier: "#FFFFFF",
  soi: "#6E2A4C",
  autre: "#1F5C46",
  dire: "#B0701D",
};

const ORIENTATIONS = {
  soi: {
    cle: "soi",
    couleur: T.soi,
    teinte: "#F8F0F4",
    bord: "#EFE0E9",
    medaille: "#F1E2EA",
    porte: "Ça remue en moi",
    sousPorte: "Je démêle ce qui se passe à l'intérieur",
    nom: "Auto-empathie",
    vers: "moi",
  },
  autre: {
    cle: "autre",
    couleur: T.autre,
    teinte: "#EDF3EE",
    bord: "#DDE8DF",
    medaille: "#DEE9E0",
    porte: "Je veux comprendre quelqu'un",
    sousPorte: "Je rejoins sa colline pour voir ce qui s'y vit",
    nom: "Empathie",
    vers: "l'autre",
  },
  dire: {
    cle: "dire",
    couleur: T.dire,
    teinte: "#FDF5EB",
    bord: "#F5E6D2",
    medaille: "#F8E9D5",
    porte: "J'ai quelque chose à dire",
    sousPorte: "Je prépare ce que je vais exprimer",
    nom: "Expression",
    vers: "l'autre",
  },
};

/* ------------------------------------------------------------------ */
/*  Repérage : est-ce que ça bout encore ?                              */
/* ------------------------------------------------------------------ */

const MOTS_JUGEMENT = [
  "toujours", "jamais", "exprès", "n'importe quoi", "évidemment", "franchement",
  "ridicule", "insupportable", "égoïste", "incapable", "s'en fiche", "se fiche",
  "méchant", "nul", "débile", "immature", "toxique", "irrespectueux", "malhonnête",
  "aucun respect", "manque de respect", "comme d'habitude", "encore une fois",
];

const FAUX_SENTIMENTS = [
  "rejeté", "rejetée", "ignoré", "ignorée", "trahi", "trahie", "manipulé", "manipulée",
  "agressé", "agressée", "abandonné", "abandonnée", "incompris", "incomprise",
  "rabaissé", "rabaissée", "humilié", "humiliée", "méprisé", "méprisée", "utilisé", "utilisée",
];

const SENTIMENTS_INTENSES = [
  "en colère", "exaspéré", "à cran", "épuisé", "débordé", "impuissant", "effrayé", "abattu",
];

const FEMININ = {
  "à cran": "à cran",
  "sur mes gardes": "sur mes gardes",
  inquiet: "inquiète",
  anxieux: "anxieuse",
  las: "lasse",
  confus: "confuse",
  joyeux: "joyeuse",
  fier: "fière",
  curieux: "curieuse",
  "plein d'énergie": "pleine d'énergie",
};

function accorder(mot, feminin) {
  if (!feminin) return mot;
  if (FEMININ[mot]) return FEMININ[mot];
  return mot.endsWith("e") ? mot : mot + "e";
}

function mesurerCharge(rep) {
  const texte = (rep.obs || "").toLowerCase();
  let charge = 0;
  const trouves = MOTS_JUGEMENT.filter((m) => texte.includes(m));
  charge += Math.min(2, trouves.length);
  if (FAUX_SENTIMENTS.some((m) => texte.includes(m))) charge += 1;
  if (rep.sentiment.some((s) => SENTIMENTS_INTENSES.includes(s))) charge += 1;
  if (rep.sentiment.length >= 3) charge += 1;
  return charge;
}

/* ------------------------------------------------------------------ */
/*  Contenu des quatre étapes, par orientation                          */
/* ------------------------------------------------------------------ */

const ETAPES = {
  soi: [
    {
      id: "obs",
      titre: "Qu'est-ce qui s'est passé ?",
      invite: "Raconte la scène comme une caméra l'aurait filmée.",
      champ: "texte",
      amorce: "Hier soir, quand…",
      exemple:
        "Hier soir, on s'était dit lundi qu'on dînerait ensemble jeudi. À 19 h 30 j'ai mis la table pour deux. Il est rentré à 21 h 10, sans message entre-temps, et il a dit « désolé, réunion » en posant ses clés.",
      role: "On sépare le fait de l'histoire qu'on se raconte dessus. Le fait, tout le monde serait d'accord dessus.",
      piege: "« Il s'en fiche de moi » n'est pas un fait, c'est une interprétation. Une caméra ne filme pas « s'en ficher ».",
      commentFaire:
        "Rembobine la scène et raconte-la comme un téléphone posé sur la table l'aurait enregistrée : quand, quels mots, quels gestes. Tout ce qui ne se voit ni ne s'entend reste dehors pour l'instant.",
    },
    {
      id: "sentiment",
      titre: "Qu'est-ce que je ressens ?",
      invite: "Accueille ce qui est là, sans le justifier.",
      champ: "sentiments",
      exemple:
        "Au moment où j'ai entendu la clé dans la serrure : la gorge serrée, le ventre dur. Si je cherche les mots : triste, tendue. Et seule, alors qu'il était là, dans la pièce.",
      role: "Le sentiment est le signal. Il ne dit rien de la faute de quelqu'un, il dit l'état où je suis.",
      piege: "« Je me sens abandonnée » parle de l'autre, pas de moi. Dessous, il y a peut-être : triste, inquiète.",
      commentFaire:
        "Cherche d'abord dans le corps, dix secondes : gorge serrée, ventre noué, épaules lourdes, chaleur. Pose le mot ensuite sur cette sensation-là, pas sur ce que l'autre a fait.",
    },
    {
      id: "besoin",
      titre: "De quoi ai-je besoin ?",
      invite: "Cherche ce qui est vivant dessous, pas ce que l'autre devrait faire.",
      champ: "besoins",
      exemple:
        "Ce n'est pas le retard en soi. C'est que ce dîner était le seul moment de la semaine où on est tous les deux. Ce que je trouve dessous : du lien, et de la considération — être compté dans son organisation à lui.",
      role: "Le besoin est universel. Il ne nomme ni personne, ni action, ni moment.",
      piege: "« J'ai besoin qu'il me prévienne » est déjà une solution. Le besoin dessous : la sécurité, la considération.",
      commentFaire:
        "Demande-toi ce qui te manque, là, maintenant. Puis vérifie le mot trouvé : s'il contient un nom de personne, une action ou une date, descends encore d'un cran.",
    },
    {
      id: "demande",
      titre: "Qu'est-ce que je peux faire pour moi, maintenant ?",
      invite: "Un geste à ta portée, dans l'heure qui vient.",
      champ: "texte",
      amorce: "Là, tout de suite, je…",
      exemple:
        "Ce soir je ne relance pas la discussion, je suis trop à vif. Je m'accorde vingt minutes à lire dans la chambre. Demain matin, je lui proposerai qu'on refixe un dîner et qu'on se dise comment on se prévient.",
      role: "L'auto-empathie se termine par soi, pas par l'autre. On voit souvent, à ce moment-là, que l'urgence est retombée.",
      piege: "Si la seule chose qui te vient dépend entièrement de quelqu'un d'autre, c'est que le besoin n'est pas encore trouvé.",
      commentFaire:
        "Cherche un geste à ta portée dans l'heure qui vient, qui ne dépend de l'accord de personne. Boire un verre d'eau, écrire trois lignes, appeler quelqu'un, remettre la conversation à demain.",
    },
  ],
  autre: [
    {
      id: "obs",
      titre: "Qu'a-t-il ou elle dit ou fait ?",
      invite: "Les mots exacts, le geste précis.",
      champ: "texte",
      amorce: "On parlait de… quand…",
      exemple:
        "Mardi en réunion, on passait en revue le planning de juin qu'elle avait préparé. J'ai proposé de repousser le lancement de trois semaines. Elle a dit « laisse tomber », elle a fermé son carnet et elle est sortie avant la fin de la réunion.",
      role: "On repart du fait pour ne pas deviner à partir de son propre film.",
      piege: "« Elle m'a agressé » raconte ton vécu. Ici, on cherche ce qu'un micro aurait enregistré.",
      commentFaire:
        "Repasse la scène au ralenti et garde seulement les mots prononcés et ce qu'une caméra aurait filmé. Ton commentaire, tu le mets de côté le temps de l'exercice.",
    },
    {
      id: "sentiment",
      titre: "Qu'est-ce qu'il ou elle pourrait ressentir ?",
      invite: "Une hypothèse, pas un diagnostic.",
      champ: "sentiments",
      exemple:
        "Si j'avais passé trois semaines sur un planning et qu'on proposait de tout décaler en deux phrases, je crois que je serais découragée. Peut-être en colère aussi. Et sans doute fatiguée, parce que ce n'est pas la première fois ce trimestre.",
      role: "On se trompe souvent, et ce n'est pas grave. Chercher est déjà un cadeau ; on vérifiera à la fin.",
      piege: "Deviner pour avoir raison. L'empathie n'est pas une enquête, c'est une main tendue.",
      commentFaire:
        "Mets-toi à sa place : si c'était moi qui venais de dire ça, qu'est-ce qui vivrait en moi ? Garde le conditionnel, « peut-être », « sans doute » : c'est ce qui laisse l'hypothèse ouverte.",
    },
    {
      id: "besoin",
      titre: "De quoi aurait-il ou elle besoin ?",
      invite: "Le besoin, pas le reproche qu'il t'adresse.",
      champ: "besoins",
      exemple:
        "Peut-être d'être entendue sur le travail déjà fait. Peut-être de la considération pour son temps. Peut-être aussi de la clarté sur qui décide vraiment de ces dates — parce que si ça se rediscute à chaque fois, préparer ne sert à rien.",
      role: "Derrière chaque parole dure, il y a un besoin qui cherche à se faire entendre.",
      piege: "Traduire son besoin en ce que tu devrais faire. Là, tu t'occupes déjà de toi, plus de lui.",
      commentFaire:
        "Écoute le reproche comme un « oui » maladroit : de quoi cette personne a-t-elle tellement envie pour parler comme ça ? Cherche un mot qui vaudrait aussi pour n'importe qui d'autre à sa place.",
    },
    {
      id: "demande",
      titre: "Tends-lui ta question",
      invite: "Elle est déjà écrite. Ce qui reste à préparer, c'est ce que tu feras de sa réponse.",
      champ: "apercu",
      exemple: "",
      role: "Vérifier n'est pas faire confirmer. Tu tends une hypothèse et tu la laisses être corrigée : c'est là que l'autre existe vraiment dans l'échange.",
      piege: "Enchaîner sur ton propre avis dès qu'elle a répondu. Elle vient de s'ouvrir : mieux vaut refaire un tour d'écoute avant de parler de toi.",
      commentFaire:
        "Pose la question telle quelle, puis tais-toi. Trois respirations, sans meubler. C'est souvent dans ce silence que la personne trouve elle-même ce qu'elle ressent.",
      apres: [
        {
          cas: "« Oui, c'est ça. »",
          quoi: "N'ajoute rien. Reste là. C'est fait, et c'est souvent tout ce qui était nécessaire.",
        },
        {
          cas: "« Non, pas du tout. »",
          quoi: "La meilleure réponse possible. Demande-lui ce qui serait plus juste, et repars de ce qu'elle dit.",
        },
        {
          cas: "Un silence, un haussement d'épaules.",
          quoi: "Laisse le silence. Il travaille souvent mieux qu'une deuxième question.",
        },
      ],
    },
  ],
  dire: [
    {
      id: "obs",
      titre: "Quel fait précis veux-tu évoquer ?",
      invite: "Une seule situation, datée, observable.",
      champ: "texte",
      amorce: "Mardi, pendant que…",
      exemple:
        "Mardi en comité, je présentais le budget. Au moment où j'expliquais la ligne « déplacements », tu as repris la parole avant que je finisse ma phrase, et tu as enchaîné sur le sujet suivant. C'est arrivé deux fois dans la même réunion.",
      role: "C'est la porte d'entrée : si elle est neutre, l'autre peut la franchir sans se défendre.",
      piege: "« Toujours » et « jamais » referment la porte avant même d'avoir commencé.",
      commentFaire:
        "Choisis une seule scène et décris-la comme une caméra : un jour, une heure, une phrase entendue, un geste vu. Si tu ne peux pas la filmer, c'est que tu racontes déjà ton interprétation.",
    },
    {
      id: "sentiment",
      titre: "Qu'est-ce que tu ressens ?",
      invite: "Ce qui se passe en toi, pas ce qu'il ou elle t'a fait.",
      champ: "sentiments",
      exemple:
        "Sur le moment : chaud aux joues, la voix qui monte d'un ton. Agacé, clairement. Et en sortant de la salle, découragé — l'envie de ne plus préparer ces présentations.",
      role: "Dire son sentiment, c'est se rendre visible. C'est ce qui rend le message recevable.",
      piege: "« Je me sens rabaissé » est une accusation déguisée en sentiment. Dessous : peut-être de la colère, de la tristesse.",
      commentFaire:
        "Commence par « je » et vérifie qu'aucun mot ne désigne un coupable. Si le mot pourrait servir à accuser, cherche celui qui se cache dessous.",
    },
    {
      id: "besoin",
      titre: "Quel besoin est vivant en toi ?",
      invite: "Ce à quoi tu tiens, indépendamment de cette personne.",
      champ: "besoins",
      exemple:
        "De la considération pour le travail préparé en amont. Et de contribuer pour de bon : être dans la salle et ne pas pouvoir aller au bout d'une idée, ça ne me suffit pas.",
      role: "Le besoin est ce qui rend le message universel. C'est là que l'autre peut se reconnaître.",
      piege: "Un besoin qui contient le nom de quelqu'un n'est pas un besoin.",
      commentFaire:
        "Prends le mot que tu as trouvé et enlève mentalement la personne concernée : s'il tient encore debout tout seul, c'est un besoin. Sinon, c'est encore une attente à son égard.",
    },
    {
      id: "demande",
      titre: "Que demandes-tu, concrètement ?",
      invite: "Faisable, maintenant ou à une date précise, et refusable.",
      champ: "texte",
      amorce: "Serais-tu d'accord pour…",
      exemple:
        "La prochaine fois qu'on présente à deux, serais-tu d'accord pour noter tes remarques et me les donner quand j'ai terminé ma partie ? On pourrait essayer jeudi et voir ce que ça donne.",
      role: "Une demande se reconnaît à une chose : tu es prêt à entendre non, et à continuer la conversation.",
      piege: "Si le non déclenche en toi du reproche ou de la bouderie, ce n'était pas une demande mais une exigence.",
      commentFaire:
        "Formule une action précise, positive et datée : quoi, quand, avec qui. Puis fais le test du non : si tu ne peux pas l'entendre sans te fermer, ce n'est pas encore une demande.",
    },
  ],
};

const ETAPE_GARDER = {
  id: "demande",
  titre: "Qu'est-ce que ça change pour toi ?",
  invite: "Depuis sa colline, ta propre scène a peut-être changé de forme.",
  champ: "texte",
  amorce: "Depuis que j'ai imaginé…",
  exemple:
    "Depuis que j'ai imaginé ses trois semaines de travail, ma colère est retombée d'un cran. Je n'ai plus besoin d'avoir raison sur cette date. Je peux attendre lundi pour lui en reparler, et commencer par lui demander comment elle voit les choses.",
  role: "L'empathie silencieuse est complète en soi. Comprendre ce qui vit chez quelqu'un suffit souvent à faire retomber ce qui pesait, sans qu'un mot soit échangé.",
  commentFaire:
    "Relis ce que tu as trouvé chez elle ou lui, puis reviens à toi : est-ce que quelque chose s'est desserré ? Est-ce que la scène a la même couleur qu'il y a cinq minutes ? Écris ce qui reste, même si c'est « rien n'a bougé » — c'est une information aussi.",
  piege:
    "Se forcer à trouver que tout va mieux. Si la colère est toujours là, c'est sans doute toi qui as besoin d'empathie avant de pouvoir en donner.",
};

/* ------------------------------------------------------------------ */
/*  Vocabulaire                                                         */
/* ------------------------------------------------------------------ */

const SENTIMENTS_MANQUE = {
  "Colère, agitation": ["agacé", "irrité", "en colère", "exaspéré", "tendu", "à cran", "frustré"],
  Tristesse: ["triste", "découragé", "abattu", "seul", "nostalgique", "touché"],
  Peur: ["inquiet", "anxieux", "sur mes gardes", "effrayé", "hésitant"],
  Fatigue: ["fatigué", "épuisé", "débordé", "lourd", "las"],
  "Gêne, confusion": ["mal à l'aise", "confus", "perdu", "gêné", "impuissant", "déçu"],
};

const SENTIMENTS_NOURRI = {
  Joie: ["joyeux", "enthousiaste", "pétillant", "ravi", "fier"],
  Paix: ["serein", "apaisé", "soulagé", "confiant", "en sécurité", "détendu"],
  Élan: ["curieux", "inspiré", "plein d'énergie", "reconnaissant", "ému", "tendre"],
};

const BESOINS = {
  "Bien-être physique": ["repos", "mouvement", "douceur", "santé", "espace", "calme"],
  "Sécurité": ["sécurité", "confiance", "stabilité", "clarté", "cohérence", "prévisibilité"],
  "Lien": ["écoute", "empathie", "lien", "appartenance", "considération", "respect", "soutien", "réciprocité", "intimité"],
  "Autonomie": ["choix", "liberté", "autonomie", "espace à moi", "rythme"],
  "Sens": ["contribuer", "apprendre", "créer", "beauté", "célébration", "grandir", "être utile"],
  "Reconnaissance": ["être vu", "être compris", "être reconnu", "équité", "justice"],
};

/* ------------------------------------------------------------------ */
/*  Entraînement                                                        */
/* ------------------------------------------------------------------ */

const EXERCICES = [
  {
    famille: "Les distinctions de base",
    type: "binaire",
    titre: "Fait ou interprétation ?",
    consigne: "Une caméra pourrait-elle le filmer ?",
    choix: ["Un fait", "Une interprétation"],
    items: [
      { phrase: "Tu es arrivé à 9 h 20.", bonne: 0, mot: "Une heure se filme." },
      { phrase: "Tu ne respectes pas mon travail.", bonne: 1, mot: "« Respecter » est une évaluation, pas une image." },
      { phrase: "Tu as laissé trois messages sans réponse.", bonne: 0, mot: "Trois messages se comptent." },
      { phrase: "Tu es toujours en retard.", bonne: 1, mot: "« Toujours » généralise : c'est déjà un jugement." },
      { phrase: "Tu as haussé la voix pendant la réunion.", bonne: 0, mot: "Le volume s'entend." },
      { phrase: "Elle fait tout pour m'éviter.", bonne: 1, mot: "« Pour » prête une intention. On ne filme pas les intentions." },
      { phrase: "Il a dit « on verra » et il a changé de sujet.", bonne: 0, mot: "Des mots exacts et un enchaînement observable." },
      { phrase: "Tu ne fais aucun effort à la maison.", bonne: 1, mot: "« Aucun effort » est une évaluation globale. Que s'est-il passé, précisément, cette semaine ?" },
    ],
  },
  {
    famille: "Les distinctions de base",
    type: "binaire",
    titre: "Sentiment ou pensée sur l'autre ?",
    consigne: "Est-ce que ça parle de moi, ou de ce que l'autre m'aurait fait ?",
    choix: ["Un sentiment", "Une pensée sur l'autre"],
    items: [
      { phrase: "Je me sens rejeté.", bonne: 1, mot: "Ça accuse l'autre. Dessous : peut-être triste, seul." },
      { phrase: "Je suis inquiet.", bonne: 0, mot: "C'est un état intérieur, il n'accuse personne." },
      { phrase: "Je me sens manipulée.", bonne: 1, mot: "C'est une interprétation. Dessous : peut-être méfiance, colère." },
      { phrase: "Je me sens soulagé.", bonne: 0, mot: "Personne n'est mis en cause." },
      { phrase: "Je me sens incompris.", bonne: 1, mot: "Ça décrit ce que l'autre n'a pas fait. Dessous : découragement, tristesse." },
      { phrase: "Je suis épuisée.", bonne: 0, mot: "Le corps parle, et lui seul." },
      { phrase: "Je me sens trahi.", bonne: 1, mot: "Un verdict sur l'autre. Dessous : sans doute de la colère, et beaucoup de tristesse." },
      { phrase: "Je me sens tendu depuis ce matin.", bonne: 0, mot: "Un état, situé dans le temps, sans coupable." },
    ],
  },
  {
    famille: "Les distinctions de base",
    type: "binaire",
    titre: "Besoin ou stratégie ?",
    consigne: "Est-ce que ça pourrait se satisfaire de mille façons différentes ?",
    choix: ["Un besoin", "Une stratégie"],
    items: [
      { phrase: "J'ai besoin que tu m'appelles ce soir.", bonne: 1, mot: "C'est une seule façon. Le besoin dessous : le lien." },
      { phrase: "J'ai besoin de considération.", bonne: 0, mot: "Mille gestes peuvent y répondre." },
      { phrase: "J'ai besoin de deux semaines de vacances.", bonne: 1, mot: "Le besoin dessous : repos, espace." },
      { phrase: "J'ai besoin de clarté.", bonne: 0, mot: "Aucun nom, aucune action, aucune date." },
      { phrase: "J'ai besoin que tu ranges la cuisine.", bonne: 1, mot: "Le besoin dessous : ordre, équité, peut-être soutien." },
      { phrase: "J'ai besoin de contribuer à quelque chose qui compte.", bonne: 0, mot: "Universel : n'importe qui pourrait le dire." },
      { phrase: "J'ai besoin que tu me dises que tu m'aimes.", bonne: 1, mot: "Une formule précise, attendue d'une personne précise. Dessous : sécurité, lien." },
      { phrase: "J'ai besoin de sécurité.", bonne: 0, mot: "Un besoin nu, qui n'impose rien à personne." },
    ],
  },
  {
    famille: "Les distinctions de base",
    type: "binaire",
    titre: "Demande ou exigence ?",
    consigne: "Qu'est-ce qui se passerait en moi si l'autre disait non ?",
    choix: ["Une demande", "Une exigence"],
    items: [
      { phrase: "Serais-tu d'accord pour qu'on en reparle jeudi soir ?", bonne: 0, mot: "Concret, daté, et refusable sans drame." },
      { phrase: "Si tu m'aimais, tu ferais l'effort.", bonne: 1, mot: "Le refus est puni d'avance : il prouverait qu'on n'aime pas." },
      { phrase: "J'aimerais que tu sois plus attentif.", bonne: 1, mot: "Ni observable ni réalisable : personne ne sait quoi faire de ça." },
      { phrase: "Est-ce que tu peux me dire ce que tu entends dans ce que je viens de dire ?", bonne: 0, mot: "Une demande de connexion : elle vérifie le lien avant l'action." },
      { phrase: "Tu ranges ta chambre, sinon pas d'écran ce week-end.", bonne: 1, mot: "La sanction est annoncée. C'est peut-être nécessaire, mais ce n'est pas une demande." },
      { phrase: "Ça t'irait de prendre les enfants mardi ? Sinon je trouverai autre chose.", bonne: 0, mot: "Le non est prévu, et il ne casse rien." },
    ],
  },
  {
    famille: "Chercher plus loin",
    type: "choix",
    titre: "Quel besoin, dessous ?",
    consigne: "Sous la phrase, qu'est-ce qui cherche à se faire entendre ?",
    items: [
      {
        phrase: "Tu ne m'écoutes jamais quand je te raconte ma journée.",
        options: [
          { texte: "Que tu poses ton téléphone", bonne: false, mot: "C'est une stratégie : une seule façon parmi d'autres." },
          { texte: "Partager ce qui compte pour moi", bonne: true, mot: "Universel, et vrai même si l'autre n'est pas là." },
          { texte: "Que tu sois moins égoïste", bonne: false, mot: "Un jugement déguisé en besoin." },
          { texte: "Du repos", bonne: false, mot: "Un vrai besoin, mais pas celui que la scène touche." },
        ],
      },
      {
        phrase: "Je ne supporte plus qu'on décide sans me demander mon avis.",
        options: [
          { texte: "Être consulté avant chaque décision", bonne: false, mot: "Une stratégie précise, donc négociable — mais pas le besoin." },
          { texte: "Que les autres arrêtent", bonne: false, mot: "Ça dit ce que les autres doivent faire, pas ce qui est vivant en moi." },
          { texte: "Compter dans ce qui se décide", bonne: true, mot: "Considération, participation : ça peut se nourrir de mille manières." },
          { texte: "De la tranquillité", bonne: false, mot: "Plausible, mais la phrase parle de place, pas de calme." },
        ],
      },
      {
        phrase: "Il ne me remercie jamais pour ce que je fais à la maison.",
        options: [
          { texte: "Qu'il dise merci le soir", bonne: false, mot: "Une formule attendue d'une personne : une stratégie." },
          { texte: "Que mon travail soit vu", bonne: true, mot: "Reconnaissance : le besoin tient debout tout seul." },
          { texte: "Qu'il soit reconnaissant", bonne: false, mot: "Ça décrit ce que l'autre doit ressentir. On ne peut pas l'exiger." },
          { texte: "De la liberté", bonne: false, mot: "Un besoin réel, mais hors sujet ici." },
        ],
      },
      {
        phrase: "J'en ai marre qu'elle change les horaires à la dernière minute.",
        options: [
          { texte: "Qu'elle prévienne 48 h à l'avance", bonne: false, mot: "Excellente demande — mais c'est déjà la solution, pas le besoin." },
          { texte: "Qu'elle soit plus professionnelle", bonne: false, mot: "Une étiquette posée sur quelqu'un." },
          { texte: "Pouvoir m'organiser", bonne: true, mot: "Prévisibilité, autonomie : ça vaudrait pour n'importe qui." },
          { texte: "De l'affection", bonne: false, mot: "Rien dans la scène ne pointe vers là." },
        ],
      },
      {
        phrase: "Mon fils claque la porte de sa chambre dès que je pose une question.",
        options: [
          { texte: "Qu'il réponde poliment", bonne: false, mot: "Une exigence de comportement, pas un besoin." },
          { texte: "Qu'il ait du respect pour moi", bonne: false, mot: "« Du respect » sert souvent à nommer l'obéissance qu'on attend." },
          { texte: "Garder le lien avec lui", bonne: true, mot: "C'est ce qui est réellement en jeu, et ça ne dépend pas d'une porte." },
          { texte: "Du silence", bonne: false, mot: "Il l'a, justement, et ça ne règle rien." },
        ],
      },
      {
        phrase: "Elle m'a corrigé devant toute l'équipe.",
        options: [
          { texte: "Qu'elle s'excuse", bonne: false, mot: "Une réparation possible, choisie parmi d'autres." },
          { texte: "Être traité avec ménagement devant les autres", bonne: true, mot: "Considération, dignité : un besoin partagé par tous les humains." },
          { texte: "Qu'elle me parle en privé la prochaine fois", bonne: false, mot: "Une très bonne demande, et une stratégie." },
          { texte: "De l'apprentissage", bonne: false, mot: "Elle apportait peut-être une information utile : ce n'est pas là que ça coince." },
        ],
      },
    ],
  },
  {
    famille: "Chercher plus loin",
    type: "choix",
    titre: "Qu'est-ce qui manque ?",
    consigne: "Le message est presque complet. Quelle étape n'y est pas ?",
    items: [
      {
        phrase: "Quand tu rentres tard, je me sens seule. Est-ce que tu peux me prévenir ?",
        options: [
          { texte: "Le fait", bonne: false, mot: "« Rentrer tard » reste vague, mais il y a bien une observation." },
          { texte: "Le sentiment", bonne: false, mot: "« Seule » est là." },
          { texte: "Le besoin", bonne: true, mot: "Rien ne dit ce qui est en jeu : le lien ? la sécurité ? Sans lui, la demande ressemble à une consigne." },
          { texte: "La demande", bonne: false, mot: "Elle est présente et concrète." },
        ],
      },
      {
        phrase: "Tu ne penses jamais à moi. Je suis triste, j'ai besoin de considération, tu peux m'appeler en partant ?",
        options: [
          { texte: "Le fait", bonne: true, mot: "« Tu ne penses jamais à moi » est un verdict. Que s'est-il passé, précisément, et quand ?" },
          { texte: "Le sentiment", bonne: false, mot: "« Triste » est bien un sentiment." },
          { texte: "Le besoin", bonne: false, mot: "La considération est nommée." },
          { texte: "La demande", bonne: false, mot: "Appeler en partant : c'est concret." },
        ],
      },
      {
        phrase: "Hier tu es rentré à 21 h sans message. J'ai besoin de lien. Tu peux m'écrire quand tu es retenu ?",
        options: [
          { texte: "Le fait", bonne: false, mot: "Une heure, un message absent : c'est filmable." },
          { texte: "Le sentiment", bonne: true, mot: "On ne sait pas ce que ça a fait. Sans ça, la phrase devient un règlement intérieur." },
          { texte: "Le besoin", bonne: false, mot: "Le lien est nommé." },
          { texte: "La demande", bonne: false, mot: "Écrire quand on est retenu : réalisable." },
        ],
      },
      {
        phrase: "Hier tu es rentré à 21 h sans message. Je me suis sentie seule, parce que j'ai besoin de lien.",
        options: [
          { texte: "Le fait", bonne: false, mot: "Il est précis." },
          { texte: "Le sentiment", bonne: false, mot: "Il est dit, et sans reproche." },
          { texte: "Le besoin", bonne: false, mot: "Il est nommé." },
          { texte: "La demande", bonne: true, mot: "Sans elle, l'autre reste avec l'inconfort et sans rien à en faire. C'est souvent là que naît la culpabilité." },
        ],
      },
      {
        phrase: "Ce matin j'ai vu la vaisselle de trois jours. Je me sens découragée, j'ai besoin de soutien. Tu pourrais faire un effort ?",
        options: [
          { texte: "Le fait", bonne: false, mot: "Trois jours de vaisselle : c'est observable." },
          { texte: "Le sentiment", bonne: false, mot: "« Découragée » est juste." },
          { texte: "Le besoin", bonne: false, mot: "Le soutien est nommé." },
          { texte: "Une demande concrète", bonne: true, mot: "« Faire un effort » n'est pas réalisable : personne ne sait quel geste ferait l'affaire. Quoi, quand, comment ?" },
        ],
      },
    ],
  },
  {
    famille: "Chercher plus loin",
    type: "choix",
    titre: "Répondre sans couper le lien",
    consigne: "Quelle réponse reste avec la personne ?",
    items: [
      {
        phrase: "J'en ai marre, je n'y arrive plus avec ma fille.",
        options: [
          { texte: "Tu devrais poser des limites plus tôt dans la journée.", bonne: false, mot: "Le conseil. Il déplace l'attention vers celui qui parle." },
          { texte: "Ah, c'était pareil avec mon fils à cet âge.", bonne: false, mot: "L'histoire personnelle. Elle prend la place." },
          { texte: "Mais non, tu es une très bonne mère.", bonne: false, mot: "La consolation. Elle nie ce qui vient d'être dit." },
          { texte: "Tu es épuisée, et tu aurais besoin de sentir que ce que tu fais compte ?", bonne: true, mot: "Une hypothèse tendue, qui laisse la personne au centre." },
        ],
      },
      {
        phrase: "Mon chef a validé mon projet, puis il l'a présenté comme le sien.",
        options: [
          { texte: "Il faut que tu ailles lui en parler.", bonne: false, mot: "Le conseil arrive avant que la personne ait fini d'être entendue." },
          { texte: "C'est vraiment un manipulateur.", bonne: false, mot: "Prendre parti soulage sur le moment et ferme la réflexion." },
          { texte: "Tu es en colère, tu aurais eu besoin que ton travail soit reconnu ?", bonne: true, mot: "Sentiment et besoin, proposés en question." },
          { texte: "Au moins le projet est passé, c'est déjà ça.", bonne: false, mot: "Le côté positif forcé : ça referme la porte." },
        ],
      },
      {
        phrase: "Je crois que je vais tout arrêter, la formation, tout.",
        options: [
          { texte: "Attends, ne prends pas de décision maintenant.", bonne: false, mot: "Rassurer, c'est encore décider pour l'autre." },
          { texte: "Qu'est-ce qui s'est passé cette semaine ?", bonne: false, mot: "L'enquête. Ça peut venir, mais plus tard." },
          { texte: "Tu es découragée là, tu aurais besoin de souffler ?", bonne: true, mot: "On reste sur ce qui est vivant maintenant." },
          { texte: "Tu as déjà fait la moitié, ce serait dommage.", bonne: false, mot: "L'argument. Il oppose au lieu d'accompagner." },
        ],
      },
      {
        phrase: "Papa, personne ne veut jouer avec moi à la récré.",
        options: [
          { texte: "Va voir les autres et propose un jeu, tu verras.", bonne: false, mot: "La solution avant l'écoute. L'enfant apprend qu'on ne l'écoute pas." },
          { texte: "Tu es triste, tu aurais aimé qu'on t'appelle pour jouer ?", bonne: true, mot: "Simple, à sa portée, et vérifiable par lui." },
          { texte: "Mais si, hier tu m'as dit que tu avais joué au foot.", bonne: false, mot: "Corriger les faits ferme la conversation." },
          { texte: "Ne t'inquiète pas, ça va s'arranger.", bonne: false, mot: "L'apaisement rapide : il dit surtout notre propre inconfort." },
        ],
      },
      {
        phrase: "Tu n'as même pas remarqué que j'avais tout rangé.",
        options: [
          { texte: "Si, j'ai vu, mais je n'ai rien dit.", bonne: false, mot: "Se défendre. La conversation devient un procès." },
          { texte: "Tu n'as qu'à me le dire quand tu fais quelque chose.", bonne: false, mot: "Renvoyer la responsabilité." },
          { texte: "Tu es déçue, tu aurais eu besoin que ce travail soit vu ?", bonne: true, mot: "Écouter d'abord, même quand la phrase nous vise." },
          { texte: "Merci alors, c'est gentil.", bonne: false, mot: "Le remerciement réflexe passe à côté de ce qui vient d'être dit." },
        ],
      },
    ],
  },
  {
    famille: "Reformuler",
    type: "traduction",
    titre: "Traduire un jugement",
    consigne: "Écris ta version, puis compare. Il n'y a pas une seule bonne réponse.",
    items: [
      {
        phrase: "Il est complètement irresponsable.",
        modele:
          "Il a oublié deux fois ce mois-ci de récupérer les enfants à l'heure. Ça m'inquiète, j'ai besoin de fiabilité pour m'organiser.",
        pourquoi: "Le fait rend le désaccord discutable. Le besoin dit ce qui est réellement en jeu.",
      },
      {
        phrase: "Elle se fiche complètement de ce que je pense.",
        modele:
          "Hier en réunion, j'ai donné mon avis et elle a enchaîné sans y répondre. Je me suis senti agacé, j'aurais eu besoin que ma proposition soit prise en compte.",
        pourquoi: "« Se fiche de » prête une intention. Ce qu'on a vu, c'est un enchaînement.",
      },
      {
        phrase: "Tu ne fais jamais rien à la maison.",
        modele:
          "Cette semaine, j'ai fait les courses et les repas tous les soirs. Je suis épuisée, j'ai besoin de partager la charge.",
        pourquoi: "« Jamais » est réfutable en une phrase, et la conversation part sur la comptabilité.",
      },
      {
        phrase: "Mon ado est devenu insupportable.",
        modele:
          "Ces trois derniers matins, il a répondu « lâche-moi » quand je lui ai demandé s'il avait mangé. Je me sens démunie, j'ai besoin de garder un contact avec lui.",
        pourquoi: "L'étiquette colle à la personne. Le fait, lui, décrit un moment — et un moment peut changer.",
      },
      {
        phrase: "Ils nous prennent vraiment pour des imbéciles.",
        modele:
          "La date de livraison a été repoussée trois fois sans explication. Je suis en colère, j'ai besoin de clarté sur ce qui se passe.",
        pourquoi: "Le « ils » collectif empêche toute réponse. Un fait daté ouvre une discussion possible.",
      },
      {
        phrase: "Je me sens humiliée par sa remarque.",
        modele:
          "Quand elle a dit devant l'équipe « ça, c'est du travail d'amateur », je me suis sentie honteuse puis en colère. J'aurais eu besoin de considération devant les autres.",
        pourquoi: "« Humiliée » décrit ce que l'autre m'aurait fait. Dessous, il y a des sentiments qui m'appartiennent.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Théorie                                                             */
/* ------------------------------------------------------------------ */

const THEORIE = [
  {
    section: "Les fondements",
    entrees: [
      {
        titre: "D'où ça vient",
        corps: [
          "Marshall Rosenberg grandit à Detroit dans les années 1940 et voit, enfant, des émeutes raciales éclater dans sa rue. Toute sa vie tiendra dans une question : qu'est-ce qui fait que certains humains coupent le lien à ce point, et que d'autres restent bienveillants dans les mêmes conditions ?",
          "Psychologue clinicien, il travaille ensuite à la déségrégation des écoles américaines, puis comme médiateur dans des conflits armés. La Communication NonViolente naît là — pas dans un séminaire de développement personnel, mais dans des salles où des gens qui se haïssaient devaient continuer à vivre ensemble.",
          "Le mot « nonviolente » est emprunté à Gandhi : ahimsa, l'état où la violence s'est retirée du cœur. Il ne désigne pas une façon polie de parler, mais ce qui reste quand on cesse de vouloir avoir raison.",
        ],
      },
      {
        titre: "L'intention avant la méthode",
        corps: [
          "On peut réciter les quatre étapes parfaitement et rester dans un rapport de force. « Quand tu rentres à 21 h, je me sens seule, parce que j'ai besoin de considération, serais-tu d'accord pour m'appeler ? » peut être dit comme une sommation.",
          "L'intention de la CNV n'est pas d'obtenir quelque chose de l'autre en y mettant les formes. C'est le pari qu'en comprenant ce qui compte pour chacun, une solution apparaît que personne n'avait en tête au départ.",
          "Une question permet de vérifier où l'on en est : est-ce que je serais prêt à entendre non ? Si la réponse est non, ce n'est pas encore de la CNV, quelle que soit la qualité de la formulation.",
        ],
      },
      {
        titre: "La girafe et le chacal",
        corps: [
          "Rosenberg utilisait deux marionnettes. Le chacal a le nez au ras du sol : il juge, exige, compare, étiquette. La girafe a le plus gros cœur des mammifères terrestres et voit loin : elle parle en sentiments et en besoins.",
          "Ce sont deux langues, pas deux catégories de personnes. Tout le monde parle chacal plusieurs fois par jour, et le chacal n'est jamais qu'une girafe qui n'a pas trouvé ses mots.",
          "Le piège est d'en faire une arme : dire à quelqu'un « tu parles chacal » est exactement ce que la CNV essaie d'éviter — une étiquette posée sur une personne.",
        ],
      },
      {
        titre: "Ce que la CNV n'est pas",
        corps: [
          "Ce n'est pas être gentil. On peut dire des choses très dures en CNV, et le désaccord y est plus net qu'ailleurs parce qu'il porte sur du concret.",
          "Ce n'est pas éviter le conflit. C'est le tenir sans casser le lien — ce qui suppose d'y entrer, pas de le contourner.",
          "Ce n'est pas tout dire non plus. Choisir de se taire, de garder une empathie pour soi, de reporter une conversation, ce sont des choix CNV à part entière.",
        ],
      },
    ],
  },
  {
    section: "Les quatre étapes",
    entrees: [
      {
        titre: "1 · Observer sans évaluer",
        corps: [
          "L'observation est ce qu'une caméra aurait enregistré : des mots prononcés, un geste, une heure, un nombre. Rien de plus.",
          "Notre cerveau évalue plus vite qu'il ne perçoit, et l'évaluation se déguise en constat : « il est désorganisé », « elle manque de respect », « tu ne fais jamais attention ». Ces phrases déclenchent immédiatement la défense chez celui qui les reçoit, et la conversation n'a plus lieu d'être.",
          "Krishnamurti disait qu'observer sans évaluer est la forme la plus élevée de l'intelligence humaine. C'est l'étape que les gens sous-estiment le plus, et celle qui change le plus de choses.",
        ],
        exemple: "« Tu m'as coupé la parole trois fois ce matin » plutôt que « tu es autoritaire ».",
      },
      {
        titre: "2 · Sentir, et non interpréter",
        corps: [
          "Un sentiment se passe dans le corps : gorge serrée, poids sur la poitrine, chaleur, jambes molles. Il ne met personne en cause.",
          "Le français est plein de mots qui ressemblent à des sentiments et n'en sont pas : rejeté, trahi, ignoré, manipulé, incompris, agressé. Ce sont des interprétations de ce que l'autre m'aurait fait. Les dire déclenche la contre-attaque, parce qu'elles contiennent une accusation.",
          "Il ne s'agit pas d'un raffinement de vocabulaire. Chercher le sentiment sous l'interprétation, c'est reprendre la responsabilité de ce qui se passe en soi — et cesser de la déléguer à quelqu'un d'autre.",
        ],
        exemple: "Sous « je me sens abandonnée », il y a souvent : triste, inquiète, seule.",
      },
      {
        titre: "3 · Le besoin, cœur du processus",
        corps: [
          "Un besoin est ce qui est vivant en nous, universel, partagé par tous les humains : sécurité, lien, repos, autonomie, contribuer, être vu. Il ne contient ni nom de personne, ni action, ni date.",
          "Rosenberg fait du besoin la cause du sentiment, et non l'autre. Ce n'est pas ce que tu as fait qui me met en colère, c'est le besoin que ton geste a touché en moi. Deux personnes vivant la même scène ne ressentiront pas la même chose, parce que leurs besoins ne sont pas les mêmes au même moment.",
          "Il faut distinguer le besoin de la stratégie qui vise à le nourrir. « J'ai besoin que tu m'appelles » est une stratégie ; le lien est le besoin. Les conflits portent presque toujours sur les stratégies, jamais sur les besoins : au niveau des besoins, tout le monde se comprend.",
        ],
        exemple: "Deux personnes qui se disputent la fenêtre ouverte ont besoin, l'une d'air, l'autre de chaleur. Aucune n'a besoin d'une fenêtre.",
      },
      {
        titre: "4 · La demande, pas l'exigence",
        corps: [
          "Une demande est concrète, formulée au positif, réalisable maintenant ou à une date précise. « Sois plus attentif » n'est pas une demande ; « serais-tu d'accord pour poser ton téléphone pendant le dîner ? » en est une.",
          "Il existe deux sortes de demandes, et on oublie souvent la première. La demande de connexion vérifie que le lien tient : « qu'est-ce que ça te fait, ce que je viens de dire ? ». La demande d'action porte sur un geste. Faire la seconde sans la première est la cause d'une grande partie des malentendus.",
          "La différence entre demande et exigence ne se voit pas dans la formulation, elle se voit après le refus. Si le non déclenche du reproche, de la bouderie ou une punition, c'était une exigence depuis le début.",
        ],
      },
    ],
  },
  {
    section: "Les trois orientations",
    entrees: [
      {
        titre: "S'écouter soi",
        corps: [
          "L'auto-empathie consiste à s'appliquer les quatre étapes à soi-même, sans témoin. C'est la pratique la moins spectaculaire et la plus utile : elle est disponible partout, y compris quand l'autre personne est absente, morte, ou pas du tout intéressée par la CNV.",
          "Elle sert aussi de sas. Quand l'activation est forte, aucune formulation ne tient : le corps est encore en alerte et les mots sortent plus durs qu'on ne voudrait. Cinq minutes pour soi rendent la suite possible.",
        ],
      },
      {
        titre: "Écouter l'autre",
        corps: [
          "L'empathie n'est pas la sympathie, ni le conseil, ni le partage d'une expérience semblable. C'est une présence à ce qui vit chez l'autre en ce moment — et, très souvent, un silence.",
          "Rosenberg répétait que la première chose que nous faisons en entendant une souffrance est la moins aidante : rassurer, expliquer, raconter la fois où ça nous est arrivé, ou conseiller. Toutes ces réponses déplacent l'attention vers celui qui les donne.",
          "L'empathie peut être silencieuse — deviner ce qui vit chez son patron sans jamais le lui dire suffit parfois à cesser de le détester. Elle peut aussi être adressée : on tend son hypothèse sous forme de question, et le « non, pas du tout » est une bonne nouvelle.",
        ],
      },
      {
        titre: "Se dire",
        corps: [
          "L'expression honnête, c'est se rendre visible : voilà ce que j'observe, ce que ça me fait, ce à quoi je tiens, ce que je te demande. Sans reproche, et sans se cacher non plus.",
          "C'est souvent l'orientation la plus difficile, parce qu'elle expose. Dire « je me sens seul » demande plus de courage que dire « tu n'es jamais là ».",
        ],
      },
      {
        titre: "Recevoir un message difficile",
        corps: [
          "Face à une phrase dure, quatre options sont toujours ouvertes. Se blâmer : « c'est vrai, je suis nul. » Blâmer l'autre : « et toi alors ? » Ces deux-là coupent le lien.",
          "Les deux autres le maintiennent. S'écouter soi : qu'est-ce que ça me fait, de quoi ai-je besoin là ? Écouter l'autre : qu'est-ce qui vit chez lui pour qu'il parle comme ça ?",
          "Savoir qu'il y a quatre portes, et non deux, est souvent ce qui change tout dans une dispute.",
        ],
      },
    ],
  },
  {
    section: "Dans la vraie vie",
    entrees: [
      {
        titre: "La colère",
        corps: [
          "En CNV, la colère n'est pas un problème à faire disparaître : c'est une alarme utile qui signale un besoin important, et une pensée qui juge quelqu'un.",
          "Rosenberg proposait quatre temps : s'arrêter et respirer ; repérer les pensées qui jugent ; chercher le besoin caché derrière ces pensées ; puis exprimer, si on le souhaite, ce qui se passe. La colère ne se réprime pas, elle se traduit.",
        ],
      },
      {
        titre: "Gratitude et célébration",
        corps: [
          "La CNV s'applique aussi à ce qui va bien, et cette moitié est presque toujours oubliée. Un remerciement CNV a la même structure : ce que tu as fait, ce que ça a fait en moi, le besoin que ça a nourri.",
          "« Merci d'avoir appelé hier soir : je me suis sentie soulagée, ça a nourri mon besoin de lien » dit infiniment plus que « tu es adorable » — qui reste un jugement, même positif.",
          "Symétriquement, le deuil consiste à accueillir ce qui n'a pas été nourri, sans se punir de ses actes passés. Célébration et deuil sont les deux faces d'une même pratique quotidienne.",
        ],
      },
      {
        titre: "Quand la CNV ne suffit pas",
        corps: [
          "La CNV suppose deux personnes qui gardent une capacité de choix. Dans une situation de violence, d'emprise ou de danger, la priorité est la protection : partir, appeler, se mettre à l'abri. Chercher le besoin de l'agresseur pendant qu'on est en danger n'est pas de la CNV, c'est un piège.",
          "Rosenberg parlait d'un « usage protecteur de la force » : agir pour empêcher un dommage, sans intention de punir. Retenir le bras d'un enfant qui court vers la route n'est pas une violence.",
          "Une application ne remplace ni une formation, ni un accompagnement, ni un professionnel de santé. Elle sert à pratiquer entre deux.",
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Pictogrammes — tracé fin, irrégulier, sans remplissage              */
/* ------------------------------------------------------------------ */

const traits = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.15,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Picto({ children, label }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" role="img" aria-label={label} {...traits}>
      {children}
    </svg>
  );
}

/* pelote de fils emmêlés : ce qui remue à l'intérieur */
function TangleIcon() {
  return (
    <Picto label="pelote emmêlée">
      <path d="M20.5 12.3c5.6-1.4 11.4 1.6 12.6 6.9 1.2 5.2-2.6 10.2-8.2 11.3-5.4 1.1-10.6-2.1-11.6-7-1-4.8 2-9.9 7.2-11.2z" />
      <path d="M27.4 14.1c4.9 1.9 7.4 7.2 5.4 11.9-2 4.8-7.7 7-12.6 5.1-4.7-1.9-7-7.1-5.1-11.7 1.8-4.5 7.1-6.9 12.3-5.3z" />
      <path d="M16.8 18.9c3.6-4.2 9.7-4.8 13.6-1.2 3.9 3.5 4.1 9.5.5 13.6-3.5 3.9-9.4 4.2-13.2.7-3.7-3.4-4.1-9.1-.9-13.1z" />
      <circle cx="33.6" cy="33.9" r="1.5" fill="currentColor" stroke="none" />
    </Picto>
  );
}

/* la colline de l'autre, et le chemin pour y monter */
function HillIcon() {
  return (
    <Picto label="colline">
      <path d="M6 35.2c4.1.3 7.4-2.2 10.4-6.4 3.2-4.5 6.1-9.6 10.3-11.6 4.6-2.2 9.6 2.1 13.1 8.1" />
      <path d="M9.6 35.4c9.8 1 21.6.9 31.6-.2" strokeDasharray="0.5 3.2" />
      <path d="M13.5 33.6c2.2-2.9 3.1-5.9 6.6-7.4 3.4-1.5 4.1-4.6 6.7-6.4 2.3-1.6 4.6-1.2 6.4.4" strokeDasharray="2.6 3" />
      <path d="M33.2 20.5V10.4" />
      <path d="M33.4 11c2.2-.9 4.3.2 6.3-.6-1.4 1.9-1.2 3.6.1 5.2-2.2.6-4.2-.6-6.4.2" />
      <path d="M11.4 27.9c-1.9-.4-3.4-2-3.5-3.9 2 .1 3.4 1.3 4 3" />
      <path d="M12 28c1-1.6 2.9-2.4 4.6-1.9-.7 1.8-2.4 2.9-4.2 2.7" />
      <path d="M11.7 27.6c.4 1.6.3 3.3-.3 4.9" />
    </Picto>
  );
}

/* la parole qu'on prépare : une bulle où pousse quelque chose */
function SpeechIcon() {
  return (
    <Picto label="bulle de parole">
      <path d="M11.6 15.4c4.9-3.6 19.2-3.9 24.6-.6 5.5 3.4 5.8 12.6.7 16.4-4.4 3.3-11.2 3.6-16.4 2.6-1.9 1.9-4.1 3.3-6.6 4 .6-1.9.9-3.9.7-5.9-5.2-3.1-6.9-13.1-3-16.5z" />
      <path d="M24.2 28.6c-.5-3.6.6-7 3-9.9" />
      <path d="M24.6 24.1c-1.6-1.2-3.8-1.3-5.7-.4 1.2 1.7 3.4 2.5 5.4 2" />
      <path d="M25.6 21.4c1.9-.9 3.2-2.7 3.4-4.8-2 .3-3.7 1.7-4.3 3.6" />
      <path d="M26.2 25.9c2 .1 4-.9 5.2-2.6-2-.6-4.2 0-5.6 1.5" />
    </Picto>
  );
}

/* le journal : un carnet fermé, un signet, une pousse sur la couverture */
function JournalIcon() {
  return (
    <Picto label="carnet">
      <path d="M12.4 10.6c-.6 8.9-.7 17.9-.2 26.9 6.7-.4 13.5-.3 20.2.3.6-9 .7-18 .2-27-6.7.5-13.5.4-20.2-.2z" />
      <path d="M15.3 11c-.6 8.9-.6 17.9-.1 26.9" />
      <path d="M25.7 10.9c-.4 6.1-.4 12.2-.1 18.3-1.2-.8-2.4-1.6-3.7-2.3-1.2.8-2.4 1.5-3.6 2.4-.4-6.1-.4-12.2 0-18.3" />
      <path d="M32.6 37.8c1.4.2 2.8-.5 3.5-1.7.6-8.5.5-17.1-.2-25.6-.8-1.1-2.1-1.7-3.4-1.5" />
      <path d="M27.3 33.5c1.8.2 3.5-.9 4-2.7-1.9-.4-3.8.5-4.4 2.3" />
      <path d="M27.4 33.4c-.8-1.7-.3-3.8 1.2-5 1.1 1.5 1.1 3.6-.1 5" />
    </Picto>
  );
}

/* la brindille : l'entraînement qui pousse doucement */
function BranchIcon() {
  return (
    <Picto label="brindille">
      <path d="M16.4 38.4c1.1-9.6 6.9-18.2 15.4-22.9" />
      <path d="M22.4 28.9c-2.1-1.5-5-1.6-7.3-.4 1.6 2.1 4.4 3 6.9 2.2" />
      <path d="M23.2 27.6c1-2.4.5-5.2-1.3-7.1-1.4 2.2-1.3 5.1.3 7.2" />
      <path d="M27.4 22.1c2.4.2 4.8-1.1 6.1-3.2-2.4-.7-5 .2-6.4 2.4" />
      <path d="M28.4 20.6c.7-2.5.1-5.2-1.7-7-1.2 2.3-.8 5.2 1.1 7" />
      <path d="M19.6 33.6c-2.3-1-5-.6-6.9 1.1 2.1 1.5 4.9 1.6 7 .2" />
    </Picto>
  );
}

/* la boussole : comprendre, s'orienter */
function CompassIcon() {
  return (
    <Picto label="boussole">
      <path d="M24.3 8.6c8.6-.2 15.6 6.6 15.4 15.1-.2 8.4-7.2 15.4-15.6 15.2-8.5-.2-15.2-7.2-14.9-15.7.3-8.2 7-14.5 15.1-14.6z" />
      <path d="M24.2 13.2c6-.2 11 4.6 10.9 10.5-.1 5.9-5 10.7-10.9 10.6-5.9-.1-10.6-5-10.4-11 .2-5.7 4.8-10 10.4-10.1z" strokeDasharray="1 3.4" />
      <path d="M30.1 17.9c-1 3-2.3 5.9-3.8 8.6-2.8 1.6-5.7 2.9-8.7 3.9 1-3 2.3-5.9 3.9-8.6 2.7-1.6 5.6-2.9 8.6-3.9z" />
      <path d="M24 24c.1-.1.2-.1.3 0" />
      <path d="M24.1 5.9v2.4M24.1 39.6V42M42 24h-2.4M8.4 24H6" />
    </Picto>
  );
}

/* réglages : une fleur mécanique */
function GearIcon() {
  return (
    <Picto label="réglages">
      <path d="M24 9.6c1.7 0 3.3.3 4.8.9l1.2 3.5 3.5 1.4 3.4-1.3c1.1 1.2 2 2.6 2.6 4.1l-2.2 2.9.1 3.7 2.8 2.3c-.4 1.6-1.1 3.1-2.1 4.4l-3.5-.5-2.9 2.3-.5 3.5c-1.5.8-3.1 1.2-4.8 1.3l-2-3-3.6-.7-2.8 2.2c-1.4-.8-2.7-1.9-3.7-3.2l1.4-3.3-1.2-3.5-3.3-1.2c0-1.6.3-3.2.9-4.7l3.6-.6 2.2-2.9-.5-3.5c1.3-1 2.8-1.7 4.4-2.1l2.4 2.6" />
      <path d="M24.2 19.1c2.8-.1 5.1 2.1 5 4.9-.1 2.7-2.3 4.9-5 4.9-2.7 0-4.9-2.3-4.8-5 .1-2.6 2.2-4.7 4.8-4.8z" />
    </Picto>
  );
}

function FlecheIcon() {
  return (
    <Picto label="ouvrir">
      <path d="M15.5 24.2c5.6-.5 11.3-.6 17 -.3" />
      <path d="M26.8 17.9c1.8 2.4 3.8 4.5 6 6.2-2.1 1.9-4 4-5.7 6.4" />
    </Picto>
  );
}

/* ------------------------------------------------------------------ */
/*  Signature : l'arc de l'attention                                    */
/* ------------------------------------------------------------------ */

const CHEMINS = {
  soi: [
    [[38, 52], [2, 30], [30, 6], [54, 22]],
    [[54, 22], [80, 40], [66, 58], [38, 52]],
  ],
  autre: [[[38, 52], [96, 6], [176, 6], [232, 52]]],
  dire: [[[38, 52], [96, 6], [176, 6], [232, 52]]],
};

function pointCubique(seg, t) {
  const [p0, p1, p2, p3] = seg;
  const u = 1 - t;
  const a = u * u * u,
    b = 3 * u * u * t,
    c = 3 * u * t * t,
    d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

function pointSurChemin(segments, f) {
  const n = segments.length;
  const i = Math.min(n - 1, Math.floor(f * n));
  return pointCubique(segments[i], f * n - i);
}

function versD(segments) {
  return segments
    .map((s, i) =>
      `${i === 0 ? `M${s[0][0]} ${s[0][1]} ` : ""}C${s[1][0]} ${s[1][1]}, ${s[2][0]} ${s[2][1]}, ${s[3][0]} ${s[3][1]}`
    )
    .join(" ");
}

function ArcAttention({ orientation, etape, total }) {
  const o = ORIENTATIONS[orientation];
  const segs = CHEMINS[orientation];
  const d = versD(segs);
  const perles = [0.18, 0.42, 0.66, 0.9].map((f) => pointSurChemin(segs, f));
  const soloSoi = orientation === "soi";

  return (
    <svg viewBox="0 0 260 66" width="100%" height="60" role="img"
      aria-label={`${o.nom}, étape ${etape + 1} sur ${total}`}>
      <path
        d={d}
        fill="none"
        stroke={o.couleur}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeDasharray={orientation === "autre" ? "3 4" : "none"}
        opacity="0.45"
      />
      {perles.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={i === etape ? 5.5 : 3.5}
          fill={i <= etape ? o.couleur : T.papier}
          stroke={o.couleur}
          strokeWidth="1.25"
          opacity={i <= etape ? 1 : 0.5}
        />
      ))}
      <circle cx="38" cy="52" r="3" fill={T.encre} />
      <text x="38" y="65" textAnchor="middle" fontSize="8.5" fill={T.gris} letterSpacing="0.08em">
        MOI
      </text>
      {!soloSoi && (
        <>
          <circle cx="232" cy="52" r="3" fill={T.encre} opacity={orientation === "autre" ? 0.5 : 1} />
          <text x="232" y="65" textAnchor="middle" fontSize="8.5" fill={T.gris} letterSpacing="0.08em">
            L'AUTRE
          </text>
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Petits composants                                                   */
/* ------------------------------------------------------------------ */

function Puce({ mot, actif, couleur, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="puce"
      style={{
        background: actif ? couleur : "transparent",
        color: actif ? "#fff" : T.encre,
        borderColor: actif ? couleur : T.trait,
      }}
    >
      {mot}
    </button>
  );
}

function Selecteur({ groupes, valeurs, couleur, onToggle }) {
  const [filtre, setFiltre] = useState("");
  const q = filtre.trim().toLowerCase();
  return (
    <div>
      <input
        className="champ champ-filtre"
        placeholder="Chercher un mot"
        value={filtre}
        onChange={(e) => setFiltre(e.target.value)}
      />
      <div className="groupes">
        {Object.entries(groupes).map(([titre, mots]) => {
          const visibles = q ? mots.filter((m) => m.includes(q)) : mots;
          if (!visibles.length) return null;
          return (
            <div key={titre} className="groupe">
              <div className="eyebrow">{titre}</div>
              <div className="puces">
                {visibles.map((m) => (
                  <Puce
                    key={m}
                    mot={m}
                    couleur={couleur}
                    actif={valeurs.includes(m)}
                    onClick={() => onToggle(m)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Application                                                         */
/* ------------------------------------------------------------------ */

const CLE_JOURNAL = "cnv-journal-v1";
const CLE_REGLAGES = "cnv-reglages-v1";

function lire(cle, defaut) {
  try {
    const brut = window.localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : defaut;
  } catch (err) {
    return defaut;
  }
}

function ecrire(cle, valeur) {
  try {
    window.localStorage.setItem(cle, JSON.stringify(valeur));
  } catch (err) {
    /* stockage indisponible : l'app continue de fonctionner sans mémoire */
  }
}

export default function App() {
  const [vue, setVue] = useState("accueil");
  const [orientation, setOrientation] = useState("dire");
  const [etape, setEtape] = useState(0);
  const [decouverte, setDecouverte] = useState(true);
  const [aideOuverte, setAideOuverte] = useState(false);
  const [nourri, setNourri] = useState(false);
  const [detour, setDetour] = useState(null);
  const [rapporte, setRapporte] = useState(null);
  const [refus, setRefus] = useState([]);
  const [journal, setJournal] = useState(() => lire(CLE_JOURNAL, []));
  const [reglages, setReglages] = useState(() =>
    lire(CLE_REGLAGES, { accord: "m", rappel: false })
  );

  useEffect(() => ecrire(CLE_JOURNAL, journal), [journal]);
  useEffect(() => ecrire(CLE_REGLAGES, reglages), [reglages]);
  const [garde, setGarde] = useState(false);
  const [copie, setCopie] = useState(false);
  const zoneRecap = useRef(null);

  const [temps, setTemps] = useState(null);
  const [voie, setVoie] = useState(null);
  const [bifurcation, setBifurcation] = useState(false);
  const vide = { obs: "", sentiment: [], besoin: [], demande: "", intensite: 3, accord: "m" };
  const [reponses, setReponses] = useState({
    soi: { ...vide },
    autre: { ...vide },
    dire: { ...vide },
  });

  const o = ORIENTATIONS[orientation];
  const etapes =
    orientation === "autre" && voie === "garder"
      ? [...ETAPES.autre.slice(0, 3), ETAPE_GARDER]
      : ETAPES[orientation];
  const courante = etapes[etape];
  const rep = reponses[orientation];

  const maj = (champ, valeur) =>
    setReponses((r) => ({ ...r, [orientation]: { ...r[orientation], [champ]: valeur } }));

  const bascule = (champ, mot) => {
    const liste = rep[champ];
    maj(champ, liste.includes(mot) ? liste.filter((x) => x !== mot) : [...liste, mot].slice(-3));
  };

  const rempli = useMemo(() => {
    if (courante.champ === "apercu") return true;
    const v = rep[courante.id];
    return Array.isArray(v) ? v.length > 0 : v.trim().length > 0;
  }, [rep, courante]);

  const charge = useMemo(() => mesurerCharge(rep), [rep]);
  const cleRefus = `${orientation}-${etape}`;
  const proposeDetour =
    orientation !== "soi" &&
    !detour &&
    !rapporte &&
    (etape === 1 || etape === 2) &&
    (charge >= 2 || rep.intensite > 4) &&
    !refus.includes(cleRefus);

  const enregistrer = (entree) => {
    setJournal((j) => [{ id: Date.now(), date: new Date().toISOString(), ...entree }, ...j]);
  };

  const ouvrir = (cle) => {
    setReponses((r) => ({ ...r, [cle]: { ...r[cle], accord: reglages.accord } }));
    setOrientation(cle);
    setEtape(0);
    setAideOuverte(false);
    setRapporte(null);
    setGarde(false);
    setTemps(null);
    setVoie(null);
    setBifurcation(false);
    setVue("parcours");
  };

  const partirEnDetour = () => {
    setDetour({ orientation, etape });
    setReponses((r) => ({ ...r, soi: { ...r.soi, obs: r.soi.obs || r[orientation].obs } }));
    setOrientation("soi");
    setEtape(0);
    setAideOuverte(false);
  };

  const revenirDuDetour = () => {
    const besoins = reponses.soi.besoin;
    setRapporte(besoins.length ? besoins.join(", ") : null);
    setOrientation(detour.orientation);
    setEtape(detour.etape);
    setDetour(null);
    setAideOuverte(false);
  };

  const auPasse =
    temps !== null
      ? temps === "passe"
      : orientation === "autre"
      ? false
      : reponses[orientation].intensite <= 4;

  const phrase = useMemo(() => {
    const r = reponses[orientation];
    const f = r.accord === "f";
    const e = f ? "e" : "";
    const s = r.sentiment.map((m) => accorder(m, f)).join(", ") || "…";
    const b = r.besoin.join(", ") || "…";
    const ob = r.obs.trim() || "…";
    const de = r.demande.trim() || "…";
    if (orientation === "dire")
      return auPasse
        ? `Quand ${minuscule(ob)}, je me suis senti${e} ${s}, parce que j'avais besoin de ${b}.\n${de}`
        : `Quand ${minuscule(ob)}, je me sens ${s}, parce que j'ai besoin de ${b}.\n${de}`;
    if (orientation === "autre") {
      if (voie === "garder") {
        const pron = f ? "elle" : "il";
        return auPasse
          ? `Quand ${minuscule(ob)}, ${pron} s'est peut-être senti${e} ${s}, parce qu'${pron} avait besoin de ${b}.\nDe mon côté : ${de}`
          : `Quand ${minuscule(ob)}, ${pron} se sent peut-être ${s}, parce qu'${pron} aurait besoin de ${b}.\nDe mon côté : ${de}`;
      }
      return auPasse
        ? `Quand ${minuscule(ob)}, est-ce que tu t'es senti${e} ${s}, parce que tu avais besoin de ${b} ?`
        : `Quand ${minuscule(ob)}, est-ce que tu te sens ${s}, parce que tu aurais besoin de ${b} ?`;
    }
    return auPasse
      ? `Quand ${minuscule(ob)}, je me suis senti${e} ${s}, parce que j'avais besoin de ${b}.\nCe que je fais maintenant : ${de}`
      : `Quand ${minuscule(ob)}, je me sens ${s}, parce que j'ai besoin de ${b}.\nCe que je fais maintenant : ${de}`;
  }, [reponses, orientation, auPasse, voie]);

  const copier = async () => {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(phrase);
        ok = true;
      }
    } catch (err) {
      ok = false;
    }
    if (!ok) {
      try {
        const zone = document.createElement("textarea");
        zone.value = phrase;
        zone.setAttribute("readonly", "");
        zone.style.position = "fixed";
        zone.style.top = "0";
        zone.style.left = "0";
        zone.style.opacity = "0.01";
        zone.style.fontSize = "16px";
        document.body.appendChild(zone);
        zone.focus();
        zone.select();
        zone.setSelectionRange(0, zone.value.length);
        ok = document.execCommand("copy");
        document.body.removeChild(zone);
      } catch (err) {
        ok = false;
      }
    }
    setCopie(ok ? "ok" : "echec");
    if (ok) setTimeout(() => setCopie(false), 2000);
  };

  /* ---------------- rendu ---------------- */

  return (
    <div className="racine">
      <style>{CSS}</style>
      <div className="cadre">
        {vue === "accueil" && (
          <Accueil onOuvrir={ouvrir} onAller={setVue} journal={journal} />
        )}

        {vue === "parcours" && bifurcation && (
          <div className="ecran">
            <header className="barre">
              <button className="lien" onClick={() => setBifurcation(false)}>← Retour</button>
            </header>
            <div className="arc">
              <ArcAttention orientation="autre" etape={2} total={4} />
              <div className="arc-nom" style={{ color: T.autre }}>Empathie</div>
            </div>
            <div className="entete">
              <div className="eyebrow">Avant la dernière étape</div>
              <h1 className="titre">Tu as rejoint sa colline.</h1>
              <p className="chapo">Deux chemins partent d'ici, et les deux sont entiers.</p>
            </div>
            <div className="portes">
              <button
                className="porte"
                onClick={() => { setVoie("parler"); setBifurcation(false); setEtape(3); }}
              >
                <span className="porte-texte">
                  <span className="porte-titre" style={{ color: T.autre }}>
                    Je vais lui en parler
                  </span>
                  <span className="porte-sous">
                    Je lui propose ce que j'ai deviné et je regarde ce qu'elle ou il en fait.
                  </span>
                </span>
              </button>
              <button
                className="porte"
                onClick={() => { setVoie("garder"); setBifurcation(false); setEtape(3); }}
              >
                <span className="porte-texte">
                  <span className="porte-titre" style={{ color: T.soi }}>
                    Je garde ça pour moi
                  </span>
                  <span className="porte-sous">
                    J'avais besoin de comprendre, pas de lui dire. Ça a déjà changé quelque chose.
                  </span>
                </span>
              </button>
            </div>
            <p className="note bas">
              Deviner ce qui vit chez quelqu'un, même sans le lui dire, suffit souvent à desserrer
              ce qu'on avait contre lui.
            </p>
          </div>
        )}

        {vue === "parcours" && !bifurcation && (
          <div className="ecran">
            <header className="barre">
              <button className="lien" onClick={() => setVue("accueil")}>← Accueil</button>
              <button
                className="lien"
                onClick={() => setDecouverte((d) => !d)}
                aria-pressed={decouverte}
              >
                {decouverte ? "Mode fluide" : "Mode découverte"}
              </button>
            </header>

            <div className="arc">
              <ArcAttention orientation={orientation} etape={etape} total={4} />
              <div className="arc-nom" style={{ color: o.couleur }}>{o.nom}</div>
            </div>

            {detour && (
              <div className="bandeau" style={{ borderColor: T.soi, color: T.soi }}>
                Détour par l'auto-empathie. Tu reviendras à ta phrase après.
              </div>
            )}

            {rapporte && (
              <div className="bandeau" style={{ borderColor: T.soi, color: T.soi }}>
                Tu as trouvé, pour toi : {rapporte}
              </div>
            )}

            <div key={orientation + etape} className="carte">
              <div className="eyebrow">Étape {etape + 1} sur 4</div>
              <h2 className="titre-etape">{courante.titre}</h2>
              <p className="invite">{courante.invite}</p>

              {decouverte && <p className="role">{courante.role}</p>}

              <div className="saisie">
                {courante.champ === "texte" && (
                  <textarea
                    className="champ"
                    rows={3}
                    placeholder={courante.amorce || courante.exemple}
                    value={rep[courante.id]}
                    onChange={(e) => maj(courante.id, e.target.value)}
                  />
                )}

                {courante.champ === "sentiments" && (
                  <>
                    <div className="bascule">
                      <button
                        className={!nourri ? "onglet actif" : "onglet"}
                        onClick={() => setNourri(false)}
                        style={!nourri ? { borderColor: o.couleur, color: o.couleur } : undefined}
                      >
                        Quelque chose manque
                      </button>
                      <button
                        className={nourri ? "onglet actif" : "onglet"}
                        onClick={() => setNourri(true)}
                        style={nourri ? { borderColor: o.couleur, color: o.couleur } : undefined}
                      >
                        Quelque chose est nourri
                      </button>
                    </div>
                    <Selecteur
                      groupes={nourri ? SENTIMENTS_NOURRI : SENTIMENTS_MANQUE}
                      valeurs={rep.sentiment}
                      couleur={o.couleur}
                      onToggle={(m) => bascule("sentiment", m)}
                    />

                    <div className="accord">
                      <span>{orientation === "autre" ? "La personne dont tu parles :" : "Accorder au"}</span>
                      <button
                        className={rep.accord === "m" ? "accord-actif" : ""}
                        onClick={() => maj("accord", "m")}
                      >
                        {orientation === "autre" ? "il" : "masculin"}
                      </button>
                      <button
                        className={rep.accord === "f" ? "accord-actif" : ""}
                        onClick={() => maj("accord", "f")}
                      >
                        {orientation === "autre" ? "elle" : "féminin"}
                      </button>
                    </div>

                    <div className="jauge">
                      <div className="jauge-tete">
                        <span>
                          {orientation === "autre"
                            ? "Et toi, où en es-tu ?"
                            : "À quel point ça te touche, maintenant ?"}
                        </span>
                        <strong style={{ color: o.couleur }}>{rep.intensite}</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={rep.intensite}
                        onChange={(e) => maj("intensite", Number(e.target.value))}
                        style={{ accentColor: o.couleur }}
                        aria-label="Intensité de ce que je ressens maintenant"
                      />
                      <div className="jauge-bornes">
                        <span>c'est passé</span>
                        <span>c'est encore vif</span>
                      </div>
                      {orientation === "autre" && (
                        <p className="jauge-note">
                          Cette réponse reste pour toi : elle n'entre pas dans ta phrase. Elle sert
                          seulement à vérifier que tu es assez disponible pour écouter.
                        </p>
                      )}
                    </div>
                  </>
                )}

                {courante.champ === "apercu" && (
                  <div className="apercu">
                    <div className="eyebrow">Ta question, telle qu'elle sonne</div>
                    <p className="apercu-phrase" style={{ borderColor: o.couleur }}>{phrase}</p>
                    <div className="eyebrow espace">Ce qu'elle ou il peut répondre</div>
                    {courante.apres.map((a) => (
                      <div key={a.cas} className="cas">
                        <div className="cas-titre">{a.cas}</div>
                        <p className="cas-quoi">{a.quoi}</p>
                      </div>
                    ))}
                  </div>
                )}

                {courante.champ === "besoins" && (
                  <Selecteur
                    groupes={BESOINS}
                    valeurs={rep.besoin}
                    couleur={o.couleur}
                    onToggle={(m) => bascule("besoin", m)}
                  />
                )}
              </div>

              <div className="comment">
                <div className="eyebrow" style={{ color: o.couleur }}>Comment faire</div>
                <p className="comment-corps">{courante.commentFaire}</p>
              </div>

              <button
                className="aide-bouton"
                onClick={() => setAideOuverte((a) => !a)}
                aria-expanded={aideOuverte}
              >
                <span className="rond" style={{ borderColor: o.couleur, color: o.couleur }}>?</span>
                {aideOuverte ? "Masquer l'aide" : "Je ne sais pas quoi mettre"}
              </button>

              {aideOuverte && (
                <div className="aide" style={{ borderColor: o.couleur }}>
                  <div className="eyebrow">
                    {etape === 0 ? "Exemple" : "La même scène, suite"}
                  </div>
                  <p className="aide-exemple">{courante.exemple}</p>
                  <div className="eyebrow">Le piège fréquent</div>
                  <p className="aide-piege">{courante.piege}</p>
                </div>
              )}
            </div>

            {proposeDetour && (
              <div className="propose">
                <div className="eyebrow" style={{ color: T.soi }}>Une suggestion</div>
                <p className="propose-texte">
                  {rep.intensite > 4
                    ? `Tu as mis ${rep.intensite} sur 10 : c'est encore vif. Tant que le corps est en alerte, il capte mal l'autre et les mots sortent plus durs qu'on ne voudrait.`
                    : "Il y a beaucoup d'énergie dans ce que tu écris : des mots qui jugent, des sentiments intenses."}
                </p>
                <p className="propose-texte">
                  {orientation === "dire"
                    ? "Cinq minutes pour toi d'abord, et ta phrase se trouvera souvent toute seule."
                    : "Cinq minutes pour toi d'abord, et l'écoute redeviendra possible."}
                </p>
                <div className="propose-actions">
                  <button className="propose-oui" onClick={partirEnDetour}>
                    Passer par moi d'abord
                  </button>
                  <button className="propose-non" onClick={() => setRefus((r) => [...r, cleRefus])}>
                    Je continue
                  </button>
                </div>
              </div>
            )}

            {orientation !== "soi" && !detour && !proposeDetour && etape >= 1 && (
              <button className="detour" onClick={partirEnDetour}>
                Faire un détour par l'auto-empathie
              </button>
            )}

            <div className="pied">
              <button
                className="secondaire"
                onClick={() => (etape === 0 ? setVue("accueil") : setEtape((e) => e - 1))}
              >
                Retour
              </button>
              {etape < 3 ? (
                <button
                  className="principal"
                  style={{ background: o.couleur, opacity: rempli ? 1 : 0.35 }}
                  disabled={!rempli}
                  onClick={() => {
                    setAideOuverte(false);
                    if (orientation === "autre" && etape === 2 && !voie) setBifurcation(true);
                    else setEtape((e) => e + 1);
                  }}
                >
                  Continuer
                </button>
              ) : detour ? (
                <button className="principal" style={{ background: T.soi }} onClick={revenirDuDetour}>
                  Revenir à ma phrase
                </button>
              ) : (
                <button
                  className="principal"
                  style={{ background: o.couleur, opacity: rempli ? 1 : 0.35 }}
                  disabled={!rempli}
                  onClick={() => setVue("recap")}
                >
                  Voir ce que ça donne
                </button>
              )}
            </div>
          </div>
        )}

        {vue === "recap" && (
          <div className="ecran">
            <header className="barre">
              <button className="lien" onClick={() => setVue("parcours")}>← Modifier</button>
              <button className="lien" onClick={() => setVue("accueil")}>Accueil</button>
            </header>
            <div className="carte">
              <div className="eyebrow" style={{ color: o.couleur }}>
                {o.nom}
                {orientation === "autre" && voie === "garder" && " · pour moi seul"}
                {orientation === "autre" && voie === "parler" && " · à lui proposer"}
              </div>
              <p className="phrase">{phrase}</p>

              <div className="temps">
                <div className="bascule">
                  <button
                    className={auPasse ? "onglet" : "onglet actif"}
                    onClick={() => setTemps("present")}
                    style={!auPasse ? { borderColor: o.couleur, color: o.couleur } : undefined}
                  >
                    C'est encore là
                  </button>
                  <button
                    className={auPasse ? "onglet actif" : "onglet"}
                    onClick={() => setTemps("passe")}
                    style={auPasse ? { borderColor: o.couleur, color: o.couleur } : undefined}
                  >
                    C'est passé
                  </button>
                </div>
                <p className="temps-note">
                  {orientation === "autre"
                    ? voie === "garder"
                      ? "Cette phrase ne sortira pas d'ici. Elle est écrite au conditionnel parce que c'est une hypothèse, et qu'elle le restera."
                      : auPasse
                      ? "La scène est ancienne : tu demandes à cette personne ce qu'elle a vécu ce jour-là."
                      : "Par défaut, tu proposes ton hypothèse au présent : c'est ce qui pourrait être vivant chez elle ou lui en ce moment. Passe au passé si la scène est déjà loin pour cette personne."
                    : auPasse
                    ? "Tu as mis " +
                      reponses[orientation].intensite +
                      " sur 10, alors la phrase est au passé : ce jour-là, ça t'a fait quelque chose, et c'est retombé depuis."
                    : "Tu as mis " +
                      reponses[orientation].intensite +
                      " sur 10, alors la phrase est au présent : ce n'est pas un souvenir, c'est vivant maintenant."}
                </p>
              </div>
              <div className="recap-actions">
                <button
                  className="principal plein"
                  style={{ background: o.couleur }}
                  onClick={copier}
                >
                  {copie === "ok" ? "Copié" : "Copier la phrase"}
                </button>
                {garde ? (
                  <div className="confirme">
                    <span>Gardé dans le journal.</span>
                    <button className="lien souligne" onClick={() => setVue("journal")}>
                      Le voir
                    </button>
                  </div>
                ) : (
                  <button
                    className="secondaire plein"
                    onClick={() => {
                      enregistrer({ type: "parcours", orientation, ...reponses[orientation] });
                      setGarde(true);
                    }}
                  >
                    Garder dans le journal
                  </button>
                )}
              </div>

              {copie === "echec" && (
                <div className="copie-secours">
                  <p className="note" style={{ marginTop: 0 }}>
                    La copie automatique est bloquée ici. Sélectionne le texte ci-dessous :
                  </p>
                  <textarea
                    ref={zoneRecap}
                    className="champ"
                    rows={4}
                    readOnly
                    value={phrase}
                    onFocus={(ev) => ev.target.select()}
                  />
                </div>
              )}
              <p className="note">
                Relis-la à voix basse. Si une phrase te serre la gorge, c'est souvent qu'un besoin
                dessous n'est pas encore nommé.
              </p>
            </div>
            <button className="secondaire large" onClick={() => setVue("accueil")}>Terminer</button>
          </div>
        )}

        {vue === "journal" && (
          <JournalVue
            journal={journal}
            onEcrire={() => setVue("note")}
            onExporter={() => setVue("impression")}
            onRetour={() => setVue("accueil")}
          />
        )}
        {vue === "note" && (
          <NoteDuJour
            onEnregistrer={(e) => { enregistrer(e); setVue("journal"); }}
            onRetour={() => setVue("journal")}
          />
        )}
        {vue === "reglages" && (
          <Reglages
            reglages={reglages}
            setReglages={setReglages}
            journal={journal}
            onEffacer={() => setJournal([])}
            onExporter={() => setVue("impression")}
            onRetour={() => setVue("accueil")}
          />
        )}
        {vue === "impression" && (
          <Impression journal={journal} onRetour={() => setVue("journal")} />
        )}
        {vue === "entrainement" && <Entrainement onRetour={() => setVue("accueil")} />}
        {vue === "theorie" && <Theorie onRetour={() => setVue("accueil")} />}
      </div>
    </div>
  );
}

function minuscule(s) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1).replace(/\.$/, "");
}

/* ---------------- Accueil ---------------- */

function Accueil({ onOuvrir, onAller, journal }) {
  const aujourdhui = journal.some((e) => memeJour(e.date, new Date().toISOString()));
  const pictos = { soi: TangleIcon, autre: HillIcon, dire: SpeechIcon };

  return (
    <div className="ecran accueil">
      <header className="barre entete-haut">
        <span className="eyebrow" style={{ marginBottom: 0 }}>Pratique quotidienne</span>
        <button className="lien lien-icone" onClick={() => onAller("reglages")}>
          Réglages
          <span className="icone-mini"><GearIcon /></span>
        </button>
      </header>

      <h1 className="titre titre-accueil">Où est ton attention, là, maintenant ?</h1>

      <div className="portes">
        {Object.values(ORIENTATIONS).map((o) => {
          const Icone = pictos[o.cle];
          return (
            <button
              key={o.cle}
              className="porte"
              onClick={() => onOuvrir(o.cle)}
              style={{ background: o.teinte, borderColor: o.bord }}
            >
              <span className="medaille" style={{ background: o.medaille, color: o.couleur }}>
                <Icone />
              </span>
              <span className="porte-texte">
                <span className="porte-titre" style={{ color: o.couleur }}>{o.porte}</span>
                <span className="porte-sous">{o.sousPorte}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button className="ruban" onClick={() => onAller("journal")}>
        <span className="ruban-picto"><JournalIcon /></span>
        <span className="ruban-texte">
          <span className="ruban-titre">Journal</span>
          <span className="ruban-sous">
            {aujourdhui
              ? "Tu as écrit aujourd'hui"
              : journal.length
              ? "Rien pour aujourd'hui"
              : "Une note par jour, même courte"}
          </span>
        </span>
        <FilDesJours journal={journal} />
        <span className="rond-fleche"><FlecheIcon /></span>
      </button>

      <div className="secondaires">
        <button className="tuile" onClick={() => onAller("entrainement")}>
          <span className="medaille petite" style={{ background: "#DEE9E0", color: T.autre }}>
            <BranchIcon />
          </span>
          <span className="tuile-titre" style={{ color: T.autre }}>S'entraîner</span>
          <span className="tuile-sous">{EXERCICES.length} séries courtes, à froid</span>
        </button>
        <button className="tuile" onClick={() => onAller("theorie")}>
          <span className="medaille petite" style={{ background: "#F8E9D5", color: T.dire }}>
            <CompassIcon />
          </span>
          <span className="tuile-titre" style={{ color: T.dire }}>Comprendre</span>
          <span className="tuile-sous">
            {THEORIE.reduce((n, sec) => n + sec.entrees.length, 0)} repères, à lire dans le désordre
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---------------- Journal ---------------- */

function memeJour(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const jourLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const jourCourt = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });

function FilDesJours({ journal }) {
  const jours = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  return (
    <span className="fil" aria-hidden="true">
      {jours.map((d, i) => {
        const plein = journal.some((e) => memeJour(e.date, d.toISOString()));
        return (
          <span
            key={i}
            className="fil-point"
            style={{ background: plein ? T.encre : "transparent", borderColor: plein ? T.encre : T.trait }}
          />
        );
      })}
    </span>
  );
}

function JournalVue({ journal, onEcrire, onExporter, onRetour }) {
  const groupes = [];
  journal.forEach((e) => {
    const dernier = groupes[groupes.length - 1];
    if (dernier && memeJour(dernier.date, e.date)) dernier.entrees.push(e);
    else groupes.push({ date: e.date, entrees: [e] });
  });

  return (
    <div className="ecran">
      <header className="barre">
        <button className="lien" onClick={onRetour}>← Accueil</button>
      </header>
      <div className="entete">
        <div className="eyebrow">Journal</div>
        <h1 className="titre">Ce que tu as traversé</h1>
        <p className="chapo">
          Une note par jour suffit. Relues à la file, elles montrent les besoins qui reviennent.
        </p>
      </div>

      <button className="principal large" style={{ background: T.soi, marginTop: 0 }} onClick={onEcrire}>
        Écrire la note du jour
      </button>
      {journal.length > 0 && (
        <button className="secondaire large" onClick={onExporter}>
          Exporter en PDF
        </button>
      )}

      {journal.length === 0 ? (
        <p className="note bas">Rien encore. La première note peut tenir en trois mots.</p>
      ) : (
        <div className="entrees">
          {groupes.map((g) => (
            <div key={g.date} className="jour">
              <div className="eyebrow">{jourLong.format(new Date(g.date))}</div>
              {g.entrees.map((e) => {
                const couleur = e.type === "note" ? (e.ton === "nourri" ? T.autre : T.soi) : ORIENTATIONS[e.orientation].couleur;
                const etiquette =
                  e.type === "note"
                    ? e.ton === "nourri"
                      ? "Ça m'a nourri"
                      : "Ça m'a remué"
                    : ORIENTATIONS[e.orientation].nom;
                return (
                  <div key={e.id} className="entree" style={{ borderColor: couleur }}>
                    <div className="entree-tag" style={{ color: couleur }}>{etiquette}</div>
                    <p className="entree-obs">{e.obs}</p>
                    {e.sentiment.length > 0 && (
                      <p className="entree-mots">{e.sentiment.join(" · ")}</p>
                    )}
                    {e.besoin.length > 0 && (
                      <p className="entree-besoin">Besoin de {e.besoin.join(", ")}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteDuJour({ onEnregistrer, onRetour }) {
  const [ton, setTon] = useState("manque");
  const [obs, setObs] = useState("");
  const [sentiment, setSentiment] = useState([]);
  const [besoin, setBesoin] = useState([]);
  const couleur = ton === "nourri" ? T.autre : T.soi;

  const bascule = (setter, liste) => (mot) =>
    setter(liste.includes(mot) ? liste.filter((x) => x !== mot) : [...liste, mot].slice(-3));

  return (
    <div className="ecran">
      <header className="barre">
        <button className="lien" onClick={onRetour}>← Journal</button>
        <span className="compteur">{jourLong.format(new Date())}</span>
      </header>

      <div className="carte">
        <div className="eyebrow" style={{ color: couleur }}>Note du jour</div>
        <h2 className="titre-etape">Qu'est-ce qui a compté aujourd'hui ?</h2>

        <div className="bascule">
          <button
            className={ton === "manque" ? "onglet actif" : "onglet"}
            onClick={() => { setTon("manque"); setSentiment([]); }}
            style={ton === "manque" ? { borderColor: T.soi, color: T.soi } : undefined}
          >
            Ça m'a remué
          </button>
          <button
            className={ton === "nourri" ? "onglet actif" : "onglet"}
            onClick={() => { setTon("nourri"); setSentiment([]); }}
            style={ton === "nourri" ? { borderColor: T.autre, color: T.autre } : undefined}
          >
            Ça m'a nourri
          </button>
        </div>

        <textarea
          className="champ"
          rows={2}
          placeholder="Un moment, une phrase, un geste."
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />

        <div className="comment">
          <div className="eyebrow" style={{ color: couleur }}>Comment faire</div>
          <p className="comment-corps">
            Une scène suffit, la première qui revient. Un mot pour ce que ça a fait en toi, un mot
            pour ce que ça dit de ce à quoi tu tiens. Trois minutes, pas plus.
          </p>
        </div>

        <div className="eyebrow">Ce que ça m'a fait</div>
        <Selecteur
          groupes={ton === "nourri" ? SENTIMENTS_NOURRI : SENTIMENTS_MANQUE}
          valeurs={sentiment}
          couleur={couleur}
          onToggle={bascule(setSentiment, sentiment)}
        />

        <div className="eyebrow espace">Ce à quoi je tiens</div>
        <Selecteur
          groupes={BESOINS}
          valeurs={besoin}
          couleur={couleur}
          onToggle={bascule(setBesoin, besoin)}
        />

        <button
          className="principal large"
          style={{ background: couleur, opacity: obs.trim() ? 1 : 0.35 }}
          disabled={!obs.trim()}
          onClick={() => onEnregistrer({ type: "note", ton, obs: obs.trim(), sentiment, besoin, demande: "" })}
        >
          Garder cette note
        </button>
      </div>
    </div>
  );
}

function Impression({ journal, onRetour }) {
  const [periode, setPeriode] = useState("tout");
  const [copie, setCopie] = useState(false);

  const limite = new Date();
  limite.setDate(limite.getDate() - 30);
  const retenues = periode === "tout" ? journal : journal.filter((e) => new Date(e.date) >= limite);

  const groupes = [];
  retenues.forEach((e) => {
    const dernier = groupes[groupes.length - 1];
    if (dernier && memeJour(dernier.date, e.date)) dernier.entrees.push(e);
    else groupes.push({ date: e.date, entrees: [e] });
  });

  const enTexte = () =>
    groupes
      .map((g) => {
        const lignes = g.entrees.map((e) => {
          const t =
            e.type === "note"
              ? e.ton === "nourri"
                ? "Ça m'a nourri"
                : "Ça m'a remué"
              : ORIENTATIONS[e.orientation].nom;
          return [
            `[${t}]`,
            e.obs,
            e.sentiment.length ? `Ressenti : ${e.sentiment.join(", ")}` : "",
            e.besoin.length ? `Besoin de ${e.besoin.join(", ")}` : "",
            e.demande ? `Suite : ${e.demande}` : "",
          ]
            .filter(Boolean)
            .join("\n");
        });
        return `${jourLong.format(new Date(g.date))}\n${lignes.join("\n\n")}`;
      })
      .join("\n\n———\n\n");

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(enTexte());
      setCopie(true);
      setTimeout(() => setCopie(false), 1800);
    } catch (e) {
      setCopie(false);
    }
  };

  return (
    <div className="ecran">
      <header className="barre no-print">
        <button className="lien" onClick={onRetour}>← Journal</button>
        <span className="compteur">{retenues.length} note{retenues.length > 1 ? "s" : ""}</span>
      </header>

      <div className="no-print">
        <div className="entete">
          <div className="eyebrow">Exporter</div>
          <h1 className="titre">Ton journal, sur papier</h1>
          <p className="chapo">
            Choisis « Enregistrer en PDF » dans la fenêtre d'impression. Le fichier reste sur ton
            appareil : rien n'est envoyé nulle part.
          </p>
        </div>

        <div className="bascule">
          <button
            className={periode === "tout" ? "onglet actif" : "onglet"}
            onClick={() => setPeriode("tout")}
            style={periode === "tout" ? { borderColor: T.encre, color: T.encre } : undefined}
          >
            Tout le journal
          </button>
          <button
            className={periode === "mois" ? "onglet actif" : "onglet"}
            onClick={() => setPeriode("mois")}
            style={periode === "mois" ? { borderColor: T.encre, color: T.encre } : undefined}
          >
            30 derniers jours
          </button>
        </div>

        <div className="reglage-actions">
          <button
            className="principal"
            style={{ background: T.encre }}
            onClick={() => window.print()}
          >
            Imprimer ou enregistrer en PDF
          </button>
          <button className="secondaire" onClick={copier}>
            {copie ? "Copié" : "Copier le texte"}
          </button>
        </div>
      </div>

      <div className="feuille">
        <div className="feuille-tete">
          <h2>Journal de pratique</h2>
          <p>
            {retenues.length} note{retenues.length > 1 ? "s" : ""} ·{" "}
            {periode === "mois" ? "30 derniers jours" : "journal complet"} · édité le{" "}
            {jourLong.format(new Date())}
          </p>
        </div>

        {groupes.length === 0 && <p className="note">Rien à exporter sur cette période.</p>}

        {groupes.map((g) => (
          <div key={g.date} className="feuille-jour">
            <div className="feuille-date">{jourLong.format(new Date(g.date))}</div>
            {g.entrees.map((e) => {
              const etiquette =
                e.type === "note"
                  ? e.ton === "nourri"
                    ? "Ça m'a nourri"
                    : "Ça m'a remué"
                  : ORIENTATIONS[e.orientation].nom;
              return (
                <div key={e.id} className="feuille-entree">
                  <div className="feuille-tag">{etiquette}</div>
                  <p className="feuille-obs">{e.obs}</p>
                  {e.sentiment.length > 0 && (
                    <p className="feuille-ligne">Ressenti : {e.sentiment.join(", ")}</p>
                  )}
                  {e.besoin.length > 0 && (
                    <p className="feuille-ligne">Besoin de {e.besoin.join(", ")}</p>
                  )}
                  {e.demande && <p className="feuille-ligne">Suite : {e.demande}</p>}
                </div>
              );
            })}
          </div>
        ))}

        <p className="feuille-pied">
          Document personnel. Rien de ce qu'il contient n'a quitté l'appareil sur lequel il a été
          écrit.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Entraînement ---------------- */

function Entrainement({ onRetour }) {
  const [serie, setSerie] = useState(null);
  const [i, setI] = useState(0);
  const [choisi, setChoisi] = useState(null);
  const [score, setScore] = useState(0);
  const [essai, setEssai] = useState("");
  const [devoile, setDevoile] = useState(false);

  const relancer = (k) => {
    setSerie(k);
    setI(0);
    setChoisi(null);
    setScore(0);
    setEssai("");
    setDevoile(false);
  };

  const suivante = () => {
    setI((n) => n + 1);
    setChoisi(null);
    setEssai("");
    setDevoile(false);
  };

  if (serie === null) {
    const familles = [];
    EXERCICES.forEach((ex, k) => {
      const derniere = familles[familles.length - 1];
      if (derniere && derniere.nom === ex.famille) derniere.series.push({ ex, k });
      else familles.push({ nom: ex.famille, series: [{ ex, k }] });
    });

    return (
      <div className="ecran">
        <header className="barre">
          <button className="lien" onClick={onRetour}>← Accueil</button>
        </header>
        <div className="entete">
          <div className="eyebrow">S'entraîner</div>
          <h1 className="titre">{EXERCICES.length} séries, à froid</h1>
          <p className="chapo">
            Ces distinctions se travaillent quand rien ne brûle. C'est là qu'elles s'installent, et
            elles reviennent toutes seules le jour où ça chauffe.
          </p>
        </div>
        {familles.map((f) => (
          <div key={f.nom} className="chapitre">
            <div className="chapitre-tete">{f.nom}</div>
            <div className="secondaires colonne">
              {f.series.map(({ ex, k }) => (
                <button key={ex.titre} className="tuile large-tuile" onClick={() => relancer(k)}>
                  <span className="tuile-titre" style={{ color: T.nuit }}>{ex.titre}</span>
                  <span className="tuile-sous">
                    {ex.items.length} phrases · {ex.consigne}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ex = EXERCICES[serie];
  const item = ex.items[i];
  const fini = i >= ex.items.length;

  if (fini) {
    return (
      <div className="ecran">
        <header className="barre">
          <button className="lien" onClick={() => setSerie(null)}>← Séries</button>
        </header>
        <div className="carte">
          <div className="eyebrow">{ex.titre}</div>
          <p className="phrase">
            {ex.type === "traduction"
              ? `${ex.items.length} phrases travaillées`
              : `${score} sur ${ex.items.length}`}
          </p>
          <p className="note">
            {ex.type === "traduction"
              ? "Reprends la série dans quelques jours avec tes propres phrases : celles que tu as pensées cette semaine sans les dire."
              : "Ce qui compte n'est pas le score, c'est le temps qu'il te faudra la prochaine fois pour repérer la différence dans ta propre phrase."}
          </p>
          <div className="recap-actions">
            <button className="principal plein" style={{ background: T.encre }} onClick={() => relancer(serie)}>
              Refaire la série
            </button>
            <button className="secondaire plein" onClick={() => setSerie(null)}>
              Choisir une autre série
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ecran">
      <header className="barre">
        <button className="lien" onClick={() => setSerie(null)}>← Séries</button>
        <span className="compteur">{i + 1} / {ex.items.length}</span>
      </header>
      <div className="carte">
        <div className="eyebrow">{ex.consigne}</div>
        <p className="phrase-exo">« {item.phrase} »</p>

        {ex.type === "binaire" && (
          <div className="choix">
            {ex.choix.map((c, k) => {
              const juste = k === item.bonne;
              const montre = choisi !== null;
              return (
                <button
                  key={c}
                  className="option"
                  onClick={() => {
                    if (choisi !== null) return;
                    setChoisi(k);
                    if (juste) setScore((n) => n + 1);
                  }}
                  style={
                    montre
                      ? {
                          borderColor: juste ? T.autre : k === choisi ? T.dire : T.trait,
                          color: juste ? T.autre : k === choisi ? T.dire : T.gris,
                        }
                      : undefined
                  }
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {ex.type === "choix" && (
          <div className="choix">
            {item.options.map((o, k) => {
              const montre = choisi !== null;
              return (
                <button
                  key={o.texte}
                  className="option"
                  onClick={() => {
                    if (choisi !== null) return;
                    setChoisi(k);
                    if (o.bonne) setScore((n) => n + 1);
                  }}
                  style={
                    montre
                      ? {
                          borderColor: o.bonne ? T.autre : k === choisi ? T.dire : T.trait,
                          color: o.bonne ? T.autre : k === choisi ? T.dire : T.gris,
                        }
                      : undefined
                  }
                >
                  {o.texte}
                  {montre && (k === choisi || o.bonne) && (
                    <span className="option-mot">{o.mot}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {ex.type === "traduction" && (
          <>
            <textarea
              className="champ"
              rows={4}
              placeholder="Le fait d'abord, puis ce que ça te fait, puis le besoin."
              value={essai}
              onChange={(e) => setEssai(e.target.value)}
            />
            {!devoile && (
              <button
                className="principal plein"
                style={{ background: T.encre, marginTop: 12, opacity: essai.trim() ? 1 : 0.35 }}
                disabled={!essai.trim()}
                onClick={() => setDevoile(true)}
              >
                Comparer avec une proposition
              </button>
            )}
            {devoile && (
              <div className="aide" style={{ borderColor: T.autre, marginTop: 16 }}>
                <div className="eyebrow">Une version possible</div>
                <p className="aide-exemple">{item.modele}</p>
                <div className="eyebrow">Pourquoi</div>
                <p className="aide-piege">{item.pourquoi}</p>
              </div>
            )}
          </>
        )}

        {ex.type === "binaire" && choisi !== null && <p className="retour-exo">{item.mot}</p>}

        {(choisi !== null || devoile) && (
          <button className="principal plein" style={{ background: T.encre, marginTop: 16 }} onClick={suivante}>
            {i + 1 === ex.items.length ? "Terminer" : "Suivante"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Théorie ---------------- */

function Theorie({ onRetour }) {
  const [ouvert, setOuvert] = useState("0-0");
  return (
    <div className="ecran">
      <header className="barre">
        <button className="lien" onClick={onRetour}>← Accueil</button>
      </header>
      <div className="entete">
        <div className="eyebrow">Comprendre</div>
        <h1 className="titre">Ce qu'il y a derrière les quatre étapes</h1>
        <p className="chapo">
          À lire dans le désordre, un morceau à la fois. Rien ici ne sert à réussir un exercice.
        </p>
      </div>

      {THEORIE.map((sec, si) => (
        <div key={sec.section} className="chapitre">
          <div className="chapitre-tete">{sec.section}</div>
          <div className="pliages">
            {sec.entrees.map((t, k) => {
              const cle = `${si}-${k}`;
              const actif = ouvert === cle;
              return (
                <div key={t.titre} className="pliage">
                  <button
                    className="pliage-tete"
                    onClick={() => setOuvert(actif ? "" : cle)}
                    aria-expanded={actif}
                  >
                    <span>{t.titre}</span>
                    <span className="chevron" style={{ transform: actif ? "rotate(45deg)" : "none" }}>+</span>
                  </button>
                  {actif && (
                    <div className="pliage-corps">
                      {t.corps.map((par, i) => (
                        <p key={i}>{par}</p>
                      ))}
                      {t.exemple && <p className="pliage-exemple">{t.exemple}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="note bas">
        Cette application ne remplace pas une formation. Elle sert à pratiquer entre deux.
      </p>
    </div>
  );
}

function Reglages({ reglages, setReglages, journal, onEffacer, onExporter, onRetour }) {
  const [confirme, setConfirme] = useState(false);
  return (
    <div className="ecran">
      <header className="barre">
        <button className="lien" onClick={onRetour}>← Accueil</button>
      </header>
      <div className="entete">
        <div className="eyebrow">Réglages</div>
        <h1 className="titre">Comment l'application se tient</h1>
      </div>

      <div className="chapitre">
        <div className="chapitre-tete">Préférences</div>
        <div className="reglage">
          <span className="reglage-nom">Accord par défaut</span>
          <div className="bascule court">
            <button
              className={reglages.accord === "m" ? "onglet actif" : "onglet"}
              onClick={() => setReglages({ ...reglages, accord: "m" })}
              style={reglages.accord === "m" ? { borderColor: T.encre, color: T.encre } : undefined}
            >
              masculin
            </button>
            <button
              className={reglages.accord === "f" ? "onglet actif" : "onglet"}
              onClick={() => setReglages({ ...reglages, accord: "f" })}
              style={reglages.accord === "f" ? { borderColor: T.encre, color: T.encre } : undefined}
            >
              féminin
            </button>
          </div>
        </div>
        <div className="reglage">
          <span className="reglage-nom">
            Rappel du journal
            <span className="reglage-sous">Une invitation à écrire, en fin de journée</span>
          </span>
          <button
            className={reglages.rappel ? "interrupteur allume" : "interrupteur"}
            onClick={() => setReglages({ ...reglages, rappel: !reglages.rappel })}
            aria-pressed={reglages.rappel}
          >
            <span className="pastille" />
          </button>
        </div>
      </div>

      <div className="chapitre">
        <div className="chapitre-tete">Tes données</div>
        <p className="reglage-texte">
          Tout ce que tu écris reste sur cet appareil. Aucun compte, aucun envoi vers un serveur,
          aucune mesure d'audience, aucun partage avec qui que ce soit. Personne d'autre que toi,
          pas même la personne qui a fait cette application, ne peut lire ton journal.
        </p>
        <p className="reglage-texte">
          La contrepartie est là aussi : si tu perds ton téléphone, tes notes partent avec.
          Une sauvegarde manuelle est prévue, et elle restera un fichier que tu ranges où tu veux.
        </p>
        <div className="reglage-actions">
          <button className="secondaire" onClick={onExporter} disabled={journal.length === 0}>
            Exporter le journal
          </button>
          <button
            className="secondaire danger"
            onClick={() => (confirme ? (onEffacer(), setConfirme(false)) : setConfirme(true))}
          >
            {confirme ? "Confirmer l'effacement" : "Effacer le journal"}
          </button>
        </div>
        <p className="note">
          {journal.length === 0
            ? "Aucune note enregistrée."
            : `${journal.length} note${journal.length > 1 ? "s" : ""} sur cet appareil.`}
        </p>
      </div>

      <div className="chapitre">
        <div className="chapitre-tete">À qui ça appartient</div>
        <p className="reglage-texte">
          La Communication NonViolente a été élaborée par Marshall Rosenberg (1934-2015). Le
          processus lui-même n'appartient à personne : il s'enseigne, se transmet et se pratique
          librement.
        </p>
        <p className="reglage-texte">
          Le Center for Nonviolent Communication certifie les formatrices et formateurs. Cette
          application n'est ni certifiée, ni affiliée, ni validée par le CNVC ou par une association
          de CNV. Elle ne donne aucun titre et ne remplace aucune formation.
        </p>
        <p className="reglage-texte">
          Les textes, les exercices et les listes de sentiments et de besoins réunis ici ont été
          écrits pour cette application. Les listes s'inspirent du vocabulaire largement partagé dans
          la communauté CNV francophone, sans reprendre le contenu d'un organisme en particulier.
        </p>
        <p className="reglage-texte">
          Une erreur, un désaccord, une formulation qui te semble fausse ? Écris-nous : cette
          application est faite pour être corrigée.
        </p>
      </div>

      <p className="note bas">
        Version web · tes notes sont conservées dans le stockage local de ce navigateur.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500&family=Karla:wght@400;500;600&display=swap');

.racine {
  min-height: 100%;
  background: ${T.brume};
  padding: 0;
  font-family: Karla, ui-sans-serif, system-ui, sans-serif;
  color: ${T.encre};
  -webkit-font-smoothing: antialiased;
}
.cadre {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${T.fond};
  box-shadow: 0 0 60px rgba(22,34,46,0.06);
}
.ecran { padding: 26px 22px 44px; animation: entree .34s ease both; }
@keyframes entree { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ecran, .carte { animation: none !important; } }

.barre { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.lien {
  background: none; border: none; padding: 6px 0; cursor: pointer;
  font-family: Karla, sans-serif; font-size: 13px; color: ${T.gris};
}
.lien:hover { color: ${T.encre}; }
.compteur { font-size: 12px; color: ${T.gris}; letter-spacing: .06em; }

.eyebrow {
  font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
  color: ${T.gris}; margin-bottom: 8px; font-weight: 600;
}
.titre {
  font-family: Fraunces, Georgia, serif; font-weight: 300;
  font-size: 30px; line-height: 1.15; margin: 0 0 10px; color: ${T.nuit};
  letter-spacing: -0.01em;
}
.chapo { font-size: 14.5px; line-height: 1.55; color: ${T.gris}; margin: 0; }
.entete { margin-bottom: 26px; }

/* portes */
.entete-haut { margin-bottom: 26px; }
.lien-icone { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: ${T.encre}; }
.icone-mini { width: 18px; height: 18px; display: block; color: ${T.encre}; }
.titre-accueil { font-size: 36px; line-height: 1.12; margin-bottom: 30px; }

.portes { display: flex; flex-direction: column; gap: 14px; }
.porte {
  display: flex; align-items: center; gap: 18px; width: 100%;
  border: 1px solid; border-radius: 16px;
  padding: 20px 20px; text-align: left; cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
}
.porte:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(22,34,46,0.06); }
.medaille {
  width: 84px; height: 84px; flex: 0 0 84px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; padding: 17px; box-sizing: border-box;
}
.medaille.petite { width: 52px; height: 52px; flex: 0 0 52px; padding: 10px; margin-bottom: 14px; }
.porte-texte { display: flex; flex-direction: column; gap: 6px; }
.porte-titre { font-family: Fraunces, Georgia, serif; font-size: 21px; font-weight: 400; line-height: 1.15; }
.porte-sous { font-size: 14px; color: ${T.gris}; line-height: 1.45; }

.secondaires { display: flex; gap: 12px; margin-top: 14px; }
.secondaires.colonne { flex-direction: column; }
.tuile {
  flex: 1; background: ${T.papier}; border: 1px solid ${T.trait}; border-radius: 16px;
  padding: 18px; text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 5px;
}
.tuile:hover { box-shadow: 0 6px 18px rgba(22,34,46,0.05); }
.tuile-titre { font-family: Fraunces, Georgia, serif; font-size: 19px; }
.tuile-sous { font-size: 13px; color: ${T.gris}; line-height: 1.45; }

/* arc */
.arc { margin: 2px 0 18px; }
.arc-nom { text-align: center; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; margin-top: 4px; }

.bandeau {
  border-left: 2px solid; padding: 8px 12px; font-size: 12.5px; line-height: 1.45;
  margin-bottom: 14px; background: rgba(0,0,0,0.015);
}

/* carte d'étape */
.carte {
  border: 1px solid ${T.trait}; border-radius: 16px; padding: 22px 20px 20px;
  background: ${T.papier}; animation: entree .3s ease both;
}
.titre-etape {
  font-family: Fraunces, Georgia, serif; font-weight: 300; font-size: 24px;
  line-height: 1.2; margin: 0 0 8px; color: ${T.nuit};
}
.invite { font-size: 14px; color: ${T.gris}; margin: 0 0 14px; line-height: 1.5; }
.role {
  font-size: 13.5px; line-height: 1.55; color: ${T.encre}; margin: 0 0 16px;
  padding-left: 12px; border-left: 1px solid ${T.trait};
}
.saisie { margin-bottom: 14px; }

.champ {
  width: 100%; box-sizing: border-box; border: 1px solid ${T.trait}; border-radius: 10px;
  padding: 11px 12px; font-family: Karla, sans-serif; font-size: 15px; color: ${T.encre};
  background: #fff; resize: vertical; line-height: 1.5;
}
.champ::placeholder { color: #A9B1B7; }
.champ:focus { outline: 2px solid ${T.encre}; outline-offset: 1px; border-color: transparent; }
.champ-filtre { margin-bottom: 12px; font-size: 14px; padding: 8px 10px; }
.cachee { position: absolute; left: -9999px; opacity: 0; }

.groupes { display: flex; flex-direction: column; gap: 12px; max-height: 260px; overflow-y: auto; }
.groupe .eyebrow { margin-bottom: 6px; }
.puces { display: flex; flex-wrap: wrap; gap: 6px; }
.puce {
  border: 1px solid; border-radius: 999px; padding: 5px 11px; font-size: 13px;
  font-family: Karla, sans-serif; cursor: pointer; transition: background .15s, color .15s;
}

.bascule { display: flex; gap: 6px; margin-bottom: 12px; }
.onglet {
  flex: 1; border: 1px solid ${T.trait}; background: ${T.papier}; border-radius: 999px;
  padding: 7px 8px; font-size: 12.5px; font-family: Karla, sans-serif; color: ${T.gris}; cursor: pointer;
}
.onglet.actif { font-weight: 600; }

.comment {
  background: ${T.brume}; border-radius: 12px; padding: 12px 14px; margin: 0 0 14px;
}
.comment .eyebrow { margin-bottom: 5px; }
.comment-corps { font-size: 13.5px; line-height: 1.6; margin: 0; color: ${T.encre}; }

/* proposition de détour */
.accord {
  display: flex; align-items: center; gap: 6px; margin-top: 12px;
  font-size: 12px; color: ${T.gris};
}
.accord button {
  background: none; border: none; padding: 2px 0; cursor: pointer;
  font-family: Karla, sans-serif; font-size: 12px; color: ${T.gris};
  border-bottom: 1px solid transparent;
}
.accord button.accord-actif { color: ${T.encre}; border-bottom-color: ${T.encre}; font-weight: 600; }

.jauge { margin-top: 16px; padding-top: 14px; border-top: 1px solid ${T.trait}; }
.jauge-tete { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; color: ${T.encre}; margin-bottom: 6px; }
.jauge-tete strong { font-family: Fraunces, Georgia, serif; font-size: 22px; font-weight: 500; }
.jauge input[type="range"] { width: 100%; }
.jauge-note { font-size: 12px; line-height: 1.5; color: ${T.gris}; margin: 10px 0 0; }
.jauge-bornes { display: flex; justify-content: space-between; font-size: 11px; color: ${T.gris}; margin-top: 2px; }

.apercu { }
.apercu-phrase {
  font-family: Fraunces, Georgia, serif; font-size: 18px; line-height: 1.45;
  border-left: 2px solid; padding: 2px 0 2px 12px; margin: 0 0 4px; color: ${T.nuit};
  white-space: pre-line;
}
.cas { margin-bottom: 12px; }
.cas-titre { font-size: 13.5px; font-weight: 600; color: ${T.encre}; margin-bottom: 2px; }
.cas-quoi { font-size: 13px; line-height: 1.55; color: ${T.gris}; margin: 0; }

.temps { margin-top: 18px; padding-top: 14px; border-top: 1px solid ${T.trait}; }
.temps-note { font-size: 12.5px; line-height: 1.55; color: ${T.gris}; margin: 10px 0 0; }

.propose {
  margin-top: 14px; border: 1px solid ${T.soi}; border-radius: 14px; padding: 14px;
  background: rgba(124,92,126,0.05); animation: entree .3s ease both;
}
.propose-texte { font-size: 13.5px; line-height: 1.55; margin: 0 0 12px; color: ${T.encre}; }
.propose-actions { display: flex; gap: 8px; }
.propose-oui {
  flex: 2; border: none; background: ${T.soi}; color: #fff; border-radius: 999px; padding: 10px;
  font-family: Karla, sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer;
}
.propose-non {
  flex: 1; border: 1px solid ${T.trait}; background: transparent; color: ${T.gris};
  border-radius: 2px; padding: 10px; font-family: Karla, sans-serif; font-size: 13.5px; cursor: pointer;
}

/* journal */
.ruban {
  width: 100%; margin-top: 14px; display: flex; align-items: center; gap: 14px;
  background: ${T.papier}; border: 1px solid ${T.trait}; border-radius: 16px;
  padding: 16px 18px; cursor: pointer; text-align: left;
}
.ruban:hover { box-shadow: 0 6px 18px rgba(22,34,46,0.05); }
.ruban-picto { width: 46px; height: 46px; flex: 0 0 46px; color: ${T.encre}; display: block; }
.ruban-texte { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.ruban-titre { font-family: Fraunces, Georgia, serif; font-size: 20px; color: ${T.nuit}; }
.ruban-sous { font-size: 13px; color: ${T.gris}; line-height: 1.4; }
.fil { display: flex; gap: 5px; flex: 0 0 auto; }
.fil-point { width: 6px; height: 6px; border-radius: 50%; border: 1px solid; display: block; }
.rond-fleche {
  width: 38px; height: 38px; flex: 0 0 38px; border-radius: 50%; background: ${T.brume};
  color: ${T.encre}; display: flex; align-items: center; justify-content: center; padding: 7px;
  box-sizing: border-box;
}

.entrees { margin-top: 26px; display: flex; flex-direction: column; gap: 22px; }
.jour { display: flex; flex-direction: column; gap: 8px; }
.entree { border-left: 2px solid; padding: 2px 0 2px 12px; }
.entree-tag { font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
.entree-obs { font-family: Fraunces, Georgia, serif; font-size: 15.5px; line-height: 1.45; margin: 0 0 4px; color: ${T.nuit}; }
.entree-mots { font-size: 13px; color: ${T.gris}; margin: 0 0 2px; }
.entree-besoin { font-size: 13px; color: ${T.encre}; margin: 0; }
.eyebrow.espace { margin-top: 18px; }

.aide-bouton {
  display: flex; align-items: center; gap: 8px; background: none; border: none; padding: 4px 0;
  font-family: Karla, sans-serif; font-size: 13px; color: ${T.gris}; cursor: pointer;
}
.aide-bouton:hover { color: ${T.encre}; }
.rond {
  width: 19px; height: 19px; border-radius: 50%; border: 1px solid; display: inline-flex;
  align-items: center; justify-content: center; font-size: 12px; font-weight: 600;
}
.aide { border-left: 2px solid; padding: 12px 0 2px 12px; margin-top: 12px; }
.aide-exemple { font-family: Fraunces, Georgia, serif; font-size: 15px; line-height: 1.55; margin: 0 0 14px; color: ${T.nuit}; }
.aide-piege { font-size: 13.5px; line-height: 1.55; margin: 0; color: ${T.encre}; }

.detour {
  width: 100%; margin-top: 12px; background: none; border: 1px dashed ${T.soi};
  color: ${T.soi}; border-radius: 999px; padding: 10px; font-size: 13px;
  font-family: Karla, sans-serif; cursor: pointer;
}

.pied { display: flex; gap: 10px; margin-top: 18px; }
.principal {
  flex: 2; border: none; border-radius: 999px; color: #fff; padding: 13px;
  font-family: Karla, sans-serif; font-size: 15px; font-weight: 600; cursor: pointer;
}
.principal[disabled] { cursor: not-allowed; }
.secondaire {
  flex: 1; border: 1px solid ${T.trait}; background: transparent; border-radius: 999px;
  padding: 13px; font-family: Karla, sans-serif; font-size: 15px; color: ${T.gris}; cursor: pointer;
}
.large { width: 100%; flex: none; margin-top: 14px; }
.recap-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.plein { width: 100%; flex: none; }
.confirme {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 13.5px; color: ${T.gris}; padding: 12px;
}
.lien.souligne { border-bottom: 1px solid ${T.encre}; color: ${T.encre}; padding: 0; }
.copie-secours { margin-top: 14px; }

.phrase {
  font-family: Fraunces, Georgia, serif; font-size: 21px; line-height: 1.45;
  color: ${T.nuit}; white-space: pre-line; margin: 6px 0 0;
}
.phrase-exo { font-family: Fraunces, Georgia, serif; font-size: 20px; line-height: 1.4; color: ${T.nuit}; margin: 4px 0 18px; }
.note { font-size: 13px; line-height: 1.55; color: ${T.gris}; margin-top: 16px; }
.note.bas { margin-top: 26px; text-align: center; }

.choix { display: flex; flex-direction: column; gap: 8px; }
.option {
  border: 1px solid ${T.trait}; background: ${T.papier}; border-radius: 12px; padding: 12px;
  font-family: Karla, sans-serif; font-size: 14.5px; color: ${T.encre}; cursor: pointer; text-align: left;
}
.option { display: flex; flex-direction: column; gap: 5px; }
.option-mot { font-size: 12.5px; line-height: 1.5; opacity: .85; }
.retour-exo { font-size: 13.5px; line-height: 1.55; color: ${T.encre}; margin: 14px 0 0; padding-left: 12px; border-left: 1px solid ${T.trait}; }
.large-tuile { padding: 18px 16px; }

.chapitre { margin-bottom: 30px; }
.chapitre-tete {
  font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; font-weight: 600;
  color: ${T.gris}; margin-bottom: 4px;
}
.pliage-exemple {
  font-family: Fraunces, Georgia, serif; font-size: 14.5px; line-height: 1.5;
  border-left: 2px solid ${T.trait}; padding-left: 12px; color: ${T.nuit};
}
.pliage-corps p { margin: 0 0 12px; }

.reglage {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 14px 0; border-top: 1px solid ${T.trait};
}
.reglage-nom { display: flex; flex-direction: column; gap: 2px; font-size: 14.5px; color: ${T.encre}; }
.reglage-sous { font-size: 12px; color: ${T.gris}; }
.bascule.court { margin: 0; flex: 0 0 auto; }
.bascule.court .onglet { padding: 6px 10px; font-size: 12px; }
.reglage-texte { font-size: 14px; line-height: 1.6; color: ${T.encre}; margin: 12px 0 0; }
.reglage-actions { display: flex; gap: 8px; margin-top: 16px; }
.reglage-actions .secondaire { flex: 1; padding: 10px; font-size: 13.5px; }
.secondaire.danger { color: #9B4A3F; border-color: #E0C9C4; }
.secondaire[disabled] { opacity: .45; cursor: not-allowed; }
.interrupteur {
  width: 40px; height: 23px; border-radius: 999px; border: 1px solid ${T.trait};
  background: transparent; cursor: pointer; padding: 2px; display: flex; justify-content: flex-start;
}
.interrupteur.allume { background: ${T.encre}; border-color: ${T.encre}; justify-content: flex-end; }
.pastille { width: 17px; height: 17px; border-radius: 50%; background: ${T.trait}; display: block; }
.interrupteur.allume .pastille { background: #fff; }

.pliages { display: flex; flex-direction: column; }
.pliage { border-top: 1px solid ${T.trait}; }
.pliage:last-child { border-bottom: 1px solid ${T.trait}; }
.pliage-tete {
  width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px;
  background: none; border: none; padding: 16px 0; cursor: pointer; text-align: left;
  font-family: Fraunces, Georgia, serif; font-size: 17px; color: ${T.nuit};
}
.chevron { font-size: 18px; color: ${T.gris}; transition: transform .2s; }
.pliage-corps { font-size: 14px; line-height: 1.6; color: ${T.encre}; margin: 0 0 18px; padding-right: 8px; }

button:focus-visible { outline: 2px solid ${T.nuit}; outline-offset: 2px; }

/* feuille d'export */
.feuille {
  margin-top: 26px; background: ${T.papier}; border: 1px solid ${T.trait};
  border-radius: 16px; padding: 24px 22px;
}
.feuille-tete { border-bottom: 1px solid ${T.trait}; padding-bottom: 14px; margin-bottom: 20px; }
.feuille-tete h2 {
  font-family: Fraunces, Georgia, serif; font-weight: 300; font-size: 24px;
  margin: 0 0 6px; color: ${T.nuit};
}
.feuille-tete p { font-size: 12px; color: ${T.gris}; margin: 0; }
.feuille-jour { margin-bottom: 22px; }
.feuille-date {
  font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
  font-weight: 600; color: ${T.gris}; margin-bottom: 10px;
}
.feuille-entree { margin-bottom: 14px; break-inside: avoid; page-break-inside: avoid; }
.feuille-tag { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: ${T.gris}; margin-bottom: 3px; }
.feuille-obs { font-family: Fraunces, Georgia, serif; font-size: 15.5px; line-height: 1.5; margin: 0 0 4px; color: ${T.nuit}; }
.feuille-ligne { font-size: 13px; line-height: 1.5; color: ${T.encre}; margin: 0; }
.feuille-pied { font-size: 11.5px; color: ${T.gris}; margin: 24px 0 0; border-top: 1px solid ${T.trait}; padding-top: 12px; }

@media print {
  .racine, .cadre { background: #fff; box-shadow: none; max-width: none; }
  .ecran { padding: 0; animation: none; }
  .no-print { display: none !important; }
  .feuille { border: none; border-radius: 0; padding: 0; margin: 0; }
  .feuille-obs, .feuille-ligne, .feuille-tete h2 { color: #000; }
  @page { margin: 18mm; }
}

/* accueil : tout tient dans une hauteur d'écran, sans défilement */
.ecran.accueil {
  min-height: 100vh;
  min-height: 100dvh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(8px, 1.5vh, 16px);
  padding: clamp(14px, 2.4vh, 26px) 22px
    calc(clamp(16px, 2.6vh, 30px) + env(safe-area-inset-bottom, 0px));
}
.accueil .entete-haut { margin-bottom: 0; }
.accueil .titre-accueil {
  font-size: clamp(24px, 4.5vh, 36px);
  line-height: 1.1;
  margin: 0;
}
.accueil .portes { gap: clamp(8px, 1.3vh, 14px); }
.accueil .porte {
  padding: clamp(10px, 1.7vh, 20px) clamp(14px, 4vw, 20px);
  gap: clamp(12px, 3.5vw, 18px);
  border-radius: clamp(12px, 2vh, 16px);
}
.accueil .medaille {
  flex: 0 0 auto;
  width: clamp(50px, 9.2vh, 84px);
  height: clamp(50px, 9.2vh, 84px);
  padding: clamp(9px, 1.8vh, 17px);
}
.accueil .porte-texte { gap: clamp(2px, .5vh, 6px); }
.accueil .porte-titre { font-size: clamp(17px, 2.6vh, 21px); }
.accueil .porte-sous { font-size: clamp(12px, 1.7vh, 14px); }
.accueil .ruban {
  margin-top: 0;
  padding: clamp(10px, 1.5vh, 16px) clamp(14px, 4vw, 18px);
  border-radius: clamp(12px, 2vh, 16px);
  gap: clamp(10px, 3vw, 14px);
}
.accueil .ruban-picto {
  flex: 0 0 auto;
  width: clamp(32px, 5.4vh, 46px);
  height: clamp(32px, 5.4vh, 46px);
}
.accueil .ruban-titre { font-size: clamp(17px, 2.5vh, 20px); }
.accueil .ruban-sous { font-size: clamp(11.5px, 1.6vh, 13px); }
.accueil .rond-fleche {
  width: clamp(30px, 4.8vh, 38px);
  height: clamp(30px, 4.8vh, 38px);
  flex: 0 0 auto;
}
.accueil .secondaires { margin-top: 0; gap: clamp(8px, 2.5vw, 12px); }
.accueil .tuile {
  padding: clamp(11px, 1.7vh, 18px);
  border-radius: clamp(12px, 2vh, 16px);
  gap: clamp(2px, .5vh, 5px);
}
.accueil .medaille.petite {
  width: clamp(36px, 6vh, 52px);
  height: clamp(36px, 6vh, 52px);
  padding: clamp(7px, 1.2vh, 10px);
  margin-bottom: clamp(6px, 1.2vh, 14px);
}
.accueil .tuile-titre { font-size: clamp(16px, 2.4vh, 19px); }
.accueil .tuile-sous { font-size: clamp(11.5px, 1.6vh, 13px); }

/* écrans très courts : le fil des jours passe à la trappe avant le reste */
@media (max-height: 620px) {
  .accueil .fil { display: none; }
}
`;
