import React from "react";
import {
  AirplaneTilt, ArrowDownLeft, ArrowUpRight, Baby, Barbell, BeachBall, Bell, Bicycle, BookOpen, BowlFood,
  Briefcase, Broom, Bus, Butterfly, Cake, CalendarHeart, Camera, Car, Carrot, ChartLineUp, ChatCircleDots,
  Champagne, Cherries, CloudRain, Coffee, Coins, Confetti, Couch, CreditCard, Crown, DeviceMobile,
  DeviceMobileSlash, Diamond, Dress, EnvelopeSimple, EnvelopeSimpleOpen, FilmSlate, Fire, Flag, Flower,
  FlowerTulip, ForkKnife, GameController, Gift, Globe, GraduationCap, Guitar, Hamburger, HandCoins, HandHeart,
  Handshake, Headphones, Heart, Heartbeat, Hourglass, HouseLine, Island, Laptop, Leaf, Lightning, LockKey,
  Mailbox, MagnifyingGlass, MapPin, Medal, Microphone, Moon, MoonStars, Moped, Motorcycle, Package, PawPrint,
  PersonSimpleWalk, PiggyBank, Pill, Plant, Popcorn, Receipt, RocketLaunch, Scales, ShieldCheck, ShoppingBag,
  Smiley, SmileyMeh, SmileySad, SmileyWink, Sneaker, Sparkle, Star, Stethoscope, Storefront, Suitcase,
  Sunglasses, Sword, Tag, Target, Television, Trash, Tray, Tree, Trophy, TShirt, User, UsersThree, Wallet,
  Wine, Basket, ShootingStar, Sun, Brain, DiceFive, MusicNotes, Anchor, Lightbulb, PuzzlePiece, MaskHappy,
  type Icon as PhosphorIcon,
  type IconWeight,
} from "@phosphor-icons/react";
import { cn } from "../../lib/utils";

/**
 * One icon family for every illustrative icon in the app (Phosphor, duotone).
 * Lucide stays for controls (close, arrows, menus); everything that used to be
 * an emoji-as-icon (categories, missions, empty states, wishes) comes from here.
 */
