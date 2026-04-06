import { lazy } from 'react';
import type { ElementType } from './types';

// ─── Lazy-loaded element registry ───────────────────────────────────────────
// Each element category chunk is split automatically by the bundler.
// Components are loaded on-demand — only when needed on the canvas.

export const elementRegistry: Partial<Record<ElementType, React.LazyExoticComponent<any>>> = {
  // ── Text ──────────────────────────────────────────────────────────
  heading: lazy(() => import('./text/Heading').then(m => ({ default: m.Heading }))),
  subheading: lazy(() => import('./text/Subheading').then(m => ({ default: m.Subheading }))),
  body: lazy(() => import('./text/Body').then(m => ({ default: m.Body }))),
  caption: lazy(() => import('./text/Caption').then(m => ({ default: m.Caption }))),
  label: lazy(() => import('./text/Label').then(m => ({ default: m.Label }))),
  quote: lazy(() => import('./text/Quote').then(m => ({ default: m.Quote }))),
  codeBlock: lazy(() => import('./text/CodeBlock').then(m => ({ default: m.CodeBlock }))),

  // ── Cards ─────────────────────────────────────────────────────────
  basicCard: lazy(() => import('./cards/BasicCard').then(m => ({ default: m.BasicCard }))),
  featureCard: lazy(() => import('./cards/FeatureCard').then(m => ({ default: m.FeatureCard }))),
  pricingCard: lazy(() => import('./cards/PricingCard').then(m => ({ default: m.PricingCard }))),
  testimonialCard: lazy(() => import('./cards/TestimonialCard').then(m => ({ default: m.TestimonialCard }))),
  statsCard: lazy(() => import('./cards/StatsCard').then(m => ({ default: m.StatsCard }))),
  profileCard: lazy(() => import('./cards/ProfileCard').then(m => ({ default: m.ProfileCard }))),
  imageCard: lazy(() => import('./cards/ImageCard').then(m => ({ default: m.ImageCard }))),

  // ── Buttons ───────────────────────────────────────────────────────
  primaryButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.PrimaryButton }))),
  secondaryButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.SecondaryButton }))),
  outlineButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.OutlineButton }))),
  ghostButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.GhostButton }))),
  iconButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.IconButton }))),
  fab: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.FAB }))),
  pillButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.PillButton }))),
  socialButton: lazy(() => import('./buttons/Buttons').then(m => ({ default: m.SocialButton }))),

  // ── Inputs ────────────────────────────────────────────────────────
  searchBar: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.SearchBarInput }))),
  textInput: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.TextInput }))),
  textarea: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.Textarea }))),
  dropdown: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.Dropdown }))),
  checkbox: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.Checkbox }))),
  radio: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.Radio }))),
  toggle: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.Toggle }))),
  slider: lazy(() => import('./inputs/Inputs').then(m => ({ default: m.Slider }))),

  // ── UI Badges ─────────────────────────────────────────────────────
  statusBadge: lazy(() => import('./uiBadges/Badges').then(m => ({ default: m.StatusBadge }))),
  notificationBadge: lazy(() => import('./uiBadges/Badges').then(m => ({ default: m.NotificationBadge }))),
  tagChip: lazy(() => import('./uiBadges/Badges').then(m => ({ default: m.TagChip }))),
  pillTag: lazy(() => import('./uiBadges/Badges').then(m => ({ default: m.PillTag }))),
  counterBadge: lazy(() => import('./uiBadges/Badges').then(m => ({ default: m.CounterBadge }))),

  // ── Avatars ───────────────────────────────────────────────────────
  circleAvatar: lazy(() => import('./avatars/Avatars').then(m => ({ default: m.CircleAvatar }))),
  squareAvatar: lazy(() => import('./avatars/Avatars').then(m => ({ default: m.SquareAvatar }))),
  avatarGroup: lazy(() => import('./avatars/Avatars').then(m => ({ default: m.AvatarGroup }))),
  initialsAvatar: lazy(() => import('./avatars/Avatars').then(m => ({ default: m.InitialsAvatar }))),

  // ── Alerts ────────────────────────────────────────────────────────
  infoAlert: lazy(() => import('./alerts/Alerts').then(m => ({ default: m.InfoAlert }))),
  successAlert: lazy(() => import('./alerts/Alerts').then(m => ({ default: m.SuccessAlert }))),
  warningAlert: lazy(() => import('./alerts/Alerts').then(m => ({ default: m.WarningAlert }))),
  errorAlert: lazy(() => import('./alerts/Alerts').then(m => ({ default: m.ErrorAlert }))),
  banner: lazy(() => import('./alerts/Alerts').then(m => ({ default: m.Banner }))),

  // ── Tooltips ──────────────────────────────────────────────────────
  topTooltip: lazy(() => import('./tooltips/Tooltips').then(m => ({ default: m.TopTooltip }))),
  bottomTooltip: lazy(() => import('./tooltips/Tooltips').then(m => ({ default: m.BottomTooltip }))),
  leftTooltip: lazy(() => import('./tooltips/Tooltips').then(m => ({ default: m.LeftTooltip }))),
  rightTooltip: lazy(() => import('./tooltips/Tooltips').then(m => ({ default: m.RightTooltip }))),

  // ── Shapes ────────────────────────────────────────────────────────
  rectangle: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Rectangle }))),
  roundedRectangle: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.RoundedRectangle }))),
  circle: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Circle }))),
  oval: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Oval }))),
  triangle: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Triangle }))),
  star: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Star }))),
  arrow: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Arrow }))),
  line: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Line }))),
  wave: lazy(() => import('./shapes/Shapes').then(m => ({ default: m.Wave }))),

  // ── Layouts ───────────────────────────────────────────────────────
  twoColumnGrid: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.TwoColumnGrid }))),
  threeColumnGrid: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.ThreeColumnGrid }))),
  fourColumnGrid: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.FourColumnGrid }))),
  splitScreen: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.SplitScreen }))),
  headerBar: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.HeaderBar }))),
  footerBar: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.FooterBar }))),
  sidebar: lazy(() => import('./layouts/Layouts').then(m => ({ default: m.Sidebar }))),

  // ── Dividers ──────────────────────────────────────────────────────
  horizontalLine: lazy(() => import('./dividers/Dividers').then(m => ({ default: m.HorizontalLine }))),
  verticalLine: lazy(() => import('./dividers/Dividers').then(m => ({ default: m.VerticalLine }))),
  dottedLine: lazy(() => import('./dividers/Dividers').then(m => ({ default: m.DottedLine }))),
  gradientLine: lazy(() => import('./dividers/Dividers').then(m => ({ default: m.GradientLine }))),
  spacer: lazy(() => import('./dividers/Dividers').then(m => ({ default: m.Spacer }))),

  // ── Media Frames ──────────────────────────────────────────────────
  imagePlaceholder: lazy(() => import('./mediaFrames/MediaFrames').then(m => ({ default: m.ImagePlaceholder }))),
  videoPlaceholder: lazy(() => import('./mediaFrames/MediaFrames').then(m => ({ default: m.VideoPlaceholder }))),
  phoneMockup: lazy(() => import('./mediaFrames/MediaFrames').then(m => ({ default: m.PhoneMockup }))),
  laptopMockup: lazy(() => import('./mediaFrames/MediaFrames').then(m => ({ default: m.LaptopMockup }))),
  tabletMockup: lazy(() => import('./mediaFrames/MediaFrames').then(m => ({ default: m.TabletMockup }))),
  browserWindow: lazy(() => import('./mediaFrames/MediaFrames').then(m => ({ default: m.BrowserWindow }))),

  // ── Icons ─────────────────────────────────────────────────────────
  arrowIcons: lazy(() => import('./icons/Icons').then(m => ({ default: m.ArrowIcons }))),
  socialIcons: lazy(() => import('./icons/Icons').then(m => ({ default: m.SocialIcons }))),
  uiIcons: lazy(() => import('./icons/Icons').then(m => ({ default: m.UIIcons }))),
  contactIcons: lazy(() => import('./icons/Icons').then(m => ({ default: m.ContactIcons }))),

  // ── Social Proof ──────────────────────────────────────────────────
  starRating: lazy(() => import('./socialProof/SocialProof').then(m => ({ default: m.StarRating }))),
  reviewQuote: lazy(() => import('./socialProof/SocialProof').then(m => ({ default: m.ReviewQuote }))),
  logoGrid: lazy(() => import('./socialProof/SocialProof').then(m => ({ default: m.LogoGrid }))),
  trustBadge: lazy(() => import('./socialProof/SocialProof').then(m => ({ default: m.TrustBadge }))),
  asSeenOn: lazy(() => import('./socialProof/SocialProof').then(m => ({ default: m.AsSeenOn }))),

  // ── Progress ──────────────────────────────────────────────────────
  progressBar: lazy(() => import('./progress/Progress').then(m => ({ default: m.ProgressBar }))),
  stepIndicator: lazy(() => import('./progress/Progress').then(m => ({ default: m.StepIndicator }))),
  loadingSpinner: lazy(() => import('./progress/Progress').then(m => ({ default: m.LoadingSpinner }))),
  skeletonLine: lazy(() => import('./progress/Progress').then(m => ({ default: m.SkeletonLine }))),

  // ── Charts ────────────────────────────────────────────────────────
  barChart: lazy(() => import('./charts/Charts').then(m => ({ default: m.BarChart }))),
  lineChart: lazy(() => import('./charts/Charts').then(m => ({ default: m.LineChart }))),
  pieChart: lazy(() => import('./charts/Charts').then(m => ({ default: m.PieChart }))),
  numberCounter: lazy(() => import('./charts/Charts').then(m => ({ default: m.NumberCounter }))),
};

