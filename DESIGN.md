# MoneyMan existing design system

The source of truth is `src/styles/tokens.css`; reuse its variables and the
components in `src/components/ui/`.

- System font on Apple platforms, bundled Inter elsewhere; 17px body text.
- Blue primary actions, semantic status colors and category-specific chart colors.
- Grouped light/dark surfaces, rounded list groups and floating navigation capsules.
- Fixed app shell with scrolling screen contents; keep safe-area insets intact.
- Forms appear in sheets with existing Motion interactions.
- Desktop polish should constrain excessive line lengths while preserving the
  same navigation and content hierarchy as mobile.

This records the existing interface, not a replacement visual direction.