export const ICONS = {
  travel: AirplaneTilt, island: Island, beach: BeachBall, suitcase: Suitcase, globe: Globe, pin: MapPin,
  car: Car, moto: Motorcycle, bike: Bicycle, bus: Bus, delivery: Moped, walk: PersonSimpleWalk,
  house: HouseLine, couch: Couch, plant: Plant, tree: Tree, leaf: Leaf, flower: Flower, tulip: FlowerTulip,
  ring: Diamond, champagne: Champagne, wine: Wine, heart: Heart, love: HandHeart, butterfly: Butterfly,
  shield: ShieldCheck, target: Target, rocket: RocketLaunch, sparkle: Sparkle, star: Star, shooting: ShootingStar,
  food: ForkKnife, bowl: BowlFood, burger: Hamburger, coffee: Coffee, cherries: Cherries, carrot: Carrot,
  cake: Cake, popcorn: Popcorn, basket: Basket,
  coins: Coins, piggy: PiggyBank, wallet: Wallet, handcoins: HandCoins, card: CreditCard, receipt: Receipt,
  tag: Tag, store: Storefront, bag: ShoppingBag, dress: Dress, shirt: TShirt, sneaker: Sneaker,
  sunglasses: Sunglasses, package: Package, scales: Scales, broom: Broom,
  phone: DeviceMobile, nophone: DeviceMobileSlash, laptop: Laptop, tv: Television, headphones: Headphones,
  mic: Microphone, guitar: Guitar, game: GameController, film: FilmSlate, camera: Camera, book: BookOpen,
  graduation: GraduationCap, briefcase: Briefcase, lightning: Lightning, gym: Barbell, pill: Pill,
  health: Stethoscope, heartbeat: Heartbeat, baby: Baby, pet: PawPrint,
  fire: Fire, trophy: Trophy, medal: Medal, crown: Crown, flag: Flag, sword: Sword, confetti: Confetti,
  gift: Gift, lock: LockKey, hourglass: Hourglass, calendar: CalendarHeart, bell: Bell, chat: ChatCircleDots,
  envelope: EnvelopeSimple, letter: EnvelopeSimpleOpen, mailbox: Mailbox, tray: Tray, trash: Trash,
  search: MagnifyingGlass, user: User, group: UsersThree, handshake: Handshake, chart: ChartLineUp,
  income: ArrowDownLeft, expense: ArrowUpRight,
  smile: Smiley, wink: SmileyWink, meh: SmileyMeh, sad: SmileySad, moon: Moon, night: MoonStars,
  rain: CloudRain, sun: Sun,
  brain: Brain, dice: DiceFive, music: MusicNotes, anchor: Anchor, idea: Lightbulb, puzzle: PuzzlePiece, mask: MaskHappy,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof ICONS;

/** Emojis saved by older versions (wishes, custom missions, goals) → icon. */
const EMOJI_TO_ICON: Record<string, IconName> = {
  "✈️": "travel", "✈": "travel", "🏝️": "island", "🏖️": "beach", "🌍": "globe", "🌴": "island", "🧳": "suitcase",
  "🚗": "car", "🏍️": "moto", "🛵": "delivery", "🚌": "bus", "🚲": "bike", "🚶": "walk", "⛽": "car",
  "🏠": "house", "🔑": "house", "🪴": "plant", "🌳": "tree", "🌿": "leaf", "💐": "flower", "🌷": "tulip",
  "💍": "ring", "🥂": "champagne", "🍷": "wine", "❤️": "heart", "💕": "heart", "💞": "heart", "💛": "heart",
  "💚": "leaf", "💖": "heart", "🫶": "love", "🛟": "shield", "🛡️": "shield", "🎯": "target", "🚀": "rocket",
  "✨": "sparkle", "⭐": "star", "🌟": "star", "💫": "shooting",
  "🍝": "food", "🍔": "burger", "🍱": "bowl", "🥗": "bowl", "🍣": "bowl", "☕": "coffee", "🍓": "cherries",
  "🍒": "cherries", "🎂": "cake", "🍿": "popcorn", "🧺": "basket",
  "💰": "coins", "🪙": "coins", "💸": "handcoins", "💳": "card", "🏷️": "tag", "🛍️": "bag", "👗": "dress",
  "👕": "shirt", "👟": "sneaker", "🕶️": "sunglasses", "📦": "package", "⚖️": "scales", "🧹": "broom",
  "💄": "sparkle", "🎀": "gift", "🎁": "gift", "📱": "phone", "📵": "nophone", "💻": "laptop", "📺": "tv",
  "🎧": "headphones", "🎤": "mic", "🎸": "guitar", "🎮": "game", "🎬": "film", "📸": "camera", "📖": "book",
  "🎓": "graduation", "💼": "briefcase", "⚡": "lightning", "💊": "pill", "🩺": "health", "🏋️": "gym",
  "🐶": "pet", "🔥": "fire", "🏆": "trophy", "🥇": "medal", "👑": "crown", "🏁": "flag", "⚔️": "sword",
  "🎉": "confetti", "🎊": "confetti", "🔒": "lock", "⏳": "hourglass", "📅": "calendar", "💌": "envelope",
  "📭": "mailbox", "🗑️": "trash", "🔎": "search", "👤": "user", "👥": "group", "📈": "chart", "💎": "ring", "🧠": "brain", "🎲": "dice", "🎵": "music", "🎶": "music", "⚓": "anchor", "💡": "idea", "🎭": "mask",
};

/** Accepts an icon key, a legacy emoji, or anything else (returns null). */
export function resolveIcon(value?: string | null): PhosphorIcon | null {
  if (!value) return null;
  if (value in ICONS) return ICONS[value as IconName];
  const key = EMOJI_TO_ICON[value] ?? EMOJI_TO_ICON[value.replace(/️/g, "")];
  return key ? ICONS[key] : null;
}

export type IconTone = "primary" | "gold" | "emerald" | "rose" | "violet" | "sky" | "amber" | "neutral";

interface AppIconProps {
  /** Icon key (see ICONS) or a legacy emoji */
  name?: string | null;
  size?: number;
  weight?: IconWeight;
  className?: string;
  /** Shown when `name` is not a known icon (e.g. a custom emoji) */
  fallback?: IconName;
}

/** Bare icon. Decorative by default (aria-hidden); label the parent control. */
export const AppIcon: React.FC<AppIconProps> = ({ name, size = 20, weight = "duotone", className, fallback = "sparkle" }) => {
  const resolved = resolveIcon(name);
  // A custom emoji typed by the user: keep showing it
  if (!resolved && name && /\p{Extended_Pictographic}/u.test(name)) {
    return <span aria-hidden="true" className="leading-none" style={{ fontSize: size * 0.9 }}>{name}</span>;
  }
  const Icon = resolved ?? ICONS[fallback];
  return <Icon size={size} weight={weight} className={className} aria-hidden="true" />;
};

const BADGE_SIZES = {
  xs: { box: "w-8 h-8 rounded-xl", icon: 16 },
  sm: { box: "w-10 h-10 rounded-[14px]", icon: 20 },
  md: { box: "w-12 h-12 rounded-2xl", icon: 24 },
  lg: { box: "w-16 h-16 rounded-[22px]", icon: 30 },
  xl: { box: "w-20 h-20 rounded-[28px]", icon: 38 },
};

interface IconBadgeProps extends AppIconProps {
  tone?: IconTone;
  badgeSize?: keyof typeof BADGE_SIZES;
}

/**
 * Icon inside a soft tinted "squircle" with a subtle gradient and inner
 * highlight: the premium replacement for emojis-as-icons.
 */
export const IconBadge: React.FC<IconBadgeProps> = ({ tone = "primary", badgeSize = "md", className, size, ...icon }) => {
  const s = BADGE_SIZES[badgeSize];
  return (
    <span className={cn("icon-badge shrink-0 inline-flex items-center justify-center", `tone-${tone}`, s.box, className)}>
      <AppIcon size={size ?? s.icon} {...icon} />
    </span>
  );
};

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  tone?: IconTone;
  action?: React.ReactNode;
  className?: string;
}