/** Get a lazy-loaded element component by its type string. Returns null if unknown. */
export const getElementComponent = (type: string) => {
  return elementRegistry[type as ElementType] ?? null;
};

// ─── Element Definitions for Panel UI ───────────────────────────────────────
// Used to populate the sidebar Elements panel with draggable cards.

export interface PanelElementDef {
  type: ElementType;
  label: string;
  category: string;
  categoryLabel: string;
  boundingSize: [number, number];
  previewEmoji?: string;
  defaultProps?: Record<string, any>;
}

export const PANEL_ELEMENTS: PanelElementDef[] = [
  // ── Text ──────────────────────────────────────────────────────────
  { type: 'heading', label: 'Headline', category: 'text', categoryLabel: 'Text', boundingSize: [400, 60], previewEmoji: '🔤' },
  { type: 'subheading', label: 'Subheading', category: 'text', categoryLabel: 'Text', boundingSize: [320, 40], previewEmoji: '📝' },
  { type: 'body', label: 'Body', category: 'text', categoryLabel: 'Text', boundingSize: [360, 80], previewEmoji: '📄' },
  { type: 'caption', label: 'Caption', category: 'text', categoryLabel: 'Text', boundingSize: [240, 24], previewEmoji: '💬' },
  { type: 'label', label: 'Label', category: 'text', categoryLabel: 'Text', boundingSize: [140, 28], previewEmoji: '🏷' },
  { type: 'quote', label: 'Quote', category: 'text', categoryLabel: 'Text', boundingSize: [360, 100], previewEmoji: '❝' },
  { type: 'codeBlock', label: 'Code Block', category: 'text', categoryLabel: 'Text', boundingSize: [400, 160], previewEmoji: '💻' },

  // ── Cards ─────────────────────────────────────────────────────────
  { type: 'basicCard', label: 'Basic Card', category: 'cards', categoryLabel: 'Cards', boundingSize: [280, 100], previewEmoji: '🃏' },
  { type: 'featureCard', label: 'Feature Card', category: 'cards', categoryLabel: 'Cards', boundingSize: [280, 160], previewEmoji: '⚡' },
  { type: 'pricingCard', label: 'Pricing Card', category: 'cards', categoryLabel: 'Cards', boundingSize: [240, 320], previewEmoji: '💰' },
  { type: 'testimonialCard', label: 'Testimonial', category: 'cards', categoryLabel: 'Cards', boundingSize: [300, 160], previewEmoji: '⭐' },
  { type: 'statsCard', label: 'Stats Card', category: 'cards', categoryLabel: 'Cards', boundingSize: [240, 110], previewEmoji: '📊' },
  { type: 'profileCard', label: 'Profile Card', category: 'cards', categoryLabel: 'Cards', boundingSize: [240, 240], previewEmoji: '👤' },
  { type: 'imageCard', label: 'Image Card', category: 'cards', categoryLabel: 'Cards', boundingSize: [280, 180], previewEmoji: '🖼' },

  // ── Buttons ───────────────────────────────────────────────────────
  { type: 'primaryButton', label: 'Primary', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [160, 44], previewEmoji: '🟣' },
  { type: 'secondaryButton', label: 'Secondary', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [160, 44], previewEmoji: '⬜' },
  { type: 'outlineButton', label: 'Outline', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [160, 44], previewEmoji: '◻' },
  { type: 'ghostButton', label: 'Ghost', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [160, 44], previewEmoji: '👻' },
  { type: 'iconButton', label: 'Icon Button', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [44, 44], previewEmoji: '⚙' },
  { type: 'fab', label: 'FAB', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [56, 56], previewEmoji: '➕' },
  { type: 'pillButton', label: 'Pill Button', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [160, 44], previewEmoji: '💊' },
  { type: 'socialButton', label: 'Social Button', category: 'buttons', categoryLabel: 'Buttons', boundingSize: [240, 48], previewEmoji: '🔗' },

  // ── Inputs ────────────────────────────────────────────────────────
  { type: 'searchBar', label: 'Search Bar', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [280, 44], previewEmoji: '🔍' },
  { type: 'textInput', label: 'Text Input', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [280, 68], previewEmoji: '✏' },
  { type: 'textarea', label: 'Textarea', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [280, 120], previewEmoji: '📝' },
  { type: 'dropdown', label: 'Dropdown', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [240, 68], previewEmoji: '⬇' },
  { type: 'checkbox', label: 'Checkbox', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [200, 32], previewEmoji: '☑' },
  { type: 'radio', label: 'Radio', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [200, 32], previewEmoji: '🔘' },
  { type: 'toggle', label: 'Toggle', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [200, 32], previewEmoji: '🔄' },
  { type: 'slider', label: 'Slider', category: 'inputs', categoryLabel: 'Inputs', boundingSize: [280, 56], previewEmoji: '🎚' },

  // ── UI Badges ─────────────────────────────────────────────────────
  { type: 'statusBadge', label: 'Status Badge', category: 'uiBadges', categoryLabel: 'UI Badges', boundingSize: [80, 28], previewEmoji: '🟢' },
  { type: 'notificationBadge', label: 'Notif. Badge', category: 'uiBadges', categoryLabel: 'UI Badges', boundingSize: [40, 28], previewEmoji: '🔴' },
  { type: 'tagChip', label: 'Tag / Chip', category: 'uiBadges', categoryLabel: 'UI Badges', boundingSize: [80, 28], previewEmoji: '🏷' },
  { type: 'pillTag', label: 'Pill Tag', category: 'uiBadges', categoryLabel: 'UI Badges', boundingSize: [80, 28], previewEmoji: '💊' },
  { type: 'counterBadge', label: 'Counter Badge', category: 'uiBadges', categoryLabel: 'UI Badges', boundingSize: [140, 28], previewEmoji: '🔢' },

  // ── Avatars ───────────────────────────────────────────────────────
  { type: 'circleAvatar', label: 'Circle Avatar', category: 'avatars', categoryLabel: 'Avatars', boundingSize: [56, 56], previewEmoji: '🧑' },
  { type: 'squareAvatar', label: 'Square Avatar', category: 'avatars', categoryLabel: 'Avatars', boundingSize: [56, 56], previewEmoji: '🖼' },
  { type: 'avatarGroup', label: 'Avatar Group', category: 'avatars', categoryLabel: 'Avatars', boundingSize: [180, 56], previewEmoji: '👥' },
  { type: 'initialsAvatar', label: 'Initials Avatar', category: 'avatars', categoryLabel: 'Avatars', boundingSize: [56, 56], previewEmoji: '🅰' },

  // ── Alerts ────────────────────────────────────────────────────────
  { type: 'infoAlert', label: 'Info Alert', category: 'alerts', categoryLabel: 'Alerts', boundingSize: [300, 60], previewEmoji: 'ℹ️' },
  { type: 'successAlert', label: 'Success Alert', category: 'alerts', categoryLabel: 'Alerts', boundingSize: [300, 60], previewEmoji: '✅' },
  { type: 'warningAlert', label: 'Warning Alert', category: 'alerts', categoryLabel: 'Alerts', boundingSize: [300, 60], previewEmoji: '⚠️' },
  { type: 'errorAlert', label: 'Error Alert', category: 'alerts', categoryLabel: 'Alerts', boundingSize: [300, 60], previewEmoji: '❌' },
  { type: 'banner', label: 'Banner', category: 'alerts', categoryLabel: 'Alerts', boundingSize: [400, 48], previewEmoji: '📢' },

  // ── Tooltips ──────────────────────────────────────────────────────
  { type: 'topTooltip', label: 'Top Tooltip', category: 'tooltips', categoryLabel: 'Tooltips', boundingSize: [160, 100], previewEmoji: '💭' },
  { type: 'bottomTooltip', label: 'Bottom Tooltip', category: 'tooltips', categoryLabel: 'Tooltips', boundingSize: [160, 100], previewEmoji: '💭' },
  { type: 'leftTooltip', label: 'Left Tooltip', category: 'tooltips', categoryLabel: 'Tooltips', boundingSize: [200, 60], previewEmoji: '💭' },
  { type: 'rightTooltip', label: 'Right Tooltip', category: 'tooltips', categoryLabel: 'Tooltips', boundingSize: [200, 60], previewEmoji: '💭' },

  // ── Shapes ────────────────────────────────────────────────────────
  { type: 'rectangle', label: 'Rectangle', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [120, 70], previewEmoji: '▬' },
  { type: 'roundedRectangle', label: 'Rounded Rect', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [120, 70], previewEmoji: '▭' },
  { type: 'circle', label: 'Circle', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [80, 80], previewEmoji: '⭕' },
  { type: 'oval', label: 'Oval', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [120, 70], previewEmoji: '⊙' },
  { type: 'triangle', label: 'Triangle', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [80, 70], previewEmoji: '🔺' },
  { type: 'star', label: 'Star', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [60, 60], previewEmoji: '⭐' },
  { type: 'arrow', label: 'Arrow', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [40, 40], previewEmoji: '➡' },
  { type: 'line', label: 'Line', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [120, 4], previewEmoji: '—' },
  { type: 'wave', label: 'Wave', category: 'shapes', categoryLabel: 'Shapes', boundingSize: [140, 40], previewEmoji: '〰' },

  // ── Layouts ───────────────────────────────────────────────────────
  { type: 'twoColumnGrid', label: '2-Col Grid', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [320, 80], previewEmoji: '⬛⬛' },
  { type: 'threeColumnGrid', label: '3-Col Grid', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [360, 80], previewEmoji: '⬛⬛⬛' },
  { type: 'fourColumnGrid', label: '4-Col Grid', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [400, 80], previewEmoji: '⬛⬛⬛⬛' },
  { type: 'splitScreen', label: 'Split Screen', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [360, 120], previewEmoji: '◰' },
  { type: 'headerBar', label: 'Header Bar', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [400, 56], previewEmoji: '▬' },
  { type: 'footerBar', label: 'Footer Bar', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [400, 48], previewEmoji: '▬' },
  { type: 'sidebar', label: 'Sidebar', category: 'layouts', categoryLabel: 'Layouts', boundingSize: [180, 240], previewEmoji: '◧' },

  // ── Dividers ──────────────────────────────────────────────────────
  { type: 'horizontalLine', label: 'H-Line', category: 'dividers', categoryLabel: 'Dividers', boundingSize: [200, 4], previewEmoji: '─' },
  { type: 'verticalLine', label: 'V-Line', category: 'dividers', categoryLabel: 'Dividers', boundingSize: [4, 80], previewEmoji: '│' },
  { type: 'dottedLine', label: 'Dotted Line', category: 'dividers', categoryLabel: 'Dividers', boundingSize: [200, 4], previewEmoji: '⋯' },
  { type: 'gradientLine', label: 'Gradient Line', category: 'dividers', categoryLabel: 'Dividers', boundingSize: [200, 4], previewEmoji: '🌈' },
  { type: 'spacer', label: 'Spacer', category: 'dividers', categoryLabel: 'Dividers', boundingSize: [200, 24], previewEmoji: '↕' },

  // ── Media Frames ──────────────────────────────────────────────────
  { type: 'imagePlaceholder', label: 'Image Frame', category: 'mediaFrames', categoryLabel: 'Media Frames', boundingSize: [280, 180], previewEmoji: '🖼' },
  { type: 'videoPlaceholder', label: 'Video Frame', category: 'mediaFrames', categoryLabel: 'Media Frames', boundingSize: [280, 180], previewEmoji: '🎬' },
  { type: 'phoneMockup', label: 'Phone Mockup', category: 'mediaFrames', categoryLabel: 'Media Frames', boundingSize: [120, 252], previewEmoji: '📱' },
  { type: 'laptopMockup', label: 'Laptop Mockup', category: 'mediaFrames', categoryLabel: 'Media Frames', boundingSize: [280, 196], previewEmoji: '💻' },
  { type: 'tabletMockup', label: 'Tablet Mockup', category: 'mediaFrames', categoryLabel: 'Media Frames', boundingSize: [180, 243], previewEmoji: '📟' },
  { type: 'browserWindow', label: 'Browser Window', category: 'mediaFrames', categoryLabel: 'Media Frames', boundingSize: [280, 180], previewEmoji: '🌐' },

  // ── Icons ─────────────────────────────────────────────────────────
  { type: 'arrowIcons', label: 'Arrow Icons', category: 'icons', categoryLabel: 'Icons', boundingSize: [180, 80], previewEmoji: '→' },
  { type: 'socialIcons', label: 'Social Icons', category: 'icons', categoryLabel: 'Icons', boundingSize: [240, 48], previewEmoji: '🔗' },
  { type: 'uiIcons', label: 'UI Icons', category: 'icons', categoryLabel: 'Icons', boundingSize: [280, 120], previewEmoji: '🎨' },
  { type: 'contactIcons', label: 'Contact Icons', category: 'icons', categoryLabel: 'Icons', boundingSize: [160, 120], previewEmoji: '📞' },

  // ── Social Proof ──────────────────────────────────────────────────
  { type: 'starRating', label: 'Star Rating', category: 'socialProof', categoryLabel: 'Social Proof', boundingSize: [160, 30], previewEmoji: '⭐' },
  { type: 'reviewQuote', label: 'Review Quote', category: 'socialProof', categoryLabel: 'Social Proof', boundingSize: [300, 160], previewEmoji: '💬' },
  { type: 'logoGrid', label: 'Logo Grid', category: 'socialProof', categoryLabel: 'Social Proof', boundingSize: [360, 56], previewEmoji: '🏢' },
  { type: 'trustBadge', label: 'Trust Badge', category: 'socialProof', categoryLabel: 'Social Proof', boundingSize: [200, 56], previewEmoji: '🔒' },
  { type: 'asSeenOn', label: 'As Seen On', category: 'socialProof', categoryLabel: 'Social Proof', boundingSize: [360, 80], previewEmoji: '📰' },

  // ── Progress ──────────────────────────────────────────────────────
  { type: 'progressBar', label: 'Progress Bar', category: 'progress', categoryLabel: 'Progress', boundingSize: [280, 50], previewEmoji: '📶' },
  { type: 'stepIndicator', label: 'Step Indicator', category: 'progress', categoryLabel: 'Progress', boundingSize: [360, 60], previewEmoji: '🔢' },
  { type: 'loadingSpinner', label: 'Spinner', category: 'progress', categoryLabel: 'Progress', boundingSize: [100, 80], previewEmoji: '🌀' },
  { type: 'skeletonLine', label: 'Skeleton', category: 'progress', categoryLabel: 'Progress', boundingSize: [280, 80], previewEmoji: '💀' },

  // ── Charts ────────────────────────────────────────────────────────
  { type: 'barChart', label: 'Bar Chart', category: 'charts', categoryLabel: 'Charts', boundingSize: [300, 200], previewEmoji: '📊' },
  { type: 'lineChart', label: 'Line Chart', category: 'charts', categoryLabel: 'Charts', boundingSize: [300, 200], previewEmoji: '📈' },
  { type: 'pieChart', label: 'Pie Chart', category: 'charts', categoryLabel: 'Charts', boundingSize: [300, 200], previewEmoji: '🥧' },
  { type: 'numberCounter', label: 'Number Counter', category: 'charts', categoryLabel: 'Charts', boundingSize: [220, 100], previewEmoji: '🔢' },
];

