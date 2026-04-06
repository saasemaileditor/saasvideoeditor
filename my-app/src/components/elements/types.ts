export interface BaseElementProps {
  isDark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// All 90+ element type strings
export type ElementType =
  // Text
  | 'heading' | 'subheading' | 'body' | 'caption' | 'label' | 'quote' | 'codeBlock'
  // Cards
  | 'basicCard' | 'featureCard' | 'pricingCard' | 'testimonialCard' | 'statsCard' | 'profileCard' | 'imageCard'
  // Buttons
  | 'primaryButton' | 'secondaryButton' | 'outlineButton' | 'ghostButton' | 'iconButton' | 'fab' | 'pillButton' | 'socialButton'
  // Inputs
  | 'searchBar' | 'textInput' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'toggle' | 'slider'
  // UI Badges
  | 'statusBadge' | 'notificationBadge' | 'tagChip' | 'pillTag' | 'counterBadge'
  // Avatars
  | 'circleAvatar' | 'squareAvatar' | 'avatarGroup' | 'initialsAvatar'
  // Alerts
  | 'infoAlert' | 'successAlert' | 'warningAlert' | 'errorAlert' | 'banner'
  // Tooltips
  | 'topTooltip' | 'bottomTooltip' | 'leftTooltip' | 'rightTooltip'
  // Shapes
  | 'rectangle' | 'roundedRectangle' | 'circle' | 'oval' | 'triangle' | 'star' | 'arrow' | 'line' | 'wave'
  // Layouts
  | 'twoColumnGrid' | 'threeColumnGrid' | 'fourColumnGrid' | 'splitScreen' | 'headerBar' | 'footerBar' | 'sidebar'
  // Dividers
  | 'horizontalLine' | 'verticalLine' | 'dottedLine' | 'gradientLine' | 'spacer'
  // Media Frames
  | 'imagePlaceholder' | 'videoPlaceholder' | 'phoneMockup' | 'laptopMockup' | 'tabletMockup' | 'browserWindow'
  // Icons
  | 'arrowIcons' | 'socialIcons' | 'uiIcons' | 'contactIcons'
  // Social Proof
  | 'starRating' | 'reviewQuote' | 'logoGrid' | 'trustBadge' | 'asSeenOn'
  // Progress
  | 'progressBar' | 'stepIndicator' | 'loadingSpinner' | 'skeletonLine'
  // Charts
  | 'barChart' | 'lineChart' | 'pieChart' | 'numberCounter';

export interface ElementDefinition {
  type: ElementType;
  label: string;
  category: string;
  boundingSize: [number, number];
  defaultProps?: Record<string, any>;
}