/** Friendly empty state: illustrated badge with halo, message and optional action. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, tone = "primary", action, className }) => (
  <div className={cn("flex flex-col items-center text-center px-6 py-10", className)}>
    <div className="relative mb-5">
      <span className={cn("absolute -inset-4 rounded-full opacity-60 icon-halo", `tone-${tone}`)} aria-hidden="true" />
      <IconBadge name={icon} tone={tone} badgeSize="xl" />
      <AppIcon name="sparkle" size={16} weight="fill" className="absolute -top-2 -right-3 text-cookbook-gold" />
      <AppIcon name="sparkle" size={10} weight="fill" className="absolute bottom-1 -left-3 text-cookbook-primary/70" />
    </div>
    <p className="font-serif text-xl text-cookbook-text">{title}</p>
    {subtitle && <p className="font-sans text-sm text-cookbook-text/70 mt-1 max-w-[260px] leading-relaxed">{subtitle}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/** Picker grid of icon keys (wishes, custom missions). */
export const IconPicker: React.FC<{ options: IconName[]; value: string; onChange: (v: IconName) => void; tone?: IconTone }> = ({
  options, value, onChange, tone = "primary",
}) => (
  <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1" role="radiogroup" aria-label="Escolha um ícone">
    {options.map((k) => {
      const active = value === k || resolveIcon(value) === ICONS[k];
      return (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={active}
          aria-label={k}
          onClick={() => onChange(k)}
          className={cn(
            "no-hit-expand shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
            active ? cn("icon-badge ring-2 ring-cookbook-primary", `tone-${tone}`) : "bg-cookbook-text/5 text-cookbook-text/70",
          )}
        >
          <AppIcon name={k} size={22} />
        </button>
      );
    })}
  </div>
);

/** Picks an icon for a transaction from its description (works with old entries too). */
export function iconForAction(action = "", type?: string): IconName {
  const a = action.toLowerCase();
  const leading = action.trim().match(/^\p{Extended_Pictographic}️?/u)?.[0];
  if (leading && EMOJI_TO_ICON[leading]) return EMOJI_TO_ICON[leading];
  const rules: [RegExp, IconName][] = [
    [/envelope/, "envelope"], [/desafio da semana/, "target"], [/desafio|duelo|batalha/, "sword"],
    [/caf[eé]/, "coffee"], [/delivery|ifood|marmita/, "delivery"], [/sal[aá]rio|freela|trabalho/, "briefcase"],
    [/presente/, "gift"], [/pix/, "lightning"], [/vend/, "tag"], [/comida|jantar|almo[cç]o|restaurante/, "food"],
    [/compra|shopping|roupa/, "bag"], [/transporte|uber|gasolina|[oô]nibus/, "car"], [/rol[eê]|festa|show/, "confetti"],
    [/sa[uú]de|farm[aá]cia|rem[eé]dio/, "pill"], [/casa|aluguel|mercado/, "house"], [/viagem|passagem|hotel/, "travel"],
    [/troco/, "coins"], [/desapego/, "package"], [/miss[aã]o|economia/, "leaf"], [/meta/, "target"],
  ];
  for (const [re, icon] of rules) if (re.test(a)) return icon;
  return type === "expense" ? "expense" : "coins";
}

/** Removes a leading emoji from stored descriptions ("☕ Café" → "Café"). */
export const stripLeadingEmoji = (s = "") => s.replace(/^\s*(\p{Extended_Pictographic}️?\s*)+/u, "");