// ─── Category metadata for panel display ────────────────────────────────────
export const ELEMENT_CATEGORIES = [
  { id: 'text', label: 'Text', emoji: '🔤' },
  { id: 'cards', label: 'Cards', emoji: '🃏' },
  { id: 'buttons', label: 'Buttons', emoji: '🟣' },
  { id: 'inputs', label: 'Inputs', emoji: '✏' },
  { id: 'uiBadges', label: 'UI Badges', emoji: '🏷' },
  { id: 'avatars', label: 'Avatars', emoji: '👤' },
  { id: 'alerts', label: 'Alerts', emoji: '⚠️' },
  { id: 'tooltips', label: 'Tooltips', emoji: '💭' },
  { id: 'shapes', label: 'Shapes', emoji: '◼' },
  { id: 'layouts', label: 'Layouts', emoji: '⬛⬛' },
  { id: 'dividers', label: 'Dividers', emoji: '─' },
  { id: 'mediaFrames', label: 'Media Frames', emoji: '🖼' },
  { id: 'icons', label: 'Icons', emoji: '🎨' },
  { id: 'socialProof', label: 'Social Proof', emoji: '⭐' },
  { id: 'progress', label: 'Progress', emoji: '📶' },
  { id: 'charts', label: 'Charts', emoji: '📊' },
];

export type { ElementType } from './types';
